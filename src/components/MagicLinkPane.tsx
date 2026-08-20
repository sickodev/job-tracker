"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Info,
  RefreshCw,
} from "lucide-react";
import { PASSWORD_RULES, validatePassword } from "@/lib/utils";

interface MagicLinkPaneProps {
  onBackToSignIn: () => void;
  initialUsername?: string;
  initialMode?: "forgot" | "reset";
}

export function MagicLinkPane({
  onBackToSignIn,
  initialUsername = "",
  initialMode = "forgot",
}: MagicLinkPaneProps) {
  const { sendMagicLink, resetPassword, isPasswordRecovery, setIsPasswordRecovery } = useAuth();

  const [mode, setMode] = useState<"forgot" | "sent" | "reset">(
    isPasswordRecovery ? "reset" : initialMode
  );
  const [username, setUsername] = useState(initialUsername);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your registered username.");
      return;
    }

    setError("");
    setIsLoading(true);

    const res = await sendMagicLink(username.trim());
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to generate magic link. Please check your username.");
    } else {
      setPreviewLink(res.previewLink || null);
      setMode("sent");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.error || "Password does not meet the requirements.");
      return;
    }

    setIsLoading(true);
    const res = await resetPassword(newPassword, username);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to reset password.");
    } else {
      setSuccessMsg("Password reset successfully! Redirecting you into JobPulse...");
      setIsPasswordRecovery(false);
    }
  };

  const handleCopyLink = () => {
    if (!previewLink) return;
    navigator.clipboard.writeText(previewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center shrink-0">
            {mode === "reset" ? (
              <KeyRound className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {mode === "reset"
                ? "Reset Your Password"
                : mode === "sent"
                ? "Magic Link Generated"
                : "Magic Link Recovery"}
            </h2>
            <p className="text-xs text-zinc-500">
              {mode === "reset"
                ? "Set a new secure password for your account"
                : mode === "sent"
                ? "Instant recovery link ready for your username"
                : "Generate a magic link to access or reset your account"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToSignIn}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
          title="Back to Sign In"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in duration-150">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mode: Forgot / Request Magic Link */}
      {mode === "forgot" && (
        <form onSubmit={handleSendMagicLink} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
            Enter your username below. We will generate an instant magic link to reset your password with zero email required.
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. alex_tech or admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                required
                autoFocus
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 font-semibold text-xs shadow-sm shadow-amber-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Magic Link...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Magic Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Mode: Magic Link Sent Confirmation & Simulation Drawer */}
      {mode === "sent" && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Magic Link Ready
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              Recovery link ready for username:{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {username}
              </span>
            </p>
          </div>

          {/* Quick Fast-Pass Action Box */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Magic Recovery</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-600 dark:text-amber-400 font-medium">
                No Email Needed
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              You can immediately proceed to set a new password or copy your magic link.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Set New Password Now</span>
              </button>

              {previewLink && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy magic link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Need a different username? Try again
            </button>
          </div>
        </div>
      )}

      {/* Mode: Reset Password */}
      {mode === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-3.5 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  New Password
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
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {showPasswordRules && (
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 text-xs mb-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Password Requirements</span>
                      </div>
                      <ul className="space-y-1.5">
                        {PASSWORD_RULES.map((rule) => {
                          const passed = newPassword ? rule.test(newPassword) : false;
                          return (
                            <li
                              key={rule.id}
                              className={`flex items-center gap-2 text-[11px] transition-colors ${
                                newPassword
                                  ? passed
                                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                    : "text-zinc-500 dark:text-zinc-400"
                                  : "text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                                  newPassword
                                    ? passed
                                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
                                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400"
                                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400"
                                }`}
                              >
                                {newPassword && passed ? (
                                  <Check className="w-2.5 h-2.5" />
                                ) : (
                                  <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                                )}
                              </div>
                              <span>{rule.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="absolute -bottom-1.5 left-2 w-3 h-3 bg-white dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-700 rotate-45" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <input
              type="password"
              placeholder="Enter new password (min 8 chars)"
              value={newPassword}
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 transition-all ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
                  : "border-zinc-200 dark:border-zinc-700 focus:border-amber-400 focus:ring-amber-400/20"
              }`}
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[11px] text-rose-500 mt-1">Passwords do not match yet</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Update Password & Sign In</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
