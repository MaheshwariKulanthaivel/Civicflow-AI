import React from "react";
import { 
  FileText, 
  Cpu, 
  Building2, 
  GitFork, 
  Activity, 
  AlertOctagon, 
  CheckCircle, 
  Award, 
  RotateCcw,
  Sparkles
} from "lucide-react";

export default function AuditTimeline({ events = [] }) {
  const getEventIcon = (type) => {
    switch (type) {
      case "COMPLAINT_SUBMITTED":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "COMPLAINT_ANALYZED":
        return <Cpu className="w-4 h-4 text-purple-600" />;
      case "DEPARTMENT_ASSIGNED":
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case "DEPENDENCY_CREATED":
        return <GitFork className="w-4 h-4 text-amber-600" />;
      case "DEPENDENCY_UNLOCKED":
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case "STATUS_CHANGED":
      case "ACTION_STATUS_CHANGED":
        return <Activity className="w-4 h-4 text-sky-600" />;
      case "ESCALATION_TRIGGERED":
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case "ISSUE_COMPLETED":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "RESOLUTION_CONFIRMED":
        return <CheckCircle className="w-4 h-4 text-emerald-700" />;
      case "CIVIC_SERVICE_CREDIT_AWARDED":
        return <Award className="w-4 h-4 text-amber-500" />;
      case "ISSUE_REOPENED":
        return <RotateCcw className="w-4 h-4 text-rose-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEventBadge = (type) => {
    const map = {
      COMPLAINT_SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLAINT_ANALYZED: "bg-purple-50 text-purple-700 border-purple-200",
      DEPARTMENT_ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-200",
      DEPENDENCY_CREATED: "bg-amber-50 text-amber-700 border-amber-200",
      DEPENDENCY_UNLOCKED: "bg-teal-50 text-teal-700 border-teal-200",
      STATUS_CHANGED: "bg-sky-50 text-sky-700 border-sky-200",
      ACTION_STATUS_CHANGED: "bg-slate-50 text-slate-700 border-slate-200",
      ESCALATION_TRIGGERED: "bg-red-50 text-red-700 border-red-200",
      ISSUE_COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      RESOLUTION_CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-300",
      CIVIC_SERVICE_CREDIT_AWARDED: "bg-amber-100 text-amber-800 border-amber-300",
      ISSUE_REOPENED: "bg-rose-50 text-rose-700 border-rose-200"
    };
    return map[type] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
        No audit events recorded yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Immutable Governance Audit Trail</h3>
          <p className="text-xs text-slate-500">
            Chronological, verifiable record of state transitions, department routing, and citizen verifications
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
          {events.length} Events Logged
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
        {events.map((ev, idx) => (
          <div key={ev.id || idx} className="relative group">
            
            {/* Timeline icon node */}
            <div className="absolute -left-[31px] top-0 w-7 h-7 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs group-hover:border-blue-500 transition-colors">
              {getEventIcon(ev.event_type)}
            </div>

            <div className="bg-slate-50/70 hover:bg-slate-50 rounded-lg p-3 border border-slate-200/80 transition">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getEventBadge(ev.event_type)}`}>
                  {ev.event_type.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(ev.created_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {ev.description}
              </p>

              <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center space-x-2 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">Actor:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono">
                  {ev.actor_name} ({ev.actor_role})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
