"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Briefcase,
  ArrowRight,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
  Database,
  TrendingUp,
  UserCheck,
  Lock,
  User,
  Zap,
} from "lucide-react";
import { PASSWORD_RULES } from "@/lib/utils";
import { MagicLinkPane } from "./MagicLinkPane";

type AuthTab = "signin" | "signup" | "magiclink";

export function AuthView() {
  const { login, register, loginAsDemo, isPasswordRecovery, recoveryEmail } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AuthTab>(
    isPasswordRecovery ? "magiclink" : "signin"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (activeTab === "signup") {
      const res = await register(username, password, fullName);
      if (!res.success) {
        setError(res.error || "Registration failed");
      }
    } else {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || "Invalid username or password");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 relative overflow-hidden transition-colors selection:bg-amber-400/30 selection:text-amber-300">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Top right Theme toggle & status badge */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 shadow-sm backdrop-blur-md transition-all cursor-pointer"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </div>

      {/* Dual Pane Layout Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch z-10 my-auto">
        
        {/* ================= LEFT SHOWCASE PANE ================= */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          {/* Subtle grid pattern background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Top Brand Section */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Career Pipeline Engine</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-400/20 font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  JobPulse
                  <span className="text-xs font-normal px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    v2.4
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Minimalist high-density career cockpit
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mt-4 font-normal">
              Track, organize, and accelerate your job search with seamless multi-sheet spreadsheets, interactive Kanban workflows, and instant passwordless magic links.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Magic Recovery Links</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Instant password recovery with zero email needed</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Sheet + Kanban Dual View</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Spreadsheet density meets visual agility</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Local-First Storage</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Offline-ready with Supabase sync option</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Pipeline Analytics</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Salary benchmarks & conversion metrics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Showcase Quote Card */}
          <div className="mt-8 pt-5 border-t border-zinc-800/80 relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-zinc-950 flex items-center justify-center font-bold text-xs">
                AR
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-200">Alex Rivera</p>
                <p className="text-[11px] text-zinc-500">Lead Tech Seeker • 3 Offers Closed</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              Username Only • No Email Required
            </span>
          </div>
        </div>

        {/* ================= RIGHT INTERACTIVE AUTH PANE ================= */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl relative transition-all">
            
            {/* Top Navigation Pane Tabs */}
            {activeTab !== "magiclink" && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signin");
                    setError("");
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "signin"
                      ? "bg-amber-400 text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("signup");
                    setError("");
                  }}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === "signup"
                      ? "bg-amber-400 text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Render Magic Link Recovery Sub-pane */}
            {activeTab === "magiclink" ? (
              <MagicLinkPane
                onBackToSignIn={() => {
                  setActiveTab("signin");
                  setError("");
                }}
                initialUsername={recoveryEmail || username}
                initialMode={isPasswordRecovery ? "reset" : "forgot"}
              />
            ) : (
              /* Sign In / Sign Up Forms */
              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {activeTab === "signup" ? "Create your workspace" : "Welcome back"}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {activeTab === "signup"
                      ? "Username & password only • No email required"
                      : "Access your sheets, pipeline stages, and analytics"}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-in fade-in duration-150">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === "signup" && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. Alex Rivera"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                        />
                        <UserCheck className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. alex_tech or admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                        required
                        autoFocus
                      />
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <label className="block text-xs font-medium text-zinc-300">
                          Password
                        </label>
                        <div
                          className="relative inline-flex items-center"
                          onMouseEnter={() => setShowPasswordRules(true)}
                          onMouseLeave={() => setShowPasswordRules(false)}
                        >
                          <button
                            type="button"
                            onClick={() => setShowPasswordRules((prev) => !prev)}
                            aria-label="Password rules"
                            className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {showPasswordRules && (
                            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-zinc-850 border border-zinc-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                              <div className="flex items-center gap-1.5 font-semibold text-zinc-100 text-xs mb-2">
                                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Password Requirements</span>
                              </div>
                              <ul className="space-y-1.5">
                                {PASSWORD_RULES.map((rule) => {
                                  const passed = password ? rule.test(password) : false;
                                  return (
                                    <li
                                      key={rule.id}
                                      className={`flex items-center gap-2 text-[11px] transition-colors ${
                                        password
                                          ? passed
                                            ? "text-emerald-400 font-medium"
                                            : "text-zinc-400"
                                          : "text-zinc-400"
                                      }`}
                                    >
                                      <div
                                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                                          password && passed
                                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                                            : "bg-zinc-800 text-zinc-500"
                                        }`}
                                      >
                                        {password && passed ? (
                                          <Check className="w-2.5 h-2.5" />
                                        ) : (
                                          <span className="w-1 h-1 rounded-full bg-zinc-500" />
                                        )}
                                      </div>
                                      <span>{rule.label}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="absolute -bottom-1.5 left-2 w-3 h-3 bg-zinc-850 border-b border-r border-zinc-700 rotate-45" />
                            </div>
                          )}
                        </div>
                      </div>

                      {activeTab === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("magiclink");
                            setError("");
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Enter password (min 8 chars)"
                        value={password}
                        minLength={8}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                        required
                      />
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 font-semibold text-xs shadow-sm shadow-amber-400/10 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{activeTab === "signup" ? "Create Account" : "Sign In to JobPulse"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick Magic Link & 1-Click Demo Login */}
                <div className="mt-5 pt-4 border-t border-zinc-800 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("magiclink");
                        setError("");
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Magic Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={loginAsDemo}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-zinc-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Click Demo</span>
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(activeTab === "signin" ? "signup" : "signin");
                        setError("");
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      {activeTab === "signup"
                        ? "Already have an account? Sign in"
                        : "New to JobPulse? Create your account"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
