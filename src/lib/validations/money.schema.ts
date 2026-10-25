import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(100)
    .refine((val) => !/[<>]/.test(val), "Nama kategori tidak boleh memuat karakter HTML"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().default("tag"),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Warna harus berupa kode HEX valid (contoh: #3BF029)")
    .default("#3BF029"),
  monthlyBudget: z.coerce.number().positive().max(999999999999, "Anggaran melebihi batas maksimum").optional().nullable(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  categoryId: z.string().uuid("ID Kategori tidak valid"),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .coerce
    .number()
    .positive("Nominal harus lebih dari 0")
    .max(999999999999, "Nominal melebihi batas maksimum"),
  date: z.string().or(z.date()).default(() => new Date().toISOString()),
  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(255)
    .refine((val) => !/[<>]/.test(val), "Deskripsi tidak boleh memuat karakter HTML"),
  notes: z.string().trim().max(1000).optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
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
