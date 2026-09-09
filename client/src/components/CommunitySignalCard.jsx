import React from "react";
import { Users, Radio, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CommunitySignalCard({ signalData }) {
  const { t } = useLanguage();

  if (!signalData || !signalData.hasSignal) return null;

  const { similarComplaintsCount = 7, potentialIncident, signalStrength = "HIGH", recommendedAction } = signalData;

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl border border-blue-200 shadow-sm p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-blue-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900">{t("communitySignal")}</h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Signal Strength: {signalStrength}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic locality cluster intelligence across municipal database
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black font-mono shadow-xs">
          {similarComplaintsCount} Similar Complaints Detected
        </div>
      </div>

      {/* Structured Signal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        <div className="p-3.5 rounded-xl bg-white border border-blue-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Potential Civic Incident:
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {potentialIncident}
          </p>
          <div className="mt-2 text-[11px] text-slate-600 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Cluster indicates systemic subterranean conduit failure, not an isolated household leak.</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-blue-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Recommended Action:
          </span>
          <p className="font-semibold text-slate-800 text-xs">
            {recommendedAction}
          </p>
          <div className="mt-2 text-[11px] text-teal-800 font-medium flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span>Advisory intelligence layer • No automatic merging without officer verification</span>
          </div>
        </div>

      </div>

    </div>
  );
}
