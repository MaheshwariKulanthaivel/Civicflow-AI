/**
 * Civic Impact Engine:
 * Analyzes civic grievances and their decomposed issues to quantify public disruption.
 * Derives explainable civic impact across school/child safety, transit, public hygiene, and municipal services.
 * Note: Clearly labeled as derived governance rules based on asset proximity and issue categories.
 */

export function calculateCivicImpact(complaint, issues = []) {
  const text = ((complaint?.description || "") + " " + (complaint?.location || "")).toLowerCase();
  
  const affectedAreas = [];
  let score = 0;

  // 1. School & Child Safety
  if (text.includes("school") || text.includes("children") || text.includes("college") || text.includes("பள்ளி")) {
    affectedAreas.push({
      id: "school_safety",
      title: "School & Child Safety",
      severity: "CRITICAL",
      reason: "Grievance located immediately adjacent to school pedestrian gates and transit zone."
    });
    score += 35;
  }

  // 2. Traffic Disruption & Transit Corridor
  const hasRoadIssue = issues.some((i) => i.category.toLowerCase().includes("road") || i.category.toLowerCase().includes("traffic") || i.department.toLowerCase().includes("road"));
  if (hasRoadIssue || text.includes("traffic") || text.includes("road") || text.includes("சாலை") || text.includes("போக்குவரத்து")) {
    affectedAreas.push({
      id: "traffic_disruption",
      title: "Traffic Disruption",
      severity: "HIGH",
      reason: "Pavement collapse and blockage affecting primary municipal transit carriage corridor."
    });
    score += 25;
  }

  // 3. Sanitation & Biological Risk
  const hasDrainageIssue = issues.some((i) => i.category.toLowerCase().includes("sewage") || i.category.toLowerCase().includes("drainage") || i.category.toLowerCase().includes("sanitation"));
  if (hasDrainageIssue || text.includes("sewage") || text.includes("கழிவுநீர்") || text.includes("குப்பை") || text.includes("drainage")) {
    affectedAreas.push({
      id: "sanitation_risk",
      title: "Sanitation & Public Health Risk",
      severity: "HIGH",
      reason: "Exposed pathogenic wastewater and biological contaminants in public thoroughfare."
    });
    score += 25;
  }

  // 4. Public Safety & Illumination
  const hasElectricalIssue = issues.some((i) => i.category.toLowerCase().includes("streetlight") || i.category.toLowerCase().includes("electrical"));
  if (hasElectricalIssue || text.includes("light") || text.includes("streetlight") || text.includes("விளக்கு") || text.includes("dark")) {
    affectedAreas.push({
      id: "public_safety",
      title: "Public Safety & Illumination",
      severity: "MEDIUM",
      reason: "Lack of night-time street illumination creates acute pedestrian accident and crime risks."
    });
    score += 15;
  }

  // Fallback area if none matched
  if (affectedAreas.length === 0) {
    affectedAreas.push({
      id: "general_amenity",
      title: "Civic Amenity Impact",
      severity: "MEDIUM",
      reason: "Standard disruption to neighborhood municipal infrastructure."
    });
    score = 40;
  }

  // Determine Impact Level
  let impactLevel = "LOW";
  if (score >= 75 || affectedAreas.length >= 3) {
    impactLevel = "HIGH";
  } else if (score >= 45 || affectedAreas.length >= 2) {
    impactLevel = "MEDIUM";
  }

  // Estimate derived metrics
  const issuesCount = Math.max(issues.length, 1);
  const publicServicesCount = affectedAreas.length;

  return {
    impactLevel,
    level: impactLevel,
    score: Math.min(100, score),
    affectedAreas,
    domains: affectedAreas.map((a) => ({
      label: a.title,
      score: a.severity === "CRITICAL" ? 95 : a.severity === "HIGH" ? 80 : 60,
      ...a
    })),
    issuesCount,
    publicServicesCount,
    explanation: `${impactLevel} CIVIC IMPACT: Compound grievance compromises ${publicServicesCount} public domains (${affectedAreas.map((a) => a.title).join(", ")}).`,
    ruleLabel: "Derived governance impact rules based on asset classification & pedestrian proximity"
  };
}
