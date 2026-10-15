"use client";

import React from "react";
import { X, ArrowUpRight, ArrowDownRight, Calendar, Tag, Layers, FileText } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { StoredTransaction } from "@/actions/money.actions";

interface TransactionDetailDialogProps {
  transaction: StoredTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailDialog({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailDialogProps) {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === "INCOME";

  const getSourceBadge = () => {
    switch (transaction.sourceType) {
      case "EMPLOYMENT_PAYROLL":
        return (
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#25dd59]/15 text-[#25dd59] border border-[#25dd59]/30">
            Gaji Kantor (Employment)
          </span>
        );
      case "FREELANCE_MILESTONE":
        return (
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Termin Freelance
          </span>
        );
      case "PROJECT_EXPENSE":
        return (
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#e28460]/15 text-[#e28460] border border-[#e28460]/30">
            Biaya Proyek
          </span>
        );
      default:
        return (
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground border border-card-border">
            Pencatatan Manual
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border border-card-border rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-card-border/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                isIncome ? "bg-neon/15 text-neon" : "bg-red-500/15 text-red-400"
              }`}
            >
              {isIncome ? (
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Detail Transaksi
              </h3>
              <p className="text-[11px] text-muted-foreground">
                ID: {transaction.id.slice(0, 12)}...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-card-inner border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Card */}
        <div className="p-5 rounded-2xl bg-card-inner border border-card-border-subtle text-center space-y-1 shadow-sm">
          <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            {isIncome ? "Total Pemasukan" : "Total Pengeluaran"}
          </span>
          <p
            className={`text-2xl font-black tabular-nums tracking-wide ${
              isIncome ? "text-neon" : "text-red-400"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatRupiah(transaction.amount)}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-card-border-subtle">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Deskripsi
            </span>
            <span className="font-bold text-foreground text-right max-w-[200px]">
              {transaction.description}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-card-border-subtle">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Tanggal
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-card-border-subtle">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Kategori
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: transaction.categoryColor }}
              />
              {transaction.categoryName}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-card-border-subtle">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Sumber Relasi
            </span>
            <div>{getSourceBadge()}</div>
          </div>

          {transaction.notes && (
            <div className="pt-2">
              <span className="text-muted-foreground block mb-1">Catatan Tambahan:</span>
              <p className="p-3.5 rounded-2xl bg-card-inner border border-card-border-subtle text-foreground text-[11px] leading-relaxed shadow-sm">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
