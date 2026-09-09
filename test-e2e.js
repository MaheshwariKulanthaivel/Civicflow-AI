import { initializeDatabase, db, seedPrimaryDemoCase } from "./server/db/database.js";
import express from "express";
import cors from "cors";
import authRouter from "./server/routes/auth.js";
import complaintsRouter from "./server/routes/complaints.js";
import issuesRouter from "./server/routes/issues.js";
import actionsRouter from "./server/routes/actions.js";
import officerRouter from "./server/routes/officer.js";
import notificationsRouter from "./server/routes/notifications.js";
import auditRouter from "./server/routes/audit.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/actions", actionsRouter);
app.use("/api/officer", officerRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/audit", auditRouter);

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("==================================================================");
  console.log("CIVICFLOW AI — FULL END-TO-END AUTOMATED VERIFICATION SUITE");
  console.log("==================================================================");

  initializeDatabase();
  seedPrimaryDemoCase(true);
  const server = app.listen(PORT);

  try {
    // 1. Citizen Login
    console.log("\n[TEST 1] Citizen Authentication");
    const citizenLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "citizen@civicflow.demo", password: "Citizen@123" })
    });
    const citizenData = await citizenLoginRes.json();
    console.log("Status:", citizenLoginRes.status, "Token acquired:", !!citizenData.token, "User:", citizenData.user.name);
    if (citizenLoginRes.status !== 200) throw new Error("Citizen login failed");
    const citizenToken = citizenData.token;

    // 2. Officer Login (Drainage Department)
    console.log("\n[TEST 2] Officer Authentication (Drainage Dept)");
    const officerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "officer@civicflow.demo", password: "Officer@123" })
    });
    const officerData = await officerLoginRes.json();
    console.log("Status:", officerLoginRes.status, "Token acquired:", !!officerData.token, "Officer:", officerData.user.name, "Dept:", officerData.user.department);
    if (officerLoginRes.status !== 200) throw new Error("Officer login failed");
    const officerToken = officerData.token;

    // 3. Authorization Regression Test: Citizen -> Officer Dashboard (MUST RETURN 403)
    console.log("\n[TEST 3] RBAC Regression Test: Citizen accessing Officer Dashboard (Expect 403 Forbidden)");
    const forbiddenRes = await fetch(`${BASE_URL}/api/officer/dashboard`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log("Status:", forbiddenRes.status, "(Expected 403)");
    const forbiddenData = await forbiddenRes.json();
    console.log("Error message:", forbiddenData.error);
    if (forbiddenRes.status !== 403) throw new Error("RBAC failed: Citizen accessed officer dashboard!");

    // 4. Authorization Regression Test: Officer -> Unauthorized citizen resource (Expect 403 Forbidden)
    console.log("\n[TEST 4] RBAC Regression Test: Officer attempting to access another citizen's case (Expect 403 Forbidden)");
    // Let's test accessing a case from another department or unauthorized
    const otherDeptRes = await fetch(`${BASE_URL}/api/officer/cases/CF-2026-001249`, {
      headers: { Authorization: `Bearer ${officerToken}` } // CF-2026-001249 belongs to Water Dept, officer is Drainage Dept
    });
    console.log("Status:", otherDeptRes.status, "(Expected 403 Forbidden for mismatched department jurisdiction)");
    const otherDeptData = await otherDeptRes.json();
    console.log("Error message:", otherDeptData.error);
    if (otherDeptRes.status !== 403) throw new Error("RBAC failed: Officer accessed case outside department jurisdiction!");

    // 5. Citizen accessing own complaint (CF-2026-001247) (Expect 200 OK)
    console.log("\n[TEST 5] Citizen Accessing Own Primary Case (CF-2026-001247)");
    const caseRes = await fetch(`${BASE_URL}/api/complaints/CF-2026-001247`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log("Status:", caseRes.status, "(Expected 200 OK)");
    const caseData = await caseRes.json();
    console.log("Complaint Description:", caseData.complaint.description);
    console.log("Decomposed Issues Count:", caseData.issues.length);
    for (const iss of caseData.issues) {
      console.log(`  - [${iss.display_id}] ${iss.title} (${iss.department}) -> Status: ${iss.status}, Risk: ${iss.risk_score}`);
    }
    console.log("Overall Risk Score:", caseData.complaint.risk_score, "Level:", caseData.complaint.risk_level);

    // Verify initial states
    const sewageIssue = caseData.issues.find((i) => i.display_id === "I-1");
    const roadIssue = caseData.issues.find((i) => i.display_id === "I-2");
    const lightIssue = caseData.issues.find((i) => i.display_id === "I-3");

    if (sewageIssue.status !== "IN_PROGRESS") throw new Error(`Expected I-1 to be IN_PROGRESS, got ${sewageIssue.status}`);
    if (roadIssue.status !== "BLOCKED") throw new Error(`Expected I-2 to be BLOCKED, got ${roadIssue.status}`);
    if (lightIssue.status !== "COMPLETED") throw new Error(`Expected I-3 to be COMPLETED, got ${lightIssue.status}`);
    console.log("Initial state verified: Sewage = IN_PROGRESS, Road = BLOCKED, Streetlight = COMPLETED");

    // 6. Officer Dashboard
    console.log("\n[TEST 6] Officer Dashboard Workload & Queue");
    const dashRes = await fetch(`${BASE_URL}/api/officer/dashboard`, {
      headers: { Authorization: `Bearer ${officerToken}` }
    });
    const dashData = await dashRes.json();
    console.log("Department:", dashData.department);
    console.log("Total Workload:", dashData.stats.total, "Active Issues in Queue:", dashData.issues.length);
    console.log("Department Points:", dashData.metrics.total_points);

    // 7. Officer Completes Sewage Issue (I-1) -> Live Dependency Engine Unlock!
    console.log("\n[TEST 7] Officer Completes Sewage Issue (I-1) & Triggers Dependency Engine");
    const completeRes = await fetch(`${BASE_URL}/api/issues/${sewageIssue.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${officerToken}`
      },
      body: JSON.stringify({
        status: "COMPLETED",
        resolutionProof: "Suction pumps cleared trunk sewer; pipe collar resealed with concrete curing compound.",
        resolutionNotes: "Flow rate verified at 1200L/min; site disinfected."
      })
    });
    const completeData = await completeRes.json();
    console.log("Status:", completeRes.status, "Message:", completeData.message);
    console.log("Unlocked Issues Count:", completeData.unlockedIssues.length);
    for (const u of completeData.unlockedIssues) {
      console.log(`  -> Unlocked: [${u.display_id}] ${u.title} (${u.department}) -> New Status: ${u.status}`);
    }

    // 8. Verify State Transition in Database (I-2 Road must now be READY)
    console.log("\n[TEST 8] Verify Real Database State: Road Shifted from BLOCKED to READY TO START");
    const updatedCaseRes = await fetch(`${BASE_URL}/api/complaints/CF-2026-001247`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const updatedCaseData = await updatedCaseRes.json();
    const updatedRoad = updatedCaseData.issues.find((i) => i.display_id === "I-2");
    console.log("Road status in DB:", updatedRoad.status, "(Expected: READY)");
    if (updatedRoad.status !== "READY") throw new Error(`Road status did not transition to READY! Got: ${updatedRoad.status}`);

    // 9. Verify Audit Trail for DEPENDENCY_UNLOCKED
    console.log("\n[TEST 9] Verify Audit Trail Records");
    const auditRes = await fetch(`${BASE_URL}/api/audit/CF-2026-001247`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const auditData = await auditRes.json();
    console.log("Total audit events logged:", auditData.auditTrail.length);
    const unlockEvent = auditData.auditTrail.find((e) => e.event_type === "DEPENDENCY_UNLOCKED");
    if (!unlockEvent) throw new Error("DEPENDENCY_UNLOCKED audit event was not found!");
    console.log("Found DEPENDENCY_UNLOCKED audit event:", unlockEvent.description);

    // 10. Verify Citizen Notifications
    console.log("\n[TEST 10] Verify Citizen Live Notifications");
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const notifData = await notifRes.json();
    console.log("Citizen unread notifications count:", notifData.unreadCount);
    const unlockNotif = notifData.notifications.find((n) => n.type === "UNLOCKED");
    if (!unlockNotif) throw new Error("UNLOCKED notification was not dispatched to citizen!");
    console.log("Found unlock notification:", unlockNotif.title, "-", unlockNotif.message);

    // 11. Test Citizen Resolution Verification & Civic Service Credits
    console.log("\n[TEST 11] Citizen Verifies Resolution (I-1 Sewage) -> Civic Service Credits Awarded");
    const confirmRes = await fetch(`${BASE_URL}/api/issues/${sewageIssue.id}/confirm-resolution`, {
      method: "POST",
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const confirmData = await confirmRes.json();
    console.log("Status:", confirmRes.status, "Points Awarded:", confirmData.pointsAwarded);
    console.log("Credit Breakdown:", confirmData.breakdown);
    if (confirmData.pointsAwarded !== 17) throw new Error(`Expected 17 points, got ${confirmData.pointsAwarded}`);

    // 12. Test Prevent Duplicate Credit Award
    console.log("\n[TEST 12] Prevent Duplicate Credit Award Safeguard");
    const duplicateConfirmRes = await fetch(`${BASE_URL}/api/issues/${sewageIssue.id}/confirm-resolution`, {
      method: "POST",
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log("Duplicate confirm status:", duplicateConfirmRes.status, "(Expected 400 Bad Request)");
    if (duplicateConfirmRes.status !== 400) throw new Error("Safeguard failed: Allowed duplicate credit award!");

    // 13. Test Tamil Killer Demo Complaint (CF-2026-001248)
    console.log("\n[TEST 13] Verify Tamil Primary Demo Case (CF-2026-001248)");
    const tamilCaseRes = await fetch(`${BASE_URL}/api/complaints/CF-2026-001248`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const tamilCaseData = await tamilCaseRes.json();
    console.log("Tamil Complaint Description:", tamilCaseData.complaint.description);
    console.log("Tamil Decomposed Issues:", tamilCaseData.issues.map((i) => `${i.display_id}: ${i.title} (${i.status})`).join(" | "));
    if (tamilCaseData.issues.length !== 3) throw new Error("Tamil case did not produce 3 atomic issues!");

    // 14. Test Dynamic Multi-issue Decomposition from fresh submission (e.g. 2 issues)
    console.log("\n[TEST 14] Dynamic Decomposition on New Custom Grievance");
    const newGrievanceRes = await fetch(`${BASE_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        description: "Severe drinking water contamination in pipeline and garbage pile accumulating near apartment complex.",
        location: "Ward 9, East Sector",
        category: "Water & Sanitation"
      })
    });
    const newGrievanceData = await newGrievanceRes.json();
    console.log("Created Grievance ID:", newGrievanceData.complaintId);
    console.log("Decomposed Issues Count:", newGrievanceData.issuesCount, "Severity:", newGrievanceData.severity);
    if (newGrievanceData.issuesCount < 2) throw new Error("Failed to decompose multi-issue grievance!");

    // 15. CivicFlow Copilot Verification (English + Tamil NLP decomposition)
    console.log("\n[TEST 15] CivicFlow Copilot Grievance Intake (English & Tamil)");
    const copilotEnRes = await fetch(`${BASE_URL}/api/complaints/copilot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        text: "Sewage overflow and broken streetlight near elementary school",
        language: "en"
      })
    });
    const copilotEn = await copilotEnRes.json();
    console.log("Copilot English Understanding:", copilotEn.understanding);
    console.log("Copilot Detected Issues:", copilotEn.issues.map(i => `${i.title} (${i.department})`).join(" | "));
    if (!copilotEn.issues || copilotEn.issues.length < 2) throw new Error("Copilot English failed to decompose issues");

    const copilotTaRes = await fetch(`${BASE_URL}/api/complaints/copilot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        text: "பள்ளி அருகில் கழிவுநீர் தேங்கி சாலை சேதமடைந்துள்ளது",
        language: "ta"
      })
    });
    const copilotTa = await copilotTaRes.json();
    console.log("Copilot Tamil Understanding:", copilotTa.understanding);
    console.log("Copilot Tamil Detected Issues:", copilotTa.issues.map(i => `${i.title} (${i.department})`).join(" | "));
    if (!copilotTa.issues || copilotTa.issues.length < 2) throw new Error("Copilot Tamil failed to decompose issues");

    // 16. Verify Civic Impact & Community Signal on Primary Case
    console.log("\n[TEST 16] Verify Civic Impact & Community Signal on Primary Case");
    console.log("Civic Impact Level:", caseData.civicImpact?.level, "Score:", caseData.civicImpact?.score);
    console.log("Impact Domains:", caseData.civicImpact?.domains?.map(d => `${d.label}: ${d.score}/100`).join(", "));
    if (caseData.civicImpact?.level !== "HIGH") throw new Error(`Expected HIGH civic impact, got ${caseData.civicImpact?.level}`);
    
    console.log("Community Signal Cluster:", caseData.communitySignal?.hasCluster, "Count:", caseData.communitySignal?.clusterCount);
    console.log("Cluster Locality:", caseData.communitySignal?.locality);
    console.log("Preventive Insight:", caseData.communitySignal?.preventiveInsight?.title);
    if (caseData.communitySignal?.clusterCount !== 7) {
      throw new Error(`Expected clusterCount of 7, got ${caseData.communitySignal?.clusterCount}`);
    }

    // 17. Citizen Request Update & Audit Trail
    console.log("\n[TEST 17] Citizen Request Update (CivicFlow Connect)");
    const reqUpdateRes = await fetch(`${BASE_URL}/api/complaints/CF-2026-001247/request-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({ reason: "School reopening tomorrow morning, critical need for status" })
    });
    const reqUpdateData = await reqUpdateRes.json();
    console.log("Request Update Status:", reqUpdateRes.status, "Response:", reqUpdateData.message);
    if (reqUpdateRes.status !== 200) throw new Error("Request Update failed!");

    const postReqAuditRes = await fetch(`${BASE_URL}/api/audit/CF-2026-001247`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    const postReqAuditData = await postReqAuditRes.json();
    const updateReqEvent = postReqAuditData.auditTrail.find((e) => e.event_type === "CITIZEN_UPDATE_REQUESTED");
    if (!updateReqEvent) throw new Error("CITIZEN_UPDATE_REQUESTED audit event was not found!");
    console.log("Verified audit trail contains CITIZEN_UPDATE_REQUESTED event:", updateReqEvent.description);

    // 18. Officer Dashboard Enhanced Metrics & Problem Graph
    console.log("\n[TEST 18] Officer Operations Control Center Enhanced Metrics");
    console.log("Active Issues:", dashData.active, "Due Soon:", dashData.dueSoon, "Avg Hours:", dashData.average_resolution_hours);
    console.log("Primary Case Graph Included:", !!dashData.primaryCaseGraph, "Graph Issues:", dashData.primaryCaseGraph?.issues?.length);
    if (!dashData.primaryCaseGraph || !dashData.communitySignals) {
      throw new Error("Officer dashboard missing primaryCaseGraph or communitySignals");
    }

    console.log("\n==================================================================");
    console.log("ALL 18 E2E VERIFICATION TESTS PASSED FLAWLESSLY!");
    console.log("==================================================================");

  } finally {
    seedPrimaryDemoCase(true);
    server.close();
  }
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("\nTEST SUITE FAILED:", err);
  process.exit(1);
});
