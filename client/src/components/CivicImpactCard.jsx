import React from "react";
import { AlertTriangle, ShieldAlert, GraduationCap, Car, Biohazard, Lightbulb, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CivicImpactCard({ impactData }) {
  const { t } = useLanguage();

  if (!impactData) return null;

  const { impactLevel = "HIGH", affectedAreas = [], issuesCount = 3, publicServicesCount = 4, ruleLabel } = impactData;

  const getAreaIcon = (id) => {
    switch (id) {
      case "school_safety":
        return <GraduationCap className="w-4 h-4 text-rose-600" />;
      case "traffic_disruption":
        return <Car className="w-4 h-4 text-amber-600" />;
      case "sanitation_risk":
        return <Biohazard className="w-4 h-4 text-red-600" />;
      case "public_safety":
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/40 rounded-2xl border border-amber-200 shadow-sm p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-amber-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs">
            <AlertTriangle className="w-5 h-5 fill-slate-950 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900">{t("civicImpact")} Assessment</h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                {t("highCivicImpact")}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quantified public disruption across municipal infrastructure and citizen safety
            </p>
          </div>
        </div>

        {/* Derived rule badge */}
        <div className="flex items-center space-x-1.5 text-[10px] text-amber-800 font-medium px-2.5 py-1 rounded-lg bg-amber-100/60 border border-amber-200">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Derived governance rule</span>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        
        <div className="p-3 rounded-xl bg-white border border-amber-200 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Issues Affected</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">{issuesCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-amber-200 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Public Services</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">{publicServicesCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-amber-200 text-center">
          <span className="text-[10px] font-bold uppercase text-red-600 block">Impact Level</span>
          <div className="text-xl font-black text-red-600 mt-0.5">{impactLevel}</div>
        </div>

      </div>

      {/* Affected Public Areas */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          Compromised Public Domains:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {affectedAreas.map((area, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start space-x-2.5"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 mt-0.5 flex-shrink-0">
                {getAreaIcon(area.id)}
              </div>
              <div className="text-xs">
                <div className="flex items-center space-x-1.5">
                  <strong className="font-bold text-slate-900">{area.title}</strong>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-100">
                    {area.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{area.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {ruleLabel && (
        <div className="mt-4 pt-3 border-t border-amber-100 text-[10px] text-slate-500 italic text-right">
          {ruleLabel}
        </div>
      )}

    </div>
  );
}
