"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { JobProvider } from "@/context/JobContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] dark:bg-[#121214] flex items-center justify-center text-neutral-600 dark:text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium tracking-tight">Loading JobPulse...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <JobProvider>{children}</JobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
