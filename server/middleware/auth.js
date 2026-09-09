import jwt from "jsonwebtoken";
import { db } from "../db/database.js";

const JWT_SECRET = process.env.JWT_SECRET || "civicflow_jwt_secret_key_2026";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

export function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Please log in" });
    }

    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted. Requires ${roles.join(" or ")} role. Current: ${req.user.role}`
      });
    }
    next();
  };
}

export function verifyComplaintAccess(req, res, next) {
  const complaintId = req.params.id || req.params.complaintId;
  if (!complaintId) return next();

  const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(complaintId);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  // Citizens can ONLY view their own complaints
  if (req.user.role === "CITIZEN") {
    if (complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You are not authorized to access this complaint" });
    }
  }

  // Officers can only access complaints that contain issues belonging to their department
  if (req.user.role === "OFFICER") {
    const issues = db.prepare("SELECT department FROM issues WHERE complaint_id = ?").all(complaintId);
    const hasDeptIssue = issues.some((i) => i.department === req.user.department);
    if (!hasDeptIssue && req.user.department) {
      return res.status(403).json({ error: "Forbidden: This case does not fall under your department's jurisdiction" });
    }
  }

  req.complaint = complaint;
  next();
}

export function verifyIssueModificationAccess(req, res, next) {
  const issueId = req.params.id || req.params.issueId;
  if (!issueId) return next();

  const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  // Officers can ONLY modify issues belonging to their own department
  if (req.user.role === "OFFICER") {
    if (req.user.department && issue.department !== req.user.department) {
      return res.status(403).json({
        error: `Forbidden: Officer cannot modify issues outside their assigned department (${req.user.department} vs ${issue.department})`
      });
    }
  }

  // Citizens cannot modify issue statuses directly
  if (req.user.role === "CITIZEN") {
    return res.status(403).json({ error: "Forbidden: Citizens cannot modify issue parameters directly" });
  }

  req.issue = issue;
  next();
}
