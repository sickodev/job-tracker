"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useJobs } from "@/context/JobContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Briefcase,
  Table,
  BarChart3,
  Kanban,
  LogOut,
  RotateCcw,
  Download,
  Upload,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  currentView: "table" | "charts" | "kanban";
  onViewChange: (view: "table" | "charts" | "kanban") => void;
}

function getUserInitials(name?: string, username?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (username && username.trim()) {
    const clean = username.trim();
    if (clean.length >= 2) {
      return clean.substring(0, 2).toUpperCase();
    }
    return clean.substring(0, 1).toUpperCase();
  }
  return "JP";
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, logout, isSupabaseEnabled } = useAuth();
  const { resetToSampleData, exportToJSON, importFromJSON } = useJobs();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState("");

  const initials = getUserInitials(user?.name, user?.username);

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importFromJSON(importJsonText);
    if (success) {
      setShowImportModal(false);
      setImportJsonText("");
      setImportError("");
    } else {
      setImportError("Invalid JSON format. Please paste a valid backup file.");
    }
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              JobPulse
            </span>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => onViewChange("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              currentView === "table"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>

          <button
            onClick={() => onViewChange("charts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              currentView === "charts"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => onViewChange("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              currentView === "kanban"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pipeline</span>
          </button>
        </div>

        {/* User profile & Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle (☀️ / 🌙) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Reset sample data button */}
          <button
            onClick={resetToSampleData}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset to default sample dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sample Data</span>
          </button>

          {/* User Menu Trigger (Avatar Only) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-[11px] tracking-wider select-none hover:ring-2 hover:ring-amber-400/40 transition-all cursor-pointer shadow-sm"
              title={user?.name || user?.username || "Account"}
            >
              {initials}
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-52 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-1.5 text-xs">
                  <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user?.name || user?.username}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseEnabled ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {isSupabaseEnabled ? "Supabase Sync" : "Local Storage"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      exportToJSON();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Backup / Export JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowImportModal(true);
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Import JSON Backup</span>
                  </button>

                  <button
                    onClick={() => {
                      resetToSampleData();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Load Demo Data</span>
                  </button>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Import Job Data JSON
            </h3>
            <p className="text-xs text-zinc-500 mb-3">
              Paste the contents of a previously exported JSON backup file below.
            </p>

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium mb-3">
                {importError}
              </div>
            )}

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-amber-400 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-medium transition-colors cursor-pointer"
              >
                Restore Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
