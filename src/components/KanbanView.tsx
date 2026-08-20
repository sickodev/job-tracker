"use client";

import React, { useState } from "react";
import { useJobs } from "@/context/JobContext";
import { JobApplication, JobStatus } from "@/types";
import { JobModal } from "./JobModal";
import { JobDetailPanel } from "./JobDetailPanel";
import { JobDeletePane } from "./JobDeletePane";
import { CompanyAvatar } from "./CompanyAvatar";
import { Plus, Edit, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

const COLUMNS: { status: JobStatus; title: string; dot: string }[] = [
  { status: "Wishlist", title: "Wishlist", dot: "bg-zinc-400 dark:bg-zinc-500" },
  { status: "Applied", title: "Applied", dot: "bg-blue-500" },
  { status: "Screening", title: "Screening", dot: "bg-purple-500" },
  { status: "Technical", title: "Technical", dot: "bg-amber-500" },
  { status: "Behavioral", title: "Behavioral", dot: "bg-indigo-500" },
  { status: "Offer", title: "Offer 🎉", dot: "bg-emerald-500" },
];

interface KanbanCardProps {
  job: JobApplication;
  onOpenDetail: (job: JobApplication) => void;
  onDeleteTarget: (job: JobApplication) => void;
}

const KanbanCard = React.memo(function KanbanCard({
  job,
  onOpenDetail,
  onDeleteTarget,
}: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", job.id)}
      className="p-3 rounded-lg bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm transition-colors group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <button
          onClick={() => onOpenDetail(job)}
          className="flex items-center gap-1.5 font-medium text-xs text-zinc-900 dark:text-zinc-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-left cursor-pointer min-w-0"
        >
          <CompanyAvatar
            company={job.company}
            companyUrl={job.companyUrl}
            jobUrl={job.jobUrl}
            size="xs"
          />
          <span className="truncate">{job.company}</span>
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(job);
            }}
            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            title="Open details"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTarget(job);
            }}
            className="p-1 rounded text-zinc-400 hover:text-rose-500 cursor-pointer"
            title="Delete application"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-normal mb-2">{job.role}</div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-700/50 font-mono">
        <span className="truncate max-w-[85px]">{job.location}</span>
        {job.salaryMax ? (
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
            ${Math.round(job.salaryMax / 1000)}k
          </span>
        ) : null}
      </div>
    </div>
  );
});

export function KanbanView() {
  const { filteredJobs, updateJob, deleteJob } = useJobs();
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailJob, setDetailJob] = useState<JobApplication | null>(null);
  const [deleteTargetJob, setDeleteTargetJob] = useState<JobApplication | null>(null);

  const handleOpenDetail = React.useCallback((job: JobApplication) => {
    setDetailJob(job);
  }, []);

  const handleDeleteTarget = React.useCallback((job: JobApplication) => {
    setDeleteTargetJob(job);
  }, []);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetStatus: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("text/plain");
    if (jobId) {
      updateJob(jobId, { status: targetStatus });
      if (targetStatus === "Offer") {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pipeline Board</h2>
          <p className="text-xs text-zinc-500">
            Drag cards across stages • Click company to inspect details
          </p>
        </div>
        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-medium shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colJobs = filteredJobs.filter((j) => j.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/60 p-2.5 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{col.title}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                {colJobs.map((job) => (
                  <KanbanCard
                    key={job.id}
                    job={job}
                    onOpenDetail={handleOpenDetail}
                    onDeleteTarget={handleDeleteTarget}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onDelete={(id) => {
          const target = filteredJobs.find((j) => j.id === id) || editingJob;
          if (target) {
            setDeleteTargetJob(target);
          }
        }}
        editingJob={editingJob}
      />

      <JobDetailPanel job={detailJob} onClose={() => setDetailJob(null)} />

      <JobDeletePane
        job={deleteTargetJob}
        isOpen={Boolean(deleteTargetJob)}
        onClose={() => setDeleteTargetJob(null)}
        onConfirmDelete={(ids) => {
          if (ids[0]) {
            deleteJob(ids[0]);
          }
          setDeleteTargetJob(null);
          setIsModalOpen(false);
          setEditingJob(null);
        }}
      />
    </div>
  );
}
