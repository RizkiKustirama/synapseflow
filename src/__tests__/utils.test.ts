import { describe, it, expect } from "bun:test";
import { formatRupiah, formatDate, getDaysUntilPayday, calculateTenure } from "@/lib/utils";

describe("Utils - formatRupiah", () => {
  it("formats positive numbers to Indonesian Rupiah currency format", () => {
    const formatted = formatRupiah(15000000);
    expect(formatted).toContain("15.000.000");
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
