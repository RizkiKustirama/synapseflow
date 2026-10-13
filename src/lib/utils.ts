import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number into Indonesian Rupiah format
 * e.g. 15000000 -> "Rp 15.000.000"
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
    maximumFractionDigits: 0,
  }).format(numericValue);
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
