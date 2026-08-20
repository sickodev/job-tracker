import { PrismaClient } from "@prisma/client";
import { INITIAL_SHEETS, INITIAL_JOBS } from "@/lib/initial-data";
import { Sheet, JobApplication } from "@/types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Check if the target user is the demo user
 */
export function isDemoUserId(userId?: string, role?: string): boolean {
  return userId === "demo-user-id" || role === "DEMO";
}

/**
 * Get initial saved demo data for the demo user
 */
export function getSavedDemoData(): { sheets: Sheet[]; jobs: JobApplication[] } {
  return {
    sheets: INITIAL_SHEETS,
    jobs: INITIAL_JOBS,
  };
}
