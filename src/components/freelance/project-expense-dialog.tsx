"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  Loader2,
  AlertCircle,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
import { createProjectExpense } from "@/actions/freelance.actions";

export interface ProjectExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function ProjectExpenseDialog({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: ProjectExpenseDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setErrorMessage(null);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const numericAmount = parseFloat(amount.replace(/[^0-9]/g, "") || "0");

  const quickAmounts = [100000, 250000, 500000, 1000000];

  const handleAddQuickAmount = (val: number) => {
    setAmount((prev) => {
      const current = parseFloat(prev.replace(/[^0-9]/g, "") || "0");
      return (current + val).toString();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim()) {
      setErrorMessage("Deskripsi pengeluaran wajib diisi.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Nominal pengeluaran harus lebih dari 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createProjectExpense({
        projectId,
        description: description.trim(),
        amount: numericAmount,
        date: date || new Date().toISOString().split("T")[0],
        notes: notes.trim() ? notes.trim() : null,
      });

      if (!res.success) {
        setErrorMessage("Gagal mencatat pengeluaran proyek.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem saat mencatat pengeluaran.");
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
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card border border-card-border rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-card-border gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shadow-sm">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Catat Biaya Proyek
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dokumentasikan direct expenses seperti hosting, API, lisensi aset, atau subkontraktor.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-card-inner border border-card-border-subtle text-muted-foreground hover:text-foreground hover:border-card-border transition-colors disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-card-inner border border-card-border-subtle text-xs text-muted-foreground flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-neon flex-shrink-0" />
          <span>
            Biaya ini otomatis tersinkronisasi sebagai <strong className="text-foreground">EXPENSE</strong> di modul Money Tracker dan mengurangi Net Margin proyek secara instan.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Deskripsi Biaya */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Deskripsi Biaya <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="contoh: Hosting VPS Cloud, Lisensi UI Kit, atau API OpenAI"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="h-10 text-xs sm:text-sm bg-card-inner border-card-border-subtle rounded-xl"
              required
            />
          </div>

          {/* Nominal Biaya (Rupiah) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                Nominal Biaya (IDR) <span className="text-red-400">*</span>
              </span>
              {numericAmount > 0 && (
                <span className="text-[11px] font-extrabold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 tabular-nums">
                  {formatRupiah(numericAmount)}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rp
              </span>
              <Input
                type="text"
                placeholder="250.000"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(val ? parseInt(val, 10).toLocaleString("id-ID") : "");
                }}
                disabled={isSubmitting}
                className="pl-10 h-10 text-xs sm:text-sm font-semibold bg-card-inner border-card-border-subtle rounded-xl"
                required
              />
            </div>
            {/* Quick amount shortcuts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground">Tambah cepat:</span>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAddQuickAmount(q)}
                  disabled={isSubmitting}
                  className="px-2.5 py-0.5 rounded-full text-[10px] bg-card-inner border border-card-border-subtle hover:border-rose-500/40 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  +{formatRupiah(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal Biaya */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Tanggal Pengeluaran <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
              className="h-10 text-xs sm:text-sm bg-card-inner border-card-border-subtle rounded-xl"
              required
            />
          </div>

          {/* Catatan Tambahan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
              Catatan / Info Vendor (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="contoh: Pembelian domain di Niagahoster via kartu debit, invoice #NH-8911"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-card-border-subtle bg-card-inner text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-card-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-5 text-xs font-bold border-card-border bg-card-inner text-foreground hover:bg-card-inner/80 rounded-full"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 text-xs font-extrabold gap-2 bg-rose-500 hover:bg-rose-600 text-white shadow-sm rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mencatat...
                </>
              ) : (
                "Catat Pengeluaran"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
