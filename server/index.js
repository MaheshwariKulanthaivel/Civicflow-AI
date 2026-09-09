import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeDatabase } from "./db/database.js";

import authRouter from "./routes/auth.js";
import complaintsRouter from "./routes/complaints.js";
import issuesRouter from "./routes/issues.js";
import actionsRouter from "./routes/actions.js";
import officerRouter from "./routes/officer.js";
import notificationsRouter from "./routes/notifications.js";
import auditRouter from "./routes/audit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Seed Demo Data
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/actions", actionsRouter);
app.use("/api/officer", officerRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/audit", auditRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "CivicFlow AI",
    tagline: "AI-powered governance orchestration for faster grievance resolution",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production build
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      res.status(200).send("CivicFlow AI API is running. Vite client is active on port 5173.");
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`CivicFlow AI Governance Orchestration Server Running`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
