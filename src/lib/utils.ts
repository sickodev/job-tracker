import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const AVATAR_COLORS = [
  "bg-pink-300 dark:bg-pink-400 text-black",
  "bg-yellow-300 dark:bg-yellow-400 text-black",
  "bg-sky-300 dark:bg-sky-400 text-black",
  "bg-emerald-300 dark:bg-emerald-400 text-black",
  "bg-purple-300 dark:bg-purple-400 text-black",
  "bg-orange-300 dark:bg-orange-400 text-black",
  "bg-indigo-300 dark:bg-indigo-400 text-black",
  "bg-teal-300 dark:bg-teal-400 text-black",
];

export function getCompanyColor(company: string): string {
  if (!company) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const domainCache = new Map<string, string>();
const logoCache = new Map<string, string>();

export function getCompanyDomain(
  company: string,
  companyUrl?: string,
  jobUrl?: string
): string {
  const cacheKey = `${company || ""}|${companyUrl || ""}|${jobUrl || ""}`;
  const cached = domainCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let domain = "";
  const urlToParse = companyUrl?.trim() || jobUrl?.trim();
  if (urlToParse) {
    try {
      let formattedUrl = urlToParse;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      const parsed = new URL(formattedUrl);
      let host = parsed.hostname.toLowerCase();
      if (host.startsWith("www.")) {
        host = host.slice(4);
      }
      if (host) domain = host;
    } catch {
      // Fallback regex parsing if URL object fails
      const match = urlToParse.replace(/^https?:\/\//i, "").split(/[\/?#]/)[0].replace(/^www\./i, "");
      if (match) domain = match.toLowerCase();
    }
  }

  // Fallback to sanitizing company name
  if (!domain && company) {
    const clean = company
      .toLowerCase()
      .trim()
      .replace(/\s+(inc|llc|corp|ltd|co|technologies|tech|ai|labs)\b/gi, "")
      .replace(/[^a-z0-9]/g, "");
    if (clean) {
      domain = `${clean}.com`;
    }
  }

  domainCache.set(cacheKey, domain);
  return domain;
}

export function getCompanyLogoUrl(
  company: string,
  companyUrl?: string,
  jobUrl?: string
): string {
  const cacheKey = `${company || ""}|${companyUrl || ""}|${jobUrl || ""}`;
  const cached = logoCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const domain = getCompanyDomain(company, companyUrl, jobUrl);
  const logoUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
    : "";
  logoCache.set(cacheKey, logoUrl);
  return logoUrl;
}

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A-Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a-z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "At least one number (0-9)",
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "At least one special character (!@#$...)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return {
        isValid: false,
        error: `Password must include: ${rule.label.toLowerCase()}`,
      };
    }
  }
  return { isValid: true };
}

