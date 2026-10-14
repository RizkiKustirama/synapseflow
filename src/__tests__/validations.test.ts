import { describe, it, expect } from "bun:test";
import { categorySchema, transactionSchema } from "@/lib/validations/money.schema";
import { jobApplicationSchema } from "@/lib/validations/career.schema";
import { employmentSchema } from "@/lib/validations/employment.schema";
import { freelanceProjectSchema, projectMilestoneSchema } from "@/lib/validations/freelance.schema";

describe("Validations - Money Schema", () => {
  it("validates a correct transaction input", () => {
    const valid = transactionSchema.safeParse({
      categoryId: "c1111111-0000-0000-0000-000000000001",
      type: "INCOME",
      amount: 15000000,
      date: "2026-10-14",
      description: "Gaji Kantor Oktober",
      sourceType: "EMPLOYMENT_PAYROLL",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects zero or negative transaction amounts", () => {
    const invalidZero = transactionSchema.safeParse({
      categoryId: "c1111111-0000-0000-0000-000000000001",
      type: "EXPENSE",
      amount: 0,
      date: "2026-10-14",
      description: "Beli Alat",
    });
    expect(invalidZero.success).toBe(false);
  });

  it("validates a correct category input", () => {
    const valid = categorySchema.safeParse({
      name: "Pendidikan & Kursus",
      type: "EXPENSE",
      icon: "book",
      color: "#3B82F6",
      monthlyBudget: 2000000,
    });
    expect(valid.success).toBe(true);
  });
});

describe("Validations - Career Schema", () => {
  it("validates a valid job application", () => {
    const valid = jobApplicationSchema.safeParse({
      companyName: "Google Cloud Indonesia",
      position: "Customer Engineer",
      workLocation: "HYBRID",
      status: "APPLIED",
      expectedSalary: 45000000,
      appliedDate: "2026-10-14",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects job application with missing company name", () => {
    const invalid = jobApplicationSchema.safeParse({
      companyName: "",
      position: "Developer",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("Validations - Employment Schema", () => {
  it("validates employment contract and payday range (1-31)", () => {
    const valid = employmentSchema.safeParse({
      companyName: "PT Teknologi Hebat",
      role: "Lead Software Architect",
      jobType: "FULL_TIME",
      status: "ACTIVE",
      payday: 25,
      baseSalary: 25000000,
      fixedAllowance: 3000000,
      startDate: "2026-01-01",
    });
    expect(valid.success).toBe(true);

    const invalidPayday = employmentSchema.safeParse({
      companyName: "PT Teknologi Hebat",
      role: "Architect",
      payday: 35, // Out of range
      startDate: "2026-01-01",
    });
    expect(invalidPayday.success).toBe(false);
  });
});

describe("Validations - Freelance Schema", () => {
  it("validates freelance project and milestone", () => {
    const validProj = freelanceProjectSchema.safeParse({
      title: "Redesign Mobile App Banking",
      totalBudget: 40000000,
      status: "IN_PROGRESS",
    });
    expect(validProj.success).toBe(true);

    const validMilestone = projectMilestoneSchema.safeParse({
      projectId: "proj-001",
      title: "Termin 1 - Wireframe & Prototype",
      amount: 15000000,
      status: "INVOICED",
    });
    expect(validMilestone.success).toBe(true);
  });
});
