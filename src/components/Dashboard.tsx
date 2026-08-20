"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { SheetTabs } from "./SheetTabs";
import { TableView } from "./TableView";
import { ChartsView } from "./ChartsView";
import { KanbanView } from "./KanbanView";
import { AuthView } from "./AuthView";

export function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<"table" | "charts" | "kanban">("table");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading JobPulse...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-amber-400/30 selection:text-amber-600 dark:selection:text-amber-300">
      {/* Top Navigation */}
      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      {/* Spreadsheet-like Sheet Tabs */}
      <SheetTabs />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {currentView === "table" && <TableView />}
        {currentView === "charts" && <ChartsView />}
        {currentView === "kanban" && <KanbanView />}
      </main>
    </div>
  );
}
