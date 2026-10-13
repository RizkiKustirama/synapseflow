import { z } from "zod";

export const employmentSchema = z.object({
  companyName: z.string().min(1, "Nama perusahaan wajib diisi").max(255),
  role: z.string().min(1, "Posisi/jabatan wajib diisi").max(255),
  jobType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"])
    .default("FULL_TIME"),
  status: z
    .enum(["ACTIVE", "PROBATION", "COMPLETED", "RESIGNED"])
    .default("ACTIVE"),
  payday: z.coerce.number().min(1).max(31).default(25),
  baseSalary: z.coerce.number().positive("Gaji pokok harus lebih dari 0"),
  fixedAllowance: z.coerce.number().nonnegative().default(0),
  startDate: z.string().or(z.date()).default(() => new Date().toISOString().split("T")[0]),
  endDate: z.string().or(z.date()).optional().nullable(),
  jobApplicationId: z.string().optional().nullable(),
});

export type EmploymentFormInput = z.infer<typeof employmentSchema>;

export const employmentTaskSchema = z.object({
  employmentId: z.string().min(1, "ID Pekerjaan wajib ada"),
  title: z.string().min(1, "Judul tugas wajib diisi").max(255),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().or(z.date()).optional().nullable(),
});

export type EmploymentTaskFormInput = z.infer<typeof employmentTaskSchema>;

export const payrollRecordSchema = z.object({
  employmentId: z.string().min(1, "ID Pekerjaan wajib ada"),
  periodMonth: z.coerce.number().min(1).max(12),
  periodYear: z.coerce.number().min(2020).max(2035),
  baseSalary: z.coerce.number().positive("Gaji pokok harus lebih dari 0"),
  allowance: z.coerce.number().nonnegative().default(0),
  incentiveBonus: z.coerce.number().nonnegative().default(0),
  deductions: z.coerce.number().nonnegative().default(0),
  payslipUrl: z.string().optional().nullable(),
  paidAt: z.string().or(z.date()).default(() => new Date().toISOString().split("T")[0]),
});

export type PayrollRecordFormInput = z.infer<typeof payrollRecordSchema>;
