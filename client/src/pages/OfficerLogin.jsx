import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Building, Lock, Mail, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";

export default function OfficerLogin() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("officer@civicflow.demo");
  const [password, setPassword] = useState("Officer@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, "OFFICER");
      navigate("/officer");
    } catch (err) {
      setError(err.message || "Invalid officer credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (officerEmail) => {
    setEmail(officerEmail);
    setPassword("Officer@123");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-700 p-8">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-500/20">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Municipal Officer Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Departmental Command Center for field dispatch, dependency unlocks & SLA monitoring
          </p>
        </div>

        {/* Demo prefill options */}
        <div className="mb-6 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-2">
          <span className="font-semibold text-teal-950 block">Quick Demo Accounts:</span>
          
          <div className="flex items-center justify-between">
            <span className="text-teal-800 text-[11px] font-mono">
              Drainage Officer (officer@civicflow.demo)
            </span>
            <button
              type="button"
              onClick={() => fillDemo("officer@civicflow.demo")}
              className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-semibold"
            >
              Select
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-teal-200/60">
            <span className="text-teal-800 text-[11px] font-mono">
              Roads Officer (roads.officer@civicflow.demo)
            </span>
            <button
              type="button"
              onClick={() => fillDemo("roads.officer@civicflow.demo")}
              className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-semibold"
            >
              Select
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Municipal Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="officer@civicflow.demo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20 flex items-center justify-center space-x-1.5 transition disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Verifying Authorization..." : "Enter Officer Dashboard"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Citizen filing a grievance?{" "}
          <Link to="/citizen/login" className="text-blue-600 font-semibold hover:underline">
            Citizen Login Here →
          </Link>
        </div>

      </div>
    </div>
  );
}
