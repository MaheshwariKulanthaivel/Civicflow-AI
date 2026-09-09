import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import CivicProblemGraph from "../components/CivicProblemGraph";
import WhyWaitingCard from "../components/WhyWaitingCard";
import ResolutionJourney from "../components/ResolutionJourney";
import CivicImpactCard from "../components/CivicImpactCard";
import CommunitySignalCard from "../components/CommunitySignalCard";
import PreventiveInsightCard from "../components/PreventiveInsightCard";
import CivicFlowConnect from "../components/CivicFlowConnect";
import AuditTimeline from "../components/AuditTimeline";
import RiskBadge from "../components/RiskBadge";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ShieldCheck, 
  Award, 
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Building2
} from "lucide-react";

export default function CitizenCaseDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const { lang, t } = useLanguage();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Reopen modal state
  const [reopenIssueId, setReopenIssueId] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback toast
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const fetchCaseDetails = () => {
    if (!token || !id) return;
    setRefreshing(true);
    fetch(`/api/complaints/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load case or unauthorized access");
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
    // Real-time polling every 3 seconds
    const interval = setInterval(fetchCaseDetails, 3000);
    return () => clearInterval(interval);
  }, [id, token]);

  const handleConfirmResolution = async (issueId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/confirm-resolution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm resolution");

      setFeedbackMessage(`Citizen Verified Resolution! Awarded +${data.pointsAwarded} Civic Service Credits to the department.`);
      fetchCaseDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/issues/${reopenIssueId}/reopen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reopenReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reopen grievance");

      setFeedbackMessage("Grievance reopened and escalated to the department supervisor.");
      setReopenIssueId(null);
      setReopenReason("");
      fetchCaseDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <p className="text-sm font-medium">Loading citizen transparency records...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-900">Access Denied or Case Not Found</h2>
          <p className="text-xs text-red-700 mt-1">{error}</p>
          <Link
            to="/citizen"
            className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            ← Back to Citizen Portal
          </Link>
        </div>
      </div>
    );
  }

  const { complaint, issues, dependencies, auditTrail, civicImpact, communitySignal } = caseData;
  const blockedIssues = issues.filter((i) => i.status === "BLOCKED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Live Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/citizen"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {complaint.id}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  complaint.status === "RESOLVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {complaint.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered at {complaint.location} • {new Date(complaint.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCaseDetails}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Live Sync Active</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage("")} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Hero Grievance Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Registered Grievance Statement
            </span>
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed italic">
              "{complaint.description}"
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-slate-500">
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Language: {complaint.language}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Severity: {complaint.severity}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Analysis: {complaint.analysis_source}
              </span>
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-bold">
                {issues.length} Atomic Work Orders
              </span>
            </div>
          </div>

          <div className="w-full md:w-64 flex-shrink-0">
            <RiskBadge
              score={complaint.risk_score}
              level={complaint.risk_level}
              reasons={["Inter-departmental dependency locking Roads Dept", "School perimeter vulnerability"]}
            />
          </div>
        </div>
      </div>

      {/* 1. Resolution Journey ("What happens next?") */}
      <ResolutionJourney complaint={complaint} issues={issues} />

      {/* 2. Civic Problem Graph */}
      <CivicProblemGraph complaint={complaint} issues={issues} dependencies={dependencies} />

      {/* 3. Why is my complaint waiting? (Shows when an issue is BLOCKED) */}
      <WhyWaitingCard blockedIssues={blockedIssues} dependencies={dependencies} />

      {/* 4. Intelligence Grid: Civic Impact & Community Signal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Civic Impact */}
        <CivicImpactCard impactData={civicImpact} />

        {/* Community Signal & Locality Clustering */}
        <CommunitySignalCard signalData={communitySignal} />
      </div>

      {/* 5. Preventive Governance Insight */}
      {communitySignal?.preventiveInsight && (
        <PreventiveInsightCard insightData={communitySignal.preventiveInsight} />
      )}

      {/* 6. CivicFlow Connect: Who can help me? */}
      <CivicFlowConnect complaint={complaint} issues={issues} onUpdateRequested={fetchCaseDetails} />

      {/* 7. Atomic Departmental Work Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-lg text-slate-900">
              {t("detectedIssues")} ({issues.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Independent departmental execution with automatic dependency unlock gates
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {issues.map((iss) => {
            const isBlocked = iss.status === "BLOCKED";
            const isReady = iss.status === "READY";
            const isCompleted = iss.status === "COMPLETED";
            const isConfirmed = iss.status === "CONFIRMED";

            return (
              <div
                key={iss.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isBlocked
                    ? "bg-red-50/20 border-red-200"
                    : isReady
                    ? "bg-teal-50/30 border-teal-300 ring-1 ring-teal-400/20"
                    : isCompleted
                    ? "bg-emerald-50/20 border-emerald-200"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {iss.display_id}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{iss.title}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>{iss.department}</span>
                      </span>
                    </div>

                    {/* Dependency notice */}
                    {iss.dependencies?.citizenExplanation && (
                      <div className="text-xs font-semibold text-slate-700 pt-1">
                        {isBlocked ? (
                          <span className="text-red-700 flex items-center space-x-1.5">
                            <Lock className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                            <span>{t("roadBlockedNotice")}</span>
                          </span>
                        ) : isReady ? (
                          <span className="text-teal-800 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                            <span>{t("roadReadyNotice")}</span>
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Status & Verification Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : isConfirmed
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : isBlocked
                          ? "bg-red-100 text-red-800 border-red-200"
                          : isReady
                          ? "bg-teal-100 text-teal-900 border-teal-300 font-black"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {iss.status}
                    </span>

                    {/* Citizen Independent Verification */}
                    {isCompleted && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleConfirmResolution(iss.id)}
                          disabled={actionLoading}
                          className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t("confirmResolved")}</span>
                        </button>

                        <button
                          onClick={() => setReopenIssueId(iss.id)}
                          disabled={actionLoading}
                          className="px-3.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t("stillNotResolved")}</span>
                        </button>
                      </div>
                    )}

                    {isConfirmed && (
                      <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Citizen Verified • +17 Credits Awarded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statutory Routing Explanation */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <div className="font-semibold text-slate-800 mb-0.5">{t("whyThisDepartment")}</div>
                  <p className="text-[11px] text-slate-600">{iss.routing_reason}</p>
                </div>

                {/* Resolution Proof Card */}
                {iss.resolution_proof && (
                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                    <div className="font-bold flex items-center space-x-1.5 mb-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t("resolutionProof")} Uploaded by Assigned Officer:</span>
                    </div>
                    <p className="text-[11px] italic font-medium">"{iss.resolution_proof}"</p>
                    {iss.resolved_at && (
                      <div className="text-[10px] text-emerald-700 mt-1">
                        Completed on: {new Date(iss.resolved_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Checklist */}
                {iss.actions && iss.actions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      SOP Field Action Checklist
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {iss.actions.map((act) => (
                        <div
                          key={act.id}
                          className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center space-x-2"
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                              act.status === "COMPLETED"
                                ? "bg-emerald-600 text-white"
                                : act.status === "IN_PROGRESS"
                                ? "bg-blue-600 text-white animate-pulse"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {act.status === "COMPLETED" ? "✓" : act.sequence_order}
                          </span>
                          <span className={`text-[11px] ${act.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-800 font-medium"}`}>
                            {act.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Immutable Audit Timeline */}
      <AuditTimeline events={auditTrail} />

      {/* Reopen Grievance Modal */}
      {reopenIssueId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2 text-rose-600 mb-2">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">{t("reopenGrievance")}</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Please state why the grievance remains unresolved on the ground. This will immediately escalate the issue to the department supervisor and dock premature resolution points.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="E.g., Sewage water continues to seep from the damaged collar; road is still flooded..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReopenIssueId(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Reopen & Escalate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
