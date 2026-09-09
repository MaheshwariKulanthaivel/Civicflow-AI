import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Building2, 
  ArrowRight, 
  Layers, 
  Bot, 
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CitizenCopilot({ onSelectParsedGrievance }) {
  const { lang, t } = useLanguage();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (textToAnalyze) => {
    const query = textToAnalyze || input;
    if (!query.trim()) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/complaints/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query, language: lang === "ta" ? "Tamil" : "auto" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Copilot parsing failed");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (text) => {
    setInput(text);
    handleAnalyze(text);
  };

  const handleApplyToForm = () => {
    if (onSelectParsedGrievance && result) {
      onSelectParsedGrievance({
        description: input,
        category: result.detectedIssues?.[0] || "General Civic",
        issues: result.issuesDetails
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
      
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white tracking-tight">{t("copilotTitle")}</h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Multilingual AI
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {t("copilotSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Natural Language Prompt Input */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === "ta" ? "எ.கா., எங்க தெருவுல கழிவுநீர் தேங்கி இருக்கு. ரோடும் damage ஆயிடுச்சு..." : "Describe your problem in plain words (e.g. Heavy sewage overflow near the school has damaged the road...)"}
              className="w-full text-xs sm:text-sm p-3.5 rounded-xl bg-slate-800/90 text-white placeholder-slate-400 border border-slate-700 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 font-sans"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Try instant sample:</span>
            
            <button
              type="button"
              onClick={() => handlePreset("எங்க தெருவுல கழிவுநீர் தேங்கி இருக்கு. ரோடும் damage ஆயிடுச்சு.")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-[11px] font-medium transition"
            >
              Tamil: "கழிவுநீர் தேங்கி இருக்கு..."
            </button>

            <button
              type="button"
              onClick={() => handlePreset("Heavy sewage overflow near the school has damaged the road, traffic is affected and streetlights aren't working.")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition"
            >
              English: Primary Demo Case
            </button>

            <div className="ml-auto">
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-md flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? t("analyzing") : "Understand Problem"}</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-xs text-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Copilot Understanding Output Card */}
        {result && (
          <div className="mt-5 p-4 sm:p-5 rounded-xl bg-slate-800/95 border border-teal-500/40 shadow-lg animate-in fade-in zoom-in duration-200 space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm text-white">{result.message}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-700">
                Source: {result.analysisSource}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              
              {/* Detected Issues */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Detected Atomic Issues:
                </span>
                <div className="space-y-1">
                  {result.detectedIssues.map((iss, i) => (
                    <div key={i} className="flex items-center space-x-1.5 text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                      <strong className="font-semibold">{iss}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsible Authorities */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Responsible Public Authorities:
                </span>
                <div className="space-y-1">
                  {result.responsibleAuthorities.map((auth, i) => (
                    <div key={i} className="flex items-center space-x-1.5 text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="font-semibold text-blue-300">{auth}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer action */}
            {onSelectParsedGrievance && (
              <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 italic">
                  Ready to register into municipal queue
                </span>
                <button
                  type="button"
                  onClick={handleApplyToForm}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center space-x-1 transition"
                >
                  <span>Use in Submission Form</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
