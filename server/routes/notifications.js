import express from "express";
import { db } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { getUserNotifications } from "../services/notificationService.js";

const router = express.Router();

// GET /api/notifications - User's notifications
router.get("/", requireAuth, (req, res) => {
  try {
    const list = getUserNotifications(req.user);
    const unreadCount = list.filter((n) => n.is_read === 0).length;
    res.json({ notifications: list, unreadCount });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/:id/read - Mark read
router.patch("/:id/read", requireAuth, (req, res) => {
  try {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// POST /api/notifications/mark-all-read
router.post("/mark-all-read", requireAuth, (req, res) => {
  try {
    if (req.user.role === "CITIZEN") {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? OR (role = 'CITIZEN' AND user_id IS NULL)").run(req.user.id);
    } else {
      db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? OR department = ?").run(req.user.id, req.user.department || "");
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;
