import { db } from "../db/database.js";
import { createAuditEvent } from "./auditService.js";
import { createNotification } from "./notificationService.js";
import { calculateIssueRisk, calculateComplaintRisk } from "./riskEngine.js";

/**
 * Dependency Engine:
 * Manages the chain of responsibility and cross-department prerequisites.
 * Shifts dependent issues from BLOCKED to READY in real database state upon resolution of prerequisite.
 */
export function evaluateDependencies(completedIssueId, actor = { id: "SYSTEM", name: "Dependency Engine", role: "SYSTEM" }) {
  const completedIssue = db.prepare("SELECT * FROM issues WHERE id = ?").get(completedIssueId);
  if (!completedIssue) return [];

  // 1. Mark dependencies originating from this issue as SATISFIED
  db.prepare(`
    UPDATE dependencies 
    SET status = 'SATISFIED' 
    WHERE source_issue_id = ?
  `).run(completedIssueId);

  // 2. Find all target issues that depended on this completed issue
  const outgoingDeps = db.prepare(`
    SELECT * FROM dependencies 
    WHERE source_issue_id = ?
  `).all(completedIssueId);

  const unlockedIssues = [];

  for (const dep of outgoingDeps) {
    const targetIssueId = dep.target_issue_id;

    // Check if ALL prerequisites for this target issue are satisfied
    const pendingPrereqs = db.prepare(`
      SELECT d.*, s.title as source_title 
      FROM dependencies d
      JOIN issues s ON d.source_issue_id = s.id
      WHERE d.target_issue_id = ? AND d.status != 'SATISFIED'
    `).all(targetIssueId);

    if (pendingPrereqs.length === 0) {
      const targetIssue = db.prepare("SELECT * FROM issues WHERE id = ?").get(targetIssueId);

      // If target issue is currently BLOCKED, transition it to READY
      if (targetIssue && targetIssue.status === "BLOCKED") {
        const now = new Date().toISOString();

        // Recalculate target issue risk with new READY state
        const updatedRisk = calculateIssueRisk({ ...targetIssue, status: "READY" });

        db.prepare(`
          UPDATE issues 
          SET status = 'READY', 
              risk_score = ?, 
              risk_level = ?, 
              escalation_stage = 'NORMAL',
              updated_at = ?
          WHERE id = ?
        `).run(updatedRisk.score, updatedRisk.level, now, targetIssueId);

        // Update parent complaint overall risk
        const siblingIssues = db.prepare("SELECT * FROM issues WHERE complaint_id = ?").all(targetIssue.complaint_id);
        const complaintRisk = calculateComplaintRisk(siblingIssues);
        db.prepare(`
          UPDATE complaints 
          SET risk_score = ?, risk_level = ?, updated_at = ? 
          WHERE id = ?
        `).run(complaintRisk.score, complaintRisk.level, now, targetIssue.complaint_id);

        // Create Audit Event: DEPENDENCY_UNLOCKED
        createAuditEvent({
          complaintId: targetIssue.complaint_id,
          issueId: targetIssue.id,
          eventType: "DEPENDENCY_UNLOCKED",
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          description: `Prerequisite dependency satisfied: ${completedIssue.display_id} (${completedIssue.title}) marked completed. ${targetIssue.display_id} (${targetIssue.title}) transitioned from BLOCKED to READY TO START.`,
          metadata: {
            sourceIssueId: completedIssue.id,
            targetIssueId: targetIssue.id,
            newStatus: "READY",
            newRiskScore: updatedRisk.score
          }
        });

        // Get complaint details for citizen notification
        const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(targetIssue.complaint_id);

        // Citizen notification
        createNotification({
          userId: complaint ? complaint.user_id : null,
          role: "CITIZEN",
          complaintId: targetIssue.complaint_id,
          issueId: targetIssue.id,
          title: "Road Issue Ready to Start",
          message: `Your ${targetIssue.title} (${targetIssue.display_id}) is now READY TO START because ${completedIssue.title} was cleared.`,
          type: "UNLOCKED"
        });

        // Department notification
        createNotification({
          department: targetIssue.department,
          role: "OFFICER",
          complaintId: targetIssue.complaint_id,
          issueId: targetIssue.id,
          title: "Work Order Unlocked: Ready to Start",
          message: `${targetIssue.title} (${targetIssue.display_id}) has been unlocked after ${completedIssue.department} completed prerequisite works.`,
          type: "UNLOCKED"
        });

        unlockedIssues.push({
          id: targetIssue.id,
          display_id: targetIssue.display_id,
          title: targetIssue.title,
          department: targetIssue.department,
          status: "READY"
        });
      }
    }
  }

  return unlockedIssues;
}

/**
 * Generates citizen-friendly and officer-specific dependency explanations
 */
export function getIssueDependencies(issueId) {
  const incoming = db.prepare(`
    SELECT d.*, s.display_id as source_display_id, s.title as source_title, s.department as source_department, s.status as source_status
    FROM dependencies d
    JOIN issues s ON d.source_issue_id = s.id
    WHERE d.target_issue_id = ?
  `).all(issueId);

  const outgoing = db.prepare(`
    SELECT d.*, t.display_id as target_display_id, t.title as target_title, t.department as target_department, t.status as target_status
    FROM dependencies d
    JOIN issues t ON d.target_issue_id = t.id
    WHERE d.source_issue_id = ?
  `).all(issueId);

  let citizenExplanation = null;
  let officerExplanation = null;

  if (incoming.length > 0) {
    const blocking = incoming.find((i) => i.source_status !== "COMPLETED");
    if (blocking) {
      citizenExplanation = `Your repair is waiting because ${blocking.source_title.toLowerCase()} clearance must be completed first.`;
      officerExplanation = `Blocked by prerequisite: ${blocking.source_display_id} ${blocking.source_title} (${blocking.source_department}) - Status: ${blocking.source_status}`;
    } else {
      citizenExplanation = `All prerequisite work has been completed. Issue is ready for direct intervention.`;
      officerExplanation = `All dependencies satisfied. Fully operational.`;
    }
  }

  return {
    incoming,
    outgoing,
    citizenExplanation,
    officerExplanation
  };
}
