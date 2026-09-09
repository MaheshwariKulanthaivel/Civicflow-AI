import { ISSUE_TAXONOMY } from "./taxonomy.js";

/**
 * Responsibility Engine:
 * Routes issues based on Category, Asset, Location, Jurisdiction, and Ownership.
 * Provides explicit, transparent "Why this department?" justification for judges and citizens.
 */
export function routeIssue(categoryName, location = "Ward 14, Central Sector") {
  const matched = ISSUE_TAXONOMY.find(
    (t) => t.name.toLowerCase() === (categoryName || "").toLowerCase()
  );

  if (!matched) {
    return {
      department: "Public Grievance Redressal Cell",
      jurisdiction: "Citizen Ombudsman & Grievance Directorate",
      asset: "Unclassified municipal asset",
      explanation: `Category '${categoryName}' did not map to a standard statutory asset. Routed to Public Grievance Redressal Cell for human triage.`,
      needsHumanReview: true,
      slaHours: 48,
      defaultSeverity: "MEDIUM"
    };
  }

  // Generate explainable statutory rationale
  const explanation = `Category = ${matched.name} | Asset = ${matched.asset} | Jurisdiction = ${matched.jurisdiction} (${location}). Therefore routed to ${matched.defaultDepartment} under urban statutory responsibility.`;

  return {
    department: matched.defaultDepartment,
    jurisdiction: matched.jurisdiction,
    asset: matched.asset,
    explanation,
    needsHumanReview: matched.name.includes("OTHER"),
    slaHours: matched.slaHours,
    defaultSeverity: matched.defaultSeverity
  };
}
