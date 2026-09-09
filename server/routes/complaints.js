import express from "express";
import crypto from "node:crypto";
import { db, seedPrimaryDemoCase } from "../db/database.js";
import { requireAuth, requireRole, verifyComplaintAccess } from "../middleware/auth.js";
import { analyzeComplaintText } from "../services/aiService.js";
import { routeIssue } from "../services/routingEngine.js";
import { generateActionPlan } from "../services/actionPlanner.js";
import { calculateIssueRisk, calculateComplaintRisk } from "../services/riskEngine.js";
import { createAuditEvent, getAuditTrail } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import { getIssueDependencies } from "../services/dependencyEngine.js";

const router = express.Router();

function generateComplaintId() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CF-${year}-00${randomSuffix}`;
}

// POST /api/complaints - Submit and auto-decompose complaint
router.post("/", requireAuth, requireRole("CITIZEN"), async (req, res) => {
  try {
    const { description, language = "English", location = "Ward 14, Central Sector", category = "General Civic", photo_url, video_url } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: "Please provide a detailed complaint description" });
    }

    const complaintId = generateComplaintId();
    const now = new Date().toISOString();

    // Run AI / Deterministic decomposition
    const analysis = await analyzeComplaintText(description, language);

    // Initial insert of Complaint
    db.prepare(`
      INSERT INTO complaints (
        id, user_id, citizen_name, description, language, location, category,
        photo_url, video_url, status, severity, priority, risk_score, risk_level, analysis_source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      complaintId,
      req.user.id,
      req.user.name,
      description.trim(),
      analysis.language,
      location,
      category,
      photo_url || null,
      video_url || null,
      "IN_PROGRESS",
      analysis.severity,
      analysis.priority,
      0,
      "LOW",
      analysis.analysisSource,
      now,
      now
    );

    // Audit: Complaint Submitted
    createAuditEvent({
      complaintId,
      eventType: "COMPLAINT_SUBMITTED",
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: "CITIZEN",
      description: `Grievance ${complaintId} registered at ${location}.`
    });

    // Create Issues & Action plans
    const createdIssues = [];
    const indexToIssueId = {};

    for (const [idx, item] of analysis.issues.entries()) {
      const issueId = `issue-${Date.now()}-${idx + 1}-${crypto.randomBytes(2).toString("hex")}`;
      const displayId = `I-${idx + 1}`;
      indexToIssueId[item.index || idx + 1] = issueId;

      // Routing engine explanation
      const routing = routeIssue(item.category, location);
      const deadlineDate = new Date(Date.now() + (item.slaHours || routing.slaHours || 24) * 3600 * 1000).toISOString();

      // Compute initial risk
      const risk = calculateIssueRisk({
        severity: item.severity || routing.defaultSeverity,
        status: item.initialStatus || "PENDING",
        complaint_id: complaintId,
        title: item.title
      });

      db.prepare(`
        INSERT INTO issues (
          id, display_id, complaint_id, title, category, severity, department, routing_reason,
          status, deadline, deadline_hours, risk_score, risk_level, escalation_stage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        issueId,
        displayId,
        complaintId,
        item.title,
        item.category,
        item.severity || routing.defaultSeverity,
        routing.department,
        routing.explanation,
        item.initialStatus || "PENDING",
        deadlineDate,
        item.slaHours || routing.slaHours || 24,
        risk.score,
        risk.level,
        risk.escalationStage,
        now,
        now
      );

      // Generate action checklist
      const actions = generateActionPlan(item.category, item.title);
      for (const [aIdx, act] of actions.entries()) {
        const actionId = `act-${Date.now()}-${idx}-${aIdx}-${crypto.randomBytes(2).toString("hex")}`;
        db.prepare(`
          INSERT INTO actions (id, issue_id, title, sequence_order, status)
          VALUES (?, ?, ?, ?, ?)
        `).run(actionId, issueId, act.title, act.sequence_order, act.status);
      }

      createdIssues.push({
        id: issueId,
        display_id: displayId,
        title: item.title,
        category: item.category,
        department: routing.department,
        status: item.initialStatus || "PENDING",
        risk_score: risk.score,
        risk_level: risk.level
      });
    }

    // Insert Dependencies
    for (const dep of analysis.dependencies || []) {
      const sourceId = indexToIssueId[dep.sourceIndex];
      const targetId = indexToIssueId[dep.targetIndex];

      if (sourceId && targetId) {
        const depId = `dep-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;
        db.prepare(`
          INSERT INTO dependencies (id, complaint_id, source_issue_id, target_issue_id, reason, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(depId, complaintId, sourceId, targetId, dep.reason, "WAITING");

        createAuditEvent({
          complaintId,
          issueId: targetId,
          eventType: "DEPENDENCY_CREATED",
          description: `Prerequisite dependency registered: [${dep.sourceTitle}] must precede [${dep.targetTitle}]. Reason: ${dep.reason}`
        });
      }
    }

    // Re-evaluate overall complaint risk
    const complaintRisk = calculateComplaintRisk(createdIssues, {
      isPrimaryDemo: description.toLowerCase().includes("sewage") && description.toLowerCase().includes("road")
    });

    db.prepare(`
      UPDATE complaints 
      SET risk_score = ?, risk_level = ? 
      WHERE id = ?
    `).run(complaintRisk.score, complaintRisk.level, complaintId);

    // Audit: Decomposed & Routed
    createAuditEvent({
      complaintId,
      eventType: "COMPLAINT_ANALYZED",
      description: `Decomposed into ${createdIssues.length} atomic issues across ${[...new Set(createdIssues.map((i) => i.department))].join(", ")}.`
    });

    // Notify citizen
    createNotification({
      userId: req.user.id,
      role: "CITIZEN",
      complaintId,
      title: "Grievance Registered & Analyzed",
      message: `Your grievance ${complaintId} was decomposed into ${createdIssues.length} atomic departmental issues.`,
      type: "INFO"
    });

    res.status(201).json({
      complaintId,
      status: "IN_PROGRESS",
      analysisSource: analysis.analysisSource,
      severity: analysis.severity,
      priority: analysis.priority,
      issuesCount: createdIssues.length,
      riskScore: complaintRisk.score,
      riskLevel: complaintRisk.level
    });
  } catch (err) {
    console.error("Complaint creation error:", err);
    res.status(500).json({ error: "Failed to process complaint" });
  }
});

// GET /api/complaints - List complaints (filtered by role and search)
router.get("/", requireAuth, (req, res) => {
  try {
    const { status, search, department } = req.query;

    let complaints = [];
    if (req.user.role === "CITIZEN") {
      let query = "SELECT * FROM complaints WHERE user_id = ?";
      const params = [req.user.id];

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }
      if (search) {
        query += " AND (description LIKE ? OR id LIKE ? OR location LIKE ?)";
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      query += " ORDER BY datetime(created_at) DESC";
      complaints = db.prepare(query).all(...params);
    } else {
      // Officer: only return complaints that touch officer's department
      let query = `
        SELECT DISTINCT c.* 
        FROM complaints c
        JOIN issues i ON c.id = i.complaint_id
        WHERE 1=1
      `;
      const params = [];

      if (req.user.department) {
        query += " AND i.department = ?";
        params.push(req.user.department);
      }
      if (status) {
        query += " AND c.status = ?";
        params.push(status);
      }
      if (search) {
        query += " AND (c.description LIKE ? OR c.id LIKE ? OR c.location LIKE ?)";
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      query += " ORDER BY datetime(c.created_at) DESC";
      complaints = db.prepare(query).all(...params);
    }

    // Attach summary stats
    const enriched = complaints.map((c) => {
      const issues = db.prepare("SELECT id, display_id, title, status, department, risk_score, risk_level FROM issues WHERE complaint_id = ?").all(c.id);
      return {
        ...c,
        issuesCount: issues.length,
        issuesSummary: issues
      };
    });

    res.json({ complaints: enriched });
  } catch (err) {
    console.error("List complaints error:", err);
    res.status(500).json({ error: "Failed to list complaints" });
  }
});

// GET /api/complaints/:id - Full details
router.get("/:id", requireAuth, verifyComplaintAccess, (req, res) => {
  try {
    const complaint = req.complaint;

    // Fetch all issues
    const issues = db.prepare(`
      SELECT * FROM issues 
      WHERE complaint_id = ? 
      ORDER BY display_id ASC
    `).all(complaint.id);

    // Fetch actions & dependencies for each issue
    const enrichedIssues = issues.map((iss) => {
      const actions = db.prepare("SELECT * FROM actions WHERE issue_id = ? ORDER BY sequence_order ASC").all(iss.id);
      const depInfo = getIssueDependencies(iss.id);
      const riskInfo = calculateIssueRisk(iss, { isPrimaryDemo: complaint.id === "CF-2026-001247" });

      return {
        ...iss,
        actions,
        dependencies: depInfo,
        riskDetails: riskInfo
      };
    });

    // Fetch all dependencies in this complaint
    const allDependencies = db.prepare(`
      SELECT d.*, 
             s.display_id as source_display_id, s.title as source_title, s.department as source_department, s.status as source_status,
             t.display_id as target_display_id, t.title as target_title, t.department as target_department, t.status as target_status
      FROM dependencies d
      JOIN issues s ON d.source_issue_id = s.id
      JOIN issues t ON d.target_issue_id = t.id
      WHERE d.complaint_id = ?
    `).all(complaint.id);

    // Fetch audit trail
    const auditTrail = getAuditTrail(complaint.id);

    res.json({
      complaint,
      issues: enrichedIssues,
      dependencies: allDependencies,
      auditTrail
    });
  } catch (err) {
    console.error("Get complaint detail error:", err);
    res.status(500).json({ error: "Failed to retrieve case details" });
  }
});

// POST /api/complaints/reset-demo - Resets primary demo case to initial state
router.post("/reset-demo", requireAuth, (req, res) => {
  try {
    // Delete existing primary demo entities if present
    const demoId = "CF-2026-001247";
    db.prepare("DELETE FROM actions WHERE issue_id IN (SELECT id FROM issues WHERE complaint_id = ?)").run(demoId);
    db.prepare("DELETE FROM dependencies WHERE complaint_id = ?").run(demoId);
    db.prepare("DELETE FROM audit_events WHERE complaint_id = ?").run(demoId);
    db.prepare("DELETE FROM notifications WHERE complaint_id = ?").run(demoId);
    db.prepare("DELETE FROM credits WHERE issue_id IN (SELECT id FROM issues WHERE complaint_id = ?)").run(demoId);
    db.prepare("DELETE FROM issues WHERE complaint_id = ?").run(demoId);
    db.prepare("DELETE FROM complaints WHERE id = ?").run(demoId);

    // Re-seed cleanly
    seedPrimaryDemoCase();

    res.json({ message: "Primary demo case CF-2026-001247 reset successfully", demoId });
  } catch (err) {
    console.error("Reset demo error:", err);
    res.status(500).json({ error: "Failed to reset demo" });
  }
});

export default router;
