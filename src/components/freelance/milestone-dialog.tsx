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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
import { createMilestone } from "@/actions/freelance.actions";

export interface MilestoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

type MilestoneStatusOption = "DRAFT" | "INVOICED" | "PAID";

const STATUS_OPTIONS: { value: MilestoneStatusOption; label: string; description: string }[] = [
  { value: "DRAFT", label: "Draft / Perencanaan", description: "Termin disepakati tapi belum ditagihkan ke klien" },
  { value: "INVOICED", label: "Ditagihkan (Invoiced)", description: "Faktur telah terbit, menunggu pelunasan klien (piutang aktif)" },
  { value: "PAID", label: "Lunas (Paid)", description: "Termin sudah dibayar dan siap sinkron ke Money" },
];

export function MilestoneDialog({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: MilestoneDialogProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<MilestoneStatusOption>("DRAFT");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setAmount("");
      setStatus("DRAFT");
      setInvoiceNumber("");
      setDueDate("");
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

  const quickAmounts = [1000000, 2500000, 5000000, 10000000];

  const handleAddQuickAmount = (val: number) => {
    setAmount((prev) => {
      const current = parseFloat(prev.replace(/[^0-9]/g, "") || "0");
      return (current + val).toString();
    });
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setInvoiceNumber(`INV-${year}-${randomSuffix}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Judul termin wajib diisi.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Nominal termin harus lebih dari 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createMilestone({
        projectId,
        title: title.trim(),
        amount: numericAmount,
        status,
        invoiceNumber: invoiceNumber.trim() ? invoiceNumber.trim() : null,
        dueDate: dueDate ? dueDate : null,
        paidDate: status === "PAID" ? new Date().toISOString().split("T")[0] : null,
      });

      if (!res.success) {
        setErrorMessage("Gagal membuat termin pembayaran.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem saat membuat termin.");
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
              <div className="w-10 h-10 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center text-neon font-bold shadow-sm">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Tambah Termin Pembayaran
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tentukan rincian pembayaran bertahap (milestone) dan nomor faktur proyek.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Termin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Judul Termin / Milestone <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="contoh: Termin 1 - DP Kickoff Proyek (30%)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="h-10 text-xs sm:text-sm bg-card-inner border-card-border-subtle rounded-xl"
              required
            />
          </div>

          {/* Nominal Termin (Rupiah) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-neon" />
                Nominal Termin (IDR) <span className="text-red-400">*</span>
              </span>
              {numericAmount > 0 && (
                <span className="text-[11px] font-extrabold text-neon bg-neon/10 px-2.5 py-0.5 rounded-full border border-neon/20 tabular-nums">
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
                placeholder="5.000.000"
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
                  className="px-2.5 py-0.5 rounded-full text-[10px] bg-card-inner border border-card-border-subtle hover:border-card-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  +{formatRupiah(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Status Termin */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Status Awal Termin <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    status === opt.value
                      ? "bg-neon/10 border-neon/50 text-foreground ring-1 ring-neon/40 shadow-sm"
                      : "bg-card-inner border-card-border-subtle text-muted-foreground hover:text-foreground hover:border-card-border"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Nomor Invoice & Tanggal Jatuh Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                  Nomor Faktur / Invoice
                </label>
                <button
                  type="button"
                  onClick={generateInvoiceNumber}
                  disabled={isSubmitting}
                  className="text-[10px] text-neon hover:underline flex items-center gap-1 disabled:opacity-50 font-bold"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Auto-gen
                </button>
              </div>
              <Input
                type="text"
                placeholder="INV-2026-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                disabled={isSubmitting}
                className="h-10 text-xs sm:text-sm uppercase font-mono bg-card-inner border-card-border-subtle rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Tanggal Jatuh Tempo
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="h-10 text-xs sm:text-sm bg-card-inner border-card-border-subtle rounded-xl"
              />
            </div>
          </div>

          {/* Notice info when status is PAID */}
          {status === "PAID" && (
            <div className="p-3 rounded-2xl bg-neon/10 border border-neon/30 text-xs text-neon flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>
                Termin ini akan otomatis tersinkronisasi sebagai pendapatan di modul Money!
              </span>
            </div>
          )}

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
              className="h-10 px-6 text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Termin"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
