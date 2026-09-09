import React from "react";
import { CheckCircle2, Circle, Clock, Sparkles, UserCheck, ShieldAlert } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function ResolutionJourney({ complaint, issues = [] }) {
  const { t } = useLanguage();

  const sewageIssue = issues.find((i) => i.display_id === "I-1" || i.title.toLowerCase().includes("sewage"));
  const roadIssue = issues.find((i) => i.display_id === "I-2" || i.title.toLowerCase().includes("road"));

  const isSewageDone = sewageIssue?.status === "COMPLETED" || sewageIssue?.status === "CONFIRMED";
  const isRoadDone = roadIssue?.status === "COMPLETED" || roadIssue?.status === "CONFIRMED";
  const isRoadReady = roadIssue?.status === "READY" || roadIssue?.status === "IN_PROGRESS";
  const isAllConfirmed = issues.every((i) => i.status === "CONFIRMED");

  // Step definition based on real database state
  const steps = [
    {
      id: "step-1",
      title: "Complaint Received",
      status: "COMPLETED",
      desc: `Registered grievance ${complaint?.id || ""}`
    },
    {
      id: "step-2",
      title: "CivicFlow Understood",
      status: "COMPLETED",
      desc: `Decomposed into ${issues.length} atomic issues`
    },
    {
      id: "step-3",
      title: "Departments Assigned",
      status: "COMPLETED",
      desc: "Drainage, Roads & Electrical allocated"
    },
    {
      id: "step-4",
      title: "Sewage Clearance",
      status: isSewageDone ? "COMPLETED" : "IN_PROGRESS",
      desc: isSewageDone ? "Culvert blockage cleared" : "Suction & desilting in progress"
    },
    {
      id: "step-5",
      title: "Road Repair",
      status: isRoadDone ? "COMPLETED" : isRoadReady ? "IN_PROGRESS" : "BLOCKED",
      desc: isRoadDone ? "Macadam repaving completed" : isRoadReady ? "Authorized: Ready to start" : "Waiting for sewage clearance"
    },
    {
      id: "step-6",
      title: "Citizen Verification",
      status: isAllConfirmed ? "COMPLETED" : isSewageDone || isRoadDone ? "ACTION_REQUIRED" : "PENDING",
      desc: isAllConfirmed ? "Confirmed & Credits awarded" : "Independent citizen inspection"
    }
  ];

  const getStepIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case "ACTION_REQUIRED":
        return <UserCheck className="w-5 h-5 text-amber-600" />;
      case "BLOCKED":
        return <Circle className="w-5 h-5 text-red-500 fill-red-100" />;
      default:
        return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStepCardBg = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50/60 border-emerald-200 text-emerald-950";
      case "IN_PROGRESS":
        return "bg-blue-50/70 border-blue-300 text-blue-950 ring-2 ring-blue-400/20";
      case "ACTION_REQUIRED":
        return "bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400/20";
      case "BLOCKED":
        return "bg-red-50/40 border-red-200 text-red-950";
      default:
        return "bg-slate-50 border-slate-200 text-slate-500 opacity-70";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">{t("resolutionJourney")}</h3>
            <p className="text-xs text-slate-500">
              Live operational milestones driven directly by actual municipal state transitions
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Stage {isAllConfirmed ? "6" : isSewageDone ? "5" : "4"} of 6
        </span>
      </div>

      {/* Stepper Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((st, idx) => (
          <div
            key={st.id}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${getStepCardBg(st.status)}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border border-slate-200">
                  0{idx + 1}
                </span>
                {getStepIcon(st.status)}
              </div>
              <h4 className="font-bold text-xs leading-tight">{st.title}</h4>
              <p className="text-[10px] mt-1 leading-snug opacity-80">{st.desc}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-black/5 text-[9px] font-bold uppercase tracking-wider">
              {st.status === "COMPLETED" ? "✓ Done" : st.status === "IN_PROGRESS" ? "● In Progress" : st.status === "BLOCKED" ? "✖ Blocked" : st.status === "ACTION_REQUIRED" ? "★ Action Needed" : "○ Pending"}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
