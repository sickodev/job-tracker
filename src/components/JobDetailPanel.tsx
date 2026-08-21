"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { JobApplication, JobStatus, CompanyType, WorkplaceType, Priority } from "@/types";
import { useJobs } from "@/context/JobContext";
import { formatDate, openDocumentAttachment } from "@/lib/utils";
import { CompanyAvatar } from "./CompanyAvatar";
import { JobDeletePane } from "./JobDeletePane";
import {
  X,
  ExternalLink,
  Star,
  ChevronRight,
  Trash2,
  Copy,
  Layers,
  Globe,
  FileText,
  Upload,
  Loader2,
  Download,
  ChevronDown,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import confetti from "canvas-confetti";

interface JobDetailPanelProps {
  job: JobApplication | null;
  onClose: () => void;
}

const STATUS_OPTIONS: { status: JobStatus; dot: string }[] = [
  { status: "Wishlist", dot: "bg-zinc-400 dark:bg-zinc-500" },
  { status: "Applied", dot: "bg-blue-500" },
  { status: "Screening", dot: "bg-purple-500" },
  { status: "Technical", dot: "bg-amber-500" },
  { status: "Behavioral", dot: "bg-indigo-500" },
  { status: "Offer", dot: "bg-emerald-500" },
  { status: "Rejected", dot: "bg-rose-500" },
  { status: "Withdrawn", dot: "bg-zinc-400 dark:bg-zinc-600" },
];

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 text-xs">
      <div className="w-28 shrink-0 text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function JobDetailPanel({ job: jobProp, onClose }: JobDetailPanelProps) {
  const { updateJob, deleteJob, duplicateJob, sheets, allJobs, uploadResume } = useJobs();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletePaneOpen, setIsDeletePaneOpen] = useState(false);
  const [docMode, setDocMode] = useState<"upload" | "link">("upload");
  const [linkInputUrl, setLinkInputUrl] = useState("");
  const [linkInputName, setLinkInputName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const job = jobProp ? (allJobs.find((j) => j.id === jobProp.id) ?? jobProp) : null;

  const save = (field: keyof JobApplication, value: unknown) => {
    if (!job) return;
    if (field === "status" && value === "Offer") {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
    updateJob(job.id, { [field]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!job) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadResume(file);
    setIsUploading(false);

    if (result) {
      updateJob(job.id, {
        resumeUrl: result.publicUrl,
        resumeName: result.fileName,
      });
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (typeof window === "undefined" || !job) return null;

  const sheetName = sheets.find((s) => s.id === job.sheetId)?.name ?? "All Sheets";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        ref={panelRef}
        className="relative z-10 h-full w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors animate-slide-in-right"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium min-w-0">
            <Layers className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{sheetName}</span>
            <ChevronRight className="w-3 h-3 shrink-0 text-zinc-400" />
            <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate">{job.company}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-4">
            {job.companyUrl && (
              <a
                href={job.companyUrl.startsWith("http") ? job.companyUrl : `https://${job.companyUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Open Company Website"
              >
                <span>Site</span>
                <Globe className="w-3 h-3" />
              </a>
            )}
            {job.jobUrl && (
              <a
                href={job.jobUrl.startsWith("http") ? job.jobUrl : `https://${job.jobUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                title="Open Job Posting"
              >
                <span>Job Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => { duplicateJob(job.id); onClose(); }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsDeletePaneOpen(true);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Company Title */}
          <div className="flex items-start gap-3">
            <CompanyAvatar
              company={job.company}
              companyUrl={job.companyUrl}
              jobUrl={job.jobUrl}
              size="lg"
            />
            <div className="flex-1 min-w-0 space-y-0.5">
              <input
                type="text"
                defaultValue={job.company}
                onBlur={(e) => save("company", e.target.value)}
                className="w-full bg-transparent text-base font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 px-1.5 py-0.5 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors"
                placeholder="Company name"
              />
              <input
                type="text"
                defaultValue={job.role}
                onBlur={(e) => save("role", e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-600 dark:text-zinc-400 placeholder-zinc-400 px-1.5 py-0.5 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors"
                placeholder="Role / Title"
              />
            </div>
          </div>

          {/* Status Stage Badges */}
          <Section label="Application Stage">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = job.status === opt.status;
                return (
                  <button
                    key={opt.status}
                    onClick={() => save("status", opt.status)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-600 shadow-sm"
                        : "bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                    <span>{opt.status === "Offer" ? "Offer 🎉" : opt.status}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Properties Grid */}
          <Section label="Properties">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 divide-y divide-zinc-200/70 dark:divide-zinc-800 overflow-hidden">
              {/* Priority */}
              <PropertyRow label="Priority">
                <div className="flex gap-1.5">
                  {(["High", "Medium", "Low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => save("priority", p)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        job.priority === p
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600 shadow-sm"
                          : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </PropertyRow>

              {/* Company Type */}
              <PropertyRow label="Company Type">
                <div className="relative inline-flex items-center">
                  <select
                    value={job.companyType}
                    onChange={(e) => save("companyType", e.target.value as CompanyType)}
                    className="appearance-none bg-transparent text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer pr-5"
                  >
                    {(["Big Tech", "Startup", "Scaleup", "Mid-size", "Other"] as CompanyType[]).map((t) => (
                      <option key={t} value={t} className="bg-white dark:bg-zinc-900">{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-0.5 text-zinc-400 pointer-events-none" />
                </div>
              </PropertyRow>

              {/* Workplace */}
              <PropertyRow label="Workplace">
                <div className="flex gap-1.5">
                  {(["Remote", "Hybrid", "On-site"] as WorkplaceType[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => save("workplaceType", w)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        job.workplaceType === w
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600 shadow-sm"
                          : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </PropertyRow>

              {/* Location */}
              <PropertyRow label="Location">
                <input
                  type="text"
                  defaultValue={job.location}
                  onBlur={(e) => save("location", e.target.value)}
                  placeholder="City, State or Remote"
                  className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none placeholder-zinc-400 w-full"
                />
              </PropertyRow>

              {/* Applied Date */}
              <PropertyRow label="Date Applied">
                <div className="relative inline-flex items-center">
                  <input
                    type="date"
                    defaultValue={job.appliedDate}
                    onChange={(e) => save("appliedDate", e.target.value)}
                    className="appearance-none bg-transparent text-zinc-800 dark:text-zinc-200 font-mono text-xs focus:outline-none pr-6 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute right-0 text-zinc-400 pointer-events-none" />
                </div>
              </PropertyRow>

              {/* Salary */}
              <PropertyRow label="Compensation">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <input
                    type="number"
                    defaultValue={job.salaryMin ?? ""}
                    onBlur={(e) => save("salaryMin", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Min"
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-1.5 py-0.5 w-20 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-zinc-400">–</span>
                  <input
                    type="number"
                    defaultValue={job.salaryMax ?? ""}
                    onBlur={(e) => save("salaryMax", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Max"
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded px-1.5 py-0.5 w-20 focus:outline-none focus:border-amber-400"
                  />
                  <div className="relative inline-flex items-center">
                    <select
                      value={job.salaryCurrency}
                      onChange={(e) => save("salaryCurrency", e.target.value)}
                      className="appearance-none bg-transparent text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer pr-5"
                    >
                      {["USD", "EUR", "GBP", "INR", "CAD"].map((c) => (
                        <option key={c} value={c} className="bg-white dark:bg-zinc-900">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-0.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </PropertyRow>

              {/* Company Website / URL */}
              <PropertyRow label="Company URL">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    defaultValue={job.companyUrl ?? ""}
                    onBlur={(e) => save("companyUrl", e.target.value.trim() || undefined)}
                    placeholder="e.g. stripe.com"
                    className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none placeholder-zinc-400 flex-1 min-w-0"
                  />
                  {job.companyUrl && (
                    <a
                      href={job.companyUrl.startsWith("http") ? job.companyUrl : `https://${job.companyUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-amber-500 shrink-0"
                      title="Visit company website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </PropertyRow>

              {/* Job Posting URL */}
              <PropertyRow label="Job URL">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="url"
                    defaultValue={job.jobUrl ?? ""}
                    onBlur={(e) => save("jobUrl", e.target.value.trim() || undefined)}
                    placeholder="https://..."
                    className="bg-transparent text-amber-600 dark:text-amber-400 text-xs focus:outline-none placeholder-zinc-400 truncate flex-1 min-w-0"
                  />
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl.startsWith("http") ? job.jobUrl : `https://${job.jobUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-amber-500 shrink-0"
                      title="Open job posting URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </PropertyRow>

              {/* Contact */}
              <PropertyRow label="Contact Person">
                <input
                  type="text"
                  defaultValue={job.contact ?? ""}
                  onBlur={(e) => save("contact", e.target.value)}
                  placeholder="Recruiter or referral contact"
                  className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none placeholder-zinc-400 w-full"
                />
              </PropertyRow>
            </div>
          </Section>

          {/* Rating */}
          <Section label="Excitement Rating">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => save("rating", star)}
                  className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= (job.rating ?? 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </Section>

          {/* Resume & Attachments */}
          <Section label="Resume & Documents">
            {job.resumeUrl ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {job.resumeName || "Attached Document"}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {job.resumeUrl.startsWith("data:")
                        ? "Stored Locally in Browser"
                        : job.resumeUrl.startsWith("http")
                        ? "External / Cloud Link"
                        : "Attached Document"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openDocumentAttachment(job.resumeUrl!, job.resumeName)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateJob(job.id, { resumeUrl: undefined, resumeName: undefined });
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-end gap-1 text-[11px] mb-1">
                  <button
                    type="button"
                    onClick={() => setDocMode("upload")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      docMode === "upload"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    Upload File
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <button
                    type="button"
                    onClick={() => setDocMode("link")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      docMode === "link"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    Paste Link
                  </button>
                </div>

                {docMode === "upload" ? (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-400 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        <span>Processing attachment...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span>Attach Resume / Document (PDF, DOCX, TXT, Images)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or resume link"
                        value={linkInputUrl}
                        onChange={(e) => setLinkInputUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Document label (e.g. Master Resume 2026)"
                        value={linkInputName}
                        onChange={(e) => setLinkInputName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (linkInputUrl.trim()) {
                            updateJob(job.id, {
                              resumeUrl: linkInputUrl.trim(),
                              resumeName: linkInputName.trim() || "Document Link",
                            });
                            setLinkInputUrl("");
                            setLinkInputName("");
                          }
                        }}
                        disabled={!linkInputUrl.trim()}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        Attach Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Notes */}
          <Section label="Notes & Interview Logs">
            <textarea
              key={job.id}
              defaultValue={job.notes ?? ""}
              onBlur={(e) => save("notes", e.target.value)}
              rows={5}
              placeholder="Write your interview prep notes, talking points, feedback..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </Section>

          {/* Meta Info */}
          <div className="text-[11px] text-zinc-400 font-mono space-y-0.5 pt-1">
            <p>Created: {formatDate(job.createdAt)}</p>
            <p>Updated: {formatDate(job.updatedAt)}</p>
          </div>
        </div>
      </div>

      <JobDeletePane
        job={job}
        isOpen={isDeletePaneOpen}
        onClose={() => setIsDeletePaneOpen(false)}
        onConfirmDelete={(ids) => {
          if (ids[0]) {
            deleteJob(ids[0]);
          }
          setIsDeletePaneOpen(false);
          onClose();
        }}
      />
    </div>,
    document.body
  );
}
