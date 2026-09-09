import { ISSUE_TAXONOMY } from "./taxonomy.js";

/**
 * Deterministic Multilingual Fallback Engine:
 * Analyzes English and Tamil complaint text and extracts atomic issues from the 35-item taxonomy.
 * Detects compound grievances and produces atomic decomposed issues with dependencies.
 */
export function analyzeDeterministically(text, language = "auto") {
  const normalized = (text || "").toLowerCase();
  
  // Detect language if auto
  const isTamil = /[\u0B80-\u0BFF]/.test(text);
  const detectedLang = isTamil ? "Tamil" : "English";

  const detectedCategories = [];

  // Match against taxonomy keywords
  for (const item of ISSUE_TAXONOMY) {
    if (item.name === "OTHER / HUMAN_REVIEW_REQUIRED") continue;

    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        if (!detectedCategories.some((d) => d.id === item.id)) {
          detectedCategories.push(item);
        }
        break;
      }
    }
  }

  // If no match found, fallback to General Grievance
  if (detectedCategories.length === 0) {
    const fallback = ISSUE_TAXONOMY.find((t) => t.name === "OTHER / HUMAN_REVIEW_REQUIRED");
    detectedCategories.push({
      ...fallback,
      customTitle: "Unclassified Civic Grievance"
    });
  }

  // Determine overall severity & priority
  let maxSeverityScore = 1;
  const severityRank = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

  // Special check: Is this the primary demo case?
  const isPrimaryDemo =
    (normalized.includes("sewage") && normalized.includes("road") && normalized.includes("streetlight")) ||
    (normalized.includes("கழிவுநீர்") && normalized.includes("சாலை") && normalized.includes("விளக்கு"));

  const issues = detectedCategories.map((item, index) => {
    const rank = severityRank[item.defaultSeverity] || 2;
    if (rank > maxSeverityScore) maxSeverityScore = rank;

    // Default status:
    // If primary demo:
    // I-1 (Sewage) => IN PROGRESS
    // I-2 (Road) => BLOCKED (blocked by sewage)
    // I-3 (Streetlight) => COMPLETED
    let status = "PENDING";
    if (isPrimaryDemo) {
      if (item.name.includes("Sewage") || item.name.includes("Drainage")) {
        status = "IN_PROGRESS";
      } else if (item.name.includes("Road")) {
        status = "BLOCKED";
      } else if (item.name.includes("Streetlight") || item.name.includes("Electrical")) {
        status = "COMPLETED";
      }
    } else {
      // General multi-issue: if first is high severity sewage or pipe burst and second is road repair, block road
      if (item.name.includes("Road") && detectedCategories.some((c) => c.name.includes("Sewage") || c.name.includes("Water leakage"))) {
        status = "BLOCKED";
      } else {
        status = index === 0 ? "IN_PROGRESS" : "PENDING";
      }
    }

    return {
      title: item.name,
      category: item.name,
      severity: item.defaultSeverity,
      department: item.defaultDepartment,
      jurisdiction: item.jurisdiction,
      asset: item.asset,
      slaHours: item.slaHours,
      initialStatus: status,
      index: index + 1
    };
  });

  // Calculate overall severity string
  const severityMap = { 1: "LOW", 2: "MEDIUM", 3: "HIGH", 4: "CRITICAL" };
  const overallSeverity = severityMap[maxSeverityScore] || "MEDIUM";
  const overallPriority = overallSeverity; // in civic systems, priority aligns with urgency & safety

  // Determine inter-issue dependencies
  const dependencies = [];
  const sewageIssue = issues.find((i) => i.category.includes("Sewage") || i.category.includes("Drainage"));
  const roadIssue = issues.find((i) => i.category.includes("Road"));

  if (sewageIssue && roadIssue) {
    dependencies.push({
      sourceIndex: sewageIssue.index,
      targetIndex: roadIssue.index,
      sourceTitle: sewageIssue.title,
      targetTitle: roadIssue.title,
      reason: "Road resurfacing cannot commence until underground sewage overflow is completely repaired, subterranean soil dried, and drainage verified."
    });
  }

  return {
    language: detectedLang,
    severity: overallSeverity,
    priority: overallPriority,
    analysisSource: "Deterministic fallback",
    issues,
    dependencies
  };
}
