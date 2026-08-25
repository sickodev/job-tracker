"use client";

import React, { useMemo } from "react";
import { useJobs } from "@/context/JobContext";
import { useTheme } from "@/context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { Briefcase, Award, Clock, DollarSign } from "lucide-react";
import { JobStatus } from "@/types";

const STATUS_COLORS: Record<JobStatus, string> = {
  Wishlist: "#94a3b8",
  Applied: "#3b82f6",
  Screening: "#a855f7",
  Technical: "#f59e0b",
  Behavioral: "#6366f1",
  Offer: "#10b981",
  Rejected: "#f43f5e",
  Withdrawn: "#64748b",
};

const COMPANY_TYPE_COLORS: Record<string, string> = {
  "Big Tech": "#3b82f6",
  Startup: "#a855f7",
  Scaleup: "#14b8a6",
  "Mid-size": "#f59e0b",
  Other: "#64748b",
};

export function ChartsView() {
  const { filteredJobs, activeSheetJobs, activeSheet, activeSheetId } = useJobs();
  const { theme } = useTheme();

  const jobsToAnalyze = filteredJobs.length > 0 ? filteredJobs : activeSheetJobs;

  // 1. KPI Aggregates
  const totalApps = jobsToAnalyze.length;
  const inInterview = jobsToAnalyze.filter((j) =>
    ["Screening", "Technical", "Behavioral"].includes(j.status)
  ).length;
  const offers = jobsToAnalyze.filter((j) => j.status === "Offer").length;
  const offerRate = totalApps > 0 ? ((offers / totalApps) * 100).toFixed(0) : "0";

  const salaries = jobsToAnalyze
    .map((j) => j.salaryMax)
    .filter((s): s is number => typeof s === "number" && s > 0);
  const avgMaxSalary =
    salaries.length > 0
      ? salaries.reduce((acc, curr) => acc + curr, 0) / salaries.length
      : 0;

  // 2. Status Distribution (Donut)
  const statusData = useMemo(() => {
    const counts: Partial<Record<JobStatus, number>> = {};
    jobsToAnalyze.forEach((j) => {
      counts[j.status] = (counts[j.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status as JobStatus] || "#71717a",
    }));
  }, [jobsToAnalyze]);

  // 3. Pipeline Funnel
  const funnelData = useMemo(() => {
    const stageOrder: JobStatus[] = [
      "Applied",
      "Screening",
      "Technical",
      "Behavioral",
      "Offer",
    ];
    const total = jobsToAnalyze.length || 1;
    return stageOrder.map((stage) => {
      const count = jobsToAnalyze.filter((j) => j.status === stage).length;
      return {
        stage,
        count,
        rate: Math.round((count / total) * 100),
      };
    });
  }, [jobsToAnalyze]);

  // 4. Company Category Breakdown
  const companyTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobsToAnalyze.forEach((j) => {
      const type = j.companyType || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: type,
      value: count,
      color: COMPANY_TYPE_COLORS[type] || "#71717a",
    }));
  }, [jobsToAnalyze]);

  // 5. Compensation Ranges by Company
  const salaryComparisonData = useMemo(() => {
    return jobsToAnalyze
      .filter((j) => j.salaryMax && j.salaryMax > 0)
      .slice(0, 8)
      .map((j) => ({
        company: j.company,
        min: j.salaryMin ? Math.round(j.salaryMin / 1000) : Math.round(j.salaryMax! / 1000),
        max: Math.round(j.salaryMax! / 1000),
      }));
  }, [jobsToAnalyze]);

  // 6. Cumulative Timeline
  const timelineData = useMemo(() => {
    const sorted = [...jobsToAnalyze].sort(
      (a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
    );
    return sorted.map((job, idx) => ({
      date: job.appliedDate,
      total: idx + 1,
      company: job.company,
    }));
  }, [jobsToAnalyze]);

  const tooltipStyle = {
    backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
    borderColor: theme === "dark" ? "#27272a" : "#e4e4e7",
    borderWidth: "1px",
    borderRadius: "8px",
    fontSize: "12px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    color: theme === "dark" ? "#fafafa" : "#09090b",
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Applications */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-ambient-low">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Applications</span>
            <Briefcase className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">{totalApps}</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {activeSheetId === "all" ? "All sheets" : activeSheet?.name}
            </p>
          </div>
        </div>

        {/* In Interview Pipeline */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-ambient-low">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Interviews</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-zinc-100">{inInterview}</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Screening, Tech, & Final
            </p>
          </div>
        </div>

        {/* Offers */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-ambient-low">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Offers & Win Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">{offers}</div>
            <span className="text-xs text-zinc-500 font-mono">
              ({offerRate}%)
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Confirmed offers
          </p>
        </div>

        {/* Target Salary */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-ambient-low">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Avg Target Comp</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              {avgMaxSalary > 0 ? `$${(avgMaxSalary / 1000).toFixed(0)}k` : "N/A"}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Across {salaries.length} listed roles
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Status Donut Chart */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Application Status Distribution
              </h3>
              <p className="text-[11px] text-zinc-500">
                Breakdown of applications across hiring stages
              </p>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {statusData.length === 0 ? (
              <div className="text-xs text-zinc-500">No applications data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Pipeline Funnel Bar Chart */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Interview Pipeline Funnel
              </h3>
              <p className="text-[11px] text-zinc-500">
                Progression from Application to Final Offer
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            {funnelData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#27272a" : "#e4e4e7"} horizontal={false} />
                  <XAxis type="number" stroke={theme === "dark" ? "#a1a1aa" : "#71717a"} fontSize={11} />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    stroke={theme === "dark" ? "#a1a1aa" : "#71717a"}
                    fontSize={11}
                    width={75}
                  />
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${value} applications (${item.payload.rate}%)`,
                      "Volume",
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Big Tech vs Startup Category Breakdown */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Company Category Ratio
              </h3>
              <p className="text-[11px] text-zinc-500">
                Type distribution across tracked jobs
              </p>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {companyTypeData.length === 0 ? (
              <div className="text-xs text-zinc-500">No category data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {companyTypeData.map((entry, index) => (
                      <Cell key={`type-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Compensation Ranges by Company */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Compensation Ranges ($k / Year)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Min vs Max salary expectations
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            {salaryComparisonData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No salary data provided yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#27272a" : "#e4e4e7"} vertical={false} />
                  <XAxis
                    dataKey="company"
                    stroke={theme === "dark" ? "#a1a1aa" : "#71717a"}
                    fontSize={11}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke={theme === "dark" ? "#a1a1aa" : "#71717a"} fontSize={11} tickFormatter={(v) => `$${v}k`} />
                  <Tooltip
                    formatter={(value: any, name: any) => [`$${value},000`, name === "min" ? "Min Salary" : "Max Salary"]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="min" name="Min Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" name="Max Salary" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 5: Applications Timeline */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Application Velocity
              </h3>
              <p className="text-[11px] text-zinc-500">
                Cumulative volume submitted over time
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            {timelineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                No dates recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#27272a" : "#e4e4e7"} />
                  <XAxis dataKey="date" stroke={theme === "dark" ? "#a1a1aa" : "#71717a"} fontSize={11} />
                  <YAxis stroke={theme === "dark" ? "#a1a1aa" : "#71717a"} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Applications"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
