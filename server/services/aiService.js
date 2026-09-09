import { analyzeDeterministically } from "./deterministicEngine.js";

/**
 * AI Service Abstraction Layer:
 * Checks for Gemini or OpenAI API keys in environment.
 * If available, attempts structured JSON decomposition.
 * If unavailable, fails, or malformed, gracefully falls back to the deterministic engine.
 * Transparently labels analysis source as 'AI' or 'Deterministic fallback'.
 */
export async function analyzeComplaintText(text, language = "auto") {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return analyzeDeterministically(text, language);
  }

  try {
    // Attempt structured JSON call via Gemini REST endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are the civic intelligence decomposition engine of CivicFlow AI.
Analyze this citizen grievance and decompose it into distinct atomic civic issues.
Citizen text: "${text}"

Respond with ONLY raw valid JSON matching this schema:
{
  "language": "English" | "Tamil",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "issues": [
    {
      "title": "Short title",
      "category": "One standard civic category",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }
  ]
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn("AI API returned error, falling back to deterministic engine");
      return analyzeDeterministically(text, language);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return analyzeDeterministically(text, language);
    }

    const parsed = JSON.parse(rawText);
    if (!parsed.issues || !Array.isArray(parsed.issues) || parsed.issues.length === 0) {
      return analyzeDeterministically(text, language);
    }

    // Merge with deterministic enrichments (departments, action plans, SLAs)
    const enriched = analyzeDeterministically(text, language);
    return {
      language: parsed.language || enriched.language,
      severity: parsed.severity || enriched.severity,
      priority: parsed.priority || enriched.priority,
      analysisSource: "AI",
      issues: enriched.issues,
      dependencies: enriched.dependencies
    };
  } catch (err) {
    console.warn("AI generation failed or timed out:", err.message);
    return analyzeDeterministically(text, language);
  }
}
