"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeSafeUrl } from "@/lib/security";
import {
  categorySchema,
  transactionSchema,
  CategoryFormInput,
  TransactionFormInput,
} from "@/lib/validations/money.schema";
import { getCurrentUserId } from "@/lib/user";

export { getCurrentUserId };

export interface StoredCategory {
  id: string;
  userId?: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  monthlyBudget: number | null;
}

export interface StoredTransaction {
  id: string;
  userId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  description: string;
  notes: string | null;
  sourceType: "MANUAL" | "EMPLOYMENT_PAYROLL" | "FREELANCE_MILESTONE" | "PROJECT_EXPENSE";
  categoryName: string;
  categoryColor: string;
}

export interface StoredReceivableItem {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  milestoneTitle: string;
  amount: number;
  dueDate: string | null;
  status: "INVOICED" | "OVERDUE";
  invoiceNumber: string | null;
}

const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  monthlyBudget: number | null;
}> = [
  { name: "Gaji Kantor", type: "INCOME", icon: "briefcase", color: "#22C55E", monthlyBudget: null },
  { name: "Termin Freelance", type: "INCOME", icon: "folder-git-2", color: "#3BF029", monthlyBudget: null },
  { name: "Makan & Minum", type: "EXPENSE", icon: "utensils", color: "#F97316", monthlyBudget: 3500000 },
  { name: "Transport & Bensin", type: "EXPENSE", icon: "car", color: "#3B82F6", monthlyBudget: 1200000 },
  { name: "Hosting & Tools", type: "EXPENSE", icon: "server", color: "#EC4899", monthlyBudget: 800000 },
  { name: "Belanja & Hiburan", type: "EXPENSE", icon: "shopping-bag", color: "#A855F7", monthlyBudget: 2000000 },
];

/**
 * Ensure default starter categories exist in the database for the user.
 */
export async function ensureDefaultCategories(userId: string): Promise<void> {
  const count = await prisma.category.count({ where: { userId } });
  if (count === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({
        userId,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        monthlyBudget: c.monthlyBudget,
      })),
    });
  }
}

/**
 * 1. Get Categories (Filtered by Multi-Tenant User)
 */
export async function getCategories(type?: "INCOME" | "EXPENSE"): Promise<StoredCategory[]> {
  const userId = await getCurrentUserId();
  await ensureDefaultCategories(userId);

  const categories = await prisma.category.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    type: c.type,
    icon: c.icon,
    color: c.color,
    monthlyBudget: c.monthlyBudget ? Number(c.monthlyBudget) : null,
  }));
}

/**
 * 2. Create Category
 */
export async function createCategory(formData: CategoryFormInput) {
  const userId = await getCurrentUserId();
  const validated = categorySchema.parse(formData);

  // Check if identical category already exists for this tenant to prevent unique constraint conflict
  const existing = await prisma.category.findFirst({
    where: {
      userId,
      name: { equals: validated.name, mode: "insensitive" },
      type: validated.type,
    },
  });

  if (existing) {
    return {
      success: true,
      data: {
        id: existing.id,
        userId: existing.userId,
        name: existing.name,
        type: existing.type,
        icon: existing.icon,
        color: existing.color,
        monthlyBudget: existing.monthlyBudget ? Number(existing.monthlyBudget) : null,
      },
    };
  }

  const created = await prisma.category.create({
    data: {
      userId,
      name: validated.name,
      type: validated.type,
      icon: validated.icon,
      color: validated.color,
      monthlyBudget: validated.monthlyBudget ? Number(validated.monthlyBudget) : null,
    },
  });

  revalidatePath("/money");
  revalidatePath("/money/budgets");
  return {
    success: true,
    data: {
      id: created.id,
      userId: created.userId,
      name: created.name,
      type: created.type,
      icon: created.icon,
      color: created.color,
      monthlyBudget: created.monthlyBudget ? Number(created.monthlyBudget) : null,
    },
  };
}

/**
 * 3. Get Transactions with Category Details
 */
export async function getTransactions(filters?: {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  limit?: number;
}): Promise<StoredTransaction[]> {
  const userId = await getCurrentUserId();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
    take: filters?.limit ?? 50,
  });

  return transactions.map((t) => ({
    id: t.id,
    userId: t.userId,
    categoryId: t.categoryId,
    type: t.type,
    amount: Number(t.amount),
    date: t.date,
    description: t.description,
    notes: t.notes,
    sourceType: t.sourceType,
    categoryName: t.category.name,
    categoryColor: t.category.color,
  }));
}

/**
 * 4. Create Transaction
 */
export async function createTransaction(formData: TransactionFormInput) {
  const userId = await getCurrentUserId();
  const validated = transactionSchema.parse(formData);

  // Validate categoryId belongs to user, fallback gracefully to prevent FK violation
  let targetCategoryId = validated.categoryId;
  const existingCategory = await prisma.category.findFirst({
    where: { id: targetCategoryId, userId },
  });

  if (!existingCategory) {
    await ensureDefaultCategories(userId);
    const fallbackCategory =
      (await prisma.category.findFirst({
        where: { userId, type: validated.type },
        orderBy: { createdAt: "asc" },
      })) ||
      (await prisma.category.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }));

    if (!fallbackCategory) {
      throw new Error("Kategori transaksi tidak ditemukan");
    }
    targetCategoryId = fallbackCategory.id;
  }

  // Verify multi-tenant ownership of optional linked foreign keys to prevent IDOR injection
  if (validated.employmentId) {
    const emp = await prisma.employment.findFirst({
      where: { id: validated.employmentId, userId },
      select: { id: true },
    });
    if (!emp) {
      throw new Error("Akses ditolak: Data pekerjaan tidak ditemukan atau bukan milik Anda");
    }
  }

  if (validated.projectId) {
    const proj = await prisma.freelanceProject.findFirst({
      where: { id: validated.projectId, userId },
      select: { id: true },
    });
    if (!proj) {
      throw new Error("Akses ditolak: Data proyek tidak ditemukan atau bukan milik Anda");
    }
  }

  if (validated.milestoneId) {
    const ms = await prisma.projectMilestone.findFirst({
      where: { id: validated.milestoneId, userId },
      select: { id: true },
    });
    if (!ms) {
      throw new Error("Akses ditolak: Data termin tidak ditemukan atau bukan milik Anda");
    }
  }

  const created = await prisma.transaction.create({
    data: {
      userId,
      categoryId: targetCategoryId,
      type: validated.type,
      amount: Number(validated.amount),
      date: new Date(validated.date),
      description: validated.description,
      notes: validated.notes ?? null,
      receiptUrl: sanitizeSafeUrl(validated.receiptUrl),
      sourceType: validated.sourceType,
      employmentId: validated.employmentId ?? null,
      projectId: validated.projectId ?? null,
      milestoneId: validated.milestoneId ?? null,
    },
    include: {
      category: true,
    },
  });

  revalidatePath("/money");
  revalidatePath("/");
  return {
    success: true,
    data: {
      id: created.id,
      userId: created.userId,
      categoryId: created.categoryId,
      type: created.type,
      amount: Number(created.amount),
      date: created.date,
      description: created.description,
      notes: created.notes,
      sourceType: created.sourceType,
      categoryName: created.category.name,
      categoryColor: created.category.color,
    },
  };
}

/**
 * 5. Delete Transaction
 */
export async function deleteTransaction(transactionId: string) {
  const userId = await getCurrentUserId();

  await prisma.transaction.deleteMany({
    where: {
      id: transactionId,
      userId,
    },
  });

  revalidatePath("/money");
  revalidatePath("/");
  return { success: true };
}

/**
 * 6. Get Cashflow & Money KPI Summary
 */
export async function getMoneySummary() {
  const userId = await getCurrentUserId();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  let totalBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpense = 0;

  // 1. All-time balance & monthly aggregations
  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
    select: { type: true, amount: true, date: true },
  });

  for (const t of allTransactions) {
    const amt = Number(t.amount);
    if (t.type === "INCOME") {
      totalBalance += amt;
    } else {
      totalBalance -= amt;
    }

    const txDate = new Date(t.date);
    if (txDate >= startOfMonth && txDate <= endOfMonth) {
      if (t.type === "INCOME") {
        monthlyIncome += amt;
      } else {
        monthlyExpense += amt;
      }
    }
  }

  // 2. Dynamic freelance receivables (INVOICED & OVERDUE milestones)
  const receivablesAgg = await prisma.projectMilestone.aggregate({
    where: { userId, status: { in: ["INVOICED", "OVERDUE"] } },
    _sum: { amount: true },
  });
  const totalReceivables = Number(receivablesAgg._sum.amount || 0);

  const netCashflow = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? ((netCashflow / monthlyIncome) * 100) : 0;

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netCashflow,
    savingsRate: Math.max(0, Math.min(100, parseFloat(savingsRate.toFixed(1)))),
    totalReceivables,
  };
}

/**
 * 7. Update Category
 */
export async function updateCategory(categoryId: string, formData: CategoryFormInput) {
  const userId = await getCurrentUserId();
  const validated = categorySchema.parse(formData);

  const updated = await prisma.category.update({
    where: { id: categoryId, userId },
    data: {
      name: validated.name,
      type: validated.type,
      icon: validated.icon,
      color: validated.color,
      monthlyBudget: validated.monthlyBudget ? Number(validated.monthlyBudget) : null,
    },
  });

  revalidatePath("/money");
  revalidatePath("/money/budgets");
  return { success: true, data: updated };
}

/**
 * 8. Delete Category
 */
export async function deleteCategory(categoryId: string) {
  const userId = await getCurrentUserId();

  await prisma.category.deleteMany({
    where: { id: categoryId, userId },
  });

  revalidatePath("/money");
  revalidatePath("/money/budgets");
  return { success: true };
}

/**
 * 9. Get Categories with Monthly Spent vs Budget Calculation
 */
export async function getCategoryBudgetsWithSpent() {
  const userId = await getCurrentUserId();
  const categories = await getCategories("EXPENSE");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const dbExpenses = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  const monthlyExpenses = dbExpenses.map((e) => ({
    categoryId: e.categoryId,
    amount: Number(e.amount),
  }));

  return categories.map((cat) => {
    const totalSpent = monthlyExpenses
      .filter((t) => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = cat.monthlyBudget || 0;
    const percentage = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
    const isOverBudget = budget > 0 && totalSpent > budget;
    const isNearLimit = budget > 0 && percentage >= 70 && !isOverBudget;

    return {
      ...cat,
      totalSpent,
      budget,
      percentage,
      status: isOverBudget ? ("OVER_BUDGET" as const) : isNearLimit ? ("WARNING" as const) : ("HEALTHY" as const),
      remaining: Math.max(0, budget - totalSpent),
    };
  });
}

/**
 * 10. Get Active Freelance Receivables (INVOICED or OVERDUE milestones)
 */
export async function getReceivables(): Promise<StoredReceivableItem[]> {
  const userId = await getCurrentUserId();

  const milestones = await prisma.projectMilestone.findMany({
    where: {
      userId,
      status: { in: ["INVOICED", "OVERDUE"] },
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return milestones.map((m) => ({
    id: m.id,
    projectId: m.projectId,
    projectTitle: m.project?.title || "Proyek Freelance",
    clientName: m.project?.client?.company || m.project?.client?.name || "Klien",
    milestoneTitle: m.title,
    amount: Number(m.amount),
    dueDate: m.dueDate ? m.dueDate.toISOString().split("T")[0] : null,
    status: (m.status === "OVERDUE" ? "OVERDUE" : "INVOICED") as "INVOICED" | "OVERDUE",
    invoiceNumber: m.invoiceNumber,
  }));
}

