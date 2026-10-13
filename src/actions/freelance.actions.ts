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

const DEFAULT_USER_ID = "c0000000-0000-0000-0000-000000000001";

export async function getCurrentUserId(): Promise<string> {
  return DEFAULT_USER_ID;
}

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

// Fallback in-memory store
let mockClientsStore: StoredClient[] = [
  {
    id: "cli-001",
    userId: DEFAULT_USER_ID,
    name: "Pak Hendra Wijaya",
    company: "PT Sinar Digital Nusantara",
    email: "hendra@sinardigital.id",
    phone: "+6281234567890",
    notes: "Klien korporat langganan revamp ERP & dashboard internal.",
    projectCount: 1,
  },
  {
    id: "cli-002",
    userId: DEFAULT_USER_ID,
    name: "Sarah Jenkins",
    company: "Apex Global Fin SG",
    email: "sarah@apexfin.sg",
    phone: "+6591234567",
    notes: "Klien luar negeri, pembayaran termin via Wise / Wire transfer USD.",
    projectCount: 1,
  },
];

let mockProjectsStore: StoredFreelanceProject[] = [
  {
    id: "proj-001",
    userId: DEFAULT_USER_ID,
    clientId: "cli-001",
    clientName: "Pak Hendra Wijaya",
    clientCompany: "PT Sinar Digital Nusantara",
    title: "Web Platform & Semi-ERP Analytics Dashboard",
    description: "Sistem ERP terpadu untuk monitoring order logistik, multi-user CRM, dan dashboard visual.",
    status: "IN_PROGRESS",
    totalBudget: 35000000,
    startDate: "2026-09-01",
    deadline: "2026-11-15",
    milestones: [
      {
        id: "m-001",
        userId: DEFAULT_USER_ID,
        projectId: "proj-001",
        title: "Termin 1 - DP Kickoff Proyek (30%)",
        amount: 10500000,
        status: "PAID",
        invoiceNumber: "INV-2026-001",
        dueDate: "2026-09-05",
        paidDate: "2026-09-05",
      },
      {
        id: "m-002",
        userId: DEFAULT_USER_ID,
        projectId: "proj-001",
        title: "Termin 2 - Development Sprint & UAT (40%)",
        amount: 14000000,
        status: "INVOICED",
        invoiceNumber: "INV-2026-002",
        dueDate: "2026-10-25",
        paidDate: null,
      },
      {
        id: "m-003",
        userId: DEFAULT_USER_ID,
        projectId: "proj-001",
        title: "Termin 3 - Handover & Pelunasan (30%)",
        amount: 10500000,
        status: "DRAFT",
        invoiceNumber: null,
        dueDate: "2026-11-15",
        paidDate: null,
      },
    ],
    expenses: [
      {
        id: "exp-001",
        projectId: "proj-001",
        amount: 250000,
        description: "Beli Domain .id & SSL Certificate",
        date: "2026-09-02",
        categoryName: "Hosting & Tools",
      },
      {
        id: "exp-002",
        projectId: "proj-001",
        amount: 450000,
        description: "Cloud VPS Staging Server (2 Bulan)",
        date: "2026-09-05",
        categoryName: "Hosting & Tools",
      },
      {
        id: "exp-003",
        projectId: "proj-001",
        amount: 650000,
        description: "Commercial UI Kit Pro License",
        date: "2026-09-10",
        categoryName: "Belanja & Hiburan",
      },
    ],
    paidRevenue: 10500000,
    invoicedReceivables: 14000000,
    totalExpenses: 1350000,
    netProfitMargin: 9150000,
    marginPercentage: 87.1,
  },
  {
    id: "proj-002",
    userId: DEFAULT_USER_ID,
    clientId: "cli-002",
    clientName: "Sarah Jenkins",
    clientCompany: "Apex Global Fin SG",
    title: "Fintech Landing Page & Design System",
    description: "High-converting marketing site dengan visual 3D dan kalkulator simulasi pinjaman.",
    status: "REVIEW",
    totalBudget: 18000000,
    startDate: "2026-09-15",
    deadline: "2026-10-20",
    milestones: [
      {
        id: "m-004",
        userId: DEFAULT_USER_ID,
        projectId: "proj-002",
        title: "Termin 1 - DP Design & Copywriting (50%)",
        amount: 9000000,
        status: "PAID",
        invoiceNumber: "INV-2026-003",
        dueDate: "2026-09-18",
        paidDate: "2026-09-18",
      },
      {
        id: "m-005",
        userId: DEFAULT_USER_ID,
        projectId: "proj-002",
        title: "Termin 2 - Final Delivery & Pelunasan (50%)",
        amount: 9000000,
        status: "INVOICED",
        invoiceNumber: "INV-2026-004",
        dueDate: "2026-10-20",
        paidDate: null,
      },
    ],
    expenses: [
      {
        id: "exp-004",
        projectId: "proj-002",
        amount: 500000,
        description: "3D Custom Asset Render Pack",
        date: "2026-09-20",
        categoryName: "Belanja & Hiburan",
      },
    ],
    paidRevenue: 9000000,
    invoicedReceivables: 9000000,
    totalExpenses: 500000,
    netProfitMargin: 8500000,
    marginPercentage: 94.4,
  },
];

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

  try {
    const clients = await prisma.client.findMany({
      where: { userId },
      include: {
        projects: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (clients.length > 0) {
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
  } catch {
    // Database offline fallback
  }

  return mockClientsStore.filter((c) => c.userId === userId);
}

/**
 * 2. Create Client
 */
export async function createClient(formData: ClientFormInput) {
  const userId = await getCurrentUserId();
  const validated = clientSchema.parse(formData);

  try {
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
  } catch {
    const newClient: StoredClient = {
      id: "cli-" + Date.now().toString(),
      userId,
      name: validated.name,
      company: validated.company,
      email: validated.email,
      phone: validated.phone,
      notes: validated.notes,
      projectCount: 0,
    };
    mockClientsStore.unshift(newClient);
    revalidatePath("/freelance");
    return { success: true, data: newClient };
  }
}

/**
 * 3. Update Client
 */
export async function updateClient(id: string, formData: Partial<ClientFormInput>) {
  const userId = await getCurrentUserId();

  try {
    const updated = await prisma.client.update({
      where: { id },
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
  } catch {
    const idx = mockClientsStore.findIndex((c) => c.id === id && c.userId === userId);
    if (idx !== -1) {
      mockClientsStore[idx] = {
        ...mockClientsStore[idx],
        ...formData,
      };
    }
    revalidatePath("/freelance");
    return { success: true };
  }
}

/**
 * 4. Delete Client
 */
export async function deleteClient(id: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.client.deleteMany({
      where: { id, userId },
    });
    revalidatePath("/freelance");
    return { success: true };
  } catch {
    mockClientsStore = mockClientsStore.filter((c) => !(c.id === id && c.userId === userId));
    revalidatePath("/freelance");
    return { success: true };
  }
}

/**
 * 5. Get All Freelance Projects
 */
export async function getFreelanceProjects(): Promise<StoredFreelanceProject[]> {
  const userId = await getCurrentUserId();

  try {
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

    if (projects.length > 0) {
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
  } catch {
    // Database offline fallback
  }

  return mockProjectsStore.filter((p) => p.userId === userId);
}

/**
 * 6. Create Freelance Project
 */
export async function createProject(formData: FreelanceProjectFormInput) {
  const userId = await getCurrentUserId();
  const validated = freelanceProjectSchema.parse(formData);

  try {
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
  } catch {
    const client = mockClientsStore.find((c) => c.id === validated.clientId);
    const newProject: StoredFreelanceProject = {
      id: "proj-" + Date.now().toString(),
      userId,
      clientId: validated.clientId,
      clientName: client?.name ?? null,
      clientCompany: client?.company ?? null,
      title: validated.title,
      description: validated.description,
      status: validated.status,
      totalBudget: validated.totalBudget,
      startDate: validated.startDate ? (typeof validated.startDate === "string" ? validated.startDate : validated.startDate.toISOString().split("T")[0]) : null,
      deadline: validated.deadline ? (typeof validated.deadline === "string" ? validated.deadline : validated.deadline.toISOString().split("T")[0]) : null,
      milestones: [],
      expenses: [],
      paidRevenue: 0,
      invoicedReceivables: 0,
      totalExpenses: 0,
      netProfitMargin: 0,
      marginPercentage: 0,
    };
    mockProjectsStore.unshift(newProject);
    revalidatePath("/freelance");
    return { success: true, data: newProject };
  }
}

/**
 * 7. Update Project Status (Kanban Stage / Edit)
 */
export async function updateProjectStatus(
  id: string,
  newStatus: StoredFreelanceProject["status"]
) {
  const userId = await getCurrentUserId();

  try {
    await prisma.freelanceProject.updateMany({
      where: { id, userId },
      data: { status: newStatus },
    });
    revalidatePath("/freelance");
    return { success: true };
  } catch {
    const p = mockProjectsStore.find((item) => item.id === id && item.userId === userId);
    if (p) {
      p.status = newStatus;
    }
    revalidatePath("/freelance");
    return { success: true };
  }
}

/**
 * 8. Delete Freelance Project
 */
export async function deleteProject(id: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.freelanceProject.deleteMany({
      where: { id, userId },
    });
    revalidatePath("/freelance");
    return { success: true };
  } catch {
    mockProjectsStore = mockProjectsStore.filter((p) => !(p.id === id && p.userId === userId));
    revalidatePath("/freelance");
    return { success: true };
  }
}

/**
 * 9. Create Project Milestone (Termin)
 */
export async function createMilestone(formData: ProjectMilestoneFormInput) {
  const userId = await getCurrentUserId();
  const validated = projectMilestoneSchema.parse(formData);

  try {
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
  } catch {
    const newM: StoredMilestone = {
      id: "m-" + Date.now().toString(),
      userId,
      projectId: validated.projectId,
      title: validated.title,
      amount: validated.amount,
      status: validated.status,
      invoiceNumber: validated.invoiceNumber,
      dueDate: validated.dueDate ? (typeof validated.dueDate === "string" ? validated.dueDate : validated.dueDate.toISOString().split("T")[0]) : null,
      paidDate: validated.paidDate ? (typeof validated.paidDate === "string" ? validated.paidDate : validated.paidDate.toISOString().split("T")[0]) : null,
    };

    const project = mockProjectsStore.find((p) => p.id === validated.projectId);
    if (project) {
      project.milestones.push(newM);
      const metrics = computeProjectMetrics(project.milestones, project.expenses);
      Object.assign(project, metrics);
    }
    revalidatePath("/freelance");
    return { success: true, data: newM };
  }
}

/**
 * 10. Update Milestone Status & 1-Click Sync to Money when PAID
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  newStatus: StoredMilestone["status"],
  projectId: string
) {
  const userId = await getCurrentUserId();

  try {
    const isPaid = newStatus === "PAID";
    const paidDate = isPaid ? new Date() : null;

    // 1. If marking as PAID, create live INCOME transaction in Money ledger
    let transactionId: string | undefined = undefined;
    if (isPaid) {
      const project = (await getFreelanceProjects()).find((p) => p.id === projectId);
      const milestone = project?.milestones.find((m) => m.id === milestoneId);

      if (milestone) {
        const categories = await getCategories("INCOME");
        const freelanceCat =
          categories.find((c) => c.name.toLowerCase().includes("freelance")) ||
          categories[0];

        if (freelanceCat) {
          const trx = await createTransaction({
            categoryId: freelanceCat.id,
            type: "INCOME",
            amount: milestone.amount,
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

    // 2. Update milestone in database
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
  } catch {
    // Fallback store update
    const project = mockProjectsStore.find((p) => p.id === projectId);
    if (project) {
      const m = project.milestones.find((item) => item.id === milestoneId);
      if (m) {
        m.status = newStatus;
        if (newStatus === "PAID") {
          m.paidDate = new Date().toISOString().split("T")[0];
        }
      }
      const metrics = computeProjectMetrics(project.milestones, project.expenses);
      Object.assign(project, metrics);
    }
    revalidatePath("/freelance");
    revalidatePath("/money");
    revalidatePath("/");
    return { success: true };
  }
}

/**
 * 11. Delete Milestone
 */
export async function deleteMilestone(milestoneId: string, projectId: string) {
  const userId = await getCurrentUserId();

  try {
    await prisma.projectMilestone.deleteMany({
      where: { id: milestoneId, userId },
    });
    revalidatePath("/freelance");
    return { success: true };
  } catch {
    const project = mockProjectsStore.find((p) => p.id === projectId);
    if (project) {
      project.milestones = project.milestones.filter((m) => m.id !== milestoneId);
      const metrics = computeProjectMetrics(project.milestones, project.expenses);
      Object.assign(project, metrics);
    }
    revalidatePath("/freelance");
    return { success: true };
  }
}

/**
 * 12. Create Project Expense & Auto-sync to Money as EXPENSE
 */
export async function createProjectExpense(formData: ProjectExpenseFormInput) {
  const userId = await getCurrentUserId();
  const validated = projectExpenseSchema.parse(formData);

  try {
    // 1. Find category or default to Hosting & Tools / expense
    const categories = await getCategories("EXPENSE");
    const targetCat = validated.categoryId
      ? categories.find((c) => c.id === validated.categoryId) || categories[0]
      : categories.find((c) => c.name.toLowerCase().includes("hosting") || c.name.toLowerCase().includes("tools")) || categories[0];

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
  } catch {
    const newExp: StoredProjectExpense = {
      id: "exp-" + Date.now().toString(),
      projectId: validated.projectId,
      amount: validated.amount,
      description: validated.description,
      date: typeof validated.date === "string" ? validated.date : validated.date.toISOString().split("T")[0],
      categoryName: "Hosting & Tools",
    };

    const project = mockProjectsStore.find((p) => p.id === validated.projectId);
    if (project) {
      project.expenses.unshift(newExp);
      const metrics = computeProjectMetrics(project.milestones, project.expenses);
      Object.assign(project, metrics);
    }
    revalidatePath("/freelance");
    revalidatePath("/money");
    revalidatePath("/");
    return { success: true, data: newExp };
  }
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
