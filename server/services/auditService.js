import { db } from "../db/database.js";
import crypto from "node:crypto";

export function createAuditEvent({
  complaintId,
  issueId = null,
  eventType,
  actorId = "SYSTEM",
  actorName = "CivicFlow System",
  actorRole = "SYSTEM",
  description,
  metadata = null
}) {
  const id = `aud-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const now = new Date().toISOString();
  const metaStr = metadata ? JSON.stringify(metadata) : null;

  try {
    db.prepare(`
      INSERT INTO audit_events (
        id, complaint_id, issue_id, event_type, actor_id, actor_name, actor_role, description, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, complaintId, issueId, eventType, actorId, actorName, actorRole, description, metaStr, now);

    return { id, complaintId, eventType, description, createdAt: now };
  } catch (err) {
    console.error("Failed to create audit event:", err);
    return null;
  }
}

export function getAuditTrail(complaintId) {
  try {
    return db.prepare(`
      SELECT * FROM audit_events 
      WHERE complaint_id = ? 
      ORDER BY datetime(created_at) ASC, rowid ASC
    `).all(complaintId);
  } catch (err) {
    console.error("Failed to fetch audit trail:", err);
    return [];
  }
}
