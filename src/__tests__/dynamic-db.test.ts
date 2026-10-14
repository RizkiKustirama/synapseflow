import { describe, it, expect, afterAll, mock } from "bun:test";

mock.module("next/cache", () => ({
  revalidatePath: () => {},
}));

import { prisma } from "@/lib/prisma";
import {
  getJobApplications,
  createJobApplication,
  deleteJobApplication,
} from "@/actions/career.actions";
import {
  getEmployments,
  createEmployment,
  deleteEmployment,
} from "@/actions/employment.actions";
import {
  getClients,
  getFreelanceProjects,
  createClient,
  deleteClient,
  createProject,
  deleteProject,
  createMilestone,
  updateMilestoneStatus,
} from "@/actions/freelance.actions";
import {
  getCategories,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getMoneySummary,
  getReceivables,
} from "@/actions/money.actions";
import { getExecutiveDashboardData } from "@/actions/dashboard.actions";

describe("Dynamic Multi-Feature PostgreSQL Integration Verification", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("1. Career: returns real DB records and supports dynamic CRUD without mock fallbacks", async () => {
    // Initially should be empty or contain real rows
    const initialApps = await getJobApplications();
    const initialCount = initialApps.length;

    // Verify no hardcoded mock companies like GoTo or Shopee unless explicitly created
    const hasMockGoTo = initialApps.some((a) => a.id === "app-001");
    expect(hasMockGoTo).toBe(false);

    // Create a new application dynamically
    const createRes = await createJobApplication({
      companyName: "Dynamic Corp Testing",
      position: "Senior Systems Engineer",
      workLocation: "REMOTE",
      status: "APPLIED",
      appliedDate: "2026-10-14",
      expectedSalary: 25000000,
    });
    expect(createRes.success).toBe(true);
    expect(createRes.data).toBeDefined();

    const createdId = createRes.data.id;

    // Fetch again: must include the new application
    const updatedApps = await getJobApplications();
    expect(updatedApps.length).toBe(initialCount + 1);
    const found = updatedApps.find((a) => a.id === createdId);
    expect(found).toBeDefined();
    expect(found?.companyName).toBe("Dynamic Corp Testing");

    // Clean up
    await deleteJobApplication(createdId);
    const afterDelete = await getJobApplications();
    expect(afterDelete.length).toBe(initialCount);
  });

  it("2. Money: dynamically seeds starter categories and manages ledger transactions", async () => {
    // Fetch categories: should seed default master categories directly in Postgres
    const categories = await getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(6);

    const expenseCategory = categories.find((c) => c.type === "EXPENSE");
    expect(expenseCategory).toBeDefined();

    // Verify initial transactions do not contain mock transactions
    const initialTrxs = await getTransactions();
    const hasMockTrx = initialTrxs.some((t) => t.id === "t1111111-0000-0000-0000-000000000001");
    expect(hasMockTrx).toBe(false);

    // Create a new transaction dynamically
    const trxRes = await createTransaction({
      categoryId: expenseCategory!.id,
      type: "EXPENSE",
      amount: 125000,
      date: new Date().toISOString(),
      description: "Testing Dynamic Coffee Expense",
      notes: "Integration test verify",
      sourceType: "MANUAL",
    });
    expect(trxRes.success).toBe(true);
    expect(trxRes.data.id).toBeDefined();

    // Check money summary metrics: must calculate dynamically
    const summary = await getMoneySummary();
    expect(summary.totalReceivables).toBeGreaterThanOrEqual(0);

    // Clean up
    await deleteTransaction(trxRes.data.id);
  });

  it("3. Employment: returns real DB records without mock fallbacks", async () => {
    const list = await getEmployments();
    const hasMockEmp = list.some((e) => e.id === "emp-001");
    expect(hasMockEmp).toBe(false);

    // Create employment record
    const empRes = await createEmployment({
      companyName: "Dynamic Tech Office",
      role: "Lead Architect",
      jobType: "FULL_TIME",
      status: "ACTIVE",
      payday: 25,
      baseSalary: 30000000,
      fixedAllowance: 5000000,
      startDate: "2026-01-01",
    });
    expect(empRes.success).toBe(true);

    const createdId = empRes.data.id;
    const updatedList = await getEmployments();
    const createdEmp = updatedList.find((e) => e.id === createdId);
    expect(createdEmp).toBeDefined();
    expect(createdEmp?.companyName).toBe("Dynamic Tech Office");

    // Clean up
    await deleteEmployment(createdId);
    const afterDelete = await getEmployments();
    expect(afterDelete.some((e) => e.id === createdId)).toBe(false);
  });

  it("4. Freelance: returns real DB records without mock fallbacks", async () => {
    const projects = await getFreelanceProjects();
    const hasMockProj = projects.some((p) => p.id === "proj-001");
    expect(hasMockProj).toBe(false);

    const clients = await getClients();
    const hasMockClient = clients.some((c) => c.id === "cli-001");
    expect(hasMockClient).toBe(false);

    // Create a client dynamically
    const clientRes = await createClient({
      name: "Dynamic Client Alpha",
      company: "Alpha Digital Agency",
      email: "alpha@agency.test",
    });
    expect(clientRes.success).toBe(true);

    const clientId = clientRes.data.id;
    const updatedClients = await getClients();
    expect(updatedClients.some((c) => c.id === clientId)).toBe(true);

    // Clean up
    await deleteClient(clientId);
    const afterDelete = await getClients();
    expect(afterDelete.some((c) => c.id === clientId)).toBe(false);
  });

  it("5. Dashboard: aggregates executive metrics dynamically without mock data", async () => {
    const dashboard = await getExecutiveDashboardData();
    expect(dashboard).toBeDefined();
    expect(dashboard.user).toBeDefined();
    expect(typeof dashboard.metrics.totalLiquidCash).toBe("number");
    expect(typeof dashboard.metrics.savingsRate).toBe("number");
    expect(typeof dashboard.fourPillars.freelance.netMarginAvg).toBe("number");
  });

  it("6. Receivables & Milestone Settle: ensures dynamic query, safe foreign key handling, and ledger auto-sync", async () => {
    // 6.1 Verify createTransaction protects against foreign key constraint violations
    const fakeCategoryId = "c0000000-dead-beef-9999-000000000999";
    const safeTrx = await createTransaction({
      categoryId: fakeCategoryId,
      type: "INCOME",
      amount: 500000,
      date: new Date().toISOString(),
      description: "Fallback Category Safety Test",
      notes: "Verify no foreign key constraint error",
      sourceType: "MANUAL",
    });
    expect(safeTrx.success).toBe(true);
    expect(safeTrx.data.id).toBeDefined();
    expect(safeTrx.data.categoryId).not.toBe(fakeCategoryId); // Safely resolved to valid DB category

    // Clean up safeTrx
    await deleteTransaction(safeTrx.data.id);

    // 6.2 Setup dynamic freelance project with INVOICED milestone
    const clientRes = await createClient({
      name: "Receivable Client Test",
      company: "Receivables Dynamic PT",
      email: "billing@receivable.test",
    });
    expect(clientRes.success).toBe(true);
    const clientId = clientRes.data.id;

    const projRes = await createProject({
      title: "Real Dynamic Receivables Project",
      clientId,
      totalBudget: 15000000,
      status: "IN_PROGRESS",
    });
    expect(projRes.success).toBe(true);
    const projectId = projRes.data.id;

    const milestoneRes = await createMilestone({
      projectId,
      title: "Termin 1 Testing",
      amount: 7500000,
      status: "INVOICED",
      invoiceNumber: "INV-TEST-2026",
      dueDate: "2026-10-25",
    });
    expect(milestoneRes.success).toBe(true);
    const milestoneId = milestoneRes.data.id;

    // 6.3 Verify getReceivables returns this active milestone
    const receivables = await getReceivables();
    const foundMilestone = receivables.find((r) => r.id === milestoneId);
    expect(foundMilestone).toBeDefined();
    expect(foundMilestone?.amount).toBe(7500000);
    expect(foundMilestone?.milestoneTitle).toBe("Termin 1 Testing");
    expect(foundMilestone?.clientName).toBe("Receivables Dynamic PT");

    // 6.4 Settle the milestone dynamically: updates milestone to PAID and creates Income transaction
    const settleRes = await updateMilestoneStatus(milestoneId, "PAID", projectId);
    expect(settleRes.success).toBe(true);
    expect(settleRes.transactionId).toBeDefined();

    // 6.5 Verify receivable is no longer pending in getReceivables()
    const receivablesAfterSettle = await getReceivables();
    expect(receivablesAfterSettle.some((r) => r.id === milestoneId)).toBe(false);

    // 6.6 Verify transaction was created in Money ledger
    const transactions = await getTransactions();
    const syncedTx = transactions.find((t) => t.id === settleRes.transactionId);
    expect(syncedTx).toBeDefined();
    expect(syncedTx?.amount).toBe(7500000);
    expect(syncedTx?.sourceType).toBe("FREELANCE_MILESTONE");

    // Clean up created entities
    await deleteProject(projectId);
    await deleteClient(clientId);
  });
});

