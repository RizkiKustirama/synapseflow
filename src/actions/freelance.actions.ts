"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  clientSchema,
  freelanceProjectSchema,
  projectMilestoneSchema,
  projectExpenseSchema,
  ClientFormInput,
  FreelanceProjectFormInput,
  ProjectMilestoneFormInput,
  ProjectExpenseFormInput,
} from "@/lib/validations/freelance.schema";
import { createTransaction, getCategories } from "@/actions/money.actions";
import { getCurrentUserId } from "@/lib/user";

export { getCurrentUserId };

export interface StoredClient {
  id: string;
  userId: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  projectCount?: number;
}

export interface StoredMilestone {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  amount: number;
  status: "DRAFT" | "INVOICED" | "PAID" | "OVERDUE";
  invoiceNumber?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
}

export interface StoredProjectExpense {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  categoryName?: string;
}

export interface StoredFreelanceProject {
  id: string;
  userId: string;
  clientId?: string | null;
  clientName?: string | null;
  clientCompany?: string | null;
  title: string;
  description?: string | null;
  status: "PROSPECT" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "CANCELLED";
  totalBudget: number;
  startDate?: string | null;
  deadline?: string | null;
  milestones: StoredMilestone[];
  expenses: StoredProjectExpense[];
  paidRevenue: number;
  invoicedReceivables: number;
  totalExpenses: number;
  netProfitMargin: number;
  marginPercentage: number;
}

/**
 * Helper to compute financial metrics for a project
 */
function computeProjectMetrics(
  milestones: StoredMilestone[],
  expenses: StoredProjectExpense[]
) {
  const paidRevenue = milestones
    .filter((m) => m.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const invoicedReceivables = milestones
    .filter((m) => m.status === "INVOICED" || m.status === "OVERDUE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfitMargin = paidRevenue - totalExpenses;
  const marginPercentage =
    paidRevenue > 0 ? Math.round((netProfitMargin / paidRevenue) * 1000) / 10 : 0;

  return {
    paidRevenue,
    invoicedReceivables,
    totalExpenses,
    netProfitMargin,
    marginPercentage,
  };
}

/**
 * 1. Get All Clients
 */
export async function getClients(): Promise<StoredClient[]> {
  const userId = await getCurrentUserId();

  const clients = await prisma.client.findMany({
    where: { userId },
    include: {
      projects: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return clients.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    notes: c.notes,
    projectCount: c.projects.length,
  }));
}

/**
 * 2. Create Client
 */
export async function createClient(formData: ClientFormInput) {
  const userId = await getCurrentUserId();
  const validated = clientSchema.parse(formData);

  const created = await prisma.client.create({
    data: {
      userId,
      name: validated.name,
      company: validated.company ?? null,
      email: validated.email ?? null,
      phone: validated.phone ?? null,
      notes: validated.notes ?? null,
    },
  });

  revalidatePath("/freelance");
  return { success: true, data: created };
}

/**
 * 3. Update Client
 */
export async function updateClient(
  id: string,
  formData: Partial<ClientFormInput>
) {
  const userId = await getCurrentUserId();

  const updated = await prisma.client.update({
    where: { id, userId },
    data: {
      ...(formData.name ? { name: formData.name } : {}),
      ...(formData.company !== undefined ? { company: formData.company } : {}),
      ...(formData.email !== undefined ? { email: formData.email } : {}),
      ...(formData.phone !== undefined ? { phone: formData.phone } : {}),
      ...(formData.notes !== undefined ? { notes: formData.notes } : {}),
    },
  });

  revalidatePath("/freelance");
  return { success: true, data: updated };
}

/**
 * 4. Delete Client
 */
export async function deleteClient(id: string) {
  const userId = await getCurrentUserId();

  await prisma.client.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/freelance");
  return { success: true };
}

/**
 * 5. Get All Freelance Projects
 */
export async function getFreelanceProjects(): Promise<StoredFreelanceProject[]> {
  const userId = await getCurrentUserId();

  const projects = await prisma.freelanceProject.findMany({
    where: { userId },
    include: {
      client: true,
      milestones: { orderBy: { createdAt: "asc" } },
      transactions: {
        where: { type: "EXPENSE" },
        include: { category: true },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((p) => {
    const milestones: StoredMilestone[] = p.milestones.map((m) => ({
      id: m.id,
      userId: m.userId,
      projectId: m.projectId,
      title: m.title,
      amount: Number(m.amount),
      status: m.status,
      invoiceNumber: m.invoiceNumber,
      dueDate: m.dueDate ? m.dueDate.toISOString().split("T")[0] : null,
      paidDate: m.paidDate ? m.paidDate.toISOString().split("T")[0] : null,
    }));

    const expenses: StoredProjectExpense[] = p.transactions.map((t) => ({
      id: t.id,
      projectId: p.id,
      amount: Number(t.amount),
      description: t.description,
      date: t.date.toISOString().split("T")[0],
      categoryName: t.category.name,
    }));

    const financial = computeProjectMetrics(milestones, expenses);

    return {
      id: p.id,
      userId: p.userId,
      clientId: p.clientId,
      clientName: p.client?.name ?? null,
      clientCompany: p.client?.company ?? null,
      title: p.title,
      description: p.description,
      status: p.status,
      totalBudget: Number(p.totalBudget),
      startDate: p.startDate ? p.startDate.toISOString().split("T")[0] : null,
      deadline: p.deadline ? p.deadline.toISOString().split("T")[0] : null,
      milestones,
      expenses,
      ...financial,
    };
  });
}

/**
 * 6. Create Freelance Project
 */
export async function createProject(formData: FreelanceProjectFormInput) {
  const userId = await getCurrentUserId();
  const validated = freelanceProjectSchema.parse(formData);

  const created = await prisma.freelanceProject.create({
    data: {
      userId,
      clientId: validated.clientId ? validated.clientId : null,
      title: validated.title,
      description: validated.description ?? null,
      status: validated.status,
      totalBudget: validated.totalBudget,
      startDate: validated.startDate ? new Date(validated.startDate) : null,
      deadline: validated.deadline ? new Date(validated.deadline) : null,
    },
    include: { client: true },
  });

  revalidatePath("/freelance");
  return { success: true, data: created };
}

/**
 * 7. Update Project Status (Kanban Stage / Edit)
 */
export async function updateProjectStatus(
  id: string,
  newStatus: StoredFreelanceProject["status"]
) {
  const userId = await getCurrentUserId();

  await prisma.freelanceProject.updateMany({
    where: { id, userId },
    data: { status: newStatus },
  });

  revalidatePath("/freelance");
  return { success: true };
}

/**
 * 8. Delete Freelance Project
 */
export async function deleteProject(id: string) {
  const userId = await getCurrentUserId();

  await prisma.freelanceProject.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/freelance");
  return { success: true };
}

/**
 * 9. Create Project Milestone (Termin)
 */
export async function createMilestone(formData: ProjectMilestoneFormInput) {
  const userId = await getCurrentUserId();
  const validated = projectMilestoneSchema.parse(formData);

  // Enforce ownership: Verify project belongs to current user
  const project = await prisma.freelanceProject.findFirst({
    where: { id: validated.projectId, userId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Akses ditolak: Proyek tidak ditemukan atau bukan milik Anda");
  }

  const created = await prisma.projectMilestone.create({
    data: {
      userId,
      projectId: validated.projectId,
      title: validated.title,
      amount: validated.amount,
      status: validated.status,
      invoiceNumber: validated.invoiceNumber ?? null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      paidDate: validated.paidDate ? new Date(validated.paidDate) : null,
    },
  });

  revalidatePath("/freelance");
  return { success: true, data: created };
}

/**
 * 10. Update Milestone Status & 1-Click Sync to Money when PAID (Idempotent)
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  newStatus: StoredMilestone["status"],
  projectId: string
) {
  const userId = await getCurrentUserId();

  const isPaid = newStatus === "PAID";
  const paidDate = isPaid ? new Date() : null;

  let transactionId: string | undefined = undefined;

  if (isPaid) {
    // Idempotency check: verify if a transaction is already linked to this milestone
    const existingTx = await prisma.transaction.findFirst({
      where: { milestoneId, userId },
    });

    if (existingTx) {
      transactionId = existingTx.id;
    } else {
      const project = await prisma.freelanceProject.findFirst({
        where: { id: projectId, userId },
        select: { title: true },
      });
      const milestone = await prisma.projectMilestone.findFirst({
        where: { id: milestoneId, userId },
      });

      if (milestone) {
        const categories = await getCategories("INCOME");
        const freelanceCat =
          categories.find((c) => c.name.toLowerCase().includes("freelance")) ||
          categories[0];

        if (freelanceCat) {
          const trx = await createTransaction({
            categoryId: freelanceCat.id,
            type: "INCOME",
            amount: Number(milestone.amount),
            date: new Date().toISOString(),
            description: `Pelunasan Termin - ${milestone.title} (${project?.title || "Proyek"})`,
            notes: `Auto-synced from Freelance module milestone #${milestone.id}. Invoice: ${milestone.invoiceNumber || "-"}`,
            sourceType: "FREELANCE_MILESTONE",
            projectId,
            milestoneId,
          });
          transactionId = trx?.data?.id;
        }
      }
    }
  } else {
    // If reverted from PAID to DRAFT or INVOICED, remove the auto-synced transaction to avoid phantom income
    await prisma.transaction.deleteMany({
      where: {
        milestoneId,
        userId,
        sourceType: "FREELANCE_MILESTONE",
      },
    });
  }

  // Update milestone in database
  await prisma.projectMilestone.updateMany({
    where: { id: milestoneId, userId },
    data: {
      status: newStatus,
      paidDate,
    },
  });

  revalidatePath("/freelance");
  revalidatePath("/money");
  revalidatePath("/");
  return { success: true, transactionId };
}

/**
 * 11. Delete Milestone
 */
export async function deleteMilestone(milestoneId: string, projectId: string) {
  const userId = await getCurrentUserId();

  // Delete any synced money transaction first
  await prisma.transaction.deleteMany({
    where: {
      milestoneId,
      userId,
      projectId,
      sourceType: "FREELANCE_MILESTONE",
    },
  });

  await prisma.projectMilestone.deleteMany({
    where: { id: milestoneId, userId, projectId },
  });

  revalidatePath("/freelance");
  revalidatePath("/money");
  revalidatePath("/");
  return { success: true };
}

/**
 * 12. Create Project Expense & Auto-sync to Money as EXPENSE
 */
export async function createProjectExpense(formData: ProjectExpenseFormInput) {
  const userId = await getCurrentUserId();
  const validated = projectExpenseSchema.parse(formData);

  // Enforce ownership: Verify project belongs to current user
  const project = await prisma.freelanceProject.findFirst({
    where: { id: validated.projectId, userId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Akses ditolak: Proyek tidak ditemukan atau bukan milik Anda");
  }

  // 1. Find category or default to Hosting & Tools / expense
  const categories = await getCategories("EXPENSE");
  const targetCat = validated.categoryId
    ? categories.find((c) => c.id === validated.categoryId) || categories[0]
    : categories.find((c) => c.name.toLowerCase().includes("hosting") || c.name.toLowerCase().includes("tools")) || categories[0];

  if (!targetCat) {
    throw new Error("Kategori pengeluaran belum tersedia");
  }

  // 2. Create Transaction in Money ledger linked to projectId
  const trx = await createTransaction({
    categoryId: targetCat.id,
    type: "EXPENSE",
    amount: validated.amount,
    date: new Date(validated.date).toISOString(),
    description: `[Biaya Proyek] ${validated.description}`,
    notes: validated.notes ?? `Biaya operasional proyek freelance #${validated.projectId}`,
    sourceType: "PROJECT_EXPENSE",
    projectId: validated.projectId,
  });

  revalidatePath("/freelance");
  revalidatePath("/money");
  revalidatePath("/");
  return { success: true, data: trx };
}

/**
 * 13. Get Freelance Summary Metrics
 */
export async function getFreelanceSummary() {
  const projects = await getFreelanceProjects();
  const clients = await getClients();

  const activeProjects = projects.filter(
    (p) => p.status === "IN_PROGRESS" || p.status === "REVIEW"
  ).length;

  const totalContractValue = projects.reduce((acc, curr) => acc + curr.totalBudget, 0);
  const totalPaidRevenue = projects.reduce((acc, curr) => acc + curr.paidRevenue, 0);
  const totalInvoicedReceivables = projects.reduce(
    (acc, curr) => acc + curr.invoicedReceivables,
    0
  );
  const totalProjectExpenses = projects.reduce((acc, curr) => acc + curr.totalExpenses, 0);
  const overallNetProfit = totalPaidRevenue - totalProjectExpenses;
  const overallMarginPercentage =
    totalPaidRevenue > 0
      ? Math.round((overallNetProfit / totalPaidRevenue) * 1000) / 10
      : 0;

  return {
    totalClients: clients.length,
    activeProjects,
    totalProjects: projects.length,
    totalContractValue,
    totalPaidRevenue,
    totalInvoicedReceivables,
    totalProjectExpenses,
    overallNetProfit,
    overallMarginPercentage,
  };
}
