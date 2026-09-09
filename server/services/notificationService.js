import { db } from "../db/database.js";
import crypto from "node:crypto";

export function createNotification({
  userId = null,
  role = null,
  department = null,
  complaintId = null,
  issueId = null,
  title,
  message,
  type = "INFO"
}) {
  const id = `notif-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  const now = new Date().toISOString();

  try {
    db.prepare(`
      INSERT INTO notifications (
        id, user_id, role, department, complaint_id, issue_id, title, message, type, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, userId, role, department, complaintId, issueId, title, message, type, now);

    return { id, title, message, type, createdAt: now };
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}

export function getUserNotifications(user) {
  try {
    if (user.role === "CITIZEN") {
      return db.prepare(`
        SELECT * FROM notifications 
        WHERE user_id = ? OR (role = 'CITIZEN' AND user_id IS NULL)
        ORDER BY datetime(created_at) DESC
        LIMIT 50
      `).all(user.id);
    } else {
      // Officer: can see notifications for their user_id, their department, or officer role
      return db.prepare(`
        SELECT * FROM notifications 
        WHERE user_id = ? OR department = ? OR (role = 'OFFICER' AND department IS NULL AND user_id IS NULL)
        ORDER BY datetime(created_at) DESC
        LIMIT 50
      `).all(user.id, user.department || "");
    }
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}
