import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "civicflow.db");

export const db = new DatabaseSync(dbPath);

// Enable foreign keys & WAL mode if desired
db.exec("PRAGMA foreign_keys = ON;");

// Password hashing utility
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, key] = storedHash.split(":");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(key));
  } catch (err) {
    return false;
  }
}

// Initialize tables
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      jurisdiction TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      total_points INTEGER DEFAULT 0,
      issues_resolved INTEGER DEFAULT 0,
      citizen_confirmed_count INTEGER DEFAULT 0,
      sla_compliant_count INTEGER DEFAULT 0,
      reopened_count INTEGER DEFAULT 0,
      current_workload INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      citizen_name TEXT NOT NULL,
      description TEXT NOT NULL,
      language TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      photo_url TEXT,
      video_url TEXT,
      status TEXT NOT NULL,
      severity TEXT NOT NULL,
      priority TEXT NOT NULL,
      risk_score INTEGER DEFAULT 0,
      risk_level TEXT DEFAULT 'LOW',
      analysis_source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL,
      complaint_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      department TEXT NOT NULL,
      routing_reason TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_officer_id TEXT,
      assigned_officer_name TEXT,
      deadline TEXT NOT NULL,
      deadline_hours INTEGER NOT NULL,
      risk_score INTEGER DEFAULT 0,
      risk_level TEXT DEFAULT 'LOW',
      escalation_stage TEXT DEFAULT 'NORMAL',
      resolution_proof TEXT,
      resolution_notes TEXT,
      resolved_at TEXT,
      confirmed_at TEXT,
      reopened_at TEXT,
      reopen_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id)
    );

    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      title TEXT NOT NULL,
      sequence_order INTEGER NOT NULL,
      status TEXT NOT NULL,
      completed_at TEXT,
      completed_by TEXT,
      FOREIGN KEY (issue_id) REFERENCES issues(id)
    );

    CREATE TABLE IF NOT EXISTS dependencies (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      source_issue_id TEXT NOT NULL,
      target_issue_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id),
      FOREIGN KEY (source_issue_id) REFERENCES issues(id),
      FOREIGN KEY (target_issue_id) REFERENCES issues(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT,
      department TEXT,
      complaint_id TEXT,
      issue_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      complaint_id TEXT NOT NULL,
      issue_id TEXT,
      event_type TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS credits (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL,
      issue_id TEXT NOT NULL UNIQUE,
      points INTEGER NOT NULL,
      rule_breakdown TEXT NOT NULL,
      awarded_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const countUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (countUsers > 0) return; // Already seeded

  console.log("Seeding initial database data...");

  // 1. Seed Departments
  const departments = [
    { id: "dept-1", name: "Drainage Department", jurisdiction: "Ward 14 - Stormwater & Sewerage Cell", email: "drainage@city.gov", points: 45, workload: 14 },
    { id: "dept-2", name: "Roads Department", jurisdiction: "Ward 14 - Highways & Urban Pavements", email: "roads@city.gov", points: 30, workload: 22 },
    { id: "dept-3", name: "Electrical Department", jurisdiction: "Ward 14 - Public Illumination & Grid", email: "electrical@city.gov", points: 60, workload: 8 },
    { id: "dept-4", name: "Water Department", jurisdiction: "Ward 14 - Potable Water Distribution", email: "water@city.gov", points: 40, workload: 11 },
    { id: "dept-5", name: "Sanitation Department", jurisdiction: "Ward 14 - Solid Waste Authority", email: "sanitation@city.gov", points: 55, workload: 15 },
    { id: "dept-6", name: "Health Department", jurisdiction: "Ward 14 - Epidemiological Surveillance", email: "health@city.gov", points: 35, workload: 6 }
  ];

  const insertDept = db.prepare(`
    INSERT INTO departments (id, name, jurisdiction, contact_email, total_points, current_workload)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const d of departments) {
    insertDept.run(d.id, d.name, d.jurisdiction, d.email, d.points, d.workload);
  }

  // 2. Seed Demo Users
  const citizenHash = hashPassword("Citizen@123");
  const officerHash = hashPassword("Officer@123");

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, department, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  // Primary Demo Citizen
  insertUser.run("user-citizen-1", "citizen@civicflow.demo", citizenHash, "Kavitha Raman", "CITIZEN", null, now);
  // Secondary Citizen
  insertUser.run("user-citizen-2", "citizen2@civicflow.demo", citizenHash, "Manoj Kumar", "CITIZEN", null, now);

  // Primary Demo Officer (Drainage Department)
  insertUser.run("user-officer-1", "officer@civicflow.demo", officerHash, "Officer Rajesh Kumar (Drainage)", "OFFICER", "Drainage Department", now);
  // Roads Officer
  insertUser.run("user-officer-2", "roads.officer@civicflow.demo", officerHash, "Officer Ananya Sen (Roads)", "OFFICER", "Roads Department", now);
  // Electrical Officer
  insertUser.run("user-officer-3", "electrical.officer@civicflow.demo", officerHash, "Officer Vikram Seth (Electrical)", "OFFICER", "Electrical Department", now);

  // 3. Seed Primary Killer Demo Case (CF-2026-001247)
  seedPrimaryDemoCase();

  // 4. Seed 4 other realistic complaints
  seedSecondaryDemoCases();
}

export function seedPrimaryDemoCase() {
  const existing = db.prepare("SELECT id FROM complaints WHERE id = 'CF-2026-001247'").get();
  if (existing) return;

  const now = new Date().toISOString();
  const deadlineDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  // Insert Complaint
  db.prepare(`
    INSERT INTO complaints (
      id, user_id, citizen_name, description, language, location, category, 
      photo_url, video_url, status, severity, priority, risk_score, risk_level, analysis_source, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "CF-2026-001247",
    "user-citizen-1",
    "Kavitha Raman",
    "Heavy sewage overflow near the school has damaged the road, traffic is affected and streetlights aren't working.",
    "English",
    "Near St. Mary's School, Ward 14, Central Sector",
    "Sewage & Road Infrastructure",
    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=600&q=80",
    null,
    "IN_PROGRESS",
    "HIGH",
    "HIGH",
    82,
    "HIGH",
    "Deterministic fallback",
    now,
    now
  );

  // Insert Issue 1: Sewage Overflow (IN_PROGRESS)
  db.prepare(`
    INSERT INTO issues (
      id, display_id, complaint_id, title, category, severity, department, routing_reason,
      status, assigned_officer_id, assigned_officer_name, deadline, deadline_hours,
      risk_score, risk_level, escalation_stage, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "issue-1247-1",
    "I-1",
    "CF-2026-001247",
    "Sewage Overflow",
    "Sewage overflow",
    "HIGH",
    "Drainage Department",
    "Category = Sewage overflow | Asset = Underground sewerage trunk mains | Jurisdiction = Ward 14 Stormwater & Sewerage Cell. Therefore routed to Drainage Department under urban public health mandate.",
    "IN_PROGRESS",
    "user-officer-1",
    "Officer Rajesh Kumar (Drainage)",
    deadlineDate,
    24,
    75,
    "HIGH",
    "SUPERVISOR_WARNING",
    now,
    now
  );

  // Insert Issue 2: Road Damage (BLOCKED)
  db.prepare(`
    INSERT INTO issues (
      id, display_id, complaint_id, title, category, severity, department, routing_reason,
      status, assigned_officer_id, assigned_officer_name, deadline, deadline_hours,
      risk_score, risk_level, escalation_stage, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "issue-1247-2",
    "I-2",
    "CF-2026-001247",
    "Road Damage",
    "Road surface damage",
    "HIGH",
    "Roads Department",
    "Category = Road surface damage | Asset = Asphalt carriage road surface | Jurisdiction = Ward 14 Highways & Urban Pavements. Therefore routed to Roads Department.",
    "BLOCKED",
    "user-officer-2",
    "Officer Ananya Sen (Roads)",
    new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    48,
    82,
    "HIGH",
    "SUPERVISOR_WARNING",
    now,
    now
  );

  // Insert Issue 3: Streetlight Failure (COMPLETED)
  db.prepare(`
    INSERT INTO issues (
      id, display_id, complaint_id, title, category, severity, department, routing_reason,
      status, assigned_officer_id, assigned_officer_name, deadline, deadline_hours,
      risk_score, risk_level, escalation_stage, resolution_proof, resolved_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "issue-1247-3",
    "I-3",
    "CF-2026-001247",
    "Streetlight Failure",
    "Streetlight failure",
    "MEDIUM",
    "Electrical Department",
    "Category = Streetlight failure | Asset = Public LED luminaire & pole | Jurisdiction = Municipal Electrical Distribution Wing. Therefore routed to Electrical Department.",
    "COMPLETED",
    "user-officer-3",
    "Officer Vikram Seth (Electrical)",
    deadlineDate,
    24,
    15,
    "LOW",
    "NORMAL",
    "90W LED luminaire replaced and terminal timer relay tested successfully.",
    now,
    now,
    now
  );

  // Insert Dependency: I-1 -> I-2
  db.prepare(`
    INSERT INTO dependencies (id, complaint_id, source_issue_id, target_issue_id, reason, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    "dep-1247-1",
    "CF-2026-001247",
    "issue-1247-1",
    "issue-1247-2",
    "Road resurfacing cannot begin until underground sewage overflow is completely repaired and surrounding sub-base foundation is dry.",
    "WAITING"
  );

  // Insert Actions for I-1 (Sewage)
  const sewageActions = [
    { id: "act-1247-1-1", title: "Inspect overflow site and locate ruptured culvert collar", order: 1, status: "COMPLETED" },
    { id: "act-1247-1-2", title: "Deploy suction and motorized de-silting machinery", order: 2, status: "IN_PROGRESS" },
    { id: "act-1247-1-3", title: "Clear subterranean blockage and flush trunk conduit", order: 3, status: "PENDING" },
    { id: "act-1247-1-4", title: "Seal pipe collar & disinfect immediate school perimeter", order: 4, status: "PENDING" },
    { id: "act-1247-1-5", title: "Verify hydrologic gradient restoration", order: 5, status: "PENDING" }
  ];
  for (const a of sewageActions) {
    db.prepare(`INSERT INTO actions (id, issue_id, title, sequence_order, status) VALUES (?, ?, ?, ?, ?)`).run(
      a.id, "issue-1247-1", a.title, a.order, a.status
    );
  }

  // Insert Actions for I-2 (Road)
  const roadActions = [
    { id: "act-1247-2-1", title: "Survey damaged road area and measure erosion depth", order: 1, status: "PENDING" },
    { id: "act-1247-2-2", title: "Create inter-departmental work order & requisition asphalt", order: 2, status: "PENDING" },
    { id: "act-1247-2-3", title: "Schedule site excavation post-sewage repair verification", order: 3, status: "PENDING" },
    { id: "act-1247-2-4", title: "Compact stone aggregate base layer", order: 4, status: "PENDING" },
    { id: "act-1247-2-5", title: "Apply dense bituminous macadam & finalize roller compaction", order: 5, status: "PENDING" }
  ];
  for (const a of roadActions) {
    db.prepare(`INSERT INTO actions (id, issue_id, title, sequence_order, status) VALUES (?, ?, ?, ?, ?)`).run(
      a.id, "issue-1247-2", a.title, a.order, a.status
    );
  }

  // Insert Actions for I-3 (Streetlight)
  const lightActions = [
    { id: "act-1247-3-1", title: "Inspect luminaire power supply and junction control box", order: 1, status: "COMPLETED" },
    { id: "act-1247-3-2", title: "Replace burned 90W LED fixture and driver", order: 2, status: "COMPLETED" },
    { id: "act-1247-3-3", title: "Test phase-neutral voltage and automatic timer relay", order: 3, status: "COMPLETED" }
  ];
  for (const a of lightActions) {
    db.prepare(`INSERT INTO actions (id, issue_id, title, sequence_order, status) VALUES (?, ?, ?, ?, ?)`).run(
      a.id, "issue-1247-3", a.title, a.order, a.status
    );
  }

  // Insert Notifications
  db.prepare(`
    INSERT INTO notifications (id, user_id, role, department, complaint_id, issue_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "notif-1247-1",
    "user-citizen-1",
    "CITIZEN",
    null,
    "CF-2026-001247",
    "issue-1247-2",
    "Road Repair Waiting on Dependency",
    "Your road repair is waiting because sewage clearance must be completed first.",
    "INFO",
    0,
    now
  );

  db.prepare(`
    INSERT INTO notifications (id, user_id, role, department, complaint_id, issue_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "notif-1247-2",
    "user-officer-1",
    "OFFICER",
    "Drainage Department",
    "CF-2026-001247",
    "issue-1247-1",
    "Critical Dependency Blocking Road Dept",
    "Roads Department is blocked waiting for your resolution of Sewage Overflow (I-1). Priority intervention required.",
    "WARNING",
    0,
    now
  );

  // Insert Initial Audit Events
  const audits = [
    {
      id: "aud-1247-1",
      type: "COMPLAINT_SUBMITTED",
      actorId: "user-citizen-1",
      actorName: "Kavitha Raman",
      actorRole: "CITIZEN",
      desc: "Grievance CF-2026-001247 registered near St. Mary's School, Ward 14."
    },
    {
      id: "aud-1247-2",
      type: "COMPLAINT_ANALYZED",
      actorId: "SYSTEM",
      actorName: "CivicFlow Intelligence",
      actorRole: "SYSTEM",
      desc: "Decomposed single complaint into 3 distinct atomic issues with dependency orchestration."
    },
    {
      id: "aud-1247-3",
      type: "DEPARTMENT_ASSIGNED",
      actorId: "SYSTEM",
      actorName: "Responsibility Engine",
      actorRole: "SYSTEM",
      desc: "Assigned I-1 to Drainage Department, I-2 to Roads Department, and I-3 to Electrical Department."
    },
    {
      id: "aud-1247-4",
      type: "DEPENDENCY_CREATED",
      actorId: "SYSTEM",
      actorName: "Dependency Engine",
      actorRole: "SYSTEM",
      desc: "Established hard prerequisite: I-1 (Sewage Overflow) must be COMPLETED before I-2 (Road Damage) is unblocked."
    },
    {
      id: "aud-1247-5",
      type: "RISK_CALCULATED",
      actorId: "SYSTEM",
      actorName: "Risk Engine",
      actorRole: "SYSTEM",
      desc: "Assessed overall complaint risk at 82/100 (HIGH RISK) due to school proximity and cross-department dependency blockage."
    },
    {
      id: "aud-1247-6",
      type: "ISSUE_COMPLETED",
      actorId: "user-officer-3",
      actorName: "Officer Vikram Seth",
      actorRole: "OFFICER",
      desc: "I-3 (Streetlight Failure) marked COMPLETED after LED fixture replacement."
    }
  ];

  for (const a of audits) {
    db.prepare(`
      INSERT INTO audit_events (id, complaint_id, issue_id, event_type, actor_id, actor_name, actor_role, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(a.id, "CF-2026-001247", null, a.type, a.actorId, a.actorName, a.actorRole, a.desc, now);
  }
}

function seedSecondaryDemoCases() {
  const now = new Date().toISOString();
  const deadlineDate = new Date(Date.now() + 36 * 3600 * 1000).toISOString();

  // 2. Tamil Killer Demo Complaint (CF-2026-001248)
  const existingTamil = db.prepare("SELECT id FROM complaints WHERE id = 'CF-2026-001248'").get();
  if (!existingTamil) {
    db.prepare(`
      INSERT INTO complaints (
        id, user_id, citizen_name, description, language, location, category,
        photo_url, video_url, status, severity, priority, risk_score, risk_level, analysis_source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "CF-2026-001248",
      "user-citizen-1",
      "Kavitha Raman",
      "பள்ளிக்கு அருகில் கழிவுநீர் தேங்கி சாலை சேதமடைந்துள்ளது. தெருவிளக்குகளும் வேலை செய்யவில்லை.",
      "Tamil",
      "அரசு பள்ளி அருகில், வார்டு 14",
      "கழிவுநீர் மற்றும் சாலை பராமரிப்பு",
      null,
      null,
      "IN_PROGRESS",
      "HIGH",
      "HIGH",
      82,
      "HIGH",
      "Deterministic fallback",
      now,
      now
    );

    // Tamil issues
    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1248-1",
      "I-1",
      "CF-2026-001248",
      "கழிவுநீர் தேக்கம் (Sewage Overflow)",
      "Sewage overflow",
      "HIGH",
      "Drainage Department",
      "வகை: கழிவுநீர் தேக்கம் | பொறுப்பு: வடிகால் வாரியம்",
      "IN_PROGRESS",
      deadlineDate,
      24,
      75,
      "HIGH",
      now,
      now
    );

    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1248-2",
      "I-2",
      "CF-2026-001248",
      "சாலை சேதம் (Road Damage)",
      "Road surface damage",
      "HIGH",
      "Roads Department",
      "வகை: சாலை சேதம் | பொறுப்பு: நெடுஞ்சாலை துறை (வடிகால் பணி முடிவடைய காத்திருக்கிறது)",
      "BLOCKED",
      deadlineDate,
      48,
      82,
      "HIGH",
      now,
      now
    );

    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1248-3",
      "I-3",
      "CF-2026-001248",
      "தெருவிளக்கு பழுது (Streetlight Failure)",
      "Streetlight failure",
      "MEDIUM",
      "Electrical Department",
      "வகை: தெருவிளக்கு பழுது | பொறுப்பு: மின்சார துறை",
      "COMPLETED",
      deadlineDate,
      24,
      15,
      "LOW",
      now,
      now
    );

    // Dependency
    db.prepare(`
      INSERT INTO dependencies (id, complaint_id, source_issue_id, target_issue_id, reason, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "dep-1248-1",
      "CF-2026-001248",
      "issue-1248-1",
      "issue-1248-2",
      "சாலை பராமரிப்பு தொடங்குவதற்கு முன் கழிவுநீர் தேக்கம் முழுமையாக அகற்றப்பட வேண்டும்.",
      "WAITING"
    );
  }

  // 3. Water supply interruption in Ward 8
  const existingWater = db.prepare("SELECT id FROM complaints WHERE id = 'CF-2026-001249'").get();
  if (!existingWater) {
    db.prepare(`
      INSERT INTO complaints (id, user_id, citizen_name, description, language, location, category, status, severity, priority, risk_score, risk_level, analysis_source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "CF-2026-001249",
      "user-citizen-2",
      "Manoj Kumar",
      "Drinking water supply pipeline burst in 4th Cross Road; potable water is contaminated and pressure dropped completely.",
      "English",
      "4th Cross Road, Ward 8",
      "Water Supply",
      "IN_PROGRESS",
      "HIGH",
      "HIGH",
      70,
      "MEDIUM",
      "Deterministic fallback",
      now,
      now
    );

    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1249-1",
      "I-1",
      "CF-2026-001249",
      "Water Pipe Burst & Supply Interruption",
      "Water supply interruption",
      "HIGH",
      "Water Department",
      "Category = Water supply interruption | Asset = Municipal transmission feeder line",
      "IN_PROGRESS",
      deadlineDate,
      24,
      70,
      "MEDIUM",
      now,
      now
    );
  }

  // 4. Garbage accumulation near market with health risk
  const existingGarbage = db.prepare("SELECT id FROM complaints WHERE id = 'CF-2026-001250'").get();
  if (!existingGarbage) {
    db.prepare(`
      INSERT INTO complaints (id, user_id, citizen_name, description, language, location, category, status, severity, priority, risk_score, risk_level, analysis_source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "CF-2026-001250",
      "user-citizen-1",
      "Kavitha Raman",
      "Massive commercial garbage accumulation near market entrance; severe stench and mosquito breeding risk.",
      "English",
      "Daily Market Gate 2, Ward 11",
      "Sanitation & Health",
      "IN_PROGRESS",
      "MEDIUM",
      "MEDIUM",
      65,
      "MEDIUM",
      "Deterministic fallback",
      now,
      now
    );

    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1250-1",
      "I-1",
      "CF-2026-001250",
      "Garbage Accumulation",
      "Garbage accumulation",
      "MEDIUM",
      "Sanitation Department",
      "Category = Garbage accumulation | Asset = Public market collection point",
      "IN_PROGRESS",
      deadlineDate,
      24,
      50,
      "MEDIUM",
      now,
      now
    );

    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1250-2",
      "I-2",
      "CF-2026-001250",
      "Mosquito & Vector Breeding Risk",
      "Mosquito/vector breeding risk",
      "HIGH",
      "Health Department",
      "Category = Vector breeding | Asset = Epidemiological sector",
      "IN_PROGRESS",
      deadlineDate,
      24,
      65,
      "MEDIUM",
      now,
      now
    );
  }

  // 5. Damaged public road with deep potholes in Central Ave
  const existingRoad = db.prepare("SELECT id FROM complaints WHERE id = 'CF-2026-001251'").get();
  if (!existingRoad) {
    db.prepare(`
      INSERT INTO complaints (id, user_id, citizen_name, description, language, location, category, status, severity, priority, risk_score, risk_level, analysis_source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "CF-2026-001251",
      "user-citizen-2",
      "Manoj Kumar",
      "Deep dangerous potholes across Central Avenue near bus stop causing severe vehicular accidents.",
      "English",
      "Central Avenue Bus Stand, Ward 5",
      "Road Safety",
      "RESOLVED",
      "HIGH",
      "HIGH",
      40,
      "LOW",
      "Deterministic fallback",
      now,
      now
    );

    db.prepare(`
      INSERT INTO issues (id, display_id, complaint_id, title, category, severity, department, routing_reason, status, deadline, deadline_hours, risk_score, risk_level, resolution_proof, resolved_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "issue-1251-1",
      "I-1",
      "CF-2026-001251",
      "Dangerous Road Potholes",
      "Road pothole",
      "HIGH",
      "Roads Department",
      "Category = Road pothole | Asset = Bus stand corridor carriage way",
      "COMPLETED",
      deadlineDate,
      48,
      20,
      "LOW",
      "Hot-mix bitumen compaction completed across 12 pothole patches.",
      now,
      now,
      now
    );
  }
}
