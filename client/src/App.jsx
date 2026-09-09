import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/Navbar";

import LandingPage from "./pages/LandingPage";
import CitizenLogin from "./pages/CitizenLogin";
import OfficerLogin from "./pages/OfficerLogin";
import CitizenPortal from "./pages/CitizenPortal";
import CitizenCaseDetail from "./pages/CitizenCaseDetail";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerCaseDetail from "./pages/OfficerCaseDetail";

// Protected route wrappers
function ProtectedCitizenRoute({ children }) {
  const { isAuthenticated, isCitizen, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/citizen/login" replace />;
  if (!isCitizen) return <Navigate to="/officer" replace />;
  return children;
}

function ProtectedOfficerRoute({ children }) {
  const { isAuthenticated, isOfficer, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/officer/login" replace />;
  if (!isOfficer) return <Navigate to="/citizen" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Landing & Login */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/citizen/login" element={<CitizenLogin />} />
          <Route path="/officer/login" element={<OfficerLogin />} />

          {/* Citizen Protected Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedCitizenRoute>
                <CitizenPortal />
              </ProtectedCitizenRoute>
            }
          />
          <Route
            path="/citizen/case/:id"
            element={
              <ProtectedCitizenRoute>
                <CitizenCaseDetail />
              </ProtectedCitizenRoute>
            }
          />

          {/* Officer Protected Routes */}
          <Route
            path="/officer"
            element={
              <ProtectedOfficerRoute>
                <OfficerDashboard />
              </ProtectedOfficerRoute>
            }
          />
          <Route
            path="/officer/case/:id"
            element={
              <ProtectedOfficerRoute>
                <OfficerCaseDetail />
              </ProtectedOfficerRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
