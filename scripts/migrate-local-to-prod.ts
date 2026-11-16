import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;

  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

async function main() {
  console.log("--------------------------------------------------");
  console.log("SYNAPSEFLOW - LOCAL TO PRODUCTION DATA MIGRATOR");
  console.log("--------------------------------------------------");

  // 1. Resolve Local Database URL
  const localEnv = parseEnvFile(path.resolve(process.cwd(), ".env"));
  const localDbUrl = process.env.LOCAL_DATABASE_URL || localEnv.DATABASE_URL;

  if (!localDbUrl) {
    console.error("[ERROR] LOCAL_DATABASE_URL or .env DATABASE_URL is not defined.");
    process.exit(1);
  }

  // 2. Resolve Target (Production / Neon) Database URL
  const prodEnv = parseEnvFile(path.resolve(process.cwd(), ".env.production"));
  const targetDbUrl =
    process.argv[2] ||
    process.env.TARGET_DATABASE_URL ||
    process.env.PROD_DIRECT_URL ||
    prodEnv.DIRECT_URL ||
    prodEnv.DATABASE_URL;

  if (!targetDbUrl || targetDbUrl.includes("[user]:[password]") || targetDbUrl.includes("[endpoint]")) {
    console.error("[ERROR] Target production database URL is missing or contains placeholder brackets.");
    console.error("Usage: bun run scripts/migrate-local-to-prod.ts \"<NEON_DIRECT_URL>\"");
    console.error("Or configure a valid DIRECT_URL / DATABASE_URL in .env.production");
    process.exit(1);
  }

  if (targetDbUrl === localDbUrl) {
    console.error("[ERROR] Local and target database URLs are identical. Migration aborted.");
    process.exit(1);
  }

  console.log("[INFO] Source Local DB: ", localDbUrl.replace(/:[^:@]+@/, ":***@"));
  console.log("[INFO] Target Prod DB:  ", targetDbUrl.replace(/:[^:@]+@/, ":***@"));
  console.log("--------------------------------------------------");

  const localPrisma = new PrismaClient({
    datasources: { db: { url: localDbUrl } },
  });

  const prodPrisma = new PrismaClient({
    datasources: { db: { url: targetDbUrl } },
  });

  try {
    // Test connections
    await localPrisma.$connect();
    console.log("[STATUS] Connected to Local Database.");

    await prodPrisma.$connect();
    console.log("[STATUS] Connected to Target Production Database.");
    console.log("--------------------------------------------------");

    // 1. Migrate Users
    const users = await localPrisma.user.findMany();
    console.log(`[1/12] Migrating Users (${users.length} records)...`);
    for (const u of users) {
      await prodPrisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          fullName: u.fullName,
          passwordHash: u.passwordHash,
          avatarUrl: u.avatarUrl,
          currency: u.currency,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        },
        create: {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          passwordHash: u.passwordHash,
          avatarUrl: u.avatarUrl,
          currency: u.currency,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        },
      });
    }
    console.log(`[OK] Users migrated: ${users.length}`);

    // 2. Migrate Categories
    const categories = await localPrisma.category.findMany();
    console.log(`[2/12] Migrating Categories (${categories.length} records)...`);
    for (const c of categories) {
      // Clean up conflicting categories with same userId_name_type if different id exists on target
      const existing = await prodPrisma.category.findUnique({
        where: {
          userId_name_type: {
            userId: c.userId,
            name: c.name,
            type: c.type,
          },
        },
      });

      if (existing && existing.id !== c.id) {
        await prodPrisma.category.delete({ where: { id: existing.id } });
      }

      await prodPrisma.category.upsert({
        where: { id: c.id },
        update: {
          userId: c.userId,
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color,
          monthlyBudget: c.monthlyBudget,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
        create: {
          id: c.id,
          userId: c.userId,
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color,
          monthlyBudget: c.monthlyBudget,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
      });
    }
    console.log(`[OK] Categories migrated: ${categories.length}`);

    // 3. Migrate Job Applications
    const jobApps = await localPrisma.jobApplication.findMany();
    console.log(`[3/12] Migrating Job Applications (${jobApps.length} records)...`);
    for (const j of jobApps) {
      await prodPrisma.jobApplication.upsert({
        where: { id: j.id },
        update: {
          userId: j.userId,
          companyName: j.companyName,
          position: j.position,
          workLocation: j.workLocation,
          status: j.status,
          salaryOfferedMin: j.salaryOfferedMin,
          salaryOfferedMax: j.salaryOfferedMax,
          expectedSalary: j.expectedSalary,
          jobUrl: j.jobUrl,
          cvVersion: j.cvVersion,
          appliedDate: j.appliedDate,
          notes: j.notes,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
        },
        create: {
          id: j.id,
          userId: j.userId,
          companyName: j.companyName,
          position: j.position,
          workLocation: j.workLocation,
          status: j.status,
          salaryOfferedMin: j.salaryOfferedMin,
          salaryOfferedMax: j.salaryOfferedMax,
          expectedSalary: j.expectedSalary,
          jobUrl: j.jobUrl,
          cvVersion: j.cvVersion,
          appliedDate: j.appliedDate,
          notes: j.notes,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
        },
      });
    }
    console.log(`[OK] Job Applications migrated: ${jobApps.length}`);

    // 4. Migrate Job Interview Logs
    const interviewLogs = await localPrisma.jobInterviewLog.findMany();
    console.log(`[4/12] Migrating Job Interview Logs (${interviewLogs.length} records)...`);
    for (const l of interviewLogs) {
      await prodPrisma.jobInterviewLog.upsert({
        where: { id: l.id },
        update: {
          applicationId: l.applicationId,
          roundName: l.roundName,
          scheduledAt: l.scheduledAt,
          meetingLink: l.meetingLink,
          interviewerInfo: l.interviewerInfo,
          questionsAsked: l.questionsAsked,
          feedbackNotes: l.feedbackNotes,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        },
        create: {
          id: l.id,
          applicationId: l.applicationId,
          roundName: l.roundName,
          scheduledAt: l.scheduledAt,
          meetingLink: l.meetingLink,
          interviewerInfo: l.interviewerInfo,
          questionsAsked: l.questionsAsked,
          feedbackNotes: l.feedbackNotes,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        },
      });
    }
    console.log(`[OK] Job Interview Logs migrated: ${interviewLogs.length}`);

    // 5. Migrate Employments
    const employments = await localPrisma.employment.findMany();
    console.log(`[5/12] Migrating Employments (${employments.length} records)...`);
    for (const e of employments) {
      await prodPrisma.employment.upsert({
        where: { id: e.id },
        update: {
          userId: e.userId,
          jobApplicationId: e.jobApplicationId,
          companyName: e.companyName,
          role: e.role,
          jobType: e.jobType,
          status: e.status,
          payday: e.payday,
          baseSalary: e.baseSalary,
          fixedAllowance: e.fixedAllowance,
          startDate: e.startDate,
          endDate: e.endDate,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        },
        create: {
          id: e.id,
          userId: e.userId,
          jobApplicationId: e.jobApplicationId,
          companyName: e.companyName,
          role: e.role,
          jobType: e.jobType,
          status: e.status,
          payday: e.payday,
          baseSalary: e.baseSalary,
          fixedAllowance: e.fixedAllowance,
          startDate: e.startDate,
          endDate: e.endDate,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        },
      });
    }
    console.log(`[OK] Employments migrated: ${employments.length}`);

    // 6. Migrate Employment Tasks
    const empTasks = await localPrisma.employmentTask.findMany();
    console.log(`[6/12] Migrating Employment Tasks (${empTasks.length} records)...`);
    for (const t of empTasks) {
      await prodPrisma.employmentTask.upsert({
        where: { id: t.id },
        update: {
          employmentId: t.employmentId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        },
        create: {
          id: t.id,
          employmentId: t.employmentId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        },
      });
    }
    console.log(`[OK] Employment Tasks migrated: ${empTasks.length}`);

    // 7. Migrate Clients
    const clients = await localPrisma.client.findMany();
    console.log(`[7/12] Migrating Clients (${clients.length} records)...`);
    for (const cl of clients) {
      await prodPrisma.client.upsert({
        where: { id: cl.id },
        update: {
          userId: cl.userId,
          name: cl.name,
          company: cl.company,
          email: cl.email,
          phone: cl.phone,
          notes: cl.notes,
          createdAt: cl.createdAt,
          updatedAt: cl.updatedAt,
        },
        create: {
          id: cl.id,
          userId: cl.userId,
          name: cl.name,
          company: cl.company,
          email: cl.email,
          phone: cl.phone,
          notes: cl.notes,
          createdAt: cl.createdAt,
          updatedAt: cl.updatedAt,
        },
      });
    }
    console.log(`[OK] Clients migrated: ${clients.length}`);

    // 8. Migrate Freelance Projects
    const projects = await localPrisma.freelanceProject.findMany();
    console.log(`[8/12] Migrating Freelance Projects (${projects.length} records)...`);
    for (const p of projects) {
      await prodPrisma.freelanceProject.upsert({
        where: { id: p.id },
        update: {
          userId: p.userId,
          clientId: p.clientId,
          title: p.title,
          description: p.description,
          status: p.status,
          totalBudget: p.totalBudget,
          startDate: p.startDate,
          deadline: p.deadline,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        },
        create: {
          id: p.id,
          userId: p.userId,
          clientId: p.clientId,
          title: p.title,
          description: p.description,
          status: p.status,
          totalBudget: p.totalBudget,
          startDate: p.startDate,
          deadline: p.deadline,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        },
      });
    }
    console.log(`[OK] Freelance Projects migrated: ${projects.length}`);

    // 9. Migrate Project Milestones
    const milestones = await localPrisma.projectMilestone.findMany();
    console.log(`[9/12] Migrating Project Milestones (${milestones.length} records)...`);
    for (const m of milestones) {
      await prodPrisma.projectMilestone.upsert({
        where: { id: m.id },
        update: {
          userId: m.userId,
          projectId: m.projectId,
          title: m.title,
          amount: m.amount,
          status: m.status,
          invoiceNumber: m.invoiceNumber,
          dueDate: m.dueDate,
          paidDate: m.paidDate,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        },
        create: {
          id: m.id,
          userId: m.userId,
          projectId: m.projectId,
          title: m.title,
          amount: m.amount,
          status: m.status,
          invoiceNumber: m.invoiceNumber,
          dueDate: m.dueDate,
          paidDate: m.paidDate,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        },
      });
    }
    console.log(`[OK] Project Milestones migrated: ${milestones.length}`);

    // 10. Migrate Project Tasks
    const projectTasks = await localPrisma.projectTask.findMany();
    console.log(`[10/12] Migrating Project Tasks (${projectTasks.length} records)...`);
    for (const pt of projectTasks) {
      await prodPrisma.projectTask.upsert({
        where: { id: pt.id },
        update: {
          projectId: pt.projectId,
          title: pt.title,
          status: pt.status,
          dueDate: pt.dueDate,
          createdAt: pt.createdAt,
          updatedAt: pt.updatedAt,
        },
        create: {
          id: pt.id,
          projectId: pt.projectId,
          title: pt.title,
          status: pt.status,
          dueDate: pt.dueDate,
          createdAt: pt.createdAt,
          updatedAt: pt.updatedAt,
        },
      });
    }
    console.log(`[OK] Project Tasks migrated: ${projectTasks.length}`);

    // 11. Migrate Transactions
    const transactions = await localPrisma.transaction.findMany();
    console.log(`[11/12] Migrating Transactions (${transactions.length} records)...`);
    for (const tr of transactions) {
      await prodPrisma.transaction.upsert({
        where: { id: tr.id },
        update: {
          userId: tr.userId,
          categoryId: tr.categoryId,
          type: tr.type,
          amount: tr.amount,
          date: tr.date,
          description: tr.description,
          notes: tr.notes,
          receiptUrl: tr.receiptUrl,
          sourceType: tr.sourceType,
          employmentId: tr.employmentId,
          projectId: tr.projectId,
          milestoneId: tr.milestoneId,
          createdAt: tr.createdAt,
          updatedAt: tr.updatedAt,
        },
        create: {
          id: tr.id,
          userId: tr.userId,
          categoryId: tr.categoryId,
          type: tr.type,
          amount: tr.amount,
          date: tr.date,
          description: tr.description,
          notes: tr.notes,
          receiptUrl: tr.receiptUrl,
          sourceType: tr.sourceType,
          employmentId: tr.employmentId,
          projectId: tr.projectId,
          milestoneId: tr.milestoneId,
          createdAt: tr.createdAt,
          updatedAt: tr.updatedAt,
        },
      });
    }
    console.log(`[OK] Transactions migrated: ${transactions.length}`);

    // 12. Migrate Payroll Records
    const payrollRecords = await localPrisma.payrollRecord.findMany();
    console.log(`[12/12] Migrating Payroll Records (${payrollRecords.length} records)...`);
    for (const pr of payrollRecords) {
      await prodPrisma.payrollRecord.upsert({
        where: { id: pr.id },
        update: {
          employmentId: pr.employmentId,
          periodMonth: pr.periodMonth,
          periodYear: pr.periodYear,
          baseAmount: pr.baseAmount,
          allowanceAmount: pr.allowanceAmount,
          bonusIncentive: pr.bonusIncentive,
          deductions: pr.deductions,
          netReceived: pr.netReceived,
          paidDate: pr.paidDate,
          slipFileUrl: pr.slipFileUrl,
          transactionId: pr.transactionId,
          createdAt: pr.createdAt,
          updatedAt: pr.updatedAt,
        },
        create: {
          id: pr.id,
          employmentId: pr.employmentId,
          periodMonth: pr.periodMonth,
          periodYear: pr.periodYear,
          baseAmount: pr.baseAmount,
          allowanceAmount: pr.allowanceAmount,
          bonusIncentive: pr.bonusIncentive,
          deductions: pr.deductions,
          netReceived: pr.netReceived,
          paidDate: pr.paidDate,
          slipFileUrl: pr.slipFileUrl,
          transactionId: pr.transactionId,
          createdAt: pr.createdAt,
          updatedAt: pr.updatedAt,
        },
      });
    }
    console.log(`[OK] Payroll Records migrated: ${payrollRecords.length}`);

    console.log("--------------------------------------------------");
    console.log("[SUCCESS] All local database records successfully migrated to production database!");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("[FATAL ERROR during migration]:", error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

main();
