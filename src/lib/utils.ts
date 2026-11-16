import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number into Indonesian Rupiah format
 * e.g. 15000000 -> "Rp 15.000.000", 2249291.86 -> "Rp 2.249.291,86"
 */
export function formatRupiah(amount: number | string | bigint | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }
  const numericValue = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: numericValue % 1 !== 0 ? 2 : 0,
  }).format(numericValue);
}

/**
 * Parse financial amount string handling Indonesian (dot thousands, comma decimal)
 * and International (comma thousands, dot decimal) notation.
 * e.g.:
 * "2.249.291,86" -> 2249291.86
 * "2,249,291.86" -> 2249291.86
 * "2.249.291"    -> 2249291
 * "50.000"       -> 50000
 * "45,5"         -> 45.5
 */
export function parseFinancialAmount(input: string | number | null | undefined): number {
  if (typeof input === "number") return isNaN(input) || input < 0 ? 0 : input;
  if (!input || typeof input !== "string") return 0;

  // Remove currency prefixes like Rp, IDR and surrounding whitespaces
  let cleaned = input.replace(/(?:rp\.?|idr)\s*/gi, "").trim();
  if (!cleaned) return 0;

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");

  if (hasDot && hasComma) {
    const lastDotIdx = cleaned.lastIndexOf(".");
    const lastCommaIdx = cleaned.lastIndexOf(",");
    if (lastCommaIdx > lastDotIdx) {
      // Indonesian format: 2.249.291,86 -> remove dots, replace comma with dot
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // US/International format: 2,249,291.86 -> remove commas
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (hasDot && !hasComma) {
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      // Multiple dots: 2.249.291 -> thousands separator
      cleaned = cleaned.replace(/\./g, "");
    } else {
      // Single dot: e.g. 50.000 vs 2.5
      const decimalPart = parts[1];
      if (decimalPart && decimalPart.length === 3) {
        // e.g. 50.000 or 1.500 -> thousands separator in ID
        cleaned = cleaned.replace(/\./g, "");
      }
    }
  } else if (hasComma && !hasDot) {
    const parts = cleaned.split(",");
    if (parts.length > 2) {
      // Multiple commas: 2,249,291 -> thousands separator
      cleaned = cleaned.replace(/,/g, "");
    } else {
      // Single comma: e.g. 2249291,86 vs 50,000
      const decimalPart = parts[1];
      if (decimalPart && decimalPart.length === 3) {
        // e.g. 50,000 -> thousands separator
        cleaned = cleaned.replace(/,/g, "");
      } else {
        // e.g. 2249291,86 or 45,5 -> decimal in ID
        cleaned = cleaned.replace(",", ".");
      }
    }
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * Format numeric amount to Indonesian financial display string
 * e.g. 50000 -> "50.000", 2249291.86 -> "2.249.291,86"
 */
export function formatFinancialInput(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "";
  const num = typeof amount === "string" ? parseFinancialAmount(amount) : Number(amount);
  if (isNaN(num) || num === 0) return "";

  const parts = num.toFixed(2).split(".");
  const integerPart = parseInt(parts[0], 10).toLocaleString("id-ID");
  const decimalPart = parts[1];
  return decimalPart === "00" ? integerPart : `${integerPart},${decimalPart}`;
}

/**
 * Format standard date
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Calculate remaining days until payday
 */
export function getDaysUntilPayday(payday: number = 25): { daysRemaining: number; nextDate: Date } {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  let targetDate: Date;
  if (currentDate <= payday) {
    targetDate = new Date(currentYear, currentMonth, payday);
  } else {
    targetDate = new Date(currentYear, currentMonth + 1, payday);
  }

  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return { daysRemaining, nextDate: targetDate };
}

/**
 * Calculate tenure duration in Indonesian format
 */
export function calculateTenure(startDateStr: string, endDateStr?: string | null): string {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  if (isNaN(start.getTime())) return "-";

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (end.getDate() < start.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0 && months <= 0) {
    return "< 1 Bulan";
  }

  if (years <= 0) {
    return `${months} Bulan`;
  }

  if (months === 0) {
    return `${years} Tahun`;
  }

  return `${years} Thn ${months} Bln`;
}

/**
 * Compute Company Workspace top stats
 */
export function getCompanyWorkspaceStats(emp: {
  startDate: string;
  endDate?: string | null;
  payday: number;
  payrollRecords: Array<{ netSalary: number }>;
  tasks: Array<{ status: string }>;
}) {
  const tenure = calculateTenure(emp.startDate, emp.endDate);
  const { daysRemaining, nextDate } = getDaysUntilPayday(emp.payday);
  const totalPaidAmount = emp.payrollRecords.reduce((acc, curr) => acc + curr.netSalary, 0);
  const completedTasksCount = emp.tasks.filter((t) => t.status === "DONE").length;
  const totalTasksCount = emp.tasks.length;
  const taskCompletionRatio =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return {
    tenure,
    daysUntilPayday: daysRemaining,
    nextPaydayDate: nextDate,
    totalPaidAmount,
    completedTasksCount,
    totalTasksCount,
    taskCompletionRatio,
  };
}
