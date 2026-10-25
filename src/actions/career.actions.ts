"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeSafeUrl } from "@/lib/security";
import {
  jobApplicationSchema,
  interviewLogSchema,
  convertToEmploymentSchema,
  JobApplicationFormInput,
  InterviewLogFormInput,
  ConvertToEmploymentInput,
} from "@/lib/validations/career.schema";
import { getCurrentUserId } from "@/lib/user";

export { getCurrentUserId };

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

/**
 * 1. Get All Job Applications with Interview Logs
 */
export async function getJobApplications(): Promise<StoredJobApplication[]> {
  const userId = await getCurrentUserId();

  const apps = await prisma.jobApplication.findMany({
    where: { userId },
    include: {
      interviewLogs: {
        orderBy: { scheduledAt: "asc" },
      },
    },
    orderBy: { appliedDate: "desc" },
  });

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

/**
 * 2. Create Job Application
 */
export async function createJobApplication(formData: JobApplicationFormInput) {
  const userId = await getCurrentUserId();
  const validated = jobApplicationSchema.parse(formData);

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
      jobUrl: sanitizeSafeUrl(validated.jobUrl),
      cvVersion: validated.cvVersion ?? null,
      appliedDate: new Date(validated.appliedDate),
      notes: validated.notes ?? null,
    },
    include: { interviewLogs: true },
  });

  revalidatePath("/career");
  revalidatePath("/");
  return { success: true, data: created };
}

/**
 * 3. Update Job Application Status (Kanban Drag / Move)
 */
export async function updateApplicationStatus(
  id: string,
  newStatus: StoredJobApplication["status"]
) {
  const userId = await getCurrentUserId();

  await prisma.jobApplication.updateMany({
    where: { id, userId },
    data: { status: newStatus },
  });

  revalidatePath("/career");
  revalidatePath("/");
  return { success: true };
}

/**
 * 4. Update Job Application
 */
export async function updateJobApplication(
  id: string,
  formData: Partial<JobApplicationFormInput>
) {
  const userId = await getCurrentUserId();

  const updated = await prisma.jobApplication.update({
    where: { id, userId },
    data: {
      ...(formData.companyName ? { companyName: formData.companyName } : {}),
      ...(formData.position ? { position: formData.position } : {}),
      ...(formData.workLocation ? { workLocation: formData.workLocation } : {}),
      ...(formData.status ? { status: formData.status } : {}),
      ...(formData.salaryOfferedMin !== undefined ? { salaryOfferedMin: formData.salaryOfferedMin } : {}),
      ...(formData.salaryOfferedMax !== undefined ? { salaryOfferedMax: formData.salaryOfferedMax } : {}),
      ...(formData.expectedSalary !== undefined ? { expectedSalary: formData.expectedSalary } : {}),
      ...(formData.jobUrl !== undefined ? { jobUrl: sanitizeSafeUrl(formData.jobUrl) } : {}),
      ...(formData.cvVersion !== undefined ? { cvVersion: formData.cvVersion } : {}),
      ...(formData.appliedDate ? { appliedDate: new Date(formData.appliedDate) } : {}),
      ...(formData.notes !== undefined ? { notes: formData.notes } : {}),
    },
  });

  revalidatePath("/career");
  return { success: true, data: updated };
}

/**
 * 5. Delete Job Application
 */
export async function deleteJobApplication(id: string) {
  const userId = await getCurrentUserId();

  await prisma.jobApplication.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/career");
  return { success: true };
}

/**
 * 6. Add Interview Log (Interview CRM)
 */
export async function addInterviewLog(formData: InterviewLogFormInput) {
  const userId = await getCurrentUserId();
  const validated = interviewLogSchema.parse(formData);

  // Enforce ownership: Verify job application belongs to current user
  const app = await prisma.jobApplication.findFirst({
    where: { id: validated.applicationId, userId },
    select: { id: true },
  });
  if (!app) {
    throw new Error("Akses ditolak: Lamaran kerja tidak ditemukan atau bukan milik Anda");
  }

  const created = await prisma.jobInterviewLog.create({
    data: {
      applicationId: validated.applicationId,
      roundName: validated.roundName,
      scheduledAt: new Date(validated.scheduledAt),
      meetingLink: sanitizeSafeUrl(validated.meetingLink),
      interviewerInfo: validated.interviewerInfo ?? null,
      questionsAsked: validated.questionsAsked ?? null,
      feedbackNotes: validated.feedbackNotes ?? null,
    },
  });

  revalidatePath("/career");
  return { success: true, data: created };
}

/**
 * 7. Delete Interview Log
 */
export async function deleteInterviewLog(id: string, applicationId: string) {
  const userId = await getCurrentUserId();

  await prisma.jobInterviewLog.deleteMany({
    where: {
      id,
      application: { id: applicationId, userId },
    },
  });

  revalidatePath("/career");
  return { success: true };
}

/**
 * 8. Interconnection Event: Convert Accepted Application to Active Employment
 */
export async function convertApplicationToEmployment(data: ConvertToEmploymentInput) {
  const userId = await getCurrentUserId();
  const validated = convertToEmploymentSchema.parse(data);

  // Enforce multi-tenant foreign key ownership
  const app = await prisma.jobApplication.findFirst({
    where: { id: validated.applicationId, userId },
    select: { id: true },
  });
  if (!app) {
    throw new Error("Akses ditolak: Lamaran kerja tidak ditemukan atau bukan milik Anda");
  }

  const employment = await prisma.$transaction(async (tx) => {
    // 1. Create active Employment
    const createdEmployment = await tx.employment.create({
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
    await tx.jobApplication.updateMany({
      where: { id: validated.applicationId, userId },
      data: { status: "ACCEPTED" },
    });

    return createdEmployment;
  });

  revalidatePath("/career");
  revalidatePath("/employment");
  revalidatePath("/");
  return { success: true, data: employment };
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
      : 0;

  return {
    totalApplications,
    activePipeline,
    totalInterviews,
    offerRate,
    avgExpectedSalary,
  };
}
