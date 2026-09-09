import express from "express";
import { db } from "../db/database.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createAuditEvent } from "../services/auditService.js";

const router = express.Router();

// PATCH /api/actions/:id/status - Update action SOP status
router.patch("/:id/status", requireAuth, requireRole("OFFICER"), (req, res) => {
  try {
    const { status } = req.body;
    const actionId = req.params.id;

    const action = db.prepare("SELECT * FROM actions WHERE id = ?").get(actionId);
    if (!action) return res.status(404).json({ error: "Action item not found" });

    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(action.issue_id);
    if (!issue) return res.status(404).json({ error: "Parent issue not found" });

    // Verify officer department jurisdiction
    if (req.user.department && issue.department !== req.user.department) {
      return res.status(403).json({
        error: `Forbidden: You cannot modify action items for ${issue.department}`
      });
    }

    const now = new Date().toISOString();
    const completedAt = status === "COMPLETED" ? now : null;
    const completedBy = status === "COMPLETED" ? req.user.name : null;

    db.prepare(`
      UPDATE actions 
      SET status = ?, completed_at = ?, completed_by = ? 
      WHERE id = ?
    `).run(status, completedAt, completedBy, actionId);

    // Audit event
    createAuditEvent({
      complaintId: issue.complaint_id,
      issueId: issue.id,
      eventType: "ACTION_STATUS_CHANGED",
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: "OFFICER",
      description: `Action #${action.sequence_order} ("${action.title}") set to ${status}.`
    });

    const updated = db.prepare("SELECT * FROM actions WHERE id = ?").get(actionId);
    res.json({ action: updated });
  } catch (err) {
    console.error("Update action error:", err);
    res.status(500).json({ error: "Failed to update action status" });
  }
});

export default router;
