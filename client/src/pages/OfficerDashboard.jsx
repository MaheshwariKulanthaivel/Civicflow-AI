import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
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
  FileCheck2
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
    const interval = setInterval(fetchDashboard, 4000); // Polling every 4s
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
        <p className="text-sm font-medium">Loading municipal departmental dispatch queue...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-900">Department Dashboard Error</h2>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { department, metrics, stats, issues } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Officer Department Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Official Jurisdiction Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{department}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Assigned Field Officer: <strong className="text-white">{user.name}</strong> • Jurisdiction: {metrics.jurisdiction || "Central Zone"}
          </p>
        </div>

        {/* Civic Service Credits Widget */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl flex items-center space-x-4 shadow-inner">
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
            <div className="text-[10px] text-slate-300">
              Verified: {metrics.citizen_confirmed_count || 0} • Reopened: {metrics.reopened_count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 7 Workload KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Work</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{stats.total}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-blue-600 block">Pending</span>
          <div className="text-xl font-bold text-blue-700 mt-1">{stats.pending}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-sky-600 block">In Progress</span>
          <div className="text-xl font-bold text-sky-700 mt-1">{stats.inProgress}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-red-600 block">Blocked (Deps)</span>
          <div className="text-xl font-bold text-red-700 mt-1">{stats.blocked}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block">Completed</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">{stats.completed}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600 block">High Risk</span>
          <div className="text-xl font-bold text-amber-700 mt-1">{stats.highRisk}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600 block">Escalated</span>
          <div className="text-xl font-bold text-rose-700 mt-1">{stats.escalated}</div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>
          
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
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <button
            onClick={fetchDashboard}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Department Issue Work Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Authorized Department Work Queue</h3>
            <p className="text-xs text-slate-500">
              Only grievances assigned to {department} are actionable under strict RBAC jurisdiction
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
            {issues.length} Active Tasks
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No work orders matching the selected filter criteria
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
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
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
                      <span>SLA Deadline: <strong className="text-slate-700 font-mono">{iss.deadline_hours}h</strong></span>
                    </div>

                    {/* Dependency notice */}
                    {iss.dependencies?.officerExplanation && (
                      <div className="text-xs font-semibold text-slate-700 pt-1 flex items-center space-x-1.5">
                        {isBlocked ? (
                          <span className="text-red-700 flex items-center space-x-1">
                            <Lock className="w-3.5 h-3.5 text-red-600" />
                            <span>{iss.dependencies.officerExplanation}</span>
                          </span>
                        ) : isReady ? (
                          <span className="text-teal-800 flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            <span>Dependency satisfied: Ready for immediate dispatch</span>
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="text-right">
                      <RiskBadge score={iss.risk_score} level={iss.risk_level} compact={true} />
                    </div>

                    <div>
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
                    </div>

                    <Link
                      to={`/officer/case/${iss.complaint_id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1 transition shadow-xs"
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

    </div>
  );
}
