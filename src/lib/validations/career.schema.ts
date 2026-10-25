import { z } from "zod";

export const jobApplicationSchema = z.object({
  companyName: z.string().min(1, "Nama perusahaan wajib diisi").max(255),
  position: z.string().min(1, "Posisi/jabatan wajib diisi").max(255),
  workLocation: z.enum(["REMOTE", "HYBRID", "ONSITE"]).default("REMOTE"),
  status: z
    .enum([
      "WISHLIST",
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "TECH_TEST",
      "OFFERING",
      "ACCEPTED",
      "REJECTED",
      "GHOSTED",
    ])
    .default("APPLIED"),
  salaryOfferedMin: z.coerce.number().nonnegative().optional().nullable(),
  salaryOfferedMax: z.coerce.number().nonnegative().optional().nullable(),
  expectedSalary: z.coerce.number().nonnegative().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  cvVersion: z.string().optional().nullable(),
  appliedDate: z.string().or(z.date()).default(() => new Date().toISOString().split("T")[0]),
  notes: z.string().optional().nullable(),
});

export type JobApplicationFormInput = z.infer<typeof jobApplicationSchema>;

export const parsedJobDataSchema = z.object({
  companyName: z.string().default(""),
  position: z.string().default(""),
  workLocation: z.enum(["REMOTE", "HYBRID", "ONSITE"]).default("REMOTE"),
  salaryOfferedMin: z.number().nullable().optional(),
  salaryOfferedMax: z.number().nullable().optional(),
  jobUrl: z.string().nullable().optional(),
  notes: z.string().default(""),
  source: z.enum(["AI_GEMINI", "LOCAL_FALLBACK"]).default("AI_GEMINI"),
});

export type ParsedJobData = z.infer<typeof parsedJobDataSchema>;

export const interviewLogSchema = z.object({
  applicationId: z.string().min(1, "ID lamaran wajib ada"),
  roundName: z.string().min(1, "Nama tahapan interview wajib diisi").max(100),
  scheduledAt: z.string().or(z.date()),
  meetingLink: z.string().optional().nullable(),
  interviewerInfo: z.string().optional().nullable(),
  questionsAsked: z.string().optional().nullable(),
  feedbackNotes: z.string().optional().nullable(),
});

export type InterviewLogFormInput = z.infer<typeof interviewLogSchema>;

export const convertToEmploymentSchema = z.object({
  applicationId: z.string().min(1, "ID lamaran wajib ada"),
  companyName: z.string().min(1, "Nama perusahaan wajib diisi"),
  role: z.string().min(1, "Role/jabatan wajib diisi"),
  jobType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"])
    .default("FULL_TIME"),
  payday: z.coerce.number().min(1).max(31).default(25),
  baseSalary: z.coerce.number().positive("Gaji pokok harus lebih dari 0"),
  fixedAllowance: z.coerce.number().nonnegative().default(0),
  startDate: z.string().or(z.date()).default(() => new Date().toISOString().split("T")[0]),
});

export type ConvertToEmploymentInput = z.infer<typeof convertToEmploymentSchema>;
