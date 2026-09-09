import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, TrendingUp } from "lucide-react";

export default function RiskBadge({ score = 0, level = "LOW", reasons = [], predictionWarning = null, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  const getLevelConfig = () => {
    if (score >= 90 || level === "CRITICAL") {
      return {
        bg: "bg-red-50 text-red-700 border-red-200",
        pill: "bg-red-600 text-white",
        bar: "bg-red-600",
        label: "CRITICAL RISK",
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />
      };
    }
    if (score >= 75 || level === "HIGH") {
      return {
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        pill: "bg-amber-600 text-white",
        bar: "bg-amber-500",
        label: "HIGH RISK",
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
      };
    }
    if (score >= 45 || level === "MEDIUM") {
      return {
        bg: "bg-yellow-50 text-yellow-800 border-yellow-200",
        pill: "bg-yellow-600 text-white",
        bar: "bg-yellow-500",
        label: "MEDIUM RISK",
        icon: <AlertCircle className="w-4 h-4 text-yellow-600" />
      };
    }
    return {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      pill: "bg-emerald-600 text-white",
      bar: "bg-emerald-500",
      label: "LOW RISK",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />
    };
  };

  const config = getLevelConfig();

  if (compact) {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
        {config.icon}
        <span>{score}/100</span>
      </span>
    );
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${config.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {config.icon}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Governance Risk Score</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.pill}`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-slate-900">{score}</span>
              <span className="text-xs font-medium text-slate-500">/ 100</span>
            </div>
          </div>
        </div>

        {reasons && reasons.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white px-2.5 py-1 rounded-md border border-slate-200/60 transition"
          >
            <span>{expanded ? "Hide Factors" : "Risk Factors"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Progress meter */}
      <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${config.bar}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        ></div>
      </div>

      {/* Predictive Escalation Notice */}
      {predictionWarning && (
        <div className="mt-3 p-2.5 rounded-lg bg-white/80 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2">
          <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Predictive Governance Alert:</strong>
            <span>{predictionWarning}</span>
          </div>
        </div>
      )}

      {/* Expanded Factor Breakdown */}
      {expanded && reasons && reasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs space-y-1 text-slate-700">
          <div className="font-semibold text-slate-800 mb-1">Explainable Factors:</div>
          {reasons.map((r, idx) => (
            <div key={idx} className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-blue-600 font-bold">•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
