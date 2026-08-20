"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { JobApplication } from "@/types";
import { useJobs } from "@/context/JobContext";
import { CompanyAvatar } from "./CompanyAvatar";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  X,
  AlertTriangle,
  Trash2,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Layers,
} from "lucide-react";

export interface JobDeletePaneProps {
  job?: JobApplication | null;
  jobs?: JobApplication[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (ids: string[]) => void;
}

export function JobDeletePane({
  job,
  jobs,
  isOpen,
  onClose,
  onConfirmDelete,
}: JobDeletePaneProps) {
  const { sheets } = useJobs();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Normalize target jobs array
  const targetJobs: JobApplication[] = jobs && jobs.length > 0 ? jobs : job ? [job] : [];
  if (targetJobs.length === 0) return null;

  const isBulk = targetJobs.length > 1;
  const singleJob = targetJobs[0];
  const targetSheet = sheets.find((s) => s.id === singleJob?.sheetId);

  const jobsWithResumes = targetJobs.filter((j) => j.resumeUrl || j.resumeName);

  const handleDelete = () => {
    onConfirmDelete(targetJobs.map((j) => j.id));
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-over Warning Pane */}
      <div
        ref={panelRef}
        className="relative z-10 h-full w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors"
        style={{ animation: "slideIn 180ms ease-out" }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-rose-100 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-rose-700 dark:text-rose-300 truncate">
                {isBulk ? `Delete ${targetJobs.length} Applications` : "Delete Application Warning"}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {isBulk
                  ? "Confirm batch application removal & data impact"
                  : "Confirm application removal & data impact"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!isBulk && singleJob ? (
            /* Single Job Info Card */
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
              <div className="flex items-start gap-3">
                <CompanyAvatar
                  company={singleJob.company}
                  companyUrl={singleJob.companyUrl}
                  jobUrl={singleJob.jobUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {singleJob.company}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {singleJob.role}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shrink-0 font-medium">
                  {singleJob.status === "Offer" ? "Offer 🎉" : singleJob.status}
                </span>
              </div>

              {/* Quick Details Chips */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/50 text-[11px] text-zinc-500 dark:text-zinc-400">
                {targetSheet && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Layers className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{targetSheet.name}</span>
                  </div>
                )}
                {singleJob.location && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{singleJob.location}</span>
                  </div>
                )}
                {singleJob.appliedDate && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{formatDate(singleJob.appliedDate)}</span>
                  </div>
                )}
                {singleJob.salaryMax ? (
                  <div className="flex items-center gap-1.5 truncate font-mono">
                    <DollarSign className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{formatCurrency(singleJob.salaryMax, singleJob.salaryCurrency)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            /* Bulk Summary Card */
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {targetJobs.length} Applications Selected
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Batch deletion across active tracker views
                </p>
              </div>
            </div>
          )}

          {/* Alert Message */}
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Permanent Deletion Warning</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
              {isBulk ? (
                <>
                  Are you sure you want to delete these <strong>{targetJobs.length}</strong> job applications? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete the application for <strong>{singleJob?.company}</strong> (<em>{singleJob?.role}</em>)? This action cannot be undone.
                </>
              )}
            </p>

            {jobsWithResumes.length > 0 && (
              <p className="text-[11px] font-medium text-rose-800 dark:text-rose-200 flex items-center gap-1.5 pt-0.5">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isBulk
                    ? `${jobsWithResumes.length} attached document(s) & prep logs will also be permanently deleted.`
                    : `Attached resume "${singleJob?.resumeName || "Document"}" & notes will be removed.`}
                </span>
              </p>
            )}
          </div>

          {/* Single Job Notes Preview (if any) */}
          {!isBulk && singleJob?.notes && (
            <div>
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Associated Notes
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed italic">
                &ldquo;{singleJob.notes}&rdquo;
              </div>
            </div>
          )}

          {/* Associated Applications Preview (for Bulk or Inspection) */}
          {isBulk && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                <span>Affected Applications ({targetJobs.length})</span>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/30 max-h-56 overflow-y-auto">
                {targetJobs.slice(0, 10).map((j) => (
                  <div key={j.id} className="flex items-center justify-between p-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CompanyAvatar
                        company={j.company}
                        companyUrl={j.companyUrl}
                        jobUrl={j.jobUrl}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {j.company}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {j.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {j.resumeUrl && <FileText className="w-3 h-3 text-amber-500" />}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                        {j.status}
                      </span>
                    </div>
                  </div>
                ))}
                {targetJobs.length > 10 && (
                  <div className="p-2 text-center text-[11px] text-zinc-400 font-medium">
                    + {targetJobs.length - 10} more applications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBulk ? `Delete ${targetJobs.length} Applications` : "Delete Application"}</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
