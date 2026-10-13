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
import { createTransaction, getCategories } from "@/actions/money.actions";

const DEFAULT_USER_ID = "c0000000-0000-0000-0000-000000000001";

export async function getCurrentUserId(): Promise<string> {
  return DEFAULT_USER_ID;
}

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

// Fallback in-memory store for employment
let mockEmploymentsStore: StoredEmployment[] = [
  {
    id: "emp-001",
    userId: DEFAULT_USER_ID,
    jobApplicationId: null,
    companyName: "PT Tech Innovasi Nusantara",
    role: "Senior Fullstack Engineer",
    jobType: "FULL_TIME",
    status: "ACTIVE",
    payday: 25,
    baseSalary: 18500000,
    fixedAllowance: 2500000,
    startDate: "2024-01-15",
    endDate: null,
    tasks: [
      {
        id: "task-001",
        employmentId: "emp-001",
        title: "Revamp Payment Gateway Checkout Flow",
        description: "Integrasi Midtrans QRIS dynamic dan optimasi callback webhook idempotency.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2026-10-18",
        createdAt: "2026-10-10T08:00:00Z",
      },
      {
        id: "task-002",
        employmentId: "emp-001",
        title: "Refactor Auth Middleware ke Edge Functions",
        description: "Migrasi validasi session cookie ke Next.js middleware edge runtime untuk latency di bawah 20ms.",
        status: "TODO",
        priority: "URGENT",
        dueDate: "2026-10-20",
        createdAt: "2026-10-12T09:30:00Z",
      },
      {
        id: "task-003",
        employmentId: "emp-001",
        title: "Dokumentasi API Internal & OpenAPI Specs",
        description: "Generate Swagger OpenAPI 3.0 specs untuk modul auth dan billing.",
        status: "DONE",
        priority: "MEDIUM",
        dueDate: "2026-10-11",
        createdAt: "2026-10-05T10:00:00Z",
      },
      {
        id: "task-004",
        employmentId: "emp-001",
        title: "Investigasi Memory Leak di Background Worker",
        description: "Menunggu log tracing Jaeger dari tim DevOps sebelum profiling heap snapshot.",
        status: "BLOCKED",
        priority: "HIGH",
        dueDate: "2026-10-19",
        createdAt: "2026-10-11T14:15:00Z",
      },
    ],
    payrollRecords: [
      {
        id: "pay-001",
        employmentId: "emp-001",
        periodMonth: 9,
        periodYear: 2026,
        baseSalary: 18500000,
        allowance: 2500000,
        incentiveBonus: 1000000,
        deductions: 500000,
        netSalary: 21500000,
        payslipUrl: "https://storage.synapseflow.app/payslips/2026-09.pdf",
        isSyncedToMoney: true,
        syncedTransactionId: "trx-pay-001",
        paidAt: "2026-09-25",
      },
      {
        id: "pay-002",
        employmentId: "emp-001",
        periodMonth: 8,
        periodYear: 2026,
        baseSalary: 18500000,
        allowance: 2500000,
        incentiveBonus: 0,
        deductions: 500000,
        netSalary: 20500000,
        payslipUrl: "https://storage.synapseflow.app/payslips/2026-08.pdf",
        isSyncedToMoney: true,
        syncedTransactionId: "trx-pay-002",
        paidAt: "2026-08-25",
      },
    ],
  },
];

/**
 * 1. Get All Employments
 */
export async function getEmployments(): Promise<StoredEmployment[]> {
  const userId = await getCurrentUserId();

  try {
    const list = await prisma.employment.findMany({
      where: { userId },
      include: {
        tasks: { orderBy: { createdAt: "desc" } },
        payrollRecords: { orderBy: { periodYear: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (list.length > 0) {
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
  } catch {
    // Database offline fallback
  }

  return mockEmploymentsStore.filter((e) => e.userId === userId);
}

/**
 * 2. Get Primary Active Employment
 */
export async function getActiveEmployment(): Promise<StoredEmployment | null> {
  const list = await getEmployments();
  return list.find((e) => e.status === "ACTIVE") || list[0] || null;
}

/**
 * 3. Create Employment
 */
export async function createEmployment(formData: EmploymentFormInput) {
  const userId = await getCurrentUserId();
  const validated = employmentSchema.parse(formData);

  try {
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
  } catch {
    const newEmp: StoredEmployment = {
      id: "emp-" + Date.now().toString(),
      userId,
      jobApplicationId: validated.jobApplicationId,
      companyName: validated.companyName,
      role: validated.role,
      jobType: validated.jobType,
      status: validated.status,
      payday: validated.payday,
      baseSalary: validated.baseSalary,
      fixedAllowance: validated.fixedAllowance,
      startDate: typeof validated.startDate === "string" ? validated.startDate : validated.startDate.toISOString().split("T")[0],
      endDate: validated.endDate ? (typeof validated.endDate === "string" ? validated.endDate : validated.endDate.toISOString().split("T")[0]) : null,
      tasks: [],
      payrollRecords: [],
    };
    mockEmploymentsStore.unshift(newEmp);
    revalidatePath("/employment");
    revalidatePath("/");
    return { success: true, data: newEmp };
  }
}

/**
 * 4. Update Employment
 */
export async function updateEmployment(
  id: string,
  formData: Partial<EmploymentFormInput>
) {
  const userId = await getCurrentUserId();

  try {
    const updated = await prisma.employment.update({
      where: { id },
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
  } catch {
    const idx = mockEmploymentsStore.findIndex((e) => e.id === id && e.userId === userId);
    if (idx !== -1) {
      mockEmploymentsStore[idx] = {
        ...mockEmploymentsStore[idx],
        ...formData,
      } as StoredEmployment;
    }
    revalidatePath("/employment");
    revalidatePath("/");
    return { success: true };
  }
}

/**
 * 5. Delete Employment
 */
export async function deleteEmployment(id: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.employment.deleteMany({
      where: { id, userId },
    });
    revalidatePath("/employment");
    revalidatePath("/");
    return { success: true };
  } catch {
    mockEmploymentsStore = mockEmploymentsStore.filter(
      (e) => !(e.id === id && e.userId === userId)
    );
    revalidatePath("/employment");
    revalidatePath("/");
    return { success: true };
  }
}

/**
 * 6. Create Employment Task
 */
export async function createEmploymentTask(formData: EmploymentTaskFormInput) {
  const validated = employmentTaskSchema.parse(formData);

  try {
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
  } catch {
    const newTask: StoredEmploymentTask = {
      id: "task-" + Date.now().toString(),
      employmentId: validated.employmentId,
      title: validated.title,
      description: validated.description,
      status: validated.status,
      priority: validated.priority,
      dueDate: validated.dueDate ? (typeof validated.dueDate === "string" ? validated.dueDate : validated.dueDate.toISOString().split("T")[0]) : null,
      createdAt: new Date().toISOString(),
    };

    const emp = mockEmploymentsStore.find((e) => e.id === validated.employmentId);
    if (emp) {
      emp.tasks.unshift(newTask);
    }
    revalidatePath("/employment");
    return { success: true, data: newTask };
  }
}

/**
 * 7. Update Task Status
 */
export async function updateTaskStatus(
  taskId: string,
  status: StoredEmploymentTask["status"],
  employmentId: string
) {
  try {
    await prisma.employmentTask.update({
      where: { id: taskId },
      data: { status },
    });
    revalidatePath("/employment");
    return { success: true };
  } catch {
    const emp = mockEmploymentsStore.find((e) => e.id === employmentId);
    if (emp) {
      const task = emp.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
      }
    }
    revalidatePath("/employment");
    return { success: true };
  }
}

/**
 * 8. Delete Task
 */
export async function deleteEmploymentTask(taskId: string, employmentId: string) {
  try {
    await prisma.employmentTask.delete({
      where: { id: taskId },
    });
    revalidatePath("/employment");
    return { success: true };
  } catch {
    const emp = mockEmploymentsStore.find((e) => e.id === employmentId);
    if (emp) {
      emp.tasks = emp.tasks.filter((t) => t.id !== taskId);
    }
    revalidatePath("/employment");
    return { success: true };
  }
}

/**
 * 9. Create Payroll Record
 */
export async function createPayrollRecord(formData: PayrollRecordFormInput) {
  const validated = payrollRecordSchema.parse(formData);
  const netSalary =
    validated.baseSalary +
    validated.allowance +
    validated.incentiveBonus -
    validated.deductions;

  try {
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
  } catch {
    const newRecord: StoredPayrollRecord = {
      id: "pay-" + Date.now().toString(),
      employmentId: validated.employmentId,
      periodMonth: validated.periodMonth,
      periodYear: validated.periodYear,
      baseSalary: validated.baseSalary,
      allowance: validated.allowance,
      incentiveBonus: validated.incentiveBonus,
      deductions: validated.deductions,
      netSalary,
      payslipUrl: validated.payslipUrl,
      isSyncedToMoney: false,
      syncedTransactionId: null,
      paidAt: typeof validated.paidAt === "string" ? validated.paidAt : validated.paidAt.toISOString().split("T")[0],
    };

    const emp = mockEmploymentsStore.find((e) => e.id === validated.employmentId);
    if (emp) {
      emp.payrollRecords.unshift(newRecord);
    }
    revalidatePath("/employment");
    return { success: true, data: newRecord };
  }
}

/**
 * 10. Interconnection Action: 1-Click Sync Payroll Slip to Money Module
 */
export async function syncPayrollToMoney(payrollId: string, employmentId: string) {
  try {
    // 1. Locate the payroll record
    const emp = (await getEmployments()).find((e) => e.id === employmentId);
    if (!emp) throw new Error("Profil pekerjaan tidak ditemukan");

    const record = emp.payrollRecords.find((p) => p.id === payrollId);
    if (!record) throw new Error("Slip gaji tidak ditemukan");
    if (record.isSyncedToMoney) {
      return { success: true, message: "Slip gaji sudah tersinkronkan sebelumnya" };
    }

    // 2. Find Gaji Kantor category in Money module
    const categories = await getCategories("INCOME");
    const salaryCat =
      categories.find((c) => c.name.toLowerCase().includes("gaji")) ||
      categories[0];

    if (!salaryCat) throw new Error("Kategori pemasukan Gaji belum tersedia");

    // 3. Create Transaction in Money ledger
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const monthLabel = monthNames[record.periodMonth - 1] || `Bulan ${record.periodMonth}`;

    const trxResult = await createTransaction({
      categoryId: salaryCat.id,
      type: "INCOME",
      amount: record.netSalary,
      date: new Date(record.paidAt).toISOString(),
      description: `Gaji Kantor - ${emp.companyName} (${monthLabel} ${record.periodYear})`,
      notes: `Auto-synced from Employment #${emp.id}. Rincian: Pokok Rp ${record.baseSalary.toLocaleString("id-ID")}, Tunjangan Rp ${record.allowance.toLocaleString("id-ID")}, Bonus Rp ${record.incentiveBonus.toLocaleString("id-ID")}, Potongan Rp ${record.deductions.toLocaleString("id-ID")}.`,
      sourceType: "EMPLOYMENT_PAYROLL",
      employmentId: emp.id,
    });

    const trxId = trxResult?.data?.id || "trx-" + Date.now().toString();

    // 4. Update PayrollRecord in DB or fallback store
    try {
      await prisma.payrollRecord.update({
        where: { id: payrollId },
        data: {
          transactionId: trxId,
        },
      });
    } catch {
      const mockEmp = mockEmploymentsStore.find((e) => e.id === employmentId);
      if (mockEmp) {
        const mockRec = mockEmp.payrollRecords.find((p) => p.id === payrollId);
        if (mockRec) {
          mockRec.isSyncedToMoney = true;
          mockRec.syncedTransactionId = trxId;
        }
      }
    }

    revalidatePath("/employment");
    revalidatePath("/money");
    revalidatePath("/");
    return { success: true, transactionId: trxId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal sinkronisasi gaji";
    return { success: false, error: msg };
  }
}

/**
 * 11. Get Employment Summary Stats
 */
export async function getEmploymentSummary() {
  const employments = await getEmployments();
  const activeEmp = employments.find((e) => e.status === "ACTIVE") || employments[0] || null;

  const totalBaseSalary = activeEmp ? activeEmp.baseSalary : 0;
  const totalFixedAllowance = activeEmp ? activeEmp.fixedAllowance : 0;
  const totalTakeHomePay = totalBaseSalary + totalFixedAllowance;

  const allTasks = employments.flatMap((e) => e.tasks);
  const pendingTasks = allTasks.filter((t) => t.status !== "DONE").length;
  const urgentTasks = allTasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE").length;

  const allPayrolls = employments.flatMap((e) => e.payrollRecords);
  const totalSyncedPayroll = allPayrolls
    .filter((p) => p.isSyncedToMoney)
    .reduce((acc, curr) => acc + curr.netSalary, 0);

  return {
    hasActiveEmployment: !!activeEmp,
    companyName: activeEmp?.companyName || "-",
    role: activeEmp?.role || "-",
    payday: activeEmp?.payday || 25,
    totalBaseSalary,
    totalFixedAllowance,
    totalTakeHomePay,
    pendingTasks,
    urgentTasks,
    totalSyncedPayroll,
  };
}
