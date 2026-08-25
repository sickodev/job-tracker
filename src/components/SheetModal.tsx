"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Sheet } from "@/types";
import { useJobs } from "@/context/JobContext";
import {
  X,
  Briefcase,
  Building2,
  Rocket,
  Sparkles,
  Code,
  Terminal,
  Globe,
  Cpu,
  Zap,
  Star,
  Target,
  Folder,
  Bookmark,
  Flame,
  Crown,
  Layers,
  Shield,
  Trophy,
  Compass,
  Heart,
  TrendingUp,
  Award,
  Trash2,
  LucideIcon,
  Check,
} from "lucide-react";

export interface IconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const SHEET_ICON_OPTIONS: IconOption[] = [
  { id: "Briefcase", label: "General Work", icon: Briefcase },
  { id: "Building2", label: "Enterprise / Big Tech", icon: Building2 },
  { id: "Rocket", label: "Startups & Scaleups", icon: Rocket },
  { id: "Sparkles", label: "AI & Innovation", icon: Sparkles },
  { id: "Code", label: "Software Engineering", icon: Code },
  { id: "Terminal", label: "Systems & Backend", icon: Terminal },
  { id: "Globe", label: "Remote & Global", icon: Globe },
  { id: "Cpu", label: "Hardware & DeepTech", icon: Cpu },
  { id: "Zap", label: "High Growth / Fast", icon: Zap },
  { id: "Star", label: "Dream Companies", icon: Star },
  { id: "Target", label: "Target Outreach", icon: Target },
  { id: "Flame", label: "Hot Opportunities", icon: Flame },
  { id: "Crown", label: "Tier-1 / Executive", icon: Crown },
  { id: "Layers", label: "Full Stack / Product", icon: Layers },
  { id: "Shield", label: "Fintech & Security", icon: Shield },
  { id: "Trophy", label: "Top Offers", icon: Trophy },
  { id: "TrendingUp", label: "High Comp / Growth", icon: TrendingUp },
  { id: "Award", label: "Preferred Tier", icon: Award },
  { id: "Compass", label: "Exploration / Research", icon: Compass },
  { id: "Heart", label: "Culture & Values", icon: Heart },
  { id: "Bookmark", label: "Saved Wishlist", icon: Bookmark },
  { id: "Folder", label: "Category Folder", icon: Folder },
];

export const SHEET_COLOR_OPTIONS = [
  { id: "amber", label: "Amber", bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500", ring: "ring-amber-400", lightBg: "bg-amber-50 dark:bg-amber-400/10" },
  { id: "blue", label: "Blue", bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", ring: "ring-blue-400", lightBg: "bg-blue-50 dark:bg-blue-400/10" },
  { id: "emerald", label: "Emerald", bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500", ring: "ring-emerald-400", lightBg: "bg-emerald-50 dark:bg-emerald-400/10" },
  { id: "purple", label: "Purple", bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500", ring: "ring-purple-400", lightBg: "bg-purple-50 dark:bg-purple-400/10" },
  { id: "rose", label: "Rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500", ring: "ring-rose-400", lightBg: "bg-rose-50 dark:bg-rose-400/10" },
  { id: "indigo", label: "Indigo", bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500", ring: "ring-indigo-400", lightBg: "bg-indigo-50 dark:bg-indigo-400/10" },
  { id: "cyan", label: "Cyan", bg: "bg-cyan-500", text: "text-cyan-500", border: "border-cyan-500", ring: "ring-cyan-400", lightBg: "bg-cyan-50 dark:bg-cyan-400/10" },
  { id: "orange", label: "Orange", bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500", ring: "ring-orange-400", lightBg: "bg-orange-50 dark:bg-orange-400/10" },
];

export const SHEET_ICON_MAP: Record<string, LucideIcon> = SHEET_ICON_OPTIONS.reduce(
  (acc, curr) => ({ ...acc, [curr.id]: curr.icon }),
  {}
);

export function getSheetIconComponent(iconName?: string): LucideIcon {
  if (iconName && SHEET_ICON_MAP[iconName]) {
    return SHEET_ICON_MAP[iconName];
  }
  return Briefcase;
}

export function SheetIcon({ name, className = "w-4 h-4" }: { name?: string; className?: string }) {
  const IconComponent = (name && SHEET_ICON_MAP[name]) ? SHEET_ICON_MAP[name] : Briefcase;
  return React.createElement(IconComponent, { className });
}

interface SheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string, color?: string, icon?: string) => void;
  onDelete?: (id: string) => void;
  editingSheet?: Sheet | null;
}

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

export function SheetModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSheet,
}: SheetModalProps) {
  const { allJobs, sheets } = useJobs();
  const [mounted, setMounted] = useState(false);

  // Always resolve the freshest sheet data from context if editing
  const currentSheet = editingSheet
    ? sheets.find((s) => s.id === editingSheet.id) ?? editingSheet
    : null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Briefcase");
  const [color, setColor] = useState("amber");
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentSheet) {
      setName(currentSheet.name || "");
      setDescription(currentSheet.description || "");
      setIcon(currentSheet.icon || "Briefcase");
      setColor(currentSheet.color || "amber");
    } else {
      setName("");
      setDescription("");
      setIcon("Briefcase");
      setColor("amber");
    }
    setError("");
  }, [currentSheet, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a sheet name");
      return;
    }
    onSave(name.trim(), description.trim(), color, icon);
    onClose();
  };

  const selectedColorOption = SHEET_COLOR_OPTIONS.find((c) => c.id === color) || SHEET_COLOR_OPTIONS[0];

  // Statistics for this sheet when editing
  const sheetJobs = currentSheet ? allJobs.filter((j) => j.sheetId === currentSheet.id) : [];
  const offersCount = sheetJobs.filter((j) => j.status === "Offer").length;
  const interviewsCount = sheetJobs.filter((j) =>
    ["Screening", "Technical", "Behavioral"].includes(j.status)
  ).length;
  const appliedCount = sheetJobs.filter((j) => j.status === "Applied").length;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-over Job Pane Screen */}
      <div
        ref={panelRef}
        className="relative z-10 h-full w-full max-w-lg bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-overlay-lift flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors"
        style={{ animation: "slideIn 180ms ease-out" }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${selectedColorOption.lightBg} ${selectedColorOption.text} flex items-center justify-center shrink-0 border border-current/20`}>
              <SheetIcon name={icon} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {editingSheet ? `Edit Sheet • ${editingSheet.name}` : "New Sheet"}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {editingSheet ? "Configure category settings & properties" : "Organize your job search by category"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-4">
            {editingSheet && onDelete && sheets.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingSheet.id);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Delete Sheet"
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Sheet Identity Header */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <div className={`w-12 h-12 rounded-xl ${selectedColorOption.lightBg} ${selectedColorOption.text} flex items-center justify-center shrink-0 border border-current/25 shadow-xs`}>
                <SheetIcon name={icon} className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  type="text"
                  placeholder="Sheet Name (e.g. Big Tech, AI Startups)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Brief description or purpose (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-600 dark:text-zinc-400 placeholder-zinc-400 px-2 py-1 rounded-md border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Color Accent Selection */}
            <Section label="Theme Accent Color">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 overflow-x-auto">
                {SHEET_COLOR_OPTIONS.map((c) => {
                  const isSelected = color === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      title={c.label}
                      className={`relative flex items-center justify-center w-7 h-7 rounded-full ${c.bg} transition-all cursor-pointer hover:scale-110 shrink-0 ${
                        isSelected ? "ring-3 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-900 dark:ring-zinc-100 scale-105" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Icon Picker Grid */}
            <Section label="Select Sheet Icon">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 max-h-56 overflow-y-auto">
                {SHEET_ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = icon === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIcon(opt.id)}
                      title={opt.label}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isSelected
                          ? `${selectedColorOption.lightBg} ${selectedColorOption.text} ring-2 ${selectedColorOption.ring} font-semibold shadow-xs`
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[10px] truncate max-w-full text-center">
                        {opt.label.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* If Editing: Application Statistics */}
            {editingSheet && (
              <Section label="Sheet Overview & Metrics">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {sheetJobs.length}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5">
                      Total Jobs
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {offersCount}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5">
                      Offers 🎉
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {interviewsCount}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5">
                      Interviews
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                  <span>Applied / Awaiting: <strong className="text-zinc-900 dark:text-zinc-100">{appliedCount}</strong></span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Created: {new Date(editingSheet.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Section>
            )}

            {/* Additional Notes & Strategy */}
            <Section label="Targeting Strategy & Notes">
              <textarea
                rows={3}
                placeholder="Key goals, target salary benchmarks, recruiter outreach notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400 resize-none leading-relaxed transition-colors"
              />
            </Section>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary-gold hover:bg-amber-300 text-zinc-950 shadow-ambient-low transition-colors cursor-pointer"
              >
                {editingSheet ? "Save Changes" : "Create Sheet"}
              </button>
            </div>
          </div>
        </form>
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

