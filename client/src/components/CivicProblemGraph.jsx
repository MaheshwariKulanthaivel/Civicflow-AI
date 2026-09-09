import React from "react";
import { 
  GitBranch, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  ArrowDown, 
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  Workflow,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CivicProblemGraph({ complaint, issues = [], dependencies = [] }) {
  const { t } = useLanguage();

  const sortedIssues = [...issues].sort((a, b) => (a.display_id || "").localeCompare(b.display_id || ""));

  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLETED":
      case "CONFIRMED":
        return {
          badge: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
          ring: "border-emerald-300 bg-emerald-50/30 shadow-xs",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: t("statusCompleted")
        };
      case "BLOCKED":
        return {
          badge: "bg-red-100 text-red-800 border-red-300 font-black animate-pulse",
          ring: "border-red-300 bg-red-50/40 ring-2 ring-red-400/30",
          icon: <Lock className="w-4 h-4 text-red-600" />,
          label: t("statusBlocked")
        };
      case "READY":
        return {
          badge: "bg-teal-100 text-teal-900 border-teal-300 font-black",
          ring: "border-teal-400 bg-teal-50/50 ring-2 ring-teal-400/40 shadow-md",
          icon: <Unlock className="w-4 h-4 text-teal-700" />,
          label: t("statusReady")
        };
      case "IN_PROGRESS":
        return {
          badge: "bg-blue-100 text-blue-800 border-blue-300 font-bold",
          ring: "border-blue-300 bg-blue-50/30",
          icon: <Clock className="w-4 h-4 text-blue-600" />,
          label: t("statusInProgress")
        };
      default:
        return {
          badge: "bg-slate-100 text-slate-700 border-slate-300",
          ring: "border-slate-200 bg-white",
          icon: <Clock className="w-4 h-4 text-slate-400" />,
          label: status || t("statusPending")
        };
    }
  };

  // Find prerequisite relationship for primary demo
  const primaryDep = dependencies.find(
    (d) => (d.source_display_id === "I-1" || d.source_issue_id?.includes("1")) &&
           (d.target_display_id === "I-2" || d.target_issue_id?.includes("2"))
  );

  const isSewageCompleted = sortedIssues.some(
    (i) => (i.display_id === "I-1" || i.title.toLowerCase().includes("sewage")) &&
           (i.status === "COMPLETED" || i.status === "CONFIRMED")
  );

  const isRoadReady = sortedIssues.some(
    (i) => (i.display_id === "I-2" || i.title.toLowerCase().includes("road")) &&
           (i.status === "READY" || i.status === "IN_PROGRESS" || i.status === "COMPLETED")
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
            <Workflow className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">{t("dependencyGraph")}</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Live Orchestration Flow
              </span>
            </div>
            <p className="text-xs text-slate-500">
              One citizen complaint decomposed into atomic departmental tasks with prerequisite gates
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
          </span>
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Blocked</span>
          </span>
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Ready</span>
          </span>
        </div>
      </div>

      {/* Layer 1: Citizen Complaint Root Node */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-full max-w-xl bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800 text-center relative group">
          <div className="flex items-center justify-center space-x-2 text-[11px] font-bold text-teal-400 uppercase tracking-widest mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Citizen Grievance Input</span>
          </div>
          <div className="font-mono text-xs font-semibold text-slate-300 mb-1.5">
            ID: {complaint?.id || "CF-2026-001247"} • {complaint?.location || "Ward 14"}
          </div>
          <p className="text-xs sm:text-sm text-slate-100 font-medium italic line-clamp-2">
            "{complaint?.description}"
          </p>
        </div>

        {/* Stem down to Atomic Issues */}
        <div className="w-0.5 h-6 bg-slate-300"></div>
        <div className="flex items-center justify-center space-x-1 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>ONE COMPLAINT → {sortedIssues.length} ATOMIC CIVIC ISSUES</span>
        </div>
        <div className="w-0.5 h-4 bg-slate-300"></div>
        <div className="w-full max-w-3xl border-t-2 border-slate-300 relative">
          <div className="absolute left-1/2 -top-1.5 w-3 h-3 -ml-1.5 rounded-full bg-blue-600"></div>
        </div>
      </div>

      {/* Layer 2: Decomposed Atomic Issues with Department & Dependency Locks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative mb-6">
        {sortedIssues.map((iss) => {
          const config = getStatusConfig(iss.status);
          const isUnlockPrereq = iss.display_id === "I-1" || iss.title.toLowerCase().includes("sewage");
          const isBlockedByPrereq = iss.status === "BLOCKED";
          const isReadyNow = iss.status === "READY";

          return (
            <div
              key={iss.id}
              className={`relative rounded-2xl border p-4 transition-all duration-300 ${config.ring}`}
            >
              {/* Vertical connector guide */}
              <div className="absolute -top-4 left-1/2 -ml-px w-0.5 h-4 bg-slate-300 hidden md:block"></div>

              {/* Node Header */}
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                  {iss.display_id}
                </span>
                <span className={`inline-flex items-center space-x-1 text-[11px] px-2.5 py-0.5 rounded-full border ${config.badge}`}>
                  {config.icon}
                  <span>{config.label}</span>
                </span>
              </div>

              {/* Title & Authority */}
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{iss.title}</h4>
              <div className="mt-1 flex items-center space-x-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600 font-semibold">{iss.department}</span>
              </div>

              {/* Dependency Action Badge inside card */}
              {isBlockedByPrereq && (
                <div className="mt-3 p-2.5 rounded-xl bg-red-100/80 border border-red-200 text-xs text-red-900">
                  <div className="flex items-center space-x-1.5 font-bold mb-0.5">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Prerequisite Gate Active</span>
                  </div>
                  <p className="text-[11px] leading-tight">
                    Locked until <strong className="underline">I-1 Sewage Overflow</strong> is completed.
                  </p>
                </div>
              )}

              {isReadyNow && (
                <div className="mt-3 p-2.5 rounded-xl bg-teal-100/90 border border-teal-300 text-xs text-teal-950">
                  <div className="flex items-center space-x-1.5 font-bold mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span>Dependency Satisfied!</span>
                  </div>
                  <p className="text-[11px] leading-tight">
                    Sewage clearance verified. Road repair authorized to commence.
                  </p>
                </div>
              )}

              {isUnlockPrereq && (
                <div className="mt-3 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center space-x-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>
                    {iss.status === "COMPLETED"
                      ? "Unlocks I-2 Road Repair (Completed ✓)"
                      : "Directly unlocks I-2 Road Repair upon completion"}
                  </span>
                </div>
              )}

              {iss.display_id === "I-3" && (
                <div className="mt-3 p-2 rounded-lg bg-slate-100 text-[11px] text-slate-600 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Independent Electrical Domain</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layer 3: Visual Dependency Connector Callout */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Workflow className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">
                Chain of Responsibility Orchestration
              </span>
              <span className="text-[11px] text-slate-300">
                Sewage Resolution (Drainage Dept) → Unlocks → Road Macadam Pavement (Roads Dept)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isSewageCompleted ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400 text-[11px] font-bold">
                <Unlock className="w-3.5 h-3.5 text-teal-400" />
                <span>DEPENDENCY UNLOCKED: ROAD READY</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400 text-[11px] font-bold">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>DEPENDENCY ACTIVE: ROAD WAITING</span>
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
