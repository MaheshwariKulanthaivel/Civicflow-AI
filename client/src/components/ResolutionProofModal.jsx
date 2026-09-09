import React, { useState } from "react";
import { CheckCircle, X, Camera, FileText } from "lucide-react";

export default function ResolutionProofModal({ isOpen, onClose, onSubmit, issue }) {
  const [proofText, setProofText] = useState(
    "Motorized suction cleared main blockage; high-pressure flush completed and collar sealed."
  );
  const [proofUrl, setProofUrl] = useState(
    "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=600&q=80"
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        resolutionProof: proofText,
        resolutionNotes: `Field verification completed by assigned officer. Inspection photo uploaded: ${proofUrl}`
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Submit Resolution Proof</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Issue Being Completed
            </span>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
              {issue?.display_id}: {issue?.title} ({issue?.department})
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Completion Summary & Technical Notes
            </label>
            <textarea
              required
              rows={3}
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe work completed on-site..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Photo / Document Evidence URL
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full text-xs pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-tight">
            <strong>Orchestration Notice:</strong> Completing this issue will automatically trigger the Dependency Engine to check and unlock any dependent municipal tasks (e.g. Roads Dept).
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? "Resolving..." : "Confirm & Unlock Dependencies"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
