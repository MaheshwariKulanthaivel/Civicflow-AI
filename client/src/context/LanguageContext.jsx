import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    appTitle: "CivicFlow AI",
    appSubtitle: "Governance Orchestration Platform",
    tagline: "AI-powered governance orchestration for faster grievance resolution.",
    quote1: "Existing systems manage complaints. CivicFlow AI manages the chain of responsibility required to resolve them.",
    quote2: "Existing systems ask: Who should receive this complaint? CivicFlow AI asks: What must happen next, who depends on whom, who is likely to delay, and who is accountable if resolution fails?",
    navHome: "Home",
    navCitizenPortal: "Citizen Portal",
    navOfficerDashboard: "Officer Dashboard",
    navLogin: "Login",
    navLogout: "Logout",
    citizenLogin: "Citizen Login",
    officerLogin: "Officer Login",
    tryLiveDemo: "Try Live Demo",
    loadDemoCase: "LOAD DEMO CASE",
    submitComplaint: "File Grievance",
    analyzeComplaint: "Analyze Grievance",
    analyzing: "Analyzing grievance...",
    complaintUnderstanding: "Complaint Understanding",
    detectedIssues: "Detected Atomic Issues",
    dependencyGraph: "Dependency Orchestration Graph",
    auditTimeline: "Immutable Audit Timeline",
    confirmResolved: "Confirm Resolved",
    stillNotResolved: "Still Not Resolved",
    reopenGrievance: "Reopen Grievance",
    civicCredits: "Civic Service Credits",
    resolutionProof: "Resolution Proof",
    whyThisDepartment: "Why this department?",
    statusPending: "PENDING",
    statusInProgress: "IN PROGRESS",
    statusBlocked: "BLOCKED",
    statusReady: "READY TO START",
    statusCompleted: "COMPLETED",
    statusConfirmed: "CONFIRMED RESOLVED",
    statusReopened: "REOPENED",
    riskHigh: "HIGH RISK",
    riskMedium: "MEDIUM RISK",
    riskLow: "LOW RISK",
    riskCritical: "CRITICAL RISK",
    roadBlockedNotice: "Your road repair is waiting because sewage clearance must be completed first.",
    roadReadyNotice: "Road repair is now READY TO START as sewage clearance was completed."
  },
  ta: {
    appTitle: "சிவிக்ப்ளோ AI",
    appSubtitle: "நிர்வாக ஒருங்கிணைப்பு தளம்",
    tagline: "குறைகளை விரைவாக தீர்க்க AI வழிநடத்தும் நிர்வாக ஒருங்கிணைப்பு.",
    quote1: "தற்போதுள்ள அமைப்புகள் புகார்களை மட்டுமே பதிவு செய்கின்றன. சிவிக்ப்ளோ AI அதை தீர்ப்பதற்கான பொறுப்பு சங்கிலியை ஒருங்கிணைக்கிறது.",
    quote2: "தற்போதுள்ள அமைப்புகள் கேட்கின்றன: இந்தப் புகாரை யாரிடம் அனுப்புவது? சிவிக்ப்ளோ AI கேட்கிறது: அடுத்து என்ன நடக்க வேண்டும், யார் யாரை சார்ந்துள்ளனர், யார் தாமதிக்க வாய்ப்புள்ளது, தோல்விக்கு யார் பொறுப்பு?",
    navHome: "முகப்பு",
    navCitizenPortal: "பொதுமக்கள் தளம்",
    navOfficerDashboard: "அதிகாரி கட்டுப்பாட்டகம்",
    navLogin: "உள்நுழை",
    navLogout: "வெளியேறு",
    citizenLogin: "பொதுமக்கள் உள்நுழைவு",
    officerLogin: "அதிகாரி உள்நுழைவு",
    tryLiveDemo: "நேரலை செயல்விளக்கம்",
    loadDemoCase: "மாதிரி வழக்கைத் திறக்க",
    submitComplaint: "புகார் பதிவு செய்க",
    analyzeComplaint: "புகாரை பகுப்பாய்வு செய்",
    analyzing: "பகுப்பாய்வு செய்யப்படுகிறது...",
    complaintUnderstanding: "புகார் புரிதல் விபரம்",
    detectedIssues: "கண்டறியப்பட்ட தனித்தனி பிரச்சனைகள்",
    dependencyGraph: "செயல் சார்பு வரைபடம்",
    auditTimeline: "தணிக்கை காலவரிசை",
    confirmResolved: "தீர்வை உறுதிப்படுத்து",
    stillNotResolved: "இன்னும் தீரவில்லை",
    reopenGrievance: "மீண்டும் திறக்க",
    civicCredits: "நிர்வாக சேவை புள்ளிகள்",
    resolutionProof: "தீர்வுக்கான சான்று",
    whyThisDepartment: "ஏன் இந்த துறை?",
    statusPending: "நிலுவையில்",
    statusInProgress: "நடைமுறையில்",
    statusBlocked: "முடக்கப்பட்டுள்ளது (சார்பு பணி)",
    statusReady: "தொடங்க தயார்",
    statusCompleted: "முடிக்கப்பட்டது",
    statusConfirmed: "உறுதிப்படுத்தப்பட்ட தீர்வு",
    statusReopened: "மீண்டும் திறக்கப்பட்டது",
    riskHigh: "அதிக ஆபத்து",
    riskMedium: "மிதமான ஆபத்து",
    riskLow: "குறைந்த ஆபத்து",
    riskCritical: "தீவிர ஆபத்து",
    roadBlockedNotice: "கழிவுநீர் அகற்றப்பட்ட பின்னரே சாலை சீரமைப்பு தொடங்கும் என்பதால் காத்திருக்கிறது.",
    roadReadyNotice: "கழிவுநீர் அகற்றப்பட்டதால் தற்போது சாலை சீரமைப்பு தொடங்க தயாராக உள்ளது."
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("civicflow_lang") || "en";
  });

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ta" : "en";
    setLang(nextLang);
    localStorage.setItem("civicflow_lang", nextLang);
  };

  const setSpecificLanguage = (l) => {
    setLang(l);
    localStorage.setItem("civicflow_lang", l);
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage: setSpecificLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
