import { Sheet, JobApplication } from "@/types";

export const INITIAL_SHEETS: Sheet[] = [
  {
    id: "sheet-applications",
    name: "Applications",
    description: "Track all your active job applications and interviews",
    icon: "Briefcase",
    color: "blue",
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_JOBS: JobApplication[] = [
  {
    id: "job-1",
    sheetId: "sheet-applications",
    company: "Google",
    companyUrl: "https://google.com",
    role: "Senior Software Engineer (Cloud AI)",
    status: "Applied",
    companyType: "Big Tech",
    workplaceType: "Hybrid",
    location: "Mountain View, CA",
    salaryMin: 180000,
    salaryMax: 260000,
    salaryCurrency: "USD",
    appliedDate: new Date().toISOString().split("T")[0],
    jobUrl: "https://careers.google.com",
    contact: "Recruiter via LinkedIn",
    notes: "Sample application to get you started. Feel free to edit or add new applications.",
    rating: 5,
    priority: "High",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
