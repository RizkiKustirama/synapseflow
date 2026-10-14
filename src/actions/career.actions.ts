"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  jobApplicationSchema,
  interviewLogSchema,
  convertToEmploymentSchema,
  JobApplicationFormInput,
  InterviewLogFormInput,
  ConvertToEmploymentInput,
} from "@/lib/validations/career.schema";

const DEFAULT_USER_ID = "c0000000-0000-0000-0000-000000000001";

export async function getCurrentUserId(): Promise<string> {
  return DEFAULT_USER_ID;
}

export interface StoredInterviewLog {
  id: string;
  applicationId: string;
  roundName: string;
  scheduledAt: string;
  meetingLink?: string | null;
  interviewerInfo?: string | null;
  questionsAsked?: string | null;
  feedbackNotes?: string | null;
}

export interface StoredJobApplication {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  workLocation: "REMOTE" | "HYBRID" | "ONSITE";
  status:
    | "WISHLIST"
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW"
    | "TECH_TEST"
    | "OFFERING"
    | "ACCEPTED"
    | "REJECTED"
    | "GHOSTED";
  salaryOfferedMin?: number | null;
  salaryOfferedMax?: number | null;
  expectedSalary?: number | null;
  jobUrl?: string | null;
  cvVersion?: string | null;
  appliedDate: string;
  notes?: string | null;
  interviewLogs: StoredInterviewLog[];
}

// Initial realistic applications fallback
let mockApplicationsStore: StoredJobApplication[] = [
  {
    id: "app-001",
    userId: DEFAULT_USER_ID,
    companyName: "GoTo Financial",
    position: "Staff Backend Engineer",
    workLocation: "HYBRID",
    status: "INTERVIEW",
    salaryOfferedMin: 32000000,
    salaryOfferedMax: 38000000,
    expectedSalary: 35000000,
    jobUrl: "https://goto.company/careers/staff-backend",
    cvVersion: "CV_Backend_v4_2026.pdf",
    appliedDate: "2026-10-01",
    notes: "Fokus pada sistem distributed ledger dan high-throughput payment gateway.",
    interviewLogs: [
      {
        id: "int-001",
        applicationId: "app-001",
        roundName: "User Interview & System Design",
        scheduledAt: "2026-10-15T14:00:00Z",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        interviewerInfo: "Budi Santoso (VP of Engineering)",
        questionsAsked: "Event-driven architecture dengan Kafka, idempotency payment transactions",
        feedbackNotes: "Pastikan review slide presentasi arsitektur microservices.",
      },
    ],
  },
  {
    id: "app-002",
    userId: DEFAULT_USER_ID,
    companyName: "Shopee Sea Group",
    position: "Senior Fullstack Engineer",
    workLocation: "REMOTE",
    status: "TECH_TEST",
    salaryOfferedMin: 30000000,
    salaryOfferedMax: 35000000,
    expectedSalary: 32000000,
    jobUrl: "https://careers.shopee.com/job/senior-fullstack",
    cvVersion: "CV_Fullstack_v3.pdf",
    appliedDate: "2026-09-28",
    notes: "Platform e-commerce logistik tim. Diberi waktu 48 jam untuk take-home test.",
    interviewLogs: [
      {
        id: "int-002",
        applicationId: "app-002",
        roundName: "Take-home Coding Test Review",
        scheduledAt: "2026-10-18T10:00:00Z",
        meetingLink: "https://zoom.us/j/987654321",
        interviewerInfo: "Tech Lead & Senior Architect",
        questionsAsked: "Next.js App Router performance, Redis caching, TanStack Table virtual scroll",
        feedbackNotes: "Repo submission dikirim via GitHub priv repo.",
      },
    ],
  },
  {
    id: "app-003",
    userId: DEFAULT_USER_ID,
    companyName: "Traveloka",
    position: "Frontend Architect",
    workLocation: "HYBRID",
    status: "SCREENING",
    salaryOfferedMin: 28000000,
    salaryOfferedMax: 34000000,
    expectedSalary: 30000000,
    jobUrl: "https://traveloka.com/careers/frontend-lead",
    cvVersion: "CV_Frontend_Architect_2026.pdf",
    appliedDate: "2026-10-05",
    notes: "Optimasi Web Vitals dan Micro-Frontend revamp.",
    interviewLogs: [],
  },
  {
    id: "app-004",
    userId: DEFAULT_USER_ID,
    companyName: "Fintech SG Global",
    position: "Lead Engineer",
    workLocation: "REMOTE",
    status: "OFFERING",
    salaryOfferedMin: 42000000,
    salaryOfferedMax: 48000000,
    expectedSalary: 45000000,
    jobUrl: "https://fintech-sg.io/jobs/lead-eng",
    cvVersion: "CV_TechLead_Global.pdf",
    appliedDate: "2026-09-15",
    notes: "Sudah masuk tahap offering letter! Siap dikonversi ke pekerjaan aktif saat accepted.",
    interviewLogs: [
      {
        id: "int-003",
        applicationId: "app-004",
        roundName: "Final Culture & Offer Call",
        scheduledAt: "2026-10-14T16:00:00Z",
        meetingLink: "https://meet.google.com/xyz-offering-call",
        interviewerInfo: "Sarah Jenkins (Head of People)",
        questionsAsked: "Negosiasi benefit asuransi global, annual bonus, dan peralatan remote.",
        feedbackNotes: "Offering paket sangat menarik (Rp 45 jt + bonus).",
      },
    ],
  },
  {
    id: "app-005",
    userId: DEFAULT_USER_ID,
    companyName: "Grab",
    position: "Senior Platform Engineer",
    workLocation: "REMOTE",
    status: "APPLIED",
    salaryOfferedMin: 35000000,
    salaryOfferedMax: 42000000,
    expectedSalary: 38000000,
    jobUrl: "https://grab.careers/platform-eng",
    cvVersion: "CV_Fullstack_v3.pdf",
    appliedDate: "2026-10-10",
    notes: "Kirim via referral rekan kerja.",
    interviewLogs: [],
  },
  {
    id: "app-006",
    userId: DEFAULT_USER_ID,
    companyName: "ByteDance TikTok",
    position: "Fullstack Platform Specialist",
    workLocation: "ONSITE",
    status: "WISHLIST",
    salaryOfferedMin: 40000000,
    salaryOfferedMax: 50000000,
    expectedSalary: 42000000,
    jobUrl: "https://jobs.bytedance.com/tiktok",
    cvVersion: "CV_Fullstack_v3.pdf",
    appliedDate: "2026-10-12",
    notes: "Menunggu lowongan dibuka resmi kuartal depan.",
    interviewLogs: [],
  },
];

/**
 * 1. Get All Job Applications with Interview Logs
 */
export async function getJobApplications(): Promise<StoredJobApplication[]> {
  const userId = await getCurrentUserId();

  try {
    const apps = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        interviewLogs: {
          orderBy: { scheduledAt: "asc" },
        },
      },
      orderBy: { appliedDate: "desc" },
    });

    if (apps.length > 0) {
      return apps.map((app) => ({
        id: app.id,
        userId: app.userId,
        companyName: app.companyName,
        position: app.position,
        workLocation: app.workLocation,
        status: app.status,
        salaryOfferedMin: app.salaryOfferedMin ? Number(app.salaryOfferedMin) : null,
        salaryOfferedMax: app.salaryOfferedMax ? Number(app.salaryOfferedMax) : null,
        expectedSalary: app.expectedSalary ? Number(app.expectedSalary) : null,
        jobUrl: app.jobUrl,
        cvVersion: app.cvVersion,
        appliedDate: app.appliedDate.toISOString().split("T")[0],
        notes: app.notes,
        interviewLogs: app.interviewLogs.map((log) => ({
          id: log.id,
          applicationId: log.applicationId,
          roundName: log.roundName,
          scheduledAt: log.scheduledAt.toISOString(),
          meetingLink: log.meetingLink,
          interviewerInfo: log.interviewerInfo,
          questionsAsked: log.questionsAsked,
          feedbackNotes: log.feedbackNotes,
        })),
      }));
    }
  } catch {
    // Database offline fallback
  }

  return mockApplicationsStore.filter((a) => a.userId === userId);
}

/**
 * 2. Create Job Application
 */
export async function createJobApplication(formData: JobApplicationFormInput) {
  const userId = await getCurrentUserId();
  const validated = jobApplicationSchema.parse(formData);

  try {
    const created = await prisma.jobApplication.create({
      data: {
        userId,
        companyName: validated.companyName,
        position: validated.position,
        workLocation: validated.workLocation,
        status: validated.status,
        salaryOfferedMin: validated.salaryOfferedMin ?? null,
        salaryOfferedMax: validated.salaryOfferedMax ?? null,
        expectedSalary: validated.expectedSalary ?? null,
        jobUrl: validated.jobUrl ?? null,
        cvVersion: validated.cvVersion ?? null,
        appliedDate: new Date(validated.appliedDate),
        notes: validated.notes ?? null,
      },
      include: { interviewLogs: true },
    });

    revalidatePath("/career");
    revalidatePath("/");
    return { success: true, data: created };
  } catch {
    const newApp: StoredJobApplication = {
      id: "app-" + Date.now().toString(),
      userId,
      companyName: validated.companyName,
      position: validated.position,
      workLocation: validated.workLocation,
      status: validated.status,
      salaryOfferedMin: validated.salaryOfferedMin,
      salaryOfferedMax: validated.salaryOfferedMax,
      expectedSalary: validated.expectedSalary,
      jobUrl: validated.jobUrl,
      cvVersion: validated.cvVersion,
      appliedDate: typeof validated.appliedDate === "string" ? validated.appliedDate : validated.appliedDate.toISOString().split("T")[0],
      notes: validated.notes,
      interviewLogs: [],
    };
    mockApplicationsStore.unshift(newApp);
    revalidatePath("/career");
    revalidatePath("/");
    return { success: true, data: newApp };
  }
}

/**
 * 3. Update Job Application Status (Kanban Drag / Move)
 */
export async function updateApplicationStatus(
  id: string,
  newStatus: StoredJobApplication["status"]
) {
  const userId = await getCurrentUserId();

  try {
    await prisma.jobApplication.updateMany({
      where: { id, userId },
      data: { status: newStatus },
    });
    revalidatePath("/career");
    revalidatePath("/");
    return { success: true };
  } catch {
    const app = mockApplicationsStore.find((a) => a.id === id && a.userId === userId);
    if (app) {
      app.status = newStatus;
    }
    revalidatePath("/career");
    revalidatePath("/");
    return { success: true };
  }
}

/**
 * 4. Update Job Application
 */
export async function updateJobApplication(
  id: string,
  formData: Partial<JobApplicationFormInput>
) {
  const userId = await getCurrentUserId();

  try {
    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(formData.companyName ? { companyName: formData.companyName } : {}),
        ...(formData.position ? { position: formData.position } : {}),
        ...(formData.workLocation ? { workLocation: formData.workLocation } : {}),
        ...(formData.status ? { status: formData.status } : {}),
        ...(formData.salaryOfferedMin !== undefined ? { salaryOfferedMin: formData.salaryOfferedMin } : {}),
        ...(formData.salaryOfferedMax !== undefined ? { salaryOfferedMax: formData.salaryOfferedMax } : {}),
        ...(formData.expectedSalary !== undefined ? { expectedSalary: formData.expectedSalary } : {}),
        ...(formData.jobUrl !== undefined ? { jobUrl: formData.jobUrl } : {}),
        ...(formData.cvVersion !== undefined ? { cvVersion: formData.cvVersion } : {}),
        ...(formData.appliedDate ? { appliedDate: new Date(formData.appliedDate) } : {}),
        ...(formData.notes !== undefined ? { notes: formData.notes } : {}),
      },
    });
    revalidatePath("/career");
    return { success: true, data: updated };
  } catch {
    const idx = mockApplicationsStore.findIndex((a) => a.id === id && a.userId === userId);
    if (idx !== -1) {
      mockApplicationsStore[idx] = {
        ...mockApplicationsStore[idx],
        ...formData,
      } as StoredJobApplication;
    }
    revalidatePath("/career");
    return { success: true };
  }
}

/**
 * 5. Delete Job Application
 */
export async function deleteJobApplication(id: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.jobApplication.deleteMany({
      where: { id, userId },
    });
    revalidatePath("/career");
    return { success: true };
  } catch {
    mockApplicationsStore = mockApplicationsStore.filter(
      (a) => !(a.id === id && a.userId === userId)
    );
    revalidatePath("/career");
    return { success: true };
  }
}

/**
 * 6. Add Interview Log (Interview CRM)
 */
export async function addInterviewLog(formData: InterviewLogFormInput) {
  const userId = await getCurrentUserId();
  const validated = interviewLogSchema.parse(formData);

  try {
    // Enforce ownership: Verify job application belongs to current user
    const app = await prisma.jobApplication.findFirst({
      where: { id: validated.applicationId, userId },
      select: { id: true },
    });
    if (!app) throw new Error("Akses ditolak: Lamaran kerja tidak ditemukan atau bukan milik Anda");

    const created = await prisma.jobInterviewLog.create({
      data: {
        applicationId: validated.applicationId,
        roundName: validated.roundName,
        scheduledAt: new Date(validated.scheduledAt),
        meetingLink: validated.meetingLink ?? null,
        interviewerInfo: validated.interviewerInfo ?? null,
        questionsAsked: validated.questionsAsked ?? null,
        feedbackNotes: validated.feedbackNotes ?? null,
      },
    });
    revalidatePath("/career");
    return { success: true, data: created };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Akses ditolak")) {
      throw err;
    }
    const newLog: StoredInterviewLog = {
      id: "int-" + Date.now().toString(),
      applicationId: validated.applicationId,
      roundName: validated.roundName,
      scheduledAt: typeof validated.scheduledAt === "string" ? validated.scheduledAt : validated.scheduledAt.toISOString(),
      meetingLink: validated.meetingLink,
      interviewerInfo: validated.interviewerInfo,
      questionsAsked: validated.questionsAsked,
      feedbackNotes: validated.feedbackNotes,
    };

    const app = mockApplicationsStore.find((a) => a.id === validated.applicationId && a.userId === userId);
    if (app) {
      app.interviewLogs.push(newLog);
    }
    revalidatePath("/career");
    return { success: true, data: newLog };
  }
}

/**
 * 7. Delete Interview Log
 */
export async function deleteInterviewLog(id: string, applicationId: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.jobInterviewLog.deleteMany({
      where: {
        id,
        application: { userId },
      },
    });
    revalidatePath("/career");
    return { success: true };
  } catch {
    const app = mockApplicationsStore.find((a) => a.id === applicationId && a.userId === userId);
    if (app) {
      app.interviewLogs = app.interviewLogs.filter((l) => l.id !== id);
    }
    revalidatePath("/career");
    return { success: true };
  }
}

/**
 * 8. Interconnection Event: Convert Accepted Application to Active Employment
 */
export async function convertApplicationToEmployment(data: ConvertToEmploymentInput) {
  const userId = await getCurrentUserId();
  const validated = convertToEmploymentSchema.parse(data);

  try {
    // 1. Create active Employment
    const employment = await prisma.employment.create({
      data: {
        userId,
        jobApplicationId: validated.applicationId,
        companyName: validated.companyName,
        role: validated.role,
        jobType: validated.jobType,
        status: "ACTIVE",
        payday: validated.payday,
        baseSalary: validated.baseSalary,
        fixedAllowance: validated.fixedAllowance,
        startDate: new Date(validated.startDate),
      },
    });

    // 2. Mark application status as ACCEPTED
    await prisma.jobApplication.updateMany({
      where: { id: validated.applicationId, userId },
      data: { status: "ACCEPTED" },
    });

    revalidatePath("/career");
    revalidatePath("/employment");
    revalidatePath("/");
    return { success: true, data: employment };
  } catch {
    // Fallback store update
    const app = mockApplicationsStore.find((a) => a.id === validated.applicationId);
    if (app) {
      app.status = "ACCEPTED";
    }
    revalidatePath("/career");
    revalidatePath("/employment");
    revalidatePath("/");
    return { success: true };
  }
}

/**
 * 9. Get Career Metrics & Pipeline Summary
 */
export async function getCareerStats() {
  const apps = await getJobApplications();

  const totalApplications = apps.length;
  const activePipeline = apps.filter(
    (a) => !["ACCEPTED", "REJECTED", "GHOSTED"].includes(a.status)
  ).length;

  const totalInterviews = apps.reduce(
    (acc, curr) => acc + curr.interviewLogs.length,
    0
  );

  const offerings = apps.filter((a) => ["OFFERING", "ACCEPTED"].includes(a.status)).length;
  const offerRate = totalApplications > 0 ? Math.round((offerings / totalApplications) * 100) : 0;

  const appsWithSalary = apps.filter((a) => a.expectedSalary && a.expectedSalary > 0);
  const avgExpectedSalary =
    appsWithSalary.length > 0
      ? Math.round(
          appsWithSalary.reduce((acc, curr) => acc + (curr.expectedSalary || 0), 0) /
            appsWithSalary.length
        )
      : 35000000;

  return {
    totalApplications,
    activePipeline,
    totalInterviews,
    offerRate,
    avgExpectedSalary,
  };
}
