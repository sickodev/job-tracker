"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { JobApplication, JobStatus, CompanyType, WorkplaceType, Priority } from "@/types";
import { useJobs } from "@/context/JobContext";
import { CompanyAvatar } from "./CompanyAvatar";
import { X, Star, FileText, Loader2, Upload, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  editingJob?: JobApplication | null;
}

const STATUS_OPTIONS: JobStatus[] = [
  "Wishlist",
  "Applied",
  "Screening",
  "Technical",
  "Behavioral",
  "Offer",
  "Rejected",
  "Withdrawn",
];

const COMPANY_TYPES: CompanyType[] = ["Big Tech", "Startup", "Scaleup", "Mid-size", "Other"];
const WORKPLACE_TYPES: WorkplaceType[] = ["Remote", "Hybrid", "On-site"];
const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

export function JobModal({ isOpen, onClose, onDelete, editingJob }: JobModalProps) {
  const { sheets, activeSheetId, addJob, updateJob, uploadResume } = useJobs();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [sheetId, setSheetId] = useState<string>(activeSheetId === "all" ? (sheets[0]?.id || "") : activeSheetId);
  const [company, setCompany] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [companyType, setCompanyType] = useState<CompanyType>("Startup");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>("Remote");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split("T")[0]);
  const [jobUrl, setJobUrl] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("High");
  const [rating, setRating] = useState<number>(4);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingJob) {
      setSheetId(editingJob.sheetId);
      setCompany(editingJob.company);
      setCompanyUrl(editingJob.companyUrl || "");
      setRole(editingJob.role);
      setStatus(editingJob.status);
      setCompanyType(editingJob.companyType);
      setWorkplaceType(editingJob.workplaceType);
      setLocation(editingJob.location);
      setSalaryMin(editingJob.salaryMin?.toString() || "");
      setSalaryMax(editingJob.salaryMax?.toString() || "");
      setSalaryCurrency(editingJob.salaryCurrency || "USD");
      setAppliedDate(editingJob.appliedDate || new Date().toISOString().split("T")[0]);
      setJobUrl(editingJob.jobUrl || "");
      setContact(editingJob.contact || "");
      setNotes(editingJob.notes || "");
      setPriority(editingJob.priority || "Medium");
      setRating(editingJob.rating || 4);
      setResumeUrl(editingJob.resumeUrl || "");
      setResumeName(editingJob.resumeName || "");
    } else {
      setSheetId(activeSheetId === "all" ? (sheets[0]?.id || "") : activeSheetId);
      setCompany("");
      setCompanyUrl("");
      setRole("");
      setStatus("Applied");
      setCompanyType(activeSheetId.includes("big-tech") ? "Big Tech" : "Startup");
      setWorkplaceType("Remote");
      setLocation("");
      setSalaryMin("");
      setSalaryMax("");
      setSalaryCurrency("USD");
      setAppliedDate(new Date().toISOString().split("T")[0]);
      setJobUrl("");
      setContact("");
      setNotes("");
      setPriority("High");
      setRating(4);
      setResumeUrl("");
      setResumeName("");
    }
    setError("");
  }, [editingJob, isOpen, activeSheetId, sheets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    const result = await uploadResume(file);
    setIsUploadingResume(false);

    if (result) {
      setResumeUrl(result.publicUrl);
      setResumeName(result.fileName);
    }
  };

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setError("Please enter the company name");
      return;
    }
    if (!role.trim()) {
      setError("Please enter the job title / role");
      return;
    }

    const payload = {
      sheetId: sheetId || sheets[0]?.id || "default",
      company: company.trim(),
      companyUrl: companyUrl.trim() || undefined,
      role: role.trim(),
      status,
      companyType,
      workplaceType,
      location: location.trim() || "Remote",
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency,
      appliedDate,
      jobUrl: jobUrl.trim() || undefined,
      contact: contact.trim(),
      notes: notes.trim(),
      priority,
      rating,
      resumeUrl: resumeUrl || undefined,
      resumeName: resumeName || undefined,
    };

    if (editingJob) {
      updateJob(editingJob.id, payload);
    } else {
      addJob(payload);
      if (status === "Offer") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xl overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {editingJob ? `Edit Application • ${editingJob.company}` : "New Application"}
            </h2>
            <p className="text-xs text-zinc-500">
              Track details, compensation, and interview progress
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-4">
            {editingJob && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingJob.id);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Row 1: Target Sheet & Company Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Target Sheet
              </label>
              <select
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {sheets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Company Category
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <CompanyAvatar
                  company={company || "Company"}
                  companyUrl={companyUrl}
                  jobUrl={jobUrl}
                  size="md"
                />
                <input
                  type="text"
                  placeholder="e.g. Anthropic, Stripe, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Role / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Row 3: Status & Workplace & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st === "Offer" ? "🎉 " : ""}{st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Workplace
              </label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {WORKPLACE_TYPES.map((wt) => (
                  <option key={wt} value={wt}>
                    {wt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Location & Applied Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Date Applied
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Row 5: Salary Range */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Target Annual Salary (Comp)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Min (e.g. 180000)"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <input
                type="number"
                placeholder="Max (e.g. 260000)"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>

          {/* Row 6: URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Company Website
              </label>
              <input
                type="text"
                placeholder="e.g. stripe.com"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Job Posting URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Row 7: Contact Person & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="Recruiter or referral name"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Excitement Rating
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-0.5 text-zinc-300 dark:text-zinc-600 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating ? "text-amber-400 fill-amber-400" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 8: Resume & Attachments (Supabase Storage Bucket) */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Resume / Tailored CV (Storage Bucket)
            </label>
            {resumeUrl ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                    {resumeName || "Attached Document"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeUrl("");
                      setResumeName("");
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-400 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer">
                {isUploadingResume ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Uploading to Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span>Attach Tailored Resume (PDF / DOCX)</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploadingResume}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Row 9: Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Notes & Talking Points
            </label>
            <textarea
              rows={3}
              placeholder="Key talking points, recruiter follow-ups, interview notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-medium transition-colors cursor-pointer shadow-sm"
            >
              {editingJob ? "Save Changes" : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
