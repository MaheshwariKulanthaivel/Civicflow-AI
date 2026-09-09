import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { 
  Workflow, 
  BrainCircuit, 
  GitBranch, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Award,
  Users,
  Building,
  Lock,
  Play
} from "lucide-react";

export default function LandingPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    try {
      // Log in as demo citizen and navigate to citizen portal
      await login("citizen@civicflow.demo", "Citizen@123", "CITIZEN");
      navigate("/citizen");
    } catch (err) {
      navigate("/citizen/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Next-Gen Governance Orchestration</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              CivicFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">AI</span>
            </h1>

            <p className="mt-4 text-xl sm:text-2xl font-medium text-slate-200">
              AI-powered governance orchestration for faster grievance resolution.
            </p>

            {/* Core Philosophy Callouts */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl backdrop-blur-sm text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-teal-400 mt-2 flex-shrink-0"></div>
                <p className="text-sm sm:text-base text-slate-300 font-medium italic">
                  "{t("quote1")}"
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                <p className="text-xs sm:text-sm text-slate-400">
                  <strong className="text-slate-200">Judge-level Insight:</strong> "{t("quote2")}"
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleQuickDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 group transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t("tryLiveDemo")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/citizen/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center space-x-2 transition"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>{t("citizenLogin")}</span>
              </Link>

              <Link
                to="/officer/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center space-x-2 transition"
              >
                <Building className="w-4 h-4 text-teal-400" />
                <span>{t("officerLogin")}</span>
              </Link>
            </div>

            <div className="mt-6 text-xs text-slate-400 font-mono">
              Demo credentials seeded & ready • Single-click instant authentication
            </div>

          </div>
        </div>
      </section>

      {/* 3 Major Capabilities */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Core Architecture</h2>
          <p className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
            Three Pillars of Active Governance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Understand */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Understand</h3>
            <p className="text-sm font-semibold text-blue-700 mb-3">
              Dynamic Multi-Issue Decomposition
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens submit compound complaints in colloquial English or Tamil. CivicFlow rejects monolithic tickets, decomposing grievances into atomic, actionable civic issues mapped to a 35-item municipal taxonomy.
            </p>
          </div>

          {/* Pillar 2: Orchestrate */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition ring-2 ring-teal-500/20">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Orchestrate</h3>
            <p className="text-sm font-semibold text-teal-700 mb-3">
              Cross-Department Dependency Engine
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Coordinates departments and locks dependent actions. For instance, road resurfacing is locked as <strong>BLOCKED</strong> until subterranean drainage repair is verified, preventing contractors from paving over burst pipes.
            </p>
          </div>

          {/* Pillar 3: Escalate */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Escalate</h3>
            <p className="text-sm font-semibold text-amber-700 mb-3">
              Predictive Risk & Early Intervention
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instead of waiting for an SLA breach to fire an alarm, CivicFlow calculates real-time risk scores (0–100) and triggers automated reminders and supervisor warnings at 50% and 75% thresholds before failure occurs.
            </p>
          </div>

        </div>
      </section>

      {/* Primary Killer Demo Showcase Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Primary Hackathon Scenario
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                  Compound Municipal Crisis Decomposition
                </h3>
                <p className="mt-2 text-sm text-slate-300 italic">
                  "Heavy sewage overflow near the school has damaged the road, traffic is affected and streetlights aren't working."
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-700 text-blue-300 border border-slate-600">
                    I-1: Sewage Overflow (Drainage) → IN PROGRESS
                  </span>
                  <span className="px-2.5 py-1 rounded bg-red-900/60 text-red-200 border border-red-700">
                    I-2: Road Damage (Roads) → BLOCKED by I-1
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                    I-3: Streetlight Failure (Electrical) → COMPLETED
                  </span>
                </div>
              </div>

              <button
                onClick={handleQuickDemo}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs text-white shadow-md transition flex items-center space-x-2 flex-shrink-0"
              >
                <span>Execute Scenario Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision Footer Quote */}
      <footer className="py-12 bg-white border-t border-slate-200 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
            <Workflow className="w-5 h-5" />
            <span className="font-bold text-sm">CivicFlow AI</span>
          </div>
          <p className="text-xs text-slate-500 italic">
            "Today we resolve complaints. Tomorrow, CivicFlow predicts and prevents them."
          </p>
          <div className="mt-4 text-[11px] text-slate-400">
            CivicFlow AI Governance Platform • Hackathon MVP • Role-Based Access Control • Native SQLite
          </div>
        </div>
      </footer>

    </div>
  );
}
