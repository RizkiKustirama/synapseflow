"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  categorySchema,
  transactionSchema,
  CategoryFormInput,
  TransactionFormInput,
} from "@/lib/validations/money.schema";

// Multi-tenant user simulation (In production, replace with auth session)
const DEFAULT_USER_ID = "c0000000-0000-0000-0000-000000000001";

export async function getCurrentUserId(): Promise<string> {
  return DEFAULT_USER_ID;
}

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

// Default initial categories if DB empty
const INITIAL_CATEGORIES: StoredCategory[] = [
  { id: "c1111111-0000-0000-0000-000000000001", userId: DEFAULT_USER_ID, name: "Gaji Kantor", type: "INCOME", icon: "briefcase", color: "#22C55E", monthlyBudget: null },
  { id: "c1111111-0000-0000-0000-000000000002", userId: DEFAULT_USER_ID, name: "Termin Freelance", type: "INCOME", icon: "folder-git-2", color: "#3BF029", monthlyBudget: null },
  { id: "c1111111-0000-0000-0000-000000000003", userId: DEFAULT_USER_ID, name: "Makan & Minum", type: "EXPENSE", icon: "utensils", color: "#F97316", monthlyBudget: 3500000 },
  { id: "c1111111-0000-0000-0000-000000000004", userId: DEFAULT_USER_ID, name: "Transport & Bensin", type: "EXPENSE", icon: "car", color: "#3B82F6", monthlyBudget: 1200000 },
  { id: "c1111111-0000-0000-0000-000000000005", userId: DEFAULT_USER_ID, name: "Hosting & Tools", type: "EXPENSE", icon: "server", color: "#EC4899", monthlyBudget: 800000 },
  { id: "c1111111-0000-0000-0000-000000000006", userId: DEFAULT_USER_ID, name: "Belanja & Hiburan", type: "EXPENSE", icon: "shopping-bag", color: "#A855F7", monthlyBudget: 2000000 },
];

// Fallback in-memory store if database is offline or initializing
let mockTransactionsStore: StoredTransaction[] = [
  {
    id: "t1111111-0000-0000-0000-000000000001",
    userId: DEFAULT_USER_ID,
    categoryId: "c1111111-0000-0000-0000-000000000002",
    type: "INCOME",
    amount: 6000000,
    date: new Date("2026-10-12"),
    description: "DP 30% Termin Proyek E-Commerce",
    notes: "Client: PT Maju Bersama",
    sourceType: "FREELANCE_MILESTONE",
    categoryName: "Termin Freelance",
    categoryColor: "#3BF029",
  },
  {
    id: "t1111111-0000-0000-0000-000000000002",
    userId: DEFAULT_USER_ID,
    categoryId: "c1111111-0000-0000-0000-000000000005",
    type: "EXPENSE",
    amount: 450000,
    date: new Date("2026-10-10"),
    description: "Beli Domain & Cloudflare Pro",
    notes: "Tag: E-Commerce Redesign",
    sourceType: "PROJECT_EXPENSE",
    categoryName: "Hosting & Tools",
    categoryColor: "#EC4899",
  },
  {
    id: "t1111111-0000-0000-0000-000000000003",
    userId: DEFAULT_USER_ID,
    categoryId: "c1111111-0000-0000-0000-000000000003",
    type: "EXPENSE",
    amount: 85000,
    date: new Date("2026-10-09"),
    description: "Makan Siang & Kopi Tim",
    notes: null,
    sourceType: "MANUAL",
    categoryName: "Makan & Minum",
    categoryColor: "#F97316",
  },
  {
    id: "t1111111-0000-0000-0000-000000000004",
    userId: DEFAULT_USER_ID,
    categoryId: "c1111111-0000-0000-0000-000000000001",
    type: "INCOME",
    amount: 18500000,
    date: new Date("2026-09-25"),
    description: "Gaji Pokok Kantor Bulan September",
    notes: "PT Tech Innovasi Nusantara",
    sourceType: "EMPLOYMENT_PAYROLL",
    categoryName: "Gaji Kantor",
    categoryColor: "#22C55E",
  },
];

let mockCategoriesStore: StoredCategory[] = [...INITIAL_CATEGORIES];

/**
 * 1. Get Categories (Filtered by Multi-Tenant User)
 */
export async function getCategories(type?: "INCOME" | "EXPENSE"): Promise<StoredCategory[]> {
  const userId = await getCurrentUserId();
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { name: "asc" },
    });
    if (categories.length > 0) {
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
  } catch {
    // Graceful fallback to memory store
  }

  return mockCategoriesStore.filter((c) => (type ? c.type === type : true));
}

/**
 * 2. Create Category
 */
export async function createCategory(formData: CategoryFormInput) {
  const userId = await getCurrentUserId();
  const validated = categorySchema.parse(formData);

  try {
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
  } catch {
    const newCat: StoredCategory = {
      id: "c" + Date.now().toString(),
      userId,
      name: validated.name,
      type: validated.type,
      icon: validated.icon,
      color: validated.color,
      monthlyBudget: validated.monthlyBudget ?? null,
    };
    mockCategoriesStore.push(newCat);
    revalidatePath("/money");
    return { success: true, data: newCat };
  }
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

  try {
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

    if (transactions.length > 0) {
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
  } catch {
    // Fallback
  }

  let result = mockTransactionsStore.filter((t) => t.userId === userId);
  if (filters?.type) {
    result = result.filter((t) => t.type === filters.type);
  }
  if (filters?.categoryId) {
    result = result.filter((t) => t.categoryId === filters.categoryId);
  }
  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }
  return result;
}

/**
 * 4. Create Transaction
 */
export async function createTransaction(formData: TransactionFormInput) {
  const userId = await getCurrentUserId();
  const validated = transactionSchema.parse(formData);

  try {
    const created = await prisma.transaction.create({
      data: {
        userId,
        categoryId: validated.categoryId,
        type: validated.type,
        amount: Number(validated.amount),
        date: new Date(validated.date),
        description: validated.description,
        notes: validated.notes,
        receiptUrl: validated.receiptUrl,
        sourceType: validated.sourceType,
        employmentId: validated.employmentId,
        projectId: validated.projectId,
        milestoneId: validated.milestoneId,
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
  } catch {
    const cat = mockCategoriesStore.find((c) => c.id === validated.categoryId);
    const newTrx: StoredTransaction = {
      id: "t" + Date.now().toString(),
      userId,
      categoryId: validated.categoryId,
      type: validated.type,
      amount: Number(validated.amount),
      date: new Date(validated.date),
      description: validated.description,
      notes: validated.notes ?? null,
      sourceType: validated.sourceType,
      categoryName: cat?.name ?? "Lain-lain",
      categoryColor: cat?.color ?? "#3BF029",
    };
    mockTransactionsStore.unshift(newTrx);
    revalidatePath("/money");
    revalidatePath("/");
    return { success: true, data: newTrx };
  }
}

/**
 * 5. Delete Transaction
 */
export async function deleteTransaction(transactionId: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.transaction.deleteMany({
      where: {
        id: transactionId,
        userId, // Strictly enforce multi-tenant isolation
      },
    });
  } catch {
    mockTransactionsStore = mockTransactionsStore.filter(
      (t) => !(t.id === transactionId && t.userId === userId)
    );
  }

  revalidatePath("/money");
  revalidatePath("/");
  return { success: true };
}

/**
 * 6. Get Cashflow & Money KPI Summary
 */
export async function getMoneySummary() {
  const transactions = await getTransactions();

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  }

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netCashflow / totalIncome) * 100) : 0;
  const totalReceivables = 14500000; // Unpaid Invoiced freelance milestones

  return {
    totalBalance: 24850000 + netCashflow,
    monthlyIncome: totalIncome,
    monthlyExpense: totalExpense,
    netCashflow,
    savingsRate: Math.max(0, parseFloat(savingsRate.toFixed(1))),
    totalReceivables,
  };
}
