import { z } from "zod";

export const parsedTransactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]).default("EXPENSE"),
  amount: z.number().positive("Nominal harus lebih dari 0").nullable().default(null),
  description: z.string().default(""),
  categoryId: z.string().nullable().default(null),
  categoryName: z.string().nullable().default(null),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  source: z.enum(["AI_GEMINI", "LOCAL_FALLBACK"]).default("AI_GEMINI"),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
});

export type ParsedTransactionData = z.infer<typeof parsedTransactionSchema>;
