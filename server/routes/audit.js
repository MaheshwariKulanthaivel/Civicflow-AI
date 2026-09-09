import express from "express";
import { requireAuth, verifyComplaintAccess } from "../middleware/auth.js";
import { getAuditTrail } from "../services/auditService.js";

const router = express.Router();

// GET /api/audit/:complaintId - Full chronological audit trail
router.get("/:complaintId", requireAuth, verifyComplaintAccess, (req, res) => {
  try {
    const events = getAuditTrail(req.params.complaintId);
    res.json({ auditTrail: events });
  } catch (err) {
    console.error("Fetch audit error:", err);
    res.status(500).json({ error: "Failed to fetch audit records" });
  }
});

export default router;
