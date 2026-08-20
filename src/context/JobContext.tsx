"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { JobApplication, Sheet, FilterOptions } from "@/types";
import { INITIAL_SHEETS, INITIAL_JOBS } from "@/lib/initial-data";
import { useAuth } from "./AuthContext";
import { getSupabase, uploadJobAttachment, isSupabaseConfigured } from "@/lib/supabase/client";

interface JobContextType {
  sheets: Sheet[];
  activeSheetId: string;
  activeSheet: Sheet | undefined;
  setActiveSheetId: (id: string) => void;
  createSheet: (name: string, description?: string, color?: string, icon?: string) => Promise<Sheet>;
  updateSheet: (id: string, data: Partial<Sheet>) => Promise<void>;
  deleteSheet: (id: string) => Promise<void>;

  allJobs: JobApplication[];
  activeSheetJobs: JobApplication[];
  filteredJobs: JobApplication[];
  isLoadingData: boolean;

  addJob: (job: Omit<JobApplication, "id" | "createdAt" | "updatedAt">) => Promise<JobApplication>;
  updateJob: (id: string, updates: Partial<JobApplication>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  bulkDeleteJobs: (ids: string[]) => Promise<void>;
  duplicateJob: (id: string) => Promise<void>;
  uploadResume: (file: File) => Promise<{ publicUrl: string; fileName: string } | null>;

  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilterOptions: () => void;

  resetToSampleData: () => Promise<void>;
  exportToCSV: (targetSheetId?: string) => void;
  importFromJSON: (jsonData: string) => boolean;
  exportToJSON: () => void;
}

const defaultFilterOptions: FilterOptions = {
  search: "",
  status: "All",
  companyType: "All",
  workplaceType: "All",
  priority: "All",
  sortBy: "appliedDate",
  sortOrder: "desc",
};

const JobContext = createContext<JobContextType | undefined>(undefined);

// Supabase DB snake_case mappings
interface DbJob {
  id: string;
  user_id: string;
  sheet_id: string;
  company: string;
  role: string;
  status: string;
  company_type?: string;
  workplace_type?: string;
  location?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  applied_date?: string;
  job_url?: string;
  contact?: string;
  notes?: string;
  rating?: number;
  priority?: string;
  resume_url?: string | null;
  resume_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface DbSheet {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

function mapDbJobToJob(db: DbJob): JobApplication {
  return {
    id: db.id,
    sheetId: db.sheet_id,
    company: db.company,
    role: db.role,
    status: (db.status as JobApplication["status"]) || "Wishlist",
    companyType: (db.company_type as JobApplication["companyType"]) || "Startup",
    workplaceType: (db.workplace_type as JobApplication["workplaceType"]) || "Remote",
    location: db.location || "",
    salaryMin: db.salary_min ?? undefined,
    salaryMax: db.salary_max ?? undefined,
    salaryCurrency: db.salary_currency || "USD",
    appliedDate: db.applied_date || new Date().toISOString().split("T")[0],
    jobUrl: db.job_url || "",
    contact: db.contact || "",
    notes: db.notes || "",
    rating: db.rating || 0,
    priority: (db.priority as JobApplication["priority"]) || "Medium",
    resumeUrl: db.resume_url || undefined,
    resumeName: db.resume_name || undefined,
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString(),
  };
}

function mapJobToDbJob(job: JobApplication, userId: string): DbJob {
  return {
    id: job.id,
    user_id: userId,
    sheet_id: job.sheetId,
    company: job.company,
    role: job.role,
    status: job.status,
    company_type: job.companyType,
    workplace_type: job.workplaceType,
    location: job.location,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    salary_currency: job.salaryCurrency,
    applied_date: job.appliedDate,
    job_url: job.jobUrl || "",
    contact: job.contact || "",
    notes: job.notes || "",
    rating: job.rating || 0,
    priority: job.priority,
    resume_url: job.resumeUrl || null,
    resume_name: job.resumeName || null,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}

export function JobProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storagePrefix = user?.username ? `job_tracker_${user.username}_` : "job_tracker_default_";

  const [sheets, setSheets] = useState<Sheet[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${storagePrefix}sheets`);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return INITIAL_SHEETS;
  });
  const [activeSheetId, setActiveSheetId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedActive = localStorage.getItem(`${storagePrefix}active_sheet`);
        if (storedActive) return storedActive;
      } catch (e) {}
    }
    return INITIAL_SHEETS[0]?.id || "sheet-applications";
  });
  const [allJobs, setAllJobs] = useState<JobApplication[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${storagePrefix}jobs`);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return INITIAL_JOBS;
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilterOptions);
  const [isLoadingData, setIsLoadingData] = useState(() => {
    if (typeof window !== "undefined" && isSupabaseConfigured() && user?.id && user.id !== "local-admin-id") {
      return true; // Keep loading for supabase
    }
    return false;
  });

  const isDemoUser = Boolean(user?.id === "demo-user-id" || user?.role === "DEMO");
  const isSupabaseReady = Boolean(isSupabaseConfigured() && user?.id && !isDemoUser && user.id !== "local-admin-id");

  // Load data: From saved demo data if demo user, from Supabase if logged in, otherwise from localStorage
  const loadData = useCallback(async () => {
    setIsLoadingData(true);

    if (isDemoUser) {
      setSheets(INITIAL_SHEETS);
      setAllJobs(INITIAL_JOBS);
      setActiveSheetId(INITIAL_SHEETS[0]?.id || "sheet-applications");
      setIsLoadingData(false);
      return;
    }

    const supabase = getSupabase();

    if (isSupabaseReady && supabase && user?.id) {
      try {
        // 1. Fetch user sheets
        const { data: dbSheets, error: sheetError } = await supabase
          .from("sheets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (sheetError) {
          console.error("Supabase load sheets error:", sheetError);
        }

        // 2. Fetch user jobs
        const { data: dbJobs, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (jobError) {
          console.error("Supabase load jobs error:", jobError);
        }

        if (dbSheets && dbSheets.length > 0) {
          const loadedSheets: Sheet[] = dbSheets.map((s: DbSheet) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            icon: s.icon || "Building2",
            color: s.color || "blue",
            createdAt: s.created_at || new Date().toISOString(),
          }));
          setSheets(loadedSheets);
          setActiveSheetId(loadedSheets[0].id);

          if (dbJobs) {
            const loadedJobs = (dbJobs as DbJob[]).map(mapDbJobToJob);
            setAllJobs(loadedJobs);
          }
          setIsLoadingData(false);
          return;
        } else {
          // If a new Supabase user has 0 sheets, seed the initial sample sheets & jobs
          const initialDbSheets: DbSheet[] = INITIAL_SHEETS.map((s) => ({
            id: s.id,
            user_id: user.id!,
            name: s.name,
            description: s.description,
            icon: s.icon,
            color: s.color,
          }));

          await supabase.from("sheets").insert(initialDbSheets);

          const initialDbJobs: DbJob[] = INITIAL_JOBS.map((j) => mapJobToDbJob(j, user.id!));
          await supabase.from("jobs").insert(initialDbJobs);

          setSheets(INITIAL_SHEETS);
          setAllJobs(INITIAL_JOBS);
          setActiveSheetId(INITIAL_SHEETS[0].id);
          setIsLoadingData(false);
          return;
        }
      } catch (e) {
        console.error("Error connecting to Supabase database:", e);
      }
    }

    // LocalStorage Fallback (Offline / standard local mode)
    try {
      const storedSheets = localStorage.getItem(`${storagePrefix}sheets`);
      const storedJobs = localStorage.getItem(`${storagePrefix}jobs`);
      const storedActiveSheet = localStorage.getItem(`${storagePrefix}active_sheet`);

      if (storedSheets) {
        const parsed = JSON.parse(storedSheets);
        setSheets(parsed);
        if (parsed.length > 0) {
          const validActive =
            storedActiveSheet && parsed.some((s: Sheet) => s.id === storedActiveSheet)
              ? storedActiveSheet
              : parsed[0].id;
          setActiveSheetId(validActive);
        }
      } else {
        setSheets(INITIAL_SHEETS);
        setActiveSheetId(INITIAL_SHEETS[0]?.id || "sheet-applications");
      }

      if (storedJobs) {
        setAllJobs(JSON.parse(storedJobs));
      } else {
        setAllJobs(INITIAL_JOBS);
      }
    } catch (e) {
      console.error("Failed to load sheets/jobs from storage:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [isDemoUser, isSupabaseReady, user?.id, storagePrefix]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist to localStorage whenever in local mode (not demo or supabase)
  useEffect(() => {
    if (!isSupabaseReady && !isDemoUser && !isLoadingData) {
      try {
        localStorage.setItem(`${storagePrefix}sheets`, JSON.stringify(sheets));
        localStorage.setItem(`${storagePrefix}jobs`, JSON.stringify(allJobs));
        localStorage.setItem(`${storagePrefix}active_sheet`, activeSheetId);
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }
  }, [sheets, allJobs, activeSheetId, storagePrefix, isSupabaseReady, isDemoUser, isLoadingData]);

  const activeSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || sheets[0];
  }, [sheets, activeSheetId]);

  const createSheet = useCallback(
    async (name: string, description?: string, color: string = "blue", icon: string = "Briefcase"): Promise<Sheet> => {
      const id = `sheet-${Date.now()}`;
      const newSheet: Sheet = {
        id,
        name: name.trim(),
        description: description?.trim() || "",
        icon: icon || "Briefcase",
        color,
        createdAt: new Date().toISOString(),
      };

      setSheets((prev) => [...prev, newSheet]);
      setActiveSheetId(id);

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from("sheets").insert({
            id: newSheet.id,
            user_id: user.id,
            name: newSheet.name,
            description: newSheet.description,
            icon: newSheet.icon,
            color: newSheet.color,
          });
        }
      }

      return newSheet;
    },
    [isSupabaseReady, user?.id]
  );

  const updateSheet = useCallback(
    async (id: string, data: Partial<Sheet>) => {
      setSheets((prev) =>
        prev.map((sheet) => (sheet.id === id ? { ...sheet, ...data } : sheet))
      );

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase
            .from("sheets")
            .update({
              ...(data.name !== undefined && { name: data.name }),
              ...(data.description !== undefined && { description: data.description }),
              ...(data.icon !== undefined && { icon: data.icon }),
              ...(data.color !== undefined && { color: data.color }),
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }
    },
    [isSupabaseReady, user?.id]
  );

  const deleteSheet = useCallback(
    async (id: string) => {
      if (sheets.length <= 1) {
        alert("You must have at least one sheet.");
        return;
      }
      const remainingSheets = sheets.filter((s) => s.id !== id);
      setSheets(remainingSheets);
      setAllJobs((prev) => prev.filter((j) => j.sheetId !== id));

      if (activeSheetId === id) {
        setActiveSheetId(remainingSheets[0]?.id || "");
      }

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from("sheets").delete().eq("id", id).eq("user_id", user.id);
        }
      }
    },
    [sheets, activeSheetId, isSupabaseReady, user?.id]
  );

  const activeSheetJobs = useMemo(() => {
    if (activeSheetId === "all") {
      return allJobs;
    }
    return allJobs.filter((job) => job.sheetId === activeSheetId);
  }, [allJobs, activeSheetId]);

  const filteredJobs = useMemo(() => {
    const q = filterOptions.search.trim().toLowerCase();
    const { status, companyType, workplaceType, priority, sortBy, sortOrder } = filterOptions;

    const filtered = activeSheetJobs.filter((job) => {
      if (status !== "All" && job.status !== status) return false;
      if (companyType !== "All" && job.companyType !== companyType) return false;
      if (workplaceType !== "All" && job.workplaceType !== workplaceType) return false;
      if (priority !== "All" && job.priority !== priority) return false;

      if (q) {
        const matchCompany = job.company.toLowerCase().includes(q);
        if (matchCompany) return true;
        const matchRole = job.role.toLowerCase().includes(q);
        if (matchRole) return true;
        const matchLocation = job.location.toLowerCase().includes(q);
        if (matchLocation) return true;
        const matchNotes = job.notes ? job.notes.toLowerCase().includes(q) : false;
        if (matchNotes) return true;
        const matchContact = job.contact ? job.contact.toLowerCase().includes(q) : false;
        if (matchContact) return true;
        return false;
      }

      return true;
    });

    const orderMultiplier = sortOrder === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "appliedDate": {
          const timeA = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
          const timeB = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
          return (timeA - timeB) * orderMultiplier;
        }
        case "company":
          return a.company.localeCompare(b.company) * orderMultiplier;
        case "role":
          return a.role.localeCompare(b.role) * orderMultiplier;
        case "salaryMax":
          return ((a.salaryMax || 0) - (b.salaryMax || 0)) * orderMultiplier;
        case "rating":
          return ((a.rating || 0) - (b.rating || 0)) * orderMultiplier;
        case "status":
          return a.status.localeCompare(b.status) * orderMultiplier;
        default:
          return 0;
      }
    });
  }, [activeSheetJobs, filterOptions]);

  const addJob = useCallback(
    async (
      jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
    ): Promise<JobApplication> => {
      const now = new Date().toISOString();
      const newJob: JobApplication = {
        ...jobData,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };

      setAllJobs((prev) => [newJob, ...prev]);

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          const dbJob = mapJobToDbJob(newJob, user.id);
          const { error } = await supabase.from("jobs").insert(dbJob);
          if (error) {
            console.error("Supabase insert job error:", error);
          }
        }
      }

      return newJob;
    },
    [isSupabaseReady, user?.id]
  );

  const updateJob = useCallback(
    async (id: string, updates: Partial<JobApplication>) => {
      const now = new Date().toISOString();
      setAllJobs((prev) =>
        prev.map((job) => (job.id === id ? { ...job, ...updates, updatedAt: now } : job))
      );

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          const payload: Record<string, unknown> = {
            updated_at: now,
          };
          if (updates.company !== undefined) payload.company = updates.company;
          if (updates.role !== undefined) payload.role = updates.role;
          if (updates.status !== undefined) payload.status = updates.status;
          if (updates.sheetId !== undefined) payload.sheet_id = updates.sheetId;
          if (updates.companyType !== undefined) payload.company_type = updates.companyType;
          if (updates.workplaceType !== undefined) payload.workplace_type = updates.workplaceType;
          if (updates.location !== undefined) payload.location = updates.location;
          if (updates.salaryMin !== undefined) payload.salary_min = updates.salaryMin;
          if (updates.salaryMax !== undefined) payload.salary_max = updates.salaryMax;
          if (updates.salaryCurrency !== undefined) payload.salary_currency = updates.salaryCurrency;
          if (updates.appliedDate !== undefined) payload.applied_date = updates.appliedDate;
          if (updates.jobUrl !== undefined) payload.job_url = updates.jobUrl;
          if (updates.contact !== undefined) payload.contact = updates.contact;
          if (updates.notes !== undefined) payload.notes = updates.notes;
          if (updates.rating !== undefined) payload.rating = updates.rating;
          if (updates.priority !== undefined) payload.priority = updates.priority;
          if (updates.resumeUrl !== undefined) payload.resume_url = updates.resumeUrl;
          if (updates.resumeName !== undefined) payload.resume_name = updates.resumeName;

          await supabase.from("jobs").update(payload).eq("id", id).eq("user_id", user.id);
        }
      }
    },
    [isSupabaseReady, user?.id]
  );

  const deleteJob = useCallback(
    async (id: string) => {
      setAllJobs((prev) => prev.filter((job) => job.id !== id));

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from("jobs").delete().eq("id", id).eq("user_id", user.id);
        }
      }
    },
    [isSupabaseReady, user?.id]
  );

  const bulkDeleteJobs = useCallback(
    async (ids: string[]) => {
      const idSet = new Set(ids);
      setAllJobs((prev) => prev.filter((job) => !idSet.has(job.id)));

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from("jobs").delete().in("id", ids).eq("user_id", user.id);
        }
      }
    },
    [isSupabaseReady, user?.id]
  );

  const duplicateJob = useCallback(
    async (id: string) => {
      const existing = allJobs.find((j) => j.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      const duplicated: JobApplication = {
        ...existing,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        company: `${existing.company} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };
      setAllJobs((prev) => [duplicated, ...prev]);

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          const dbJob = mapJobToDbJob(duplicated, user.id);
          await supabase.from("jobs").insert(dbJob);
        }
      }
    },
    [allJobs, isSupabaseReady, user?.id]
  );

  const uploadResume = useCallback(
    async (file: File): Promise<{ publicUrl: string; fileName: string } | null> => {
      if (!user?.id) return null;
      const res = await uploadJobAttachment(user.id, file);
      if ("error" in res) {
        alert(`Upload failed: ${res.error}`);
        return null;
      }
      return res;
    },
    [user?.id]
  );

  const resetFilterOptions = useCallback(() => {
    setFilterOptions(defaultFilterOptions);
  }, []);

  const resetToSampleData = useCallback(async () => {
    if (confirm("Reset all sheets and jobs to the default sample dataset? Your current edits will be replaced.")) {
      setSheets(INITIAL_SHEETS);
      setAllJobs(INITIAL_JOBS);
      setActiveSheetId(INITIAL_SHEETS[0]?.id || "sheet-applications");

      if (isSupabaseReady && user?.id) {
        const supabase = getSupabase();
        if (supabase) {
          await supabase.from("jobs").delete().eq("user_id", user.id);
          await supabase.from("sheets").delete().eq("user_id", user.id);

          const initialDbSheets: DbSheet[] = INITIAL_SHEETS.map((s) => ({
            id: s.id,
            user_id: user.id!,
            name: s.name,
            description: s.description,
            icon: s.icon,
            color: s.color,
          }));
          await supabase.from("sheets").insert(initialDbSheets);

          const initialDbJobs: DbJob[] = INITIAL_JOBS.map((j) => mapJobToDbJob(j, user.id!));
          await supabase.from("jobs").insert(initialDbJobs);
        }
      }
    }
  }, [isSupabaseReady, user?.id]);

  const exportToCSV = useCallback(
    (targetSheetId?: string) => {
      const jobsToExport = targetSheetId
        ? allJobs.filter((j) => j.sheetId === targetSheetId)
        : activeSheetJobs;

      const headers = [
        "Company",
        "Role",
        "Status",
        "Company Type",
        "Workplace Type",
        "Location",
        "Min Salary",
        "Max Salary",
        "Currency",
        "Applied Date",
        "Priority",
        "Job URL",
        "Contact",
        "Notes",
        "Resume URL",
      ];

      const csvRows = jobsToExport.map((j) => [
        `"${j.company.replace(/"/g, '""')}"`,
        `"${j.role.replace(/"/g, '""')}"`,
        `"${j.status}"`,
        `"${j.companyType}"`,
        `"${j.workplaceType}"`,
        `"${j.location.replace(/"/g, '""')}"`,
        j.salaryMin || "",
        j.salaryMax || "",
        j.salaryCurrency || "USD",
        j.appliedDate || "",
        `"${j.priority}"`,
        `"${(j.jobUrl || "").replace(/"/g, '""')}"`,
        `"${(j.contact || "").replace(/"/g, '""')}"`,
        `"${(j.notes || "").replace(/"/g, '""')}"`,
        `"${(j.resumeUrl || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const sheetName = activeSheet?.name || "Job_Tracker";
      link.setAttribute("href", url);
      link.setAttribute("download", `${sheetName.replace(/\s+/g, "_")}_Export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [allJobs, activeSheetJobs, activeSheet]
  );

  const exportToJSON = useCallback(() => {
    const data = {
      sheets,
      jobs: allJobs,
      exportedAt: new Date().toISOString(),
      version: "2.0",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `JobTracker_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sheets, allJobs]);

  const importFromJSON = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.sheets) && Array.isArray(parsed.jobs)) {
        setSheets(parsed.sheets);
        setAllJobs(parsed.jobs);
        if (parsed.sheets.length > 0) {
          setActiveSheetId(parsed.sheets[0].id);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid JSON import:", e);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      sheets,
      activeSheetId,
      activeSheet,
      setActiveSheetId,
      createSheet,
      updateSheet,
      deleteSheet,
      allJobs,
      activeSheetJobs,
      filteredJobs,
      isLoadingData,
      addJob,
      updateJob,
      deleteJob,
      bulkDeleteJobs,
      duplicateJob,
      uploadResume,
      filterOptions,
      setFilterOptions,
      resetFilterOptions,
      resetToSampleData,
      exportToCSV,
      exportToJSON,
      importFromJSON,
    }),
    [
      sheets,
      activeSheetId,
      activeSheet,
      createSheet,
      updateSheet,
      deleteSheet,
      allJobs,
      activeSheetJobs,
      filteredJobs,
      isLoadingData,
      addJob,
      updateJob,
      deleteJob,
      bulkDeleteJobs,
      duplicateJob,
      uploadResume,
      filterOptions,
      resetFilterOptions,
      resetToSampleData,
      exportToCSV,
      exportToJSON,
      importFromJSON,
    ]
  );

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );

}

export function useJobs() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
}
