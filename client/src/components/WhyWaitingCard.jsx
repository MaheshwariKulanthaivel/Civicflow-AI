import React from "react";
import { Lock, Clock, AlertTriangle, ArrowRight, Building2, HelpCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function WhyWaitingCard({ blockedIssues = [], dependencies = [] }) {
  const { t } = useLanguage();

  if (!blockedIssues || blockedIssues.length === 0) return null;

  return (
    <div className="space-y-4">
      {blockedIssues.map((iss) => {
        // Find matching incoming dependencies
        const incomingDeps = dependencies.filter((d) => d.target_issue_id === iss.id || d.target_display_id === iss.display_id);
        const blocker = incomingDeps[0];

        const blockerTitle = blocker?.source_title || "Sewage Overflow";
        const blockerDept = blocker?.source_department || "Drainage Department";

        return (
          <div
            key={iss.id}
            className="rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-white border-2 border-red-200 p-5 sm:p-6 shadow-sm relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-red-200/80 gap-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-red-950">
                    {t("whyWaiting")}
                  </h3>
                  <span className="text-xs text-red-800 font-medium">
                    Transparent dependency disclosure for {iss.display_id}: <strong>{iss.title}</strong>
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider animate-pulse">
                <Lock className="w-3.5 h-3.5" />
                <span>{iss.status} (DEPENDENCY LOCK)</span>
              </span>
            </div>

            {/* Structured 4-Point Explainable Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              
              {/* Question 1: Why? */}
              <div className="p-3.5 rounded-xl bg-white/90 border border-red-200/70 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block mb-1">
                  1. Root Cause
                </span>
                <p className="font-semibold text-slate-800 leading-snug">
                  {t("whyWaitingAnswer")}
                </p>
              </div>

              {/* Question 2: Waiting For */}
              <div className="p-3.5 rounded-xl bg-white/90 border border-red-200/70 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  2. Waiting For Prerequisite
                </span>
                <p className="font-bold text-slate-900 leading-snug font-mono">
                  {blockerTitle} ({blocker?.source_display_id || "I-1"})
                </p>
              </div>

              {/* Question 3: Responsible Authority */}
              <div className="p-3.5 rounded-xl bg-white/90 border border-red-200/70 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  3. Responsible Authority
                </span>
                <p className="font-bold text-blue-900 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>{blockerDept}</span>
                </p>
              </div>

              {/* Question 4: What Happens Next? */}
              <div className="p-3.5 rounded-xl bg-white/90 border border-red-200/70 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
                  4. {t("whatHappensNext")}
                </span>
                <div className="flex items-center space-x-1 font-semibold text-slate-800 text-[11px] flex-wrap">
                  <span>Sewage clearance</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>Road survey</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-teal-700 font-bold">Repaving</span>
                </div>
              </div>

            </div>

            {/* Explanatory footer */}
            <div className="mt-4 pt-3 border-t border-red-200/60 text-[11px] text-slate-600 flex items-center space-x-2">
              <span className="font-bold text-red-800 uppercase text-[10px]">Orchestration Rule:</span>
              <span>CivicFlow prevents contractors from paving roads over ruptured underground utilities before structural drainage testing is verified.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
