import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import RiskBadge from "../components/RiskBadge";
import { 
  Sparkles, 
  Send, 
  MapPin, 
  Tag, 
  Image, 
  Video, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  FileText,
  RotateCcw
} from "lucide-react";

export default function CitizenPortal() {
  const { user, token } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Near St. Mary's School, Ward 14, Central Sector");
  const [category, setCategory] = useState("Sewage & Road Infrastructure");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=600&q=80");
  const [videoUrl, setVideoUrl] = useState("");
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchMyComplaints = () => {
    if (!token) return;
    let url = `/api/complaints?search=${encodeURIComponent(searchQuery)}`;
    if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => (r.ok ? r.json() : { complaints: [] }))
      .then((data) => setComplaints(data.complaints || []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [token, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMyComplaints();
  };

  // 1-Click Load Primary Killer Demo Case
  const handleLoadDemoCase = async (isTamil = false) => {
    setError("");
    setAnalyzing(true);
    try {
      // First reset the demo database state to ensure fresh, clean presentation
      await fetch("/api/complaints/reset-demo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (isTamil) {
        setDescription("பள்ளிக்கு அருகில் கழிவுநீர் தேங்கி சாலை சேதமடைந்துள்ளது. தெருவிளக்குகளும் வேலை செய்யவில்லை.");
        setLocation("அரசு பள்ளி அருகில், வார்டு 14");
        setCategory("கழிவுநீர் மற்றும் சாலை");
      } else {
        setDescription("Heavy sewage overflow near the school has damaged the road, traffic is affected and streetlights aren't working.");
        setLocation("Near St. Mary's School, Ward 14, Central Sector");
        setCategory("Sewage & Road Infrastructure");
      }

      // Automatically redirect to the primary case detail to show full decomposition & dependencies!
      const targetId = isTamil ? "CF-2026-001248" : "CF-2026-001247";
      setTimeout(() => {
        navigate(`/citizen/case/${targetId}`);
      }, 500);
    } catch (err) {
      setError("Failed to load demo scenario: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeAndSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe the civic grievance");
      return;
    }

    setError("");
    setAnalyzing(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          location,
          category,
          photo_url: photoUrl,
          video_url: videoUrl,
          language: lang === "ta" ? "Tamil" : "English"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit grievance");

      setAnalysisResult(data);
      fetchMyComplaints();

      // Navigate to the case detail after a short pause so user can inspect decomposition
      setTimeout(() => {
        navigate(`/citizen/case/${data.complaintId}`);
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to process grievance");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner & KILLER DEMO CALLOUT */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Citizen Portal • {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Register & Track Civic Grievances
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            CivicFlow AI automatically decomposes compound complaints into atomic issues and manages the cross-department dependency chain.
          </p>
        </div>

        {/* Big Prominent LOAD DEMO CASE Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-shrink-0">
          <button
            onClick={() => handleLoadDemoCase(false)}
            className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{t("loadDemoCase")} (English)</span>
          </button>

          <button
            onClick={() => handleLoadDemoCase(true)}
            className="px-4 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 shadow-sm flex items-center justify-center space-x-1.5 transition"
          >
            <span>{t("loadDemoCase")} (தமிழ்)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Complaint Submission Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-base text-slate-900">Submit New Grievance</h2>
              <p className="text-xs text-slate-500">Deconstructs compound problems into atomic work orders</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Multilingual (EN / TA)
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyzeAndSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grievance Description (State all issues clearly)
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans"
                placeholder="E.g., Heavy sewage overflow near the school has damaged the road, traffic is affected and streetlights aren't working..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Ward
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ward 14, Main Road..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Civic Domain
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E.g., Infrastructure, Drainage..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photo Proof URL (Optional)
                </label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video Evidence URL (Optional)
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional video URL"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={analyzing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzing ? t("analyzing") : t("analyzeComplaint")}</span>
              </button>

              <span className="text-[11px] text-slate-400">
                Generates atomic issues, responsibility routing, and initial dependency graph.
              </span>
            </div>
          </form>

          {/* Real-time Analysis Card (if returned) */}
          {analysisResult && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-700 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  {t("complaintUnderstanding")}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Source: {analysisResult.analysisSource}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Complaint ID:</span>
                  <span className="font-mono font-bold text-blue-400">{analysisResult.complaintId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Severity:</span>
                  <span className="font-bold text-amber-400">{analysisResult.severity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Priority:</span>
                  <span className="font-bold text-red-400">{analysisResult.priority}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Detected Issues:</span>
                  <span className="font-bold text-teal-400">{analysisResult.issuesCount} Atomic Tasks</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Citizen's Existing Grievances (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">My Registered Grievances</h3>
              </div>
              <button
                onClick={fetchMyComplaints}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search & Filter Form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grievance ID or text..."
                  className="w-full text-xs pl-8 pr-2 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Search
              </button>
            </form>

            {/* List */}
            {loadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading cases...</div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No grievances registered under this account
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {complaints.map((c) => (
                  <Link
                    key={c.id}
                    to={`/citizen/case/${c.id}`}
                    className="block p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition bg-slate-50/50 hover:bg-white group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-blue-700">{c.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium line-clamp-2">
                      {c.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{c.issuesCount || 3} Decomposed Issues</span>
                      <div className="flex items-center space-x-1 text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                        <span>View Progress</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
