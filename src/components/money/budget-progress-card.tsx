"use client";

import React from "react";
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import { StoredCategory, deleteCategory } from "@/actions/money.actions";

interface CategoryBudgetWithSpent extends StoredCategory {
  totalSpent: number;
  budget: number;
  percentage: number;
  status: "HEALTHY" | "WARNING" | "OVER_BUDGET";
  remaining: number;
}

interface BudgetProgressCardProps {
  item: CategoryBudgetWithSpent;
  onEdit: (cat: StoredCategory) => void;
  onRefresh: () => void;
}

export function BudgetProgressCard({
  item,
  onEdit,
  onRefresh,
}: BudgetProgressCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${item.name}"?`)) {
      setIsDeleting(true);
      try {
        await deleteCategory(item.id);
        onRefresh();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusBadge = () => {
    if (item.status === "OVER_BUDGET") {
      return (
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Melebihi Anggaran
        </span>
      );
    }
    if (item.status === "WARNING") {
      return (
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          Mendekati Batas ({item.percentage}%)
        </span>
      );
    }
    if (item.budget > 0) {
      return (
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-[#25dd59]/15 text-[#25dd59] border border-[#25dd59]/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" /> Aman ({item.percentage}%)
        </span>
      );
    }
    return (
      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-card text-muted-foreground border border-card-border">
        Tanpa Batas
      </span>
    );
  };

  const getProgressBarColor = () => {
    if (item.status === "OVER_BUDGET") return "bg-red-500";
    if (item.status === "WARNING") return "bg-amber-400";
    return "bg-neon";
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border transition-all space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <h4 className="text-sm font-bold text-foreground truncate">
            {item.name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          {getStatusBadge()}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="Edit Kategori"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-full text-muted-foreground hover:text-red-400 hover:bg-card transition-colors"
            title="Hapus Kategori"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Figures */}
      <div className="flex justify-between items-baseline text-xs">
        <div>
          <span className="text-[11px] text-muted-foreground">Terpakai:</span>
          <p className="text-sm font-extrabold text-foreground tabular-nums">
            {formatRupiah(item.totalSpent)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground">
            {item.budget > 0 ? "Batas Anggaran:" : "Alokasi:"}
          </span>
          <p className="text-sm font-extrabold text-muted-foreground tabular-nums">
            {item.budget > 0 ? formatRupiah(item.budget) : "Bebas"}
          </p>
        </div>
      </div>

      {/* Progress Track */}
      {item.budget > 0 ? (
        <div className="space-y-1">
          <div className="w-full bg-card h-2.5 rounded-full overflow-hidden border border-card-border p-0.5">
            <div
              className={cn("h-full rounded-full transition-all duration-500", getProgressBarColor())}
              style={{ width: `${Math.min(100, item.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
            <span>
              {item.status === "OVER_BUDGET"
                ? `Defisit: ${formatRupiah(item.totalSpent - item.budget)}`
                : `Sisa: ${formatRupiah(item.remaining)}`}
            </span>
            <span className="font-bold">{item.percentage}%</span>
          </div>
        </div>
      ) : (
        <div className="text-[10px] text-muted-foreground italic">
          Kategori ini belum memiliki batas anggaran bulanan.
        </div>
      )}
    </div>
  );
}
