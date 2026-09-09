import express from "express";
import { db } from "../db/database.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getIssueDependencies } from "../services/dependencyEngine.js";
import { getAuditTrail } from "../services/auditService.js";
import { calculateIssueRisk } from "../services/riskEngine.js";

const router = express.Router();

// GET /api/officer/dashboard - Authorized departmental workload summary & queues
router.get("/dashboard", requireAuth, requireRole("OFFICER"), (req, res) => {
  try {
    const officerDept = req.user.department;
    const { status, riskLevel, priority, search } = req.query;

    // Fetch department metrics
    const deptMetrics = db.prepare("SELECT * FROM departments WHERE name = ?").get(officerDept) || {
      name: officerDept,
      total_points: 0,
      issues_resolved: 0,
      citizen_confirmed_count: 0,
      sla_compliant_count: 0,
      reopened_count: 0,
      current_workload: 0
    };

    // Calculate dynamic cards
    const stats = {
      total: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ?").get(officerDept).count,
      pending: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ? AND status = 'PENDING'").get(officerDept).count,
      inProgress: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ? AND status = 'IN_PROGRESS'").get(officerDept).count,
      completed: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ? AND status IN ('COMPLETED', 'CONFIRMED')").get(officerDept).count,
      blocked: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ? AND status = 'BLOCKED'").get(officerDept).count,
      highRisk: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ? AND risk_score >= 75").get(officerDept).count,
      escalated: db.prepare("SELECT COUNT(*) as count FROM issues WHERE department = ? AND (escalation_stage = 'ESCALATED' OR status = 'REOPENED')").get(officerDept).count
    };

    // Query departmental issues queue
    let query = `
      SELECT i.*, c.description as complaint_description, c.location, c.citizen_name, c.created_at as complaint_created_at
      FROM issues i
      JOIN complaints c ON i.complaint_id = c.id
      WHERE i.department = ?
    `;
    const params = [officerDept];

    if (status) {
      query += " AND i.status = ?";
      params.push(status);
    }
    if (riskLevel) {
      query += " AND i.risk_level = ?";
      params.push(riskLevel);
    }
    if (search) {
      query += " AND (i.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY i.risk_score DESC, datetime(i.created_at) DESC";

    const issues = db.prepare(query).all(...params);

    // Enrich issues with dependency info
    const enrichedIssues = issues.map((iss) => {
      const depInfo = getIssueDependencies(iss.id);
      return {
        ...iss,
        dependencies: depInfo
      };
    });

    res.json({
      department: officerDept,
      metrics: deptMetrics,
      stats,
      issues: enrichedIssues
    });
  } catch (err) {
    console.error("Officer dashboard error:", err);
    res.status(500).json({ error: "Failed to load officer dashboard" });
  }
});

// GET /api/officer/cases/:id - Officer case detail
router.get("/cases/:id", requireAuth, requireRole("OFFICER"), (req, res) => {
  try {
    const complaintId = req.params.id;
    const officerDept = req.user.department;

    const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(complaintId);
    if (!complaint) return res.status(404).json({ error: "Case not found" });

    // Verify officer's department has at least one issue on this complaint
    const departmentIssues = db.prepare("SELECT * FROM issues WHERE complaint_id = ? AND department = ?").all(complaintId, officerDept);
    if (departmentIssues.length === 0 && officerDept) {
      return res.status(403).json({
        error: "Forbidden: This case does not contain tasks assigned to your department"
      });
    }

    // Fetch all issues on this complaint (officer needs to see overall ecosystem context)
    const allIssues = db.prepare("SELECT * FROM issues WHERE complaint_id = ? ORDER BY display_id ASC").all(complaintId);

    const enrichedIssues = allIssues.map((iss) => {
      const actions = db.prepare("SELECT * FROM actions WHERE issue_id = ? ORDER BY sequence_order ASC").all(iss.id);
      const depInfo = getIssueDependencies(iss.id);
      const riskInfo = calculateIssueRisk(iss, { isPrimaryDemo: complaint.id === "CF-2026-001247" });

      return {
        ...iss,
        actions,
        dependencies: depInfo,
        riskDetails: riskInfo,
        isMyDepartment: iss.department === officerDept
      };
    });

    // Fetch dependencies
    const allDependencies = db.prepare(`
      SELECT d.*, 
             s.display_id as source_display_id, s.title as source_title, s.department as source_department, s.status as source_status,
             t.display_id as target_display_id, t.title as target_title, t.department as target_department, t.status as target_status
      FROM dependencies d
      JOIN issues s ON d.source_issue_id = s.id
      JOIN issues t ON d.target_issue_id = t.id
      WHERE d.complaint_id = ?
    `).all(complaintId);

    // Audit trail
    const auditTrail = getAuditTrail(complaintId);

    res.json({
      complaint,
      issues: enrichedIssues,
      dependencies: allDependencies,
      auditTrail,
      officerDepartment: officerDept
    });
  } catch (err) {
    console.error("Officer case error:", err);
    res.status(500).json({ error: "Failed to load officer case details" });
  }
});

// GET /api/officer/all-departments - Returns overview of all municipal departments & their service points
router.get("/all-departments", requireAuth, (req, res) => {
  try {
    const list = db.prepare("SELECT * FROM departments ORDER BY total_points DESC").all();
    res.json({ departments: list });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch department roster" });
  }
});

export default router;
