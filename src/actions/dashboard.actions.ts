"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { getDaysUntilPayday } from "@/lib/utils";

export interface CashflowHistoryPoint {
  month: string;
  monthIndex: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export interface RevenueStreamItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface DashboardTaskItem {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  companyName: string;
}

export interface DashboardInterviewItem {
  id: string;
  roundName: string;
  scheduledAt: string;
  meetingLink: string | null;
  companyName: string;
  position: string;
}

export interface DashboardDeliverableItem {
  id: string;
  title: string;
  projectName: string;
  clientName: string;
  amount: number;
  status: "DRAFT" | "INVOICED" | "PAID" | "OVERDUE";
  dueDate: string | null;
}

export interface ExecutiveDashboardData {
  user: {
    name: string;
    email: string;
  };
  metrics: {
    totalLiquidCash: number;
    currentMonthIncome: number;
    currentMonthExpense: number;
    netCashflow: number;
    savingsRate: number;
    freelanceReceivables: number;
    nextPayday: {
      companyName: string | null;
      role: string | null;
      baseSalary: number;
      payday: number;
      daysRemaining: number;
    };
  };
  cashflowHistory: CashflowHistoryPoint[];
  revenueStreams: RevenueStreamItem[];
  fourPillars: {
    career: {
      totalApplications: number;
      activeInterviews: number;
      topTarget: string | null;
    };
    employment: {
      hasActive: boolean;
      companyName: string | null;
      role: string | null;
      baseSalary: number;
      pendingTasksCount: number;
    };
    freelance: {
      activeProjectsCount: number;
      totalBudget: number;
      unpaidReceivables: number;
      netMarginAvg: number;
    };
    money: {
      transactionCountThisMonth: number;
      totalIncomeMonth: number;
      totalExpenseMonth: number;
    };
  };
  todaysTasks: DashboardTaskItem[];
  upcomingInterviews: DashboardInterviewItem[];
  activeDeliverables: DashboardDeliverableItem[];
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    sourceType: "MANUAL" | "EMPLOYMENT_PAYROLL" | "FREELANCE_MILESTONE" | "PROJECT_EXPENSE";
    categoryName: string;
    categoryColor: string;
    date: string;
  }>;
}

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// In-memory deduplication cache to avoid parallel double-queries between DashboardPage and RightPanel
let dashboardCache: { userId: string; timestamp: number; data: ExecutiveDashboardData } | null = null;
const CACHE_TTL_MS = 5000;

export async function getExecutiveDashboardData(): Promise<ExecutiveDashboardData> {
  const userId = await getCurrentUserId();
  const nowMs = Date.now();

  if (
    dashboardCache &&
    dashboardCache.userId === userId &&
    nowMs - dashboardCache.timestamp < CACHE_TTL_MS
  ) {
    return dashboardCache.data;
  }

  // 1. Fetch User
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true },
  });

  if (!user) {
    user = { fullName: "Alex Pratama", email: "alex@synapseflow.internal" };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 - 11

  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  // 2. Fetch All Transactions for Cashflow Metrics & Recharts
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      category: { select: { name: true, color: true } },
    },
    orderBy: { date: "desc" },
  });

  // Calculate Liquid Cash & Current Month Figures
  let totalLiquidCash = 0;
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;
  let currentMonthTxCount = 0;

  // Revenue Stream aggregators for current year/month
  let salaryIncome = 0;
  let freelanceIncome = 0;
  let otherIncome = 0;

  // Monthly buckets for the past 6 months
  const sixMonthsMap: Record<string, { income: number; expense: number; monthName: string; monthIndex: number; year: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    sixMonthsMap[key] = {
      income: 0,
      expense: 0,
      monthName: MONTH_NAMES_SHORT[d.getMonth()],
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
    };
  }

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    const txDate = new Date(tx.date);

    if (tx.type === "INCOME") {
      totalLiquidCash += amount;
    } else {
      totalLiquidCash -= amount;
    }

    // Check if in current month
    if (txDate >= startOfCurrentMonth && txDate <= endOfCurrentMonth) {
      currentMonthTxCount++;
      if (tx.type === "INCOME") {
        currentMonthIncome += amount;

        if (tx.sourceType === "EMPLOYMENT_PAYROLL") {
          salaryIncome += amount;
        } else if (tx.sourceType === "FREELANCE_MILESTONE") {
          freelanceIncome += amount;
        } else {
          otherIncome += amount;
        }
      } else {
        currentMonthExpense += amount;
      }
    }

    // Place into 6-month historical bucket
    const monthKey = `${txDate.getFullYear()}-${txDate.getMonth()}`;
    if (sixMonthsMap[monthKey]) {
      if (tx.type === "INCOME") {
        sixMonthsMap[monthKey].income += amount;
      } else {
        sixMonthsMap[monthKey].expense += amount;
      }
    }
  }

  const netCashflow = currentMonthIncome - currentMonthExpense;
  const savingsRate = currentMonthIncome > 0
    ? Math.max(0, Math.min(100, Math.round(((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100)))
    : 0;

  const cashflowHistory: CashflowHistoryPoint[] = Object.values(sixMonthsMap).map((item) => ({
    month: item.monthName,
    monthIndex: item.monthIndex,
    year: item.year,
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense,
  }));

  // Revenue stream distribution
  const totalIncomeRecorded = salaryIncome + freelanceIncome + otherIncome;
  const revenueStreams: RevenueStreamItem[] = [
    {
      name: "Gaji Kantor",
      value: salaryIncome,
      color: "#22C55E",
      percentage: totalIncomeRecorded > 0 ? Math.round((salaryIncome / totalIncomeRecorded) * 100) : 0,
    },
    {
      name: "Termin Freelance",
      value: freelanceIncome,
      color: "#3BF029",
      percentage: totalIncomeRecorded > 0 ? Math.round((freelanceIncome / totalIncomeRecorded) * 100) : 0,
    },
    {
      name: "Kasual / Lain-lain",
      value: otherIncome,
      color: "#38BDF8",
      percentage: totalIncomeRecorded > 0 ? Math.round((otherIncome / totalIncomeRecorded) * 100) : 0,
    },
  ];

  // 3. Fetch Employment & Tasks
  const activeEmployment = await prisma.employment.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      tasks: {
        where: { status: { not: "DONE" } },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
    },
  });

  const allPendingTasksCount = activeEmployment
    ? await prisma.employmentTask.count({
        where: { employmentId: activeEmployment.id, status: { not: "DONE" } },
      })
    : 0;

  const paydayNumber = activeEmployment?.payday || 25;
  const { daysRemaining } = getDaysUntilPayday(paydayNumber);

  const todaysTasks: DashboardTaskItem[] = activeEmployment?.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE",
    priority: t.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : null,
    companyName: activeEmployment.companyName,
  })) || [];

  // 4. Fetch Career Applications & Upcoming Interviews
  const [totalApplications, interviewLogs] = await Promise.all([
    prisma.jobApplication.count({ where: { userId } }),
    prisma.jobInterviewLog.findMany({
      where: {
        application: { userId },
        scheduledAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // from yesterday onwards
      },
      include: {
        application: { select: { companyName: true, position: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 4,
    }),
  ]);

  const upcomingInterviews: DashboardInterviewItem[] = interviewLogs.map((log) => ({
    id: log.id,
    roundName: log.roundName,
    scheduledAt: log.scheduledAt.toISOString(),
    meetingLink: log.meetingLink,
    companyName: log.application.companyName,
    position: log.application.position,
  }));

  const activeInterviewsCount = await prisma.jobApplication.count({
    where: { userId, status: { in: ["INTERVIEW", "TECH_TEST", "SCREENING"] } },
  });

  const latestJobTarget = await prisma.jobApplication.findFirst({
    where: { userId, status: { in: ["INTERVIEW", "OFFERING", "APPLIED"] } },
    orderBy: { updatedAt: "desc" },
    select: { companyName: true, position: true },
  });

  // 5. Fetch Freelance Projects, Milestones & Receivables
  const [activeProjects, invoicedMilestones] = await Promise.all([
    prisma.freelanceProject.findMany({
      where: { userId, status: { in: ["IN_PROGRESS", "REVIEW", "PROSPECT"] } },
      include: {
        client: { select: { name: true, company: true } },
        milestones: true,
      },
      orderBy: { deadline: "asc" },
    }),
    prisma.projectMilestone.findMany({
      where: { userId, status: "INVOICED" },
      include: {
        project: {
          select: {
            title: true,
            client: { select: { name: true, company: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  let freelanceReceivables = 0;
  for (const m of invoicedMilestones) {
    freelanceReceivables += Number(m.amount);
  }

  let totalBudgetActiveProjects = 0;
  for (const p of activeProjects) {
    totalBudgetActiveProjects += Number(p.totalBudget);
  }

  const activeDeliverables: DashboardDeliverableItem[] = invoicedMilestones.slice(0, 5).map((m) => ({
    id: m.id,
    title: m.title,
    projectName: m.project.title,
    clientName: m.project.client?.company || m.project.client?.name || "Klien Mandiri",
    amount: Number(m.amount),
    status: m.status as "DRAFT" | "INVOICED" | "PAID" | "OVERDUE",
    dueDate: m.dueDate ? m.dueDate.toISOString().split("T")[0] : null,
  }));

  // If no invoiced milestones, pick from active project milestones
  if (activeDeliverables.length === 0) {
    for (const p of activeProjects) {
      for (const m of p.milestones) {
        if (m.status !== "PAID" && activeDeliverables.length < 5) {
          activeDeliverables.push({
            id: m.id,
            title: m.title,
            projectName: p.title,
            clientName: p.client?.company || p.client?.name || "Klien Mandiri",
            amount: Number(m.amount),
            status: m.status as "DRAFT" | "INVOICED" | "PAID" | "OVERDUE",
            dueDate: m.dueDate ? m.dueDate.toISOString().split("T")[0] : null,
          });
        }
      }
    }
  }

  // 6. Recent Transactions preview (Top 4)
  const recentTransactions = transactions.slice(0, 4).map((tx) => ({
    id: tx.id,
    description: tx.description,
    amount: Number(tx.amount),
    type: tx.type as "INCOME" | "EXPENSE",
    sourceType: tx.sourceType as "MANUAL" | "EMPLOYMENT_PAYROLL" | "FREELANCE_MILESTONE" | "PROJECT_EXPENSE",
    categoryName: tx.category.name,
    categoryColor: tx.category.color,
    date: tx.date.toISOString().split("T")[0],
  }));

  // Dynamic freelance net profit margin
  let totalPaidMilestoneRevenue = 0;
  for (const p of activeProjects) {
    for (const m of p.milestones) {
      if (m.status === "PAID") {
        totalPaidMilestoneRevenue += Number(m.amount);
      }
    }
  }

  const projectExpensesAgg = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      projectId: { in: activeProjects.map((p) => p.id) },
    },
    _sum: { amount: true },
  });
  const totalProjectExpenses = Number(projectExpensesAgg._sum.amount || 0);

  const dynamicNetMarginAvg =
    totalPaidMilestoneRevenue > 0
      ? Math.max(0, Math.round(((totalPaidMilestoneRevenue - totalProjectExpenses) / totalPaidMilestoneRevenue) * 100))
      : 0;

  const result: ExecutiveDashboardData = {
    user: {
      name: user.fullName || "Pengguna",
      email: user.email,
    },
    metrics: {
      totalLiquidCash,
      currentMonthIncome,
      currentMonthExpense,
      netCashflow,
      savingsRate,
      freelanceReceivables,
      nextPayday: {
        companyName: activeEmployment?.companyName || null,
        role: activeEmployment?.role || null,
        baseSalary: Number(activeEmployment?.baseSalary || 0),
        payday: paydayNumber,
        daysRemaining,
      },
    },
    cashflowHistory,
    revenueStreams,
    fourPillars: {
      career: {
        totalApplications,
        activeInterviews: activeInterviewsCount,
        topTarget: latestJobTarget ? `${latestJobTarget.position} @ ${latestJobTarget.companyName}` : null,
      },
      employment: {
        hasActive: !!activeEmployment,
        companyName: activeEmployment?.companyName || null,
        role: activeEmployment?.role || null,
        baseSalary: Number(activeEmployment?.baseSalary || 0),
        pendingTasksCount: allPendingTasksCount,
      },
      freelance: {
        activeProjectsCount: activeProjects.length,
        totalBudget: totalBudgetActiveProjects,
        unpaidReceivables: freelanceReceivables,
        netMarginAvg: dynamicNetMarginAvg,
      },
      money: {
        transactionCountThisMonth: currentMonthTxCount,
        totalIncomeMonth: currentMonthIncome,
        totalExpenseMonth: currentMonthExpense,
      },
    },
    todaysTasks,
    upcomingInterviews,
    activeDeliverables,
    recentTransactions,
  };

  dashboardCache = { userId, timestamp: Date.now(), data: result };
  return result;
}

export async function toggleDashboardTaskStatus(taskId: string, currentStatus: string) {
  const userId = await getCurrentUserId();
  const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

  // Invalidate cache immediately on update
  dashboardCache = null;

  await prisma.employmentTask.updateMany({
    where: {
      id: taskId,
      employment: { userId },
    },
    data: { status: newStatus },
  });

  revalidatePath("/");
  revalidatePath("/employment");
  return { success: true, newStatus };
}
