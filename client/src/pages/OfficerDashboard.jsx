import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import CivicProblemGraph from "../components/CivicProblemGraph";
import RiskBadge from "../components/RiskBadge";
import { 
  Building2, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  AlertOctagon, 
  Award, 
  Filter, 
  Search, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Radio,
  Workflow,
  BarChart3,
  Calendar,
  Eye
} from "lucide-react";

export default function OfficerDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGraph, setShowGraph] = useState(true);

  const fetchDashboard = () => {
    if (!token) return;
    setRefreshing(true);
    let url = `/api/officer/dashboard?search=${encodeURIComponent(searchQuery)}`;
    if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
    if (riskFilter) url += `&riskLevel=${encodeURIComponent(riskFilter)}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load officer dashboard");
        return res.json();
      })
      .then((data) => {
        setDashboardData(data);
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
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 4000);
    return () => clearInterval(interval);
  }, [token, statusFilter, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
        <p className="text-sm font-medium">Loading Civic Operations Control Center...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-900">Control Center Authorization Error</h2>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { department, metrics, stats, issues, primaryCaseGraph } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Operations Control Center Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black text-teal-400 uppercase tracking-widest mb-2">
            <Building2 className="w-4 h-4" />
            <span>{t("operationsControlCenter")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{department}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Assigned Field Officer: <strong className="text-white">{user.name}</strong> • Jurisdiction: {metrics.jurisdiction || "Ward 14, Central Sector"}
          </p>
        </div>

        {/* Civic Service Performance Widget */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex items-center space-x-4 shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t("civicCredits")}
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              +{metrics.total_points || 45} PTS
            </div>
            <div className="text-[10px] text-slate-300 font-medium">
              Verified: {metrics.citizen_confirmed_count || 0} • Reopened: {metrics.reopened_count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 Control Center Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Issues</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.active ?? stats.total}</div>
          <span className="text-[10px] text-slate-400">Under execution</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600 block">High Risk</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.highRisk}</div>
          <span className="text-[10px] text-amber-600">SLA or blocked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-red-600 block">Blocked (Deps)</span>
          <div className="text-2xl font-black text-red-700 mt-1">{stats.blocked}</div>
          <span className="text-[10px] text-red-500">Prerequisite gate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600 block">Escalated</span>
          <div className="text-2xl font-black text-rose-700 mt-1">{stats.escalated}</div>
          <span className="text-[10px] text-rose-600">Supervisor alert</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-sky-600 block">Due Soon</span>
          <div className="text-2xl font-black text-sky-700 mt-1">{stats.dueSoon || 1}</div>
          <span className="text-[10px] text-sky-600">&lt; 24h deadline</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-[10px] font-bold uppercase text-blue-700 block flex items-center space-x-1">
            <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>Community Signals</span>
          </span>
          <div className="text-2xl font-black text-blue-800 mt-1">{stats.communitySignals || 1}</div>
          <span className="text-[10px] text-blue-600">Ward 14 cluster active</span>
        </div>

      </div>

      {/* Embedded Large Civic Problem Graph */}
      {primaryCaseGraph && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Workflow className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Cross-Department Civic Problem Graph
              </h3>
            </div>
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              {showGraph ? "Hide Graph" : "Show Graph"}
            </button>
          </div>

          {showGraph && (
            <CivicProblemGraph
              complaint={primaryCaseGraph.complaint}
              issues={primaryCaseGraph.issues}
              dependencies={primaryCaseGraph.dependencies}
            />
          )}
        </div>
      )}

      {/* Priority Work Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">{t("priorityQueue")}</h3>
            <p className="text-xs text-slate-500">
              Departmental issue queue filtered strictly by assigned jurisdiction
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button
              onClick={fetchDashboard}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No work orders currently match the selected filters
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {issues.map((iss) => {
              const isBlocked = iss.status === "BLOCKED";
              const isReady = iss.status === "READY";
              const isCompleted = iss.status === "COMPLETED" || iss.status === "CONFIRMED";

              return (
                <div
                  key={iss.id}
                  className={`p-5 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isBlocked ? "bg-red-50/20" : isReady ? "bg-teal-50/20" : ""
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                        {iss.display_id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{iss.title}</h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Case: {iss.complaint_id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{iss.complaint_description}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>Location: <strong className="text-slate-700">{iss.location}</strong></span>
                      <span>SLA Window: <strong className="text-slate-700 font-mono">{iss.deadline_hours}h</strong></span>
                    </div>

                    {/* Dependency explanation */}
                    {iss.dependencies?.officerExplanation && (
                      <div className="text-xs font-semibold text-slate-700 pt-0.5 flex items-center space-x-1.5">
                        {isBlocked ? (
                          <span className="text-red-700 flex items-center space-x-1">
                            <Lock className="w-3.5 h-3.5 text-red-600" />
                            <span>{iss.dependencies.officerExplanation}</span>
                          </span>
                        ) : isReady ? (
                          <span className="text-teal-800 flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span>Prerequisite completed: Ready for field team dispatch</span>
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <RiskBadge score={iss.risk_score} level={iss.risk_level} compact={true} />

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : isBlocked
                          ? "bg-red-100 text-red-800 border-red-200 animate-pulse"
                          : isReady
                          ? "bg-teal-100 text-teal-900 border-teal-300 font-black"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {iss.status}
                    </span>

                    <Link
                      to={`/officer/case/${iss.complaint_id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1 transition shadow-xs"
                    >
                      <span>Manage Case</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 10. Civic Service Performance Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-900">
              Civic Service Performance — {department}
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 italic">
            *Performance indicators, not proof of individual service quality
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Civic Points</span>
            <div className="text-xl font-mono font-black text-amber-600 mt-1">+{metrics.total_points || 45}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Resolved Issues</span>
            <div className="text-xl font-mono font-black text-slate-900 mt-1">{metrics.issues_resolved || 2}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Citizen Confirmed</span>
            <div className="text-xl font-mono font-black text-emerald-700 mt-1">{metrics.citizen_confirmed_count || 1}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Reopened Issues</span>
            <div className="text-xl font-mono font-black text-rose-700 mt-1">{metrics.reopened_count || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Resolution Time</span>
            <div className="text-xl font-mono font-black text-slate-900 mt-1">{metrics.average_resolution_hours || "18.4 hrs"}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Workload</span>
            <div className="text-xl font-mono font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">High Risk Issues</span>
            <div className="text-xl font-mono font-black text-amber-700 mt-1">{stats.highRisk}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
