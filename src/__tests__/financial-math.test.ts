import { describe, it, expect } from "bun:test";

describe("Financial Math - Cashflow & Savings Rate", () => {
  it("calculates net cashflow correctly", () => {
    const totalIncome = 25000000;
    const totalExpense = 12500000;
    const netCashflow = totalIncome - totalExpense;
    expect(netCashflow).toBe(12500000);
  });

  it("calculates savings rate percentage accurately", () => {
    const totalIncome = 20000000;
    const totalExpense = 8000000;
    const netCashflow = totalIncome - totalExpense;
    const savingsRate = Math.round(((netCashflow / totalIncome) * 100) * 10) / 10;
    expect(savingsRate).toBe(60);
  });

  it("handles zero income without division by zero", () => {
    const totalIncome = 0;
    const totalExpense = 5000000;
    const netCashflow = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netCashflow / totalIncome) * 100) : 0;
    expect(savingsRate).toBe(0);
  });

  it("handles deficit cashflow safely", () => {
    const totalIncome = 10000000;
    const totalExpense = 15000000;
    const netCashflow = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((netCashflow / totalIncome) * 100)) : 0;
    expect(netCashflow).toBe(-5000000);
    expect(savingsRate).toBe(0);
  });
});

describe("Financial Math - Freelance Project Margin", () => {
  it("calculates profit margin and margin percentage accurately", () => {
    const milestones = [
      { amount: 10000000, status: "PAID" },
      { amount: 5000000, status: "PAID" },
      { amount: 15000000, status: "INVOICED" },
    ];
    const expenses = [
      { amount: 1500000 },
      { amount: 500000 },
    ];

    const paidRevenue = milestones
      .filter((m) => m.status === "PAID")
      .reduce((sum, m) => sum + m.amount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfitMargin = paidRevenue - totalExpenses;
    const marginPercentage =
      paidRevenue > 0 ? Math.round((netProfitMargin / paidRevenue) * 1000) / 10 : 0;

    expect(paidRevenue).toBe(15000000);
    expect(totalExpenses).toBe(2000000);
    expect(netProfitMargin).toBe(13000000);
    expect(marginPercentage).toBe(86.7);
  });
});
