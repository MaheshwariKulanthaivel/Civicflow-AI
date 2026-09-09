import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Users, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function CitizenLogin() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("citizen@civicflow.demo");
  const [password, setPassword] = useState("Citizen@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, "CITIZEN");
      navigate("/citizen");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("citizen@civicflow.demo");
    setPassword("Citizen@123");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Grievance Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to register grievances, track atomic decomposition, and confirm field resolutions
          </p>
        </div>

        {/* Demo prefill banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-blue-900 block">Demo Citizen Account</span>
            <span className="text-blue-700 font-mono text-[11px]">citizen@civicflow.demo</span>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition"
          >
            Auto-Fill
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="citizen@civicflow.demo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Citizen Portal"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Municipal Officer?{" "}
          <Link to="/officer/login" className="text-teal-600 font-semibold hover:underline">
            Officer Login Here →
          </Link>
        </div>

      </div>
    </div>
  );
}
