import express from "express";
import { db } from "../db/database.js";
import { requireAuth, requireRole, verifyIssueModificationAccess } from "../middleware/auth.js";
import { evaluateDependencies } from "../services/dependencyEngine.js";
import { createAuditEvent } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import { calculateCreditAward } from "../services/creditService.js";
import crypto from "node:crypto";

const router = express.Router();

// PATCH /api/issues/:id/status - Officer updates issue status & resolution
router.patch("/:id/status", requireAuth, requireRole("OFFICER"), verifyIssueModificationAccess, (req, res) => {
  try {
    const issue = req.issue;
    const { status, resolutionProof, resolutionNotes } = req.body;

    const validStatuses = ["PENDING", "IN_PROGRESS", "BLOCKED", "READY", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const now = new Date().toISOString();
    let resolvedAt = issue.resolved_at;
    if (status === "COMPLETED" && !resolvedAt) {
      resolvedAt = now;
    }

    db.prepare(`
      UPDATE issues 
      SET status = ?, 
          resolution_proof = COALESCE(?, resolution_proof),
          resolution_notes = COALESCE(?, resolution_notes),
          resolved_at = ?,
          assigned_officer_id = COALESCE(assigned_officer_id, ?),
          assigned_officer_name = COALESCE(assigned_officer_name, ?),
          updated_at = ?
      WHERE id = ?
    `).run(status, resolutionProof || null, resolutionNotes || null, resolvedAt, req.user.id, req.user.name, now, issue.id);

    // Audit event: STATUS_CHANGED / ISSUE_COMPLETED
    const eventType = status === "COMPLETED" ? "ISSUE_COMPLETED" : "STATUS_CHANGED";
    createAuditEvent({
      complaintId: issue.complaint_id,
      issueId: issue.id,
      eventType,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: "OFFICER",
      description: `${issue.display_id} (${issue.title}) marked as ${status} by ${req.user.name} (${req.user.department}). ${resolutionProof ? `Proof: ${resolutionProof}` : ""}`
    });

    let unlockedIssues = [];

    // TRIGGER DEPENDENCY ENGINE ON COMPLETION!
    if (status === "COMPLETED") {
      unlockedIssues = evaluateDependencies(issue.id, {
        id: req.user.id,
        name: req.user.name,
        role: "OFFICER"
      });

      // Check if all issues in parent complaint are now completed
      const remainingIncomplete = db.prepare(`
        SELECT COUNT(*) as count FROM issues 
        WHERE complaint_id = ? AND status NOT IN ('COMPLETED', 'CONFIRMED')
      `).get(issue.complaint_id).count;

      if (remainingIncomplete === 0) {
        db.prepare(`
          UPDATE complaints 
          SET status = 'RESOLVED', updated_at = ? 
          WHERE id = ?
        `).run(now, issue.complaint_id);
      }
    }

    const updatedIssue = db.prepare("SELECT * FROM issues WHERE id = ?").get(issue.id);

    res.json({
      issue: updatedIssue,
      unlockedIssues,
      message: `Issue ${issue.display_id} updated to ${status}${unlockedIssues.length ? `. Unlocked ${unlockedIssues.length} dependent task(s)!` : ""}`
    });
  } catch (err) {
    console.error("Update issue status error:", err);
    res.status(500).json({ error: "Failed to update issue status" });
  }
});

// POST /api/issues/:id/escalate - Trigger predictive or supervisory escalation
router.post("/:id/escalate", requireAuth, (req, res) => {
  try {
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const now = new Date().toISOString();
    const { reason = "Approaching SLA breach threshold or multi-department deadlock" } = req.body;

    db.prepare(`
      UPDATE issues 
      SET escalation_stage = 'ESCALATED',
          risk_score = 95,
          risk_level = 'CRITICAL',
          updated_at = ?
      WHERE id = ?
    `).run(now, issue.id);

    // Audit event: ESCALATION_TRIGGERED
    createAuditEvent({
      complaintId: issue.complaint_id,
      issueId: issue.id,
      eventType: "ESCALATION_TRIGGERED",
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      description: `Predictive escalation triggered for ${issue.display_id} (${issue.title}). Reason: ${reason}`
    });

    // Alert notification
    createNotification({
      department: issue.department,
      role: "OFFICER",
      complaintId: issue.complaint_id,
      issueId: issue.id,
      title: "CRITICAL: Predictive Escalation Triggered",
      message: `Supervisor escalation dispatched for ${issue.display_id} (${issue.title}). Immediate field intervention mandated.`,
      type: "ESCALATION"
    });

    res.json({ message: "Escalation triggered successfully", escalationStage: "ESCALATED", riskScore: 95 });
  } catch (err) {
    console.error("Escalate error:", err);
    res.status(500).json({ error: "Failed to escalate issue" });
  }
});

// POST /api/issues/:id/confirm-resolution - Citizen confirms resolution and awards Civic Service Credits
router.post("/:id/confirm-resolution", requireAuth, requireRole("CITIZEN"), (req, res) => {
  try {
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(issue.complaint_id);
    if (!complaint || complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You are not authorized to confirm this complaint" });
    }

    if (issue.status !== "COMPLETED") {
      return res.status(400).json({ error: "Issue has not yet been marked completed by the field officer" });
    }

    const now = new Date().toISOString();

    // Check if already confirmed to prevent duplicate credit awards
    const existingCredit = db.prepare("SELECT * FROM credits WHERE issue_id = ?").get(issue.id);
    if (existingCredit) {
      return res.status(400).json({ error: "Resolution has already been confirmed and credits awarded" });
    }

    // Determine SLA compliance
    const resolvedTime = new Date(issue.resolved_at || now).getTime();
    const deadlineTime = new Date(issue.deadline).getTime();
    const resolvedBeforeSLA = resolvedTime <= deadlineTime;

    // Calculate Civic Service Credits
    const award = calculateCreditAward({ resolvedBeforeSLA, citizenConfirmed: true });

    // Update Issue to CONFIRMED
    db.prepare(`
      UPDATE issues 
      SET status = 'CONFIRMED', confirmed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(now, now, issue.id);

    // Record credit in credits table
    const creditId = `cred-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;
    db.prepare(`
      INSERT INTO credits (id, department, issue_id, points, rule_breakdown, awarded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(creditId, issue.department, issue.id, award.total, JSON.stringify(award.breakdown), now);

    // Update department metrics in DB
    db.prepare(`
      UPDATE departments 
      SET total_points = total_points + ?,
          issues_resolved = issues_resolved + 1,
          citizen_confirmed_count = citizen_confirmed_count + 1,
          sla_compliant_count = sla_compliant_count + ?
      WHERE name = ?
    `).run(award.total, resolvedBeforeSLA ? 1 : 0, issue.department);

    // Audit Events
    createAuditEvent({
      complaintId: issue.complaint_id,
      issueId: issue.id,
      eventType: "RESOLUTION_CONFIRMED",
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: "CITIZEN",
      description: `Citizen independently confirmed satisfactory resolution of ${issue.display_id} (${issue.title}).`
    });

    createAuditEvent({
      complaintId: issue.complaint_id,
      issueId: issue.id,
      eventType: "CIVIC_SERVICE_CREDIT_AWARDED",
      actorId: "SYSTEM",
      actorName: "Civic Service Credit Engine",
      actorRole: "SYSTEM",
      description: `Awarded +${award.total} Civic Service Credits to ${issue.department} (Breakdown: ${award.breakdown.map((b) => `${b.rule} [${b.points > 0 ? `+${b.points}` : b.points}]`).join(", ")}).`
    });

    // Notify Officer
    createNotification({
      department: issue.department,
      role: "OFFICER",
      complaintId: issue.complaint_id,
      issueId: issue.id,
      title: `Civic Service Credits Awarded: +${award.total}`,
      message: `Citizen verified resolution of ${issue.display_id}. +${award.total} points credited to ${issue.department}.`,
      type: "RESOLVED"
    });

    res.json({
      message: "Resolution verified successfully!",
      pointsAwarded: award.total,
      breakdown: award.breakdown
    });
  } catch (err) {
    console.error("Confirm resolution error:", err);
    res.status(500).json({ error: "Failed to confirm resolution" });
  }
});

// POST /api/issues/:id/reopen - Citizen reports still not resolved
router.post("/:id/reopen", requireAuth, requireRole("CITIZEN"), (req, res) => {
  try {
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(issue.complaint_id);
    if (!complaint || complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You are not authorized to modify this complaint" });
    }

    const { reason = "Grievance persists on ground despite closure claim" } = req.body;
    const now = new Date().toISOString();

    // Reopen issue
    db.prepare(`
      UPDATE issues 
      SET status = 'REOPENED',
          reopened_at = ?,
          reopen_reason = ?,
          risk_score = 90,
          risk_level = 'CRITICAL',
          escalation_stage = 'SUPERVISOR_WARNING',
          updated_at = ?
      WHERE id = ?
    `).run(now, reason, now, issue.id);

    // Update department metrics (increment reopened_count)
    db.prepare(`
      UPDATE departments 
      SET reopened_count = reopened_count + 1 
      WHERE name = ?
    `).run(issue.department);

    // Audit Event: ISSUE_REOPENED
    createAuditEvent({
      complaintId: issue.complaint_id,
      issueId: issue.id,
      eventType: "ISSUE_REOPENED",
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: "CITIZEN",
      description: `Citizen rejected resolution for ${issue.display_id} (${issue.title}). Reason: "${reason}". Grievance reopened at CRITICAL risk.`
    });

    // Alert Officer
    createNotification({
      department: issue.department,
      role: "OFFICER",
      complaintId: issue.complaint_id,
      issueId: issue.id,
      title: `URGENT: Issue Reopened by Citizen`,
      message: `${issue.display_id} (${issue.title}) was flagged as unresolved: "${reason}". Field reinspection required immediately.`,
      type: "ESCALATION"
    });

    res.json({
      message: "Issue has been reopened and escalated to the department supervisor",
      issueId: issue.id,
      status: "REOPENED"
    });
  } catch (err) {
    console.error("Reopen issue error:", err);
    res.status(500).json({ error: "Failed to reopen issue" });
  }
});

export default router;
