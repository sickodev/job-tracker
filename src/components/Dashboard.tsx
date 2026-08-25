"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "./Navbar";
import { SheetTabs } from "./SheetTabs";
import { TableView } from "./TableView";
import { AuthView } from "./AuthView";

const ViewLoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 text-zinc-400">
    <div className="flex items-center gap-2 text-xs">
      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <span>Loading view...</span>
    </div>
  </div>
);

const ChartsView = dynamic(() => import("./ChartsView").then((mod) => mod.ChartsView), {
  loading: ViewLoadingFallback,
});

const KanbanView = dynamic(() => import("./KanbanView").then((mod) => mod.KanbanView), {
  loading: ViewLoadingFallback,
});

export function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<"table" | "charts" | "kanban">("table");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-bg-light dark:bg-neutral-bg-dark flex items-center justify-center text-zinc-500 dark:text-zinc-400">
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
    <div className="min-h-screen bg-neutral-bg-light dark:bg-neutral-bg-dark text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-amber-400/30 selection:text-amber-600 dark:selection:text-amber-300">
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
