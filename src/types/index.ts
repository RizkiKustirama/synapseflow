export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionSourceType =
  | "MANUAL"
  | "EMPLOYMENT_PAYROLL"
  | "FREELANCE_MILESTONE"
  | "PROJECT_EXPENSE";

export type WorkLocationType = "REMOTE" | "HYBRID" | "ONSITE";

export type JobApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "TECH_TEST"
  | "OFFERING"
  | "ACCEPTED"
  | "REJECTED"
  | "GHOSTED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP";

export type EmploymentStatus =
  | "ACTIVE"
  | "PROBATION"
  | "COMPLETED"
  | "RESIGNED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ProjectStatus =
  | "PROSPECT"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type MilestoneStatus = "DRAFT" | "INVOICED" | "PAID" | "OVERDUE";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  active?: boolean;
}

export interface MetricSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  activeProjectsCount: number;
  totalReceivables: number; // Piutang
  activeJobApplications: number;
  daysUntilPayday: number;
}
