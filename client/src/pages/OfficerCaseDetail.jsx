import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import DependencyGraph from "../components/DependencyGraph";
import AuditTimeline from "../components/AuditTimeline";
import RiskBadge from "../components/RiskBadge";
import ResolutionProofModal from "../components/ResolutionProofModal";
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Building2, 
  AlertOctagon, 
  Camera, 
  Layers, 
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  Send
} from "lucide-react";

export default function OfficerCaseDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Resolution modal state
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const fetchCaseDetails = () => {
    if (!token || !id) return;
    setRefreshing(true);
    fetch(`/api/officer/cases/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or case not found under your department jurisdiction");
        return res.json();
      })
      .then((data) => {
        setCaseData(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchCaseDetails();
    const interval = setInterval(fetchCaseDetails, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [id, token]);

  // Toggle Action item SOP status
  const handleToggleAction = async (actionId, currentStatus) => {
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      const res = await fetch(`/api/actions/${actionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update action");
      }
      fetchCaseDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit Completion with Proof -> TRIGGERS DEPENDENCY ENGINE
  const handleCompleteIssueWithProof = async ({ resolutionProof, resolutionNotes }) => {
    if (!resolvingIssue) return;
    try {
      const res = await fetch(`/api/issues/${resolvingIssue.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "COMPLETED",
          resolutionProof,
          resolutionNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete issue");

      setToastMessage(data.message || "Issue completed and dependencies updated!");
      fetchCaseDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // Trigger Escalation
  const handleEscalateIssue = async (issueId) => {
    if (!confirm("Are you sure you want to trigger supervisory escalation for this issue?")) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/escalate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: "Field deadlock or high-risk deadline proximity" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Escalation failed");

      setToastMessage("Supervisor escalation dispatched to departmental director.");
      fetchCaseDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
        <p className="text-sm font-medium">Loading departmental case dossier...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <AlertOctagon className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-900">Jurisdiction Access Denied</h2>
          <p className="text-xs text-red-700 mt-1">{error}</p>
          <Link
            to="/officer"
            className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            ← Return to Officer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { complaint, issues, dependencies, auditTrail, officerDepartment } = caseData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/officer"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {complaint.id}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                Officer Dossier
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                {officerDepartment}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Citizen: {complaint.citizen_name} • Location: {complaint.location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCaseDetails}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Updates</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-300 text-xs text-teal-900 font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage("")} className="text-teal-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Case Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Original Citizen Grievance Statement
            </span>
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed italic">
              "{complaint.description}"
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500 pt-2">
              <span className="px-2 py-0.5 rounded bg-slate-100">Status: {complaint.status}</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">Language: {complaint.language}</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">Severity: {complaint.severity}</span>
            </div>
          </div>

          <div className="w-full md:w-64 flex-shrink-0">
            <RiskBadge
              score={complaint.risk_score}
              level={complaint.risk_level}
              reasons={["Inter-departmental dependency locking Roads Dept", "SLA window progressing"]}
            />
          </div>
        </div>
      </div>

      {/* Dependency Graph */}
      <DependencyGraph complaint={complaint} issues={issues} dependencies={dependencies} />

      {/* Department Work Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-lg text-slate-900">
              Departmental Issue Tasks & Action Plans
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Authorized officers can update checklists and complete assigned tasks
          </span>
        </div>

        <div className="space-y-4">
          {issues.map((iss) => {
            const isMyDept = iss.isMyDepartment;
            const isCompleted = iss.status === "COMPLETED" || iss.status === "CONFIRMED";
            const isBlocked = iss.status === "BLOCKED";
            const isReady = iss.status === "READY";

            return (
              <div
                key={iss.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isMyDept
                    ? "bg-white border-teal-300 ring-2 ring-teal-500/20 shadow-md"
                    : "bg-slate-50/60 border-slate-200 opacity-90"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {iss.display_id}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{iss.title}</h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isMyDept
                            ? "bg-teal-50 text-teal-800 border-teal-300"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {iss.department} {isMyDept ? "(Your Department)" : ""}
                      </span>
                    </div>

                    {/* Officer dependency note */}
                    {iss.dependencies?.officerExplanation && (
                      <p className="text-xs text-slate-600 font-medium">
                        {iss.dependencies.officerExplanation}
                      </p>
                    )}
                  </div>

                  {/* Actions & Status Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : isBlocked
                          ? "bg-red-100 text-red-800 border-red-200 animate-pulse"
                          : isReady
                          ? "bg-teal-100 text-teal-900 border-teal-300 font-black"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {iss.status}
                    </span>

                    {/* Officer Complete Button (Only for own department!) */}
                    {isMyDept && !isCompleted && !isBlocked && (
                      <button
                        onClick={() => setResolvingIssue(iss)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1.5 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete & Unlock Downstream</span>
                      </button>
                    )}

                    {/* Supervisor Escalation Button */}
                    {isMyDept && !isCompleted && (
                      <button
                        onClick={() => handleEscalateIssue(iss.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 transition"
                        title="Trigger early intervention"
                      >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>Escalate</span>
                      </button>
                    )}

                    {!isMyDept && (
                      <span className="text-[11px] font-semibold text-slate-400 italic">
                        Read-only (Jurisdiction: {iss.department})
                      </span>
                    )}
                  </div>
                </div>

                {/* Routing Explanation */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <div className="font-semibold text-slate-800 mb-0.5">Statutory Governance Rationale:</div>
                  <p className="text-[11px] text-slate-600">{iss.routing_reason}</p>
                </div>

                {/* Resolution Proof Summary */}
                {iss.resolution_proof && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                    <div className="font-bold flex items-center space-x-1.5 mb-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Resolution Proof Recorded:</span>
                    </div>
                    <p className="text-[11px] font-medium">"{iss.resolution_proof}"</p>
                    {iss.resolution_notes && (
                      <p className="text-[10px] text-emerald-800 mt-1">{iss.resolution_notes}</p>
                    )}
                  </div>
                )}

                {/* Action Checklist */}
                {iss.actions && iss.actions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      SOP Field Action Checklist {isMyDept ? "(Click to update status)" : ""}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {iss.actions.map((act) => {
                        const isDone = act.status === "COMPLETED";

                        return (
                          <div
                            key={act.id}
                            onClick={() => isMyDept && handleToggleAction(act.id, act.status)}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                              isMyDept ? "cursor-pointer hover:border-teal-400" : ""
                            } ${
                              isDone ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                              <span className={`text-[11px] ${isDone ? "line-through text-slate-400" : "text-slate-800 font-medium"}`}>
                                #{act.sequence_order} {act.title}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                isDone ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {act.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Timeline */}
      <AuditTimeline events={auditTrail} />

      {/* Resolution Proof Submission Modal */}
      <ResolutionProofModal
        isOpen={!!resolvingIssue}
        issue={resolvingIssue}
        onClose={() => setResolvingIssue(null)}
        onSubmit={handleCompleteIssueWithProof}
      />

    </div>
  );
}
