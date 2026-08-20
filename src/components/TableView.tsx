"use client";

import React, { useState, useCallback } from "react";
import { useJobs } from "@/context/JobContext";
import { JobApplication, JobStatus, CompanyType, WorkplaceType } from "@/types";
import { JobModal } from "./JobModal";
import { JobDetailPanel } from "./JobDetailPanel";
import { JobDeletePane } from "./JobDeletePane";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CompanyAvatar } from "./CompanyAvatar";
import {
  Search,
  Plus,
  ArrowUpDown,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  CheckSquare,
  Square,
  RotateCcw,
  Briefcase,
  ChevronDown,
  Globe,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; dot: string; text: string }
> = {
  Wishlist: {
    label: "Wishlist",
    dot: "bg-zinc-400 dark:bg-zinc-500",
    text: "text-zinc-600 dark:text-zinc-400",
  },
  Applied: {
    label: "Applied",
    dot: "bg-blue-500",
    text: "text-zinc-800 dark:text-zinc-200",
  },
  Screening: {
    label: "Screening",
    dot: "bg-purple-500",
    text: "text-zinc-800 dark:text-zinc-200",
  },
  Technical: {
    label: "Technical",
    dot: "bg-amber-500",
    text: "text-zinc-800 dark:text-zinc-200",
  },
  Behavioral: {
    label: "Behavioral",
    dot: "bg-indigo-500",
    text: "text-zinc-800 dark:text-zinc-200",
  },
  Offer: {
    label: "Offer 🎉",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400 font-medium",
  },
  Rejected: {
    label: "Rejected",
    dot: "bg-rose-500",
    text: "text-zinc-500 dark:text-zinc-400",
  },
  Withdrawn: {
    label: "Withdrawn",
    dot: "bg-zinc-400 dark:bg-zinc-600",
    text: "text-zinc-500 dark:text-zinc-500",
  },
};

interface JobTableRowProps {
  job: JobApplication;
  isSelected: boolean;
  isNotesExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onToggleNotes: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onOpenDetail: (job: JobApplication) => void;
  onDuplicate: (id: string) => void;
  onDelete: (job: JobApplication) => void;
}

const JobTableRow = React.memo(function JobTableRow({
  job,
  isSelected,
  isNotesExpanded,
  onToggleSelect,
  onToggleNotes,
  onStatusChange,
  onOpenDetail,
  onDuplicate,
  onDelete,
}: JobTableRowProps) {
  const statusInfo = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied;

  return (
    <React.Fragment>
      <tr
        className={`group transition-colors ${
          isSelected
            ? "bg-amber-50/50 dark:bg-amber-950/20"
            : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
        }`}
      >
        {/* Checkbox */}
        <td className="py-2.5 px-3">
          <button
            onClick={() => onToggleSelect(job.id)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            {isSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
        </td>

        {/* Company */}
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenDetail(job)}
              className="hover:opacity-80 transition-opacity cursor-pointer shrink-0"
              title="Open detail panel"
            >
              <CompanyAvatar
                company={job.company}
                companyUrl={job.companyUrl}
                jobUrl={job.jobUrl}
                size="md"
              />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenDetail(job)}
                  className="font-medium text-zinc-900 dark:text-zinc-100 text-xs hover:text-amber-500 transition-colors text-left cursor-pointer"
                >
                  {job.company}
                </button>
                {job.companyUrl && (
                  <a
                    href={job.companyUrl.startsWith("http") ? job.companyUrl : `https://${job.companyUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-amber-500 transition-colors"
                    title="Open Company Website"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="w-3 h-3" />
                  </a>
                )}
                {job.jobUrl && (
                  <a
                    href={job.jobUrl.startsWith("http") ? job.jobUrl : `https://${job.jobUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-amber-500 transition-colors"
                    title="Open Job URL"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {job.location && (
                <span className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                  {job.location}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Role */}
        <td className="py-2.5 px-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-normal text-zinc-800 dark:text-zinc-200">{job.role}</span>
              {job.resumeUrl && (
                <a
                  href={job.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium border border-amber-200/60 dark:border-amber-700/50 hover:bg-amber-100 transition-colors"
                  title="View attached resume"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-2.5 h-2.5" />
                  <span>CV</span>
                </a>
              )}
            </div>
            {job.notes && (
              <button
                onClick={() => onToggleNotes(job.id)}
                className="text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-left truncate max-w-[220px] transition-colors cursor-pointer"
              >
                {job.notes}
              </button>
            )}
          </div>
        </td>

        {/* Stage / Status */}
        <td className="py-2.5 px-3">
          <div className="relative inline-flex items-center">
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot} absolute left-2 pointer-events-none`} />
            <select
              value={job.status}
              onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
              className="appearance-none cursor-pointer pl-6 pr-5 py-1 rounded-md bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 focus:outline-none focus:border-amber-400 transition-colors font-medium"
            >
              {Object.keys(STATUS_CONFIG).map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {st === "Offer" ? "🎉 " : ""}{st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1.5 text-zinc-400 pointer-events-none" />
          </div>
        </td>

        {/* Compensation */}
        <td className="py-2.5 px-3">
          <div className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">
            {job.salaryMax ? (
              <span>
                {job.salaryMin
                  ? `${formatCurrency(job.salaryMin, job.salaryCurrency)} - `
                  : "Up to "}
                {formatCurrency(job.salaryMax, job.salaryCurrency)}
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-600">—</span>
            )}
          </div>
        </td>

        {/* Applied Date */}
        <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
          {formatDate(job.appliedDate)}
        </td>

        {/* Actions */}
        <td className="py-2.5 px-3 text-right">
          <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDuplicate(job.id)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Duplicate job"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(job)}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Delete application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Notes Row */}
      {isNotesExpanded && (
        <tr className="bg-zinc-50/70 dark:bg-zinc-950/80 border-t border-b border-zinc-200 dark:border-zinc-800">
          <td colSpan={7} className="py-2.5 px-6 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-start gap-2 max-w-3xl">
              <span className="font-medium text-zinc-400 min-w-max">
                Notes:
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                {job.notes}
              </p>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
});

export function TableView() {
  const {
    filteredJobs,
    activeSheetJobs,
    deleteJob,
    bulkDeleteJobs,
    duplicateJob,
    updateJob,
    filterOptions,
    setFilterOptions,
    resetFilterOptions,
    exportToCSV,
  } = useJobs();

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [detailJob, setDetailJob] = useState<JobApplication | null>(null);
  const [deleteTargetJobs, setDeleteTargetJobs] = useState<JobApplication[] | null>(null);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredJobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJobs.map((j) => j.id));
    }
  }, [selectedIds.length, filteredJobs]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleNotes = useCallback((id: string) => {
    setExpandedNotesId((prev) => (prev === id ? null : id));
  }, []);

  const handleStatusChange = useCallback(
    (id: string, newStatus: JobStatus) => {
      updateJob(id, { status: newStatus });
      if (newStatus === "Offer") {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    },
    [updateJob]
  );

  const handleOpenDetail = useCallback((job: JobApplication) => {
    setDetailJob(job);
  }, []);

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateJob(id);
    },
    [duplicateJob]
  );


  const handleDeleteJob = useCallback((job: JobApplication) => {
    setDeleteTargetJobs([job]);
  }, []);

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
        {/* Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search companies, roles..."
              value={filterOptions.search}
              onChange={(e) =>
                setFilterOptions((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Stage Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={filterOptions.status}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  status: e.target.value as JobStatus | "All",
                }))
              }
              className="appearance-none pl-2.5 pr-8 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="All">All Stages</option>
              {Object.keys(STATUS_CONFIG).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Company Type Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={filterOptions.companyType}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  companyType: e.target.value as CompanyType | "All",
                }))
              }
              className="appearance-none pl-2.5 pr-8 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Big Tech">Big Tech</option>
              <option value="Startup">Startup</option>
              <option value="Scaleup">Scaleup</option>
              <option value="Mid-size">Mid-size</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Workplace Filter */}
          <div className="relative inline-flex items-center">
            <select
              value={filterOptions.workplaceType}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  workplaceType: e.target.value as WorkplaceType | "All",
                }))
              }
              className="appearance-none pl-2.5 pr-8 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="All">All Workplaces</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 text-zinc-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
            <div className="relative inline-flex items-center">
              <select
                value={`${filterOptions.sortBy}_${filterOptions.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("_");
                  setFilterOptions((prev) => ({
                    ...prev,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as "asc" | "desc",
                  }));
                }}
                className="appearance-none bg-transparent text-zinc-700 dark:text-zinc-200 text-xs focus:outline-none border-none pr-5 cursor-pointer"
              >
                <option value="appliedDate_desc" className="bg-white dark:bg-zinc-900">Date Applied (Newest)</option>
                <option value="appliedDate_asc" className="bg-white dark:bg-zinc-900">Date Applied (Oldest)</option>
                <option value="salaryMax_desc" className="bg-white dark:bg-zinc-900">Highest Salary</option>
                <option value="rating_desc" className="bg-white dark:bg-zinc-900">Highest Rating</option>
                <option value="company_asc" className="bg-white dark:bg-zinc-900">Company (A-Z)</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-0.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {(filterOptions.search ||
            filterOptions.status !== "All" ||
            filterOptions.companyType !== "All" ||
            filterOptions.workplaceType !== "All") && (
            <button
              onClick={resetFilterOptions}
              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Reset filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                const selectedJobs = filteredJobs.filter((j) => selectedIds.includes(j.id));
                setDeleteTargetJobs(selectedJobs);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-medium transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => exportToCSV()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium shadow-sm transition-colors cursor-pointer"
            title="Export this sheet to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingJob(null);
              setIsJobModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-medium select-none text-[11px]">
                <th className="py-2.5 px-3 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredJobs.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3 min-w-[180px]">Company</th>
                <th className="py-2.5 px-3 min-w-[200px]">Role / Position</th>
                <th className="py-2.5 px-3 min-w-[140px]">Stage</th>
                <th className="py-2.5 px-3 min-w-[130px]">Compensation</th>
                <th className="py-2.5 px-3 min-w-[90px]">Applied</th>
                <th className="py-2.5 px-3 text-right min-w-[90px]">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 mb-3">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                        No applications found
                      </h3>
                      <p className="text-xs text-zinc-500 mb-4">
                        {filterOptions.search || filterOptions.status !== "All"
                          ? "Try clearing your search or filters to see more results."
                          : "Start tracking your job search by adding your first application."}
                      </p>
                      <button
                        onClick={() => {
                          setEditingJob(null);
                          setIsJobModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Application</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <JobTableRow
                    key={job.id}
                    job={job}
                    isSelected={selectedIds.includes(job.id)}
                    isNotesExpanded={expandedNotesId === job.id}
                    onToggleSelect={toggleSelectOne}
                    onToggleNotes={handleToggleNotes}
                    onStatusChange={handleStatusChange}
                    onOpenDetail={handleOpenDetail}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDeleteJob}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Showing <span className="text-zinc-800 dark:text-zinc-200 font-medium">{filteredJobs.length}</span> of{" "}
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">{activeSheetJobs.length}</span>{" "}
            applications
          </div>
          <div className="flex items-center gap-4">
            <span>
              Offers:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-medium">
                {filteredJobs.filter((j) => j.status === "Offer").length}
              </strong>
            </span>
            <span>
              Interviews:{" "}
              <strong className="text-zinc-800 dark:text-zinc-200 font-medium">
                {
                  filteredJobs.filter((j) =>
                    ["Screening", "Technical", "Behavioral"].includes(j.status)
                  ).length
                }
              </strong>
            </span>
          </div>
        </div>
      </div>

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
        onDelete={(id) => {
          const target = filteredJobs.find((j) => j.id === id) || editingJob;
          if (target) {
            setDeleteTargetJobs([target]);
          }
        }}
        editingJob={editingJob}
      />

      <JobDetailPanel
        job={detailJob}
        onClose={() => setDetailJob(null)}
      />

      <JobDeletePane
        jobs={deleteTargetJobs || []}
        isOpen={Boolean(deleteTargetJobs && deleteTargetJobs.length > 0)}
        onClose={() => setDeleteTargetJobs(null)}
        onConfirmDelete={(ids) => {
          if (ids.length === 1) {
            deleteJob(ids[0]);
          } else {
            bulkDeleteJobs(ids);
          }
          setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
          setDeleteTargetJobs(null);
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
      />
    </div>
  );
}
