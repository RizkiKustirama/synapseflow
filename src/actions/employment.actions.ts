"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  employmentSchema,
  employmentTaskSchema,
  payrollRecordSchema,
  EmploymentFormInput,
  EmploymentTaskFormInput,
  PayrollRecordFormInput,
} from "@/lib/validations/employment.schema";
import { getCategories } from "@/actions/money.actions";
import { getCurrentUserId } from "@/lib/user";

export { getCurrentUserId };

export interface StoredEmploymentTask {
  id: string;
  employmentId: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  createdAt: string;
}

export interface StoredPayrollRecord {
  id: string;
  employmentId: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  allowance: number;
  incentiveBonus: number;
  deductions: number;
  netSalary: number;
  payslipUrl?: string | null;
  isSyncedToMoney: boolean;
  syncedTransactionId?: string | null;
  paidAt: string;
}

export interface StoredEmployment {
  id: string;
  userId: string;
  jobApplicationId?: string | null;
  companyName: string;
  role: string;
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  status: "ACTIVE" | "PROBATION" | "COMPLETED" | "RESIGNED";
  payday: number;
  baseSalary: number;
  fixedAllowance: number;
  startDate: string;
  endDate?: string | null;
  tasks: StoredEmploymentTask[];
  payrollRecords: StoredPayrollRecord[];
}

/**
 * 1. Get All Employments
 */
export async function getEmployments(): Promise<StoredEmployment[]> {
  const userId = await getCurrentUserId();

  const list = await prisma.employment.findMany({
    where: { userId },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      payrollRecords: {
        orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return list.map((emp) => ({
    id: emp.id,
    userId: emp.userId,
    jobApplicationId: emp.jobApplicationId,
    companyName: emp.companyName,
    role: emp.role,
    jobType: emp.jobType,
    status: emp.status,
    payday: emp.payday,
    baseSalary: Number(emp.baseSalary),
    fixedAllowance: Number(emp.fixedAllowance),
    startDate: emp.startDate.toISOString().split("T")[0],
    endDate: emp.endDate ? emp.endDate.toISOString().split("T")[0] : null,
    tasks: emp.tasks.map((t) => ({
      id: t.id,
      employmentId: t.employmentId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : null,
      createdAt: t.createdAt.toISOString(),
    })),
    payrollRecords: emp.payrollRecords.map((p) => ({
      id: p.id,
      employmentId: p.employmentId,
      periodMonth: p.periodMonth,
      periodYear: p.periodYear,
      baseSalary: Number(p.baseAmount),
      allowance: Number(p.allowanceAmount),
      incentiveBonus: Number(p.bonusIncentive),
      deductions: Number(p.deductions),
      netSalary: Number(p.netReceived),
      payslipUrl: p.slipFileUrl,
      isSyncedToMoney: !!p.transactionId,
      syncedTransactionId: p.transactionId,
      paidAt: p.paidDate.toISOString().split("T")[0],
    })),
  }));
}

/**
 * 2. Get Primary Active Employment
 */
export async function getActiveEmployment(): Promise<StoredEmployment | null> {
  const list = await getEmployments();
  return list.find((e) => e.status === "ACTIVE") || list[0] || null;
}

/**
 * 2B. Get Employment By ID (Scoped to User)
 */
export async function getEmploymentById(id: string): Promise<StoredEmployment | null> {
  const userId = await getCurrentUserId();

  const emp = await prisma.employment.findFirst({
    where: { id, userId },
    include: {
      tasks: { orderBy: { createdAt: "desc" } },
      payrollRecords: {
        orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
      },
    },
  });

  if (!emp) return null;

  return {
    id: emp.id,
    userId: emp.userId,
    jobApplicationId: emp.jobApplicationId,
    companyName: emp.companyName,
    role: emp.role,
    jobType: emp.jobType,
    status: emp.status,
    payday: emp.payday,
    baseSalary: Number(emp.baseSalary),
    fixedAllowance: Number(emp.fixedAllowance),
    startDate: emp.startDate.toISOString().split("T")[0],
    endDate: emp.endDate ? emp.endDate.toISOString().split("T")[0] : null,
    tasks: emp.tasks.map((t) => ({
      id: t.id,
      employmentId: t.employmentId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : null,
      createdAt: t.createdAt.toISOString(),
    })),
    payrollRecords: emp.payrollRecords.map((p) => ({
      id: p.id,
      employmentId: p.employmentId,
      periodMonth: p.periodMonth,
      periodYear: p.periodYear,
      baseSalary: Number(p.baseAmount),
      allowance: Number(p.allowanceAmount),
      incentiveBonus: Number(p.bonusIncentive),
      deductions: Number(p.deductions),
      netSalary: Number(p.netReceived),
      payslipUrl: p.slipFileUrl,
      isSyncedToMoney: !!p.transactionId,
      syncedTransactionId: p.transactionId,
      paidAt: p.paidDate.toISOString().split("T")[0],
    })),
  };
}

/**
 * 2C. Get Scoped Office Tasks for Employment
 */
export async function getOfficeTasks(employmentId: string): Promise<StoredEmploymentTask[]> {
  const emp = await getEmploymentById(employmentId);
  return emp ? emp.tasks : [];
}

export const getEmploymentTasks = getOfficeTasks;

/**
 * 2D. Get Scoped Payroll Records for Employment
 */
export async function getPayrollRecords(employmentId: string): Promise<StoredPayrollRecord[]> {
  const emp = await getEmploymentById(employmentId);
  return emp ? emp.payrollRecords : [];
}

/**
 * 3. Create Employment
 */
export async function createEmployment(formData: EmploymentFormInput) {
  const userId = await getCurrentUserId();
  const validated = employmentSchema.parse(formData);

  const created = await prisma.employment.create({
    data: {
      userId,
      jobApplicationId: validated.jobApplicationId ?? null,
      companyName: validated.companyName,
      role: validated.role,
      jobType: validated.jobType,
      status: validated.status,
      payday: validated.payday,
      baseSalary: validated.baseSalary,
      fixedAllowance: validated.fixedAllowance,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : null,
    },
    include: { tasks: true, payrollRecords: true },
  });

  revalidatePath("/employment");
  revalidatePath("/");
  return { success: true, data: created };
}

/**
 * 4. Update Employment
 */
export async function updateEmployment(
  id: string,
  formData: Partial<EmploymentFormInput>
) {
  const userId = await getCurrentUserId();

  const updated = await prisma.employment.update({
    where: { id, userId },
    data: {
      ...(formData.companyName ? { companyName: formData.companyName } : {}),
      ...(formData.role ? { role: formData.role } : {}),
      ...(formData.jobType ? { jobType: formData.jobType } : {}),
      ...(formData.status ? { status: formData.status } : {}),
      ...(formData.payday ? { payday: formData.payday } : {}),
      ...(formData.baseSalary !== undefined ? { baseSalary: formData.baseSalary } : {}),
      ...(formData.fixedAllowance !== undefined ? { fixedAllowance: formData.fixedAllowance } : {}),
      ...(formData.startDate ? { startDate: new Date(formData.startDate) } : {}),
      ...(formData.endDate ? { endDate: new Date(formData.endDate) } : {}),
    },
  });

  revalidatePath("/employment");
  revalidatePath("/");
  return { success: true, data: updated };
}

/**
 * 5. Delete Employment
 */
export async function deleteEmployment(id: string) {
  const userId = await getCurrentUserId();

  await prisma.employment.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/employment");
  revalidatePath("/");
  return { success: true };
}

/**
 * 6. Create Employment Task
 */
export async function createEmploymentTask(formData: EmploymentTaskFormInput) {
  const userId = await getCurrentUserId();
  const validated = employmentTaskSchema.parse(formData);

  // Enforce ownership: Verify employment belongs to current user
  const emp = await prisma.employment.findFirst({
    where: { id: validated.employmentId, userId },
    select: { id: true },
  });
  if (!emp) {
    throw new Error("Akses ditolak: Profil pekerjaan tidak ditemukan atau bukan milik Anda");
  }

  const created = await prisma.employmentTask.create({
    data: {
      employmentId: validated.employmentId,
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      priority: validated.priority,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
    },
  });

  revalidatePath("/employment");
  return { success: true, data: created };
}

/**
 * 7. Update Task Status
 */
export async function updateTaskStatus(
  taskId: string,
  status: StoredEmploymentTask["status"],
  employmentId: string
) {
  const userId = await getCurrentUserId();

  const updated = await prisma.employmentTask.updateMany({
    where: {
      id: taskId,
      employmentId,
      employment: { userId },
    },
    data: { status },
  });

  if (updated.count === 0) {
    throw new Error("Akses ditolak: Task tidak ditemukan atau bukan milik Anda");
  }

  revalidatePath("/employment");
  return { success: true };
}

/**
 * 8. Delete Task
 */
export async function deleteEmploymentTask(taskId: string, employmentId: string) {
  const userId = await getCurrentUserId();

  await prisma.employmentTask.deleteMany({
    where: {
      id: taskId,
      employmentId,
      employment: { userId },
    },
  });

  revalidatePath("/employment");
  return { success: true };
}

/**
 * 9. Create Payroll Record
 */
export async function createPayrollRecord(formData: PayrollRecordFormInput) {
  const userId = await getCurrentUserId();
  const validated = payrollRecordSchema.parse(formData);
  const netSalary =
    validated.baseSalary +
    validated.allowance +
    validated.incentiveBonus -
    validated.deductions;

  // Enforce ownership: Verify employment belongs to current user
  const emp = await prisma.employment.findFirst({
    where: { id: validated.employmentId, userId },
    select: { id: true },
  });
  if (!emp) {
    throw new Error("Akses ditolak: Profil pekerjaan tidak ditemukan atau bukan milik Anda");
  }

  const created = await prisma.payrollRecord.create({
    data: {
      employmentId: validated.employmentId,
      periodMonth: validated.periodMonth,
      periodYear: validated.periodYear,
      baseAmount: validated.baseSalary,
      allowanceAmount: validated.allowance,
      bonusIncentive: validated.incentiveBonus,
      deductions: validated.deductions,
      netReceived: netSalary,
      slipFileUrl: validated.payslipUrl ?? null,
      paidDate: new Date(validated.paidAt),
    },
  });

  revalidatePath("/employment");
  return { success: true, data: created };
}

/**
 * 10. Interconnection Action: 1-Click Sync Payroll Slip to Money Module
 */
export async function syncPayrollToMoney(payrollId: string, employmentId: string) {
  const userId = await getCurrentUserId();

  try {
    // 1. Locate the employment profile & verify ownership
    const emp = await prisma.employment.findFirst({
      where: { id: employmentId, userId },
      include: {
        payrollRecords: { where: { id: payrollId } },
      },
    });
    if (!emp) throw new Error("Profil pekerjaan tidak ditemukan atau bukan milik Anda");

    const record = emp.payrollRecords[0];
    if (!record) throw new Error("Slip gaji tidak ditemukan");
    if (record.transactionId) {
      return { success: true, message: "Slip gaji sudah tersinkronkan sebelumnya" };
    }

    // 2. Find Gaji Kantor category in Money module
    const categories = await getCategories("INCOME");
    const salaryCat =
      categories.find((c) => c.name.toLowerCase().includes("gaji")) ||
      categories[0];

    if (!salaryCat) throw new Error("Kategori pemasukan Gaji belum tersedia");

    // 3. Atomically create Transaction in Money ledger and link to PayrollRecord
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const monthLabel = monthNames[record.periodMonth - 1] || `Bulan ${record.periodMonth}`;

    const createdTxId = await prisma.$transaction(async (tx) => {
      const createdTx = await tx.transaction.create({
        data: {
          userId,
          categoryId: salaryCat.id,
          type: "INCOME",
          amount: Number(record.netReceived),
          date: record.paidDate,
          description: `Gaji Kantor - ${emp.companyName} (${monthLabel} ${record.periodYear})`,
          notes: `Auto-synced from Employment #${emp.id}. Rincian: Pokok Rp ${Number(record.baseAmount).toLocaleString("id-ID")}, Tunjangan Rp ${Number(record.allowanceAmount).toLocaleString("id-ID")}, Bonus Rp ${Number(record.bonusIncentive).toLocaleString("id-ID")}, Potongan Rp ${Number(record.deductions).toLocaleString("id-ID")}.`,
          sourceType: "EMPLOYMENT_PAYROLL",
          employmentId: emp.id,
        },
      });

      await tx.payrollRecord.update({
        where: { id: payrollId },
        data: {
          transactionId: createdTx.id,
        },
      });

      return createdTx.id;
    });

    revalidatePath("/employment");
    revalidatePath("/money");
    revalidatePath("/");
    return { success: true, transactionId: createdTxId };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Gagal sinkronisasi gaji";
    return { success: false, error };
  }
}

/**
 * 11. Get Employment Summary Stats
 */
export async function getEmploymentSummary() {
  const employments = await getEmployments();
  const activeEmployments = employments.filter((e) => e.status === "ACTIVE");
  const activeEmp = activeEmployments[0] || employments[0] || null;

  const totalBaseSalary = activeEmp ? activeEmp.baseSalary : 0;
  const totalFixedAllowance = activeEmp ? activeEmp.fixedAllowance : 0;
  const totalTakeHomePay = totalBaseSalary + totalFixedAllowance;

  // Global accumulated monthly salary for all active contracts
  const totalAccumulatedMonthlySalary = activeEmployments.reduce(
    (sum, e) => sum + e.baseSalary + e.fixedAllowance,
    0
  );

  const allTasks = employments.flatMap((e) => e.tasks);
  const pendingTasks = allTasks.filter((t) => t.status !== "DONE").length;
  const urgentTasks = allTasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE").length;

  const allPayrolls = employments.flatMap((e) => e.payrollRecords);
  const totalSyncedPayroll = allPayrolls
    .filter((p) => p.isSyncedToMoney)
    .reduce((acc, curr) => acc + curr.netSalary, 0);

  const totalPaidPayrollAllTime = allPayrolls.reduce((acc, curr) => acc + curr.netSalary, 0);

  return {
    hasActiveEmployment: !!activeEmp,
    activeEmploymentsCount: activeEmployments.length,
    totalEmploymentsCount: employments.length,
    companyName: activeEmp?.companyName || "-",
    role: activeEmp?.role || "-",
    payday: activeEmp?.payday || 25,
    totalBaseSalary,
    totalFixedAllowance,
    totalTakeHomePay,
    totalAccumulatedMonthlySalary,
    totalPaidPayrollAllTime,
    pendingTasks,
    urgentTasks,
    totalSyncedPayroll,
  };
}
