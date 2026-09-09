import React, { useState } from "react";
import { Users, PhoneCall, Send, AlertOctagon, Building2, User, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function CivicFlowConnect({ complaint, issues = [], onUpdateRequested }) {
  const { t } = useLanguage();
  const { token } = useAuth();

  const [requesting, setRequesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleRequestUpdate = async () => {
    if (!complaint?.id || !token) return;
    setRequesting(true);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/request-update`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request update");

      setSuccessMessage(data.message || "Priority status review requested from departmental supervisor.");
      if (onUpdateRequested) onUpdateRequested();
    } catch (err) {
      alert(err.message);
    } finally {
      setRequesting(false);
    }
  };

  // Get primary active department and officer
  const primaryIssue = issues.find((i) => i.status === "IN_PROGRESS" || i.status === "BLOCKED") || issues[0];
  const deptName = primaryIssue?.department || "Drainage Department";
  const officerName = primaryIssue?.assigned_officer_name || "Officer Rajesh Kumar (Drainage Division)";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              CivicFlow Connect: {t("whoCanHelp")}
            </h3>
            <p className="text-xs text-slate-500">
              People already rely on local contacts. CivicFlow formalizes that communication into a transparent, accountable workflow.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Accountability Registry
        </span>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Structured Authority Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs mb-5">
        
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Responsible Authority
          </span>
          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>{deptName}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Statutory service division</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Assigned Field Officer
          </span>
          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span className="truncate">{officerName}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Directly accountable for dispatch</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Supervisory Jurisdiction
          </span>
          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span>Asst. Commissioner (Zone 3)</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Supervisory escalation authority</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Ward & Locality
          </span>
          <div className="font-bold text-slate-900">
            {complaint?.location || "Ward 14, Central Sector"}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Local municipal administrative zone</span>
        </div>

      </div>

      {/* Citizen Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 italic">
          Formal communications log transparent audit events visible to civic supervisors.
        </span>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRequestUpdate}
            disabled={requesting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{requesting ? "Requesting..." : t("requestUpdate")}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
