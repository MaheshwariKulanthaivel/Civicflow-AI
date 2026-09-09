import React from "react";
import { TrendingUp, Sparkles, Shield, ArrowRight, Lightbulb } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function PreventiveInsightCard({ insightData }) {
  const { t } = useLanguage();

  if (!insightData) return null;

  const { pattern = "RECURRING CIVIC PATTERN", detectedIssue, recommendation, reasoning, formula } = insightData;

  return (
    <div className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/40 rounded-2xl border border-teal-300 shadow-sm p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-teal-200/80 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900">{t("preventiveInsight")}</h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                {t("recurringPattern")}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Future-facing preventive intelligence moving from passive repair to active prevention
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-teal-800 italic">
          "Tomorrow, CivicFlow predicts and prevents them."
        </span>
      </div>

      <div className="space-y-3 text-xs">
        
        <div className="p-3 rounded-xl bg-white border border-teal-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Detected Pattern:
          </span>
          <p className="font-semibold text-slate-900">
            {detectedIssue}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-900 text-white shadow-sm border border-teal-800">
          <div className="flex items-center space-x-1.5 text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended Preventive Action:</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
            {recommendation}
          </p>
        </div>

        {/* Explainable Reasoning Formula */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">Explainable Governance Reasoning:</span>
          <p className="text-slate-600 mb-2">{reasoning}</p>
          <div className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-[10px] text-teal-900 font-bold">
            {formula}
          </div>
        </div>

      </div>

    </div>
  );
}
