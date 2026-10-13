import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().default("tag"),
  color: z.string().default("#3BF029"),
  monthlyBudget: z.coerce.number().positive().optional().nullable(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  categoryId: z.string().uuid("ID Kategori tidak valid"),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  date: z.string().or(z.date()).default(() => new Date().toISOString()),
  description: z.string().min(1, "Deskripsi wajib diisi").max(255),
  notes: z.string().optional().nullable(),
  receiptUrl: z.string().url().optional().nullable(),
  sourceType: z
    .enum([
      "MANUAL",
      "EMPLOYMENT_PAYROLL",
      "FREELANCE_MILESTONE",
      "PROJECT_EXPENSE",
    ])
    .default("MANUAL"),
  employmentId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  milestoneId: z.string().uuid().optional().nullable(),
});

export type TransactionFormInput = z.infer<typeof transactionSchema>;
