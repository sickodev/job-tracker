"use client";

import React, { useState } from "react";
import { useJobs } from "@/context/JobContext";
import { Sheet } from "@/types";
import { SheetModal, SheetIcon } from "./SheetModal";
import { SheetDeletePane } from "./SheetDeletePane";
import {
  Plus,
  Edit2,
  X,
  Grid,
} from "lucide-react";

export function SheetTabs() {
  const {
    sheets,
    activeSheetId,
    setActiveSheetId,
    createSheet,
    updateSheet,
    deleteSheet,
    allJobs,
  } = useJobs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<Sheet | null>(null);
  const [deleteTargetSheet, setDeleteTargetSheet] = useState<Sheet | null>(null);

  const handleCreate = (name: string, description?: string, color?: string, icon?: string) => {
    createSheet(name, description, color, icon);
  };

  const handleUpdate = (name: string, description?: string, color?: string, icon?: string) => {
    if (editingSheet) {
      updateSheet(editingSheet.id, { name, description, color, icon });
      setEditingSheet(null);
    }
  };

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm px-4 sm:px-6 transition-colors">
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
        {/* Tabs List */}
        <div className="flex items-center gap-1.5 min-w-max">
          {/* "All Sheets" Tab */}
          <button
            onClick={() => setActiveSheetId("all")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeSheetId === "all"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-medium shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-zinc-400" />
            <span>All Sheets</span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              {allJobs.length}
            </span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800 mx-1" />

          {/* User Sheets */}
          {sheets.map((sheet) => {
            const isActive = activeSheetId === sheet.id;
            const jobCount = allJobs.filter((j) => j.sheetId === sheet.id).length;

            return (
              <div
                key={sheet.id}
                title={`${sheet.description || sheet.name} (Double-click to edit)`}
                className={`group relative flex items-center rounded-lg transition-all ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 font-medium shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 border border-transparent"
                }`}
              >
                <button
                  onClick={() => setActiveSheetId(sheet.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingSheet(sheet);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer"
                >
                  <SheetIcon name={sheet.icon} className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="max-w-[130px] truncate">{sheet.name}</span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {jobCount}
                  </span>
                </button>

                {/* Quick Edit button visible on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSheet(sheet);
                    setIsModalOpen(true);
                  }}
                  title="Edit Sheet"
                  className="p-1 rounded text-zinc-400 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                {/* Delete X button: hovers red and opens Delete Warning Pane */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetSheet(sheet);
                  }}
                  title={`Delete sheet "${sheet.name}"`}
                  className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer mr-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* New Sheet Button */}
          <button
            onClick={() => {
              setEditingSheet(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors ml-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sheet</span>
          </button>
        </div>
      </div>

      <SheetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSheet(null);
        }}
        onSave={editingSheet ? handleUpdate : handleCreate}
        onDelete={(id) => {
          const s = sheets.find((item) => item.id === id);
          if (s) setDeleteTargetSheet(s);
        }}
        editingSheet={editingSheet}
      />

      {/* Delete Sheet Warning Pane */}
      <SheetDeletePane
        sheet={deleteTargetSheet}
        isOpen={Boolean(deleteTargetSheet)}
        onClose={() => setDeleteTargetSheet(null)}
        onConfirmDelete={(id) => {
          deleteSheet(id);
          setDeleteTargetSheet(null);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
