"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { validatePassword } from "@/lib/utils";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
  isPasswordRecovery: boolean;
  recoveryEmail: string;
  setIsPasswordRecovery: (val: boolean) => void;
  setRecoveryEmail: (email: string) => void;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (usernameOrEmail: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  sendMagicLink: (emailOrUsername: string) => Promise<{ success: boolean; error?: string; previewLink?: string; mode?: "supabase" | "local" }>;
  resetPassword: (newPassword: string, emailOrUsername?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "job_tracker_auth_user";
const USERS_STORAGE_KEY = "job_tracker_registered_users";
const MAGIC_TOKEN_KEY = "job_tracker_magic_token";

function formatAuthEmail(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes("@")) {
    return trimmed;
  }
  // Convert plain username to safe auth email
  const safeUsername = trimmed.replace(/[^a-z0-9_.-]/g, "");
  return `${safeUsername || "user"}@jobpulse.app`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const isSupabaseEnabled = isSupabaseConfigured();

  useEffect(() => {
    // Check URL params or hash for recovery mode or magic token
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      if (hash.includes("type=recovery") || searchParams.get("recovery") === "true") {
        setIsPasswordRecovery(true);
      }
      
      const emailParam = searchParams.get("email");
      if (emailParam) {
        setRecoveryEmail(emailParam);
      }

      const tokenParam = searchParams.get("token");
      if (tokenParam) {
        setIsPasswordRecovery(true);
      }
    }

    const initAuth = async () => {
      const supabase = getSupabase();

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser = session.user;
            const meta = authUser.user_metadata || {};
            const username = meta.username || authUser.email?.split("@")[0] || "user";
            
            setUser({
              id: authUser.id,
              email: authUser.email,
              username,
              name: meta.name || username,
              title: meta.title || "Tech Professional",
              avatarUrl: meta.avatar_url,
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to get Supabase session:", e);
        }
      }

      // Check localStorage for offline / demo user
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load auth user from localStorage:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Supabase auth state listener
    const supabase = getSupabase();
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }
        if (session?.user) {
          const authUser = session.user;
          const meta = authUser.user_metadata || {};
          const username = meta.username || authUser.email?.split("@")[0] || "user";

          setUser({
            id: authUser.id,
            email: authUser.email,
            username,
            name: meta.name || username,
            title: meta.title || "Tech Professional",
            avatarUrl: meta.avatar_url,
          });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      return { success: false, error: "Please enter both username/email and password" };
    }

    const supabase = getSupabase();

    // If Supabase is configured, authenticate with Supabase Auth
    if (supabase) {
      try {
        const email = formatAuthEmail(usernameOrEmail);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If user doesn't exist yet in Supabase, auto-register for seamless developer UX
          if (error.message.includes("Invalid login credentials") && validatePassword(password).isValid) {
            const signupRes = await register(usernameOrEmail, password);
            return signupRes;
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const username = meta.username || data.user.email?.split("@")[0] || usernameOrEmail;
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            username,
            name: meta.name || username,
            title: meta.title || "Tech Professional",
          };
          setUser(profile);
          return { success: true };
        }
      } catch (e: unknown) {
        const errMessage = e instanceof Error ? e.message : "Supabase authentication failed";
        return { success: false, error: errMessage };
      }
    }

    // Fallback: Local Storage based authentication
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      const lowerUsername = usernameOrEmail.toLowerCase().trim();

      // Check if user exists or matches default admin
      if (lowerUsername === "admin" && password === "admin123") {
        const profile: UserProfile = {
          id: "local-admin-id",
          username: "admin",
          name: "Lead Job Seeker",
          title: "Senior Full Stack Engineer",
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true };
      }

      if (storedUsers[lowerUsername]) {
        const found = storedUsers[lowerUsername];
        if (found.password === password) {
          const profile: UserProfile = {
            id: found.id || `local-user-${lowerUsername}`,
            username: found.username,
            name: found.name || found.username,
            title: found.title || "Software Engineer",
          };
          setUser(profile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          return { success: true };
        } else {
          return { success: false, error: "Invalid password" };
        }
      }

      // Auto-create account for local mode if password meets structure rules
      const passwordValidation = validatePassword(password);
      if (passwordValidation.isValid) {
        const newUserData = {
          id: `local-user-${Date.now()}`,
          username: usernameOrEmail.trim(),
          password: password.trim(),
          name: usernameOrEmail.trim(),
          title: "Tech Professional",
        };
        storedUsers[lowerUsername] = newUserData;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

        const profile: UserProfile = {
          id: newUserData.id,
          username: newUserData.username,
          name: newUserData.name,
          title: newUserData.title,
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        return { success: true };
      }

      return {
        success: false,
        error: passwordValidation.error || "User not found or password does not meet requirements",
      };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const register = async (
    usernameOrEmail: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      return { success: false, error: "Username/email and password are required" };
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error || "Password does not meet requirements" };
    }

    const supabase = getSupabase();

    // Supabase Auth Register
    if (supabase) {
      try {
        const email = formatAuthEmail(usernameOrEmail);
        const username = usernameOrEmail.trim();
        const displayName = name?.trim() || username;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              name: displayName,
              title: "Software Engineer",
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            username,
            name: displayName,
            title: "Software Engineer",
          };
          setUser(profile);
          return { success: true };
        }
      } catch (e: unknown) {
        const errMessage = e instanceof Error ? e.message : "Registration failed";
        return { success: false, error: errMessage };
      }
    }

    // Local Storage Register
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      const lowerUsername = usernameOrEmail.toLowerCase().trim();

      if (storedUsers[lowerUsername]) {
        return { success: false, error: "Username already exists. Please sign in." };
      }

      const newUserData = {
        id: `local-user-${Date.now()}`,
        username: usernameOrEmail.trim(),
        password: password.trim(),
        name: name?.trim() || usernameOrEmail.trim(),
        title: "Software Engineer",
      };

      storedUsers[lowerUsername] = newUserData;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

      const profile: UserProfile = {
        id: newUserData.id,
        username: newUserData.username,
        name: newUserData.name,
        title: newUserData.title,
      };

      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    } catch {
      return { success: false, error: "Registration failed" };
    }
  };

  const sendMagicLink = async (
    emailOrUsername: string
  ): Promise<{ success: boolean; error?: string; previewLink?: string; mode?: "supabase" | "local" }> => {
    const trimmed = emailOrUsername.trim();
    if (!trimmed) {
      return { success: false, error: "Please enter your email or username." };
    }

    setRecoveryEmail(trimmed);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const email = formatAuthEmail(trimmed);
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/?recovery=true&email=${encodeURIComponent(trimmed)}` : undefined;
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return {
          success: true,
          mode: "supabase",
          previewLink: redirectTo,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to send reset link";
        return { success: false, error: msg };
      }
    }

    // Local Storage Magic Link Simulation
    try {
      const dummyToken = `magic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const previewLink = typeof window !== "undefined" 
        ? `${window.location.origin}/?token=${dummyToken}&email=${encodeURIComponent(trimmed)}&recovery=true`
        : `/?token=${dummyToken}&email=${encodeURIComponent(trimmed)}&recovery=true`;

      localStorage.setItem(
        MAGIC_TOKEN_KEY,
        JSON.stringify({
          token: dummyToken,
          emailOrUsername: trimmed,
          createdAt: Date.now(),
        })
      );

      return {
        success: true,
        mode: "local",
        previewLink,
      };
    } catch {
      return { success: false, error: "Failed to create local magic link" };
    }
  };

  const resetPassword = async (
    newPassword: string,
    emailOrUsername?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return { success: false, error: validation.error || "Password does not meet requirements" };
    }

    const targetUser = emailOrUsername?.trim() || recoveryEmail?.trim();

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        setIsPasswordRecovery(false);
        return { success: true };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to reset password in Supabase";
        return { success: false, error: msg };
      }
    }

    // Local storage reset
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};
      const lowerUsername = (targetUser || "admin").toLowerCase();

      if (lowerUsername === "admin") {
        // Admin reset
        const adminProfile: UserProfile = {
          id: "local-admin-id",
          username: "admin",
          name: "Lead Job Seeker",
          title: "Senior Full Stack Engineer",
        };
        setUser(adminProfile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminProfile));
        setIsPasswordRecovery(false);
        return { success: true };
      }

      if (storedUsers[lowerUsername]) {
        storedUsers[lowerUsername].password = newPassword;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
        
        const profile: UserProfile = {
          id: storedUsers[lowerUsername].id || `local-user-${lowerUsername}`,
          username: storedUsers[lowerUsername].username,
          name: storedUsers[lowerUsername].name || storedUsers[lowerUsername].username,
          title: storedUsers[lowerUsername].title || "Software Engineer",
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        setIsPasswordRecovery(false);
        return { success: true };
      } else {
        // Create new account with this new password if user wasn't previously registered locally
        const newUserData = {
          id: `local-user-${Date.now()}`,
          username: targetUser || "user",
          password: newPassword,
          name: targetUser || "Job Seeker",
          title: "Tech Professional",
        };
        storedUsers[lowerUsername] = newUserData;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));

        const profile: UserProfile = {
          id: newUserData.id,
          username: newUserData.username,
          name: newUserData.name,
          title: newUserData.title,
        };
        setUser(profile);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        setIsPasswordRecovery(false);
        return { success: true };
      }
    } catch {
      return { success: false, error: "Failed to update local password" };
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Supabase sign out error:", e);
      }
    }

    setUser(null);
    setIsPasswordRecovery(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(MAGIC_TOKEN_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const loginAsDemo = () => {
    const demoProfile: UserProfile = {
      id: "demo-user-id",
      username: "alex_tech",
      name: "Alex Rivera",
      title: "Senior Product & Full-Stack Engineer",
    };
    setUser(demoProfile);
    setIsPasswordRecovery(false);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoProfile));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isSupabaseEnabled,
        isPasswordRecovery,
        recoveryEmail,
        setIsPasswordRecovery,
        setRecoveryEmail,
        login,
        register,
        sendMagicLink,
        resetPassword,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
