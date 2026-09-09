import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    appTitle: "CivicFlow AI",
    appSubtitle: "Governance Orchestration Platform",
    tagline: "From complaint management to civic resolution orchestration.",
    heroTitle: "Your civic issues, clearly tracked.",
    quote1: "Existing systems manage complaints. CivicFlow AI manages the chain of responsibility required to resolve them.",
    quote2: "We don't just ask who should receive this complaint. We ask what must happen next, who depends on whom, who is likely to delay, and who is accountable if resolution fails.",
    futureVision: "Today we resolve complaints. Tomorrow, CivicFlow predicts and prevents them.",
    navHome: "Home",
    navCitizenPortal: "Citizen Portal",
    navOfficerDashboard: "Operations Control Center",
    navLogin: "Login",
    navLogout: "Logout",
    citizenLogin: "Citizen Login",
    officerLogin: "Officer Login",
    tryLiveDemo: "Try Live Demo",
    loadDemoCase: "LOAD DEMO CASE",
    reportProblem: "Report a Problem",
    submitComplaint: "File Grievance",
    analyzeComplaint: "Analyze Grievance",
    analyzing: "Analyzing grievance...",
    complaintUnderstanding: "Complaint Understanding",
    detectedIssues: "Atomic Civic Issues",
    dependencyGraph: "Civic Problem Graph",
    auditTimeline: "Immutable Audit Timeline",
    confirmResolved: "Confirm Resolved",
    stillNotResolved: "Still Not Resolved",
    reopenGrievance: "Reopen Grievance",
    civicCredits: "Civic Service Credits",
    resolutionProof: "Resolution Proof",
    whyThisDepartment: "Why this department?",
    whyWaiting: "Why is my complaint waiting?",
    whyWaitingAnswer: "Road repair depends on sewage clearance.",
    whatHappensNext: "What happens next?",
    resolutionJourney: "Resolution Journey",
    civicImpact: "Civic Impact",
    highCivicImpact: "HIGH CIVIC IMPACT",
    communitySignal: "COMMUNITY SIGNAL",
    preventiveInsight: "Preventive Civic Insight",
    recurringPattern: "RECURRING CIVIC PATTERN",
    whoCanHelp: "Who can help me?",
    requestUpdate: "Request Update",
    copilotTitle: "CivicFlow Copilot",
    copilotSubtitle: "Citizens describe problems. CivicFlow translates them into action.",
    copilotUnderstood: "I understood your problem",
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
    roadReadyNotice: "Road repair is now READY TO START as sewage clearance was completed.",
    operationsControlCenter: "CIVIC OPERATIONS CONTROL CENTER",
    priorityQueue: "PRIORITY WORK QUEUE"
  },
  ta: {
    appTitle: "சிவிக்ப்ளோ AI",
    appSubtitle: "நிர்வாக ஒருங்கிணைப்பு தளம்",
    tagline: "புகார் நிர்வாகத்திலிருந்து தீர்வு ஒருங்கிணைப்பு வரை.",
    heroTitle: "உங்கள் மக்கள் குறைகள், வெளிப்படையாகக் கண்காணிக்கப்படுகின்றன.",
    quote1: "தற்போதுள்ள அமைப்புகள் புகார்களை மட்டுமே பதிவு செய்கின்றன. சிவிக்ப்ளோ AI அதை தீர்ப்பதற்கான பொறுப்பு சங்கிலியை ஒருங்கிணைக்கிறது.",
    quote2: "இந்தப் புகாரை யாரிடம் அனுப்புவது என்று மட்டும் நாங்கள் கேட்பதில்லை. அடுத்து என்ன நடக்க வேண்டும், யார் யாரை சார்ந்துள்ளனர், யார் தாமதிக்க வாய்ப்புள்ளது, தோல்விக்கு யார் பொறுப்பு என்று கேட்கிறோம்.",
    futureVision: "இன்று நாம் புகார்களைத் தீர்க்கிறோம். நாளை, சிவிக்ப்ளோ அவற்றைக் கணித்துத் தடுக்கும்.",
    navHome: "முகப்பு",
    navCitizenPortal: "பொதுமக்கள் தளம்",
    navOfficerDashboard: "செயல்பாட்டுக் கட்டுப்பாட்டு மையம்",
    navLogin: "உள்நுழை",
    navLogout: "வெளியேறு",
    citizenLogin: "பொதுமக்கள் உள்நுழைவு",
    officerLogin: "அதிகாரி உள்நுழைவு",
    tryLiveDemo: "நேரலை செயல்விளக்கம்",
    loadDemoCase: "மாதிரி வழக்கைத் திறக்க",
    reportProblem: "பிரச்சனையைத் தெரிவியுங்கள்",
    submitComplaint: "புகார் பதிவு செய்க",
    analyzeComplaint: "புகாரை பகுப்பாய்வு செய்",
    analyzing: "பகுப்பாய்வு செய்யப்படுகிறது...",
    complaintUnderstanding: "புகார் புரிதல் விபரம்",
    detectedIssues: "கண்டறியப்பட்ட தனித்தனி பிரச்சனைகள்",
    dependencyGraph: "குறை தீர்வு சார்பு வரைபடம்",
    auditTimeline: "தணிக்கை காலவரிசை",
    confirmResolved: "தீர்வை உறுதிப்படுத்து",
    stillNotResolved: "இன்னும் தீரவில்லை",
    reopenGrievance: "மீண்டும் திறக்க",
    civicCredits: "நிர்வாக சேவை புள்ளிகள்",
    resolutionProof: "தீர்வுக்கான சான்று",
    whyThisDepartment: "ஏன் இந்த துறை?",
    whyWaiting: "என் புகார் ஏன் காத்திருக்கிறது?",
    whyWaitingAnswer: "கழிவுநீர் அகற்றும் பணி முடிந்த பிறகே சாலை பழுதுபார்ப்பு தொடங்கும்.",
    whatHappensNext: "அடுத்து என்ன நடக்கும்?",
    resolutionJourney: "தீர்வுப் பாதை",
    civicImpact: "நிர்வாக தாக்கம்",
    highCivicImpact: "அதிக சமூக தாக்கம்",
    communitySignal: "சமூக சமிக்ஞை",
    preventiveInsight: "முன்னெச்சரிக்கை நிர்வாக பார்வை",
    recurringPattern: "மீண்டும் மீண்டும் ஏற்படும் குறை",
    whoCanHelp: "எனக்கு யார் உதவுவார்கள்?",
    requestUpdate: "நிலை அறிக்கை கோரிக்கை",
    copilotTitle: "சிவிக்ப்ளோ வழிகாட்டி",
    copilotSubtitle: "பொதுமக்கள் குறைகளை விவரிக்கிறார்கள். சிவிக்ப்ளோ அவற்றை செயல்களாக மாற்றுகிறது.",
    copilotUnderstood: "உங்கள் பிரச்சனை புரிந்து கொள்ளப்பட்டது",
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
    roadReadyNotice: "கழிவுநீர் அகற்றப்பட்டதால் தற்போது சாலை சீரமைப்பு தொடங்க தயாராக உள்ளது.",
    operationsControlCenter: "நிர்வாக செயல்பாட்டுக் கட்டுப்பாட்டு மையம்",
    priorityQueue: "முன்னுரிமைப் பணி வரிசை"
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
