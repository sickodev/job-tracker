"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Sheet } from "@/types";
import { useJobs } from "@/context/JobContext";
import { SheetIcon } from "./SheetModal";
import { CompanyAvatar } from "./CompanyAvatar";
import {
  X,
  AlertTriangle,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface SheetDeletePaneProps {
  sheet: Sheet | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export function SheetDeletePane({
  sheet,
  isOpen,
  onClose,
  onConfirmDelete,
}: SheetDeletePaneProps) {
  const { allJobs, sheets } = useJobs();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [isOpen, onClose]);

  if (typeof window === "undefined" || !isOpen || !sheet) return null;

  const isOnlySheet = sheets.length <= 1;
  const sheetJobs = allJobs.filter((j) => j.sheetId === sheet.id);

  const handleDelete = () => {
    if (isOnlySheet) return;
    onConfirmDelete(sheet.id);
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
        className="relative z-10 h-full w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-overlay-lift flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors animate-slide-in-right"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-rose-100 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-rose-700 dark:text-rose-300 truncate">
                Delete Sheet Warning
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Confirm sheet removal & data impact
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
          {/* Target Sheet Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <SheetIcon name={sheet.icon} className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {sheet.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {sheet.description || "Custom category sheet"}
              </p>
            </div>
          </div>

          {/* Alert Message */}
          {isOnlySheet ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Cannot Delete Last Sheet</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                You must have at least one sheet in your tracker. Create another sheet first before deleting <strong>{sheet.name}</strong>.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Permanent Deletion Warning</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                Are you sure you want to delete <strong>{sheet.name}</strong>? This action cannot be undone.
              </p>
              {sheetJobs.length > 0 ? (
                <p className="text-[11px] font-medium text-rose-800 dark:text-rose-200">
                  ⚠️ <strong>{sheetJobs.length}</strong> job {sheetJobs.length === 1 ? "application" : "applications"} tracked in this sheet will also be permanently deleted.
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  There are currently 0 job applications in this sheet.
                </p>
              )}
            </div>
          )}

          {/* Associated Applications Preview (if any) */}
          {sheetJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                <span>Affected Applications ({sheetJobs.length})</span>
              </div>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/30 max-h-56 overflow-y-auto">
                {sheetJobs.slice(0, 10).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CompanyAvatar
                        company={job.company}
                        companyUrl={job.companyUrl}
                        jobUrl={job.jobUrl}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {job.company}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {job.role}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shrink-0">
                      {job.status}
                    </span>
                  </div>
                ))}
                {sheetJobs.length > 10 && (
                  <div className="p-2 text-center text-[11px] text-zinc-400 font-medium">
                    + {sheetJobs.length - 10} more applications
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
          {!isOnlySheet && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Sheet</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
