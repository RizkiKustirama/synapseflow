import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Nama klien wajib diisi").max(255),
  company: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ClientFormInput = z.infer<typeof clientSchema>;

export const freelanceProjectSchema = z.object({
  clientId: z.string().optional().nullable().or(z.literal("")),
  title: z.string().min(1, "Judul proyek wajib diisi").max(255),
  description: z.string().optional().nullable(),
  status: z
    .enum(["PROSPECT", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"])
    .default("IN_PROGRESS"),
  totalBudget: z.coerce.number().nonnegative().default(0),
  startDate: z.string().or(z.date()).optional().nullable(),
  deadline: z.string().or(z.date()).optional().nullable(),
});

export type FreelanceProjectFormInput = z.infer<typeof freelanceProjectSchema>;

export const projectMilestoneSchema = z.object({
  projectId: z.string().min(1, "ID Proyek wajib ada"),
  title: z.string().min(1, "Judul termin/milestone wajib diisi").max(255),
  amount: z.coerce.number().positive("Nominal termin harus lebih dari 0"),
  status: z
    .enum(["DRAFT", "INVOICED", "PAID", "OVERDUE"])
    .default("DRAFT"),
  invoiceNumber: z.string().optional().nullable(),
  dueDate: z.string().or(z.date()).optional().nullable(),
  paidDate: z.string().or(z.date()).optional().nullable(),
});

export type ProjectMilestoneFormInput = z.infer<typeof projectMilestoneSchema>;

export const projectExpenseSchema = z.object({
  projectId: z.string().min(1, "ID Proyek wajib ada"),
  amount: z.coerce.number().positive("Nominal pengeluaran harus lebih dari 0"),
  description: z.string().min(1, "Deskripsi pengeluaran wajib diisi").max(255),
  categoryId: z.string().optional().nullable(),
  date: z.string().or(z.date()).default(() => new Date().toISOString().split("T")[0]),
  notes: z.string().optional().nullable(),
});

export type ProjectExpenseFormInput = z.infer<typeof projectExpenseSchema>;
