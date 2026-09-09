import React from "react";
import { 
  GitBranch, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowDown, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Link2
} from "lucide-react";

export default function DependencyGraph({ complaint, issues = [], dependencies = [] }) {
  // Sort issues by display_id (I-1, I-2, I-3)
  const sortedIssues = [...issues].sort((a, b) => (a.display_id || "").localeCompare(b.display_id || ""));

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
      case "CONFIRMED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: status
        };
      case "BLOCKED":
        return {
          bg: "bg-red-50 text-red-700 border-red-200 animate-pulse",
          icon: <Lock className="w-3.5 h-3.5 text-red-600" />,
          label: "BLOCKED (DEPENDENCY)"
        };
      case "READY":
        return {
          bg: "bg-teal-50 text-teal-700 border-teal-300 font-bold shadow-sm",
          icon: <Unlock className="w-3.5 h-3.5 text-teal-600" />,
          label: "READY TO START"
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
          label: "IN PROGRESS"
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
          label: status || "PENDING"
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Inter-Departmental Dependency Graph</h3>
            <p className="text-xs text-slate-500">
              Live orchestration of prerequisite civic tasks across independent municipal authorities
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
          </span>
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Blocked</span>
          </span>
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Ready</span>
          </span>
        </div>
      </div>

      {/* Root Citizen Grievance Node */}
      <div className="flex flex-col items-center mb-6">
        <div className="px-5 py-3 rounded-xl bg-slate-900 text-white shadow-md text-center max-w-lg border border-slate-700">
          <div className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
            Citizen Grievance Root
          </div>
          <div className="text-sm font-semibold mt-0.5">{complaint?.id || "CF-GRIEVANCE"}</div>
          <p className="text-xs text-slate-300 mt-1 line-clamp-1 italic">
            "{complaint?.description}"
          </p>
        </div>

        {/* Stem Connector Downward */}
        <div className="w-0.5 h-6 bg-slate-300"></div>
        <div className="w-full max-w-2xl border-t-2 border-slate-300 relative">
          <div className="absolute left-1/2 -top-1.5 w-3 h-3 -ml-1.5 rounded-full bg-blue-600"></div>
        </div>
      </div>

      {/* Atomic Issue Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
        {sortedIssues.map((iss) => {
          const badge = getStatusBadge(iss.status);
          const hasPrereq = dependencies.some((d) => d.target_issue_id === iss.id && d.status !== "SATISFIED");
          const isUnlocker = dependencies.some((d) => d.source_issue_id === iss.id);

          return (
            <div
              key={iss.id}
              className={`relative rounded-xl border p-4 transition-all duration-300 ${
                iss.status === "BLOCKED"
                  ? "bg-red-50/40 border-red-200 ring-2 ring-red-400/20"
                  : iss.status === "READY"
                  ? "bg-teal-50/40 border-teal-300 ring-2 ring-teal-400/30 shadow-md"
                  : iss.status === "COMPLETED"
                  ? "bg-emerald-50/20 border-emerald-200"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {/* Top drop line indicator */}
              <div className="absolute -top-4 left-1/2 -ml-px w-0.5 h-4 bg-slate-300 hidden md:block"></div>

              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {iss.display_id}
                </span>
                <span
                  className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug">{iss.title}</h4>
              <div className="text-xs text-slate-500 mt-1 font-medium flex items-center space-x-1">
                <span className="text-slate-400">Authority:</span>
                <span className="text-slate-700 font-semibold">{iss.department}</span>
              </div>

              {/* Dependency Status Callout */}
              {iss.status === "BLOCKED" && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-100/70 border border-red-200 text-xs text-red-800">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>Resolution Locked</span>
                  </div>
                  <p className="text-[11px] leading-tight">
                    Waiting for prerequisite <strong className="underline">I-1 Sewage Overflow</strong> to be marked completed.
                  </p>
                </div>
              )}

              {iss.status === "READY" && (
                <div className="mt-3 p-2.5 rounded-lg bg-teal-100/70 border border-teal-300 text-xs text-teal-900">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span>Dependency Satisfied</span>
                  </div>
                  <p className="text-[11px] leading-tight">
                    Prerequisite completed! Road department is now authorized to commence civil work.
                  </p>
                </div>
              )}

              {isUnlocker && iss.status === "COMPLETED" && (
                <div className="mt-3 p-2 rounded bg-emerald-100/60 border border-emerald-200 text-[11px] text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Unlocks downstream road repairs</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dependency Relationship Explanation Card */}
      {dependencies.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <div className="font-bold text-slate-900 flex items-center space-x-1.5 mb-2">
            <Link2 className="w-4 h-4 text-blue-600" />
            <span>Active Prerequisite Chains (Chain of Responsibility)</span>
          </div>

          <div className="space-y-2">
            {dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 gap-2"
              >
                <div className="flex items-center space-x-2 font-medium">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px]">
                    {dep.source_display_id} {dep.source_title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[11px]">
                    {dep.target_display_id} {dep.target_title}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      dep.status === "SATISFIED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {dep.status === "SATISFIED" ? "Prerequisite Met" : "Prerequisite Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-[11px] text-slate-500 italic">
            Governance principle: Multi-department complaints fail when authorities work in isolation. CivicFlow establishes mandatory dependency gates so downstream contractors do not pave over ruptured underground utilities.
          </div>
        </div>
      )}
    </div>
  );
}
