export type JobStatus =
  | "Wishlist"
  | "Applied"
  | "Screening"
  | "Technical"
  | "Behavioral"
  | "Offer"
  | "Rejected"
  | "Withdrawn";

export type CompanyType = "Big Tech" | "Startup" | "Scaleup" | "Mid-size" | "Other";

export type WorkplaceType = "Remote" | "Hybrid" | "On-site";

export type Priority = "Low" | "Medium" | "High";

export interface JobApplication {
  id: string;
  sheetId: string;
  company: string;
  role: string;
  status: JobStatus;
  companyType: CompanyType;
  workplaceType: WorkplaceType;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  appliedDate: string; // ISO format or YYYY-MM-DD
  jobUrl?: string;
  companyUrl?: string;
  contact?: string;
  notes?: string;
  rating?: number; // 1 to 5
  priority: Priority;
  resumeUrl?: string;
  resumeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sheet {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  username: string;
  name?: string;
  title?: string;
  avatarUrl?: string;
}

export interface FilterOptions {
  search: string;
  status: JobStatus | "All";
  companyType: CompanyType | "All";
  workplaceType: WorkplaceType | "All";
  priority: Priority | "All";
  sortBy: "appliedDate" | "company" | "role" | "salaryMax" | "status" | "rating";
  sortOrder: "asc" | "desc";
}
