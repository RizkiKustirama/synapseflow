import { describe, it, expect } from "bun:test";
import {
  formatRupiah,
  formatDate,
  getDaysUntilPayday,
  calculateTenure,
  parseFinancialAmount,
  formatFinancialInput,
} from "@/lib/utils";

describe("Utils - formatRupiah", () => {
  it("formats positive numbers to Indonesian Rupiah currency format", () => {
    const formatted = formatRupiah(15000000);
    expect(formatted).toContain("15.000.000");
    expect(formatted).toContain("Rp");
  });

  it("formats numbers with decimal fractions accurately", () => {
    const formatted = formatRupiah(2249291.86);
    expect(formatted).toContain("2.249.291,86");
    expect(formatted).toContain("Rp");
  });

  it("handles string numbers correctly", () => {
    const formatted = formatRupiah("2500000");
    expect(formatted).toContain("2.500.000");
  });

  it("returns Rp 0 for null or undefined or invalid inputs", () => {
    expect(formatRupiah(null)).toBe("Rp 0");
    expect(formatRupiah(undefined)).toBe("Rp 0");
    expect(formatRupiah("invalid")).toBe("Rp 0");
  });

  it("handles 0 correctly", () => {
    const formatted = formatRupiah(0);
    expect(formatted).toContain("0");
  });
});

describe("Utils - parseFinancialAmount", () => {
  it("correctly parses Indonesian financial notation with dot thousands and comma decimal", () => {
    // Crucial bugfix: '2.249.291,86' must be ~2.25 million, NEVER 224 million
    expect(parseFinancialAmount("2.249.291,86")).toBe(2249291.86);
    expect(parseFinancialAmount("Rp 2.249.291,86")).toBe(2249291.86);
  });

  it("correctly parses US/International notation with comma thousands and dot decimal", () => {
    expect(parseFinancialAmount("2,249,291.86")).toBe(2249291.86);
  });

  it("correctly parses multiple dot thousand separators without decimals", () => {
    expect(parseFinancialAmount("2.249.291")).toBe(2249291);
    expect(parseFinancialAmount("1.500.000")).toBe(1500000);
  });

  it("correctly parses standard Indonesian 3-digit dot thousand separator", () => {
    expect(parseFinancialAmount("50.000")).toBe(50000);
    expect(parseFinancialAmount("150.000")).toBe(150000);
  });

  it("correctly parses standalone comma decimals", () => {
    expect(parseFinancialAmount("2249291,86")).toBe(2249291.86);
    expect(parseFinancialAmount("45,5")).toBe(45.5);
  });

  it("safely handles 0, negative values, null, undefined and invalid strings", () => {
    expect(parseFinancialAmount(0)).toBe(0);
    expect(parseFinancialAmount(-1000)).toBe(0);
    expect(parseFinancialAmount(null)).toBe(0);
    expect(parseFinancialAmount(undefined)).toBe(0);
    expect(parseFinancialAmount("abc")).toBe(0);
  });
});

describe("Utils - formatFinancialInput", () => {
  it("formats integer amounts with Indonesian dot thousands", () => {
    expect(formatFinancialInput(50000)).toBe("50.000");
    expect(formatFinancialInput(1500000)).toBe("1.500.000");
  });

  it("formats decimal amounts with dot thousands and comma decimal", () => {
    expect(formatFinancialInput(2249291.86)).toBe("2.249.291,86");
    expect(formatFinancialInput(1500000.5)).toBe("1.500.000,50");
  });

  it("returns empty string for empty or zero amounts", () => {
    expect(formatFinancialInput(0)).toBe("");
    expect(formatFinancialInput(null)).toBe("");
    expect(formatFinancialInput("")).toBe("");
  });
});

describe("Utils - formatDate", () => {
  it("formats ISO string date to Indonesian format", () => {
    const formatted = formatDate("2026-10-14");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("14");
  });

  it("returns dash for null or undefined", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
  });
});

describe("Utils - getDaysUntilPayday", () => {
  it("calculates remaining days without NaN or negative values", () => {
    const { daysRemaining, nextDate } = getDaysUntilPayday(25);
    expect(daysRemaining).toBeGreaterThanOrEqual(0);
    expect(daysRemaining).toBeLessThanOrEqual(31);
    expect(nextDate instanceof Date).toBe(true);
    expect(isNaN(nextDate.getTime())).toBe(false);
  });
});

describe("Utils - calculateTenure", () => {
  it("returns < 1 Bulan for same start and end dates", () => {
    expect(calculateTenure("2026-10-01", "2026-10-10")).toBe("< 1 Bulan");
  });

  it("calculates months accurately", () => {
    const tenure = calculateTenure("2026-01-01", "2026-07-01");
    expect(tenure).toBe("6 Bulan");
  });

  it("calculates years and months accurately", () => {
    const tenure = calculateTenure("2024-01-01", "2026-04-01");
    expect(tenure).toBe("2 Thn 3 Bln");
  });

  it("returns dash for invalid start date", () => {
    expect(calculateTenure("invalid-date")).toBe("-");
  });
});
