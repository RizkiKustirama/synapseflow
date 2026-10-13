"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
import { createPayrollRecord } from "@/actions/employment.actions";

export interface PayrollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employmentId: string;
  defaultBaseSalary?: number;
  defaultAllowance?: number;
  onSuccess: () => void;
}

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export function PayrollDialog({
  isOpen,
  onClose,
  employmentId,
  defaultBaseSalary = 0,
  defaultAllowance = 0,
  onSuccess,
}: PayrollDialogProps) {
  const currentDate = useMemo(() => new Date(), []);

  const [periodMonth, setPeriodMonth] = useState<number>(currentDate.getMonth() + 1);
  const [periodYear, setPeriodYear] = useState<number>(currentDate.getFullYear());
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [allowance, setAllowance] = useState<string>("");
  const [incentiveBonus, setIncentiveBonus] = useState<string>("0");
  const [deductions, setDeductions] = useState<string>("0");
  const [paidAt, setPaidAt] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [payslipUrl, setPayslipUrl] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync default values when modal is opened
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setPeriodMonth(now.getMonth() + 1);
      setPeriodYear(now.getFullYear());
      setBaseSalary(defaultBaseSalary > 0 ? defaultBaseSalary.toString() : "");
      setAllowance(defaultAllowance > 0 ? defaultAllowance.toString() : "0");
      setIncentiveBonus("0");
      setDeductions("0");
      setPaidAt(now.toISOString().split("T")[0]);
      setPayslipUrl("");
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen, defaultBaseSalary, defaultAllowance]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Live calculation of Net Take-Home Pay
  const numBase = parseFloat(baseSalary.replace(/[^0-9.]/g, "") || "0");
  const numAllowance = parseFloat(allowance.replace(/[^0-9.]/g, "") || "0");
  const numBonus = parseFloat(incentiveBonus.replace(/[^0-9.]/g, "") || "0");
  const numDeductions = parseFloat(deductions.replace(/[^0-9.]/g, "") || "0");
  const calculatedNet = Math.max(0, numBase + numAllowance + numBonus - numDeductions);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employmentId) {
      setErrorMessage("ID Pekerjaan tidak valid.");
      return;
    }

    if (numBase <= 0) {
      setErrorMessage("Gaji pokok harus bernilai lebih dari 0.");
      return;
    }

    if (!paidAt) {
      setErrorMessage("Tanggal pembayaran gaji wajib dipilih.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createPayrollRecord({
        employmentId,
        periodMonth: Number(periodMonth),
        periodYear: Number(periodYear),
        baseSalary: numBase,
        allowance: numAllowance,
        incentiveBonus: numBonus,
        deductions: numDeductions,
        payslipUrl: payslipUrl.trim() ? payslipUrl.trim() : null,
        paidAt,
      });

      if (res && res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onSuccess();
          onClose();
        }, 600);
      } else {
        setErrorMessage("Gagal menyimpan slip gaji. Silakan coba lagi.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem saat menyimpan slip gaji.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-card-border rounded-3xl shadow-2xl p-5 sm:p-6 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-card-border gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon">
                <Receipt className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Catat Slip Gaji Baru
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Dokumentasikan rincian gaji bulanan dan siapkan sinkronisasi otomatis ke Money Tracker.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-neon/10 border border-neon/40 flex items-center gap-2.5 text-xs text-neon font-bold animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Slip gaji berhasil dicatat! Menutup formulir...</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Periode Bulan & Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Bulan Periode <span className="text-red-400">*</span>
              </label>
              <select
                value={periodMonth}
                onChange={(e) => setPeriodMonth(parseInt(e.target.value, 10))}
                disabled={isSubmitting}
                className="w-full h-10 px-3.5 rounded-xl border border-card-border bg-card text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-card text-foreground">
                    {m.label} ({m.value})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Tahun Periode <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                min={2020}
                max={2035}
                value={periodYear}
                onChange={(e) => setPeriodYear(parseInt(e.target.value, 10) || currentDate.getFullYear())}
                disabled={isSubmitting}
                placeholder="2026"
                required
              />
            </div>
          </div>

          {/* Gaji Pokok & Tunjangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-neon" />
                Gaji Pokok (Base Salary) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={50000}
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="18500000"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Tunjangan Tetap / Operasional
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={50000}
                  value={allowance}
                  onChange={(e) => setAllowance(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="2500000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Bonus KPI & Potongan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
                Bonus / Insentif KPI
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={50000}
                  value={incentiveBonus}
                  onChange={(e) => setIncentiveBonus(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Potongan (BPJS, PPh 21, dll)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-red-400">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={10000}
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Tanggal Bayar & File Slip URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Tanggal Pembayaran <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Link File Slip Gaji (PDF / Cloud)
              </label>
              <Input
                type="url"
                value={payslipUrl}
                onChange={(e) => setPayslipUrl(e.target.value)}
                disabled={isSubmitting}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          {/* Live Preview Take-Home Pay Box */}
          <div className="p-4 rounded-2xl bg-background border border-card-border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neon" /> Live Preview Take-Home Pay (Net)
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Periode: {MONTH_OPTIONS.find((m) => m.value === periodMonth)?.label} {periodYear}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1 border-t border-card-border/60">
              <div className="text-xl sm:text-2xl font-black text-neon tracking-tight">
                {formatRupiah(calculatedNet)}
              </div>
              <div className="text-[11px] text-muted-foreground font-medium">
                (Pokok: {formatRupiah(numBase)} + Tunjangan: {formatRupiah(numAllowance)} + Bonus: {formatRupiah(numBonus)} - Potongan: {formatRupiah(numDeductions)})
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-card-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="text-xs font-bold gap-2 min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" /> Simpan Slip Gaji
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
