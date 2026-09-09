import express from "express";
import { db, verifyPassword } from "../db/database.js";
import { generateToken, requireAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Validate expected role if requested (e.g. logging into citizen portal with officer account or vice-versa)
  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      error: `Access Denied: This portal requires ${expectedRole} privileges. Your account has ${user.role} role.`
    });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    }
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Stateless JWT logout
  res.json({ message: "Successfully logged out" });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, email, name, role, department, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User profile not found" });
  }
  res.json({ user });
});

export default router;
