"use client";

import React from "react";
import { X, ArrowUpRight, ArrowDownRight, Calendar, Tag, Layers, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        return <Badge variant="default">Gaji Kantor (Employment)</Badge>;
      case "FREELANCE_MILESTONE":
        return <Badge variant="processing">Termin Freelance</Badge>;
      case "PROJECT_EXPENSE":
        return <Badge variant="destructive">Biaya Proyek</Badge>;
      default:
        return <Badge variant="outline">Pencatatan Manual</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border border-card-border rounded-3xl shadow-2xl p-6 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-card-border">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isIncome ? "bg-neon/20 text-neon" : "bg-red-500/20 text-red-400"
              }`}
            >
              {isIncome ? (
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Detail Transaksi
              </h3>
              <p className="text-[11px] text-muted-foreground">
                ID: {transaction.id.slice(0, 12)}...
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-background border border-card-border text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Card */}
        <div className="p-4 rounded-2xl bg-background border border-card-border/80 text-center space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">
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
          <div className="flex justify-between py-2 border-b border-card-border">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Deskripsi
            </span>
            <span className="font-bold text-foreground text-right max-w-[200px]">
              {transaction.description}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-card-border">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Tanggal
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-card-border">
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

          <div className="flex justify-between py-2 border-b border-card-border">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Sumber Relasi
            </span>
            <div>{getSourceBadge()}</div>
          </div>

          {transaction.notes && (
            <div className="pt-2">
              <span className="text-muted-foreground block mb-1">Catatan Tambahan:</span>
              <p className="p-3 rounded-xl bg-background border border-card-border text-foreground text-[11px] leading-relaxed">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
