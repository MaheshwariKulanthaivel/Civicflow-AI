import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { 
  ShieldCheck, 
  Bell, 
  Globe, 
  LogOut, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Workflow,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = () => {
    if (!token) return;
    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => (r.ok ? r.json() : { notifications: [], unreadCount: 0 }))
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll notifications every 5s
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">{t("appTitle")}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  GovTech MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">{t("appSubtitle")}</p>
            </div>
          </Link>

          {/* Navigation links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Bilingual Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Switch English / தமிழ்"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>{lang === "en" ? "தமிழ்" : "English"}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Role Portals Navigation */}
                {user?.role === "CITIZEN" ? (
                  <Link
                    to="/citizen"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      location.pathname.startsWith("/citizen")
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {t("navCitizenPortal")}
                  </Link>
                ) : (
                  <Link
                    to="/officer"
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      location.pathname.startsWith("/officer")
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {t("navOfficerDashboard")}
                  </Link>
                )}

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition focus:outline-none"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-xs text-slate-700 uppercase tracking-wider">
                            Live Governance Alerts
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 text-xs transition ${
                                n.is_read ? "bg-white opacity-80" : "bg-blue-50/50"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                                  {n.type === "UNLOCKED" ? (
                                    <Sparkles className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                  ) : n.type === "ESCALATION" ? (
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                  )}
                                  <span>{n.title}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-600 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User badge */}
                <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-medium text-slate-200">{user.name}</div>
                    <div className="text-[10px] text-teal-400">
                      {user.role} {user.department ? `(${user.department})` : ""}
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition rounded-md hover:bg-slate-800"
                  title={t("navLogout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/citizen/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-md border border-slate-700 transition"
                >
                  {t("citizenLogin")}
                </Link>
                <Link
                  to="/officer/login"
                  className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-md shadow-sm transition"
                >
                  {t("officerLogin")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
