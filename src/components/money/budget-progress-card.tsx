"use client";

import React from "react";
import { Edit2, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <Badge variant="destructive" className="text-[10px] gap-1">
          <AlertTriangle className="w-3 h-3" /> Melebihi Anggaran
        </Badge>
      );
    }
    if (item.status === "WARNING") {
      return (
        <Badge variant="done" className="text-[10px] gap-1 text-amber-400">
          Mendekati Batas ({item.percentage}%)
        </Badge>
      );
    }
    if (item.budget > 0) {
      return (
        <Badge variant="default" className="text-[10px] gap-1">
          <CheckCircle2 className="w-3 h-3" /> Aman ({item.percentage}%)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px]">
        Tanpa Batas
      </Badge>
    );
  };

  const getProgressBarColor = () => {
    if (item.status === "OVER_BUDGET") return "bg-red-500";
    if (item.status === "WARNING") return "bg-amber-400";
    return "bg-neon";
  };

  return (
    <Card className="p-4 sm:p-5 border border-card-border hover:border-card-border/80 transition-all space-y-3.5">
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
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-border/40 transition-colors"
            title="Edit Kategori"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-card-border/40 transition-colors"
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
          <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-card-border">
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
    </Card>
  );
}
