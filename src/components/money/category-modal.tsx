"use client";

import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory, StoredCategory } from "@/actions/money.actions";
import { cn } from "@/lib/utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categoryToEdit?: StoredCategory | null;
}

const colorPresets = [
  "#3BF029", // Neon Green
  "#22C55E", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#A855F7", // Purple
  "#64748B", // Slate
];

const iconPresets = [
  { id: "briefcase", label: "Gaji/Kerja" },
  { id: "folder-git-2", label: "Freelance" },
  { id: "utensils", label: "Makan" },
  { id: "car", label: "Transport" },
  { id: "server", label: "Tools/Host" },
  { id: "shopping-bag", label: "Belanja" },
  { id: "coffee", label: "Kopi/Cafe" },
  { id: "home", label: "Tempat Tinggal" },
];

export function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}: CategoryModalProps) {
  const isEditing = !!categoryToEdit;
  const [name, setName] = useState(categoryToEdit?.name || "");
  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    categoryToEdit?.type || "EXPENSE"
  );
  const [color, setColor] = useState(categoryToEdit?.color || "#3BF029");
  const [icon, setIcon] = useState(categoryToEdit?.icon || "utensils");
  const [monthlyBudget, setMonthlyBudget] = useState<string>(
    categoryToEdit?.monthlyBudget ? categoryToEdit.monthlyBudget.toString() : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when categoryToEdit changes
  React.useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setColor(categoryToEdit.color);
      setIcon(categoryToEdit.icon);
      setMonthlyBudget(
        categoryToEdit.monthlyBudget ? categoryToEdit.monthlyBudget.toString() : ""
      );
    } else {
      setName("");
      setType("EXPENSE");
      setColor("#3BF029");
      setIcon("utensils");
      setMonthlyBudget("");
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        color,
        icon,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
      };

      if (isEditing && categoryToEdit) {
        await updateCategory(categoryToEdit.id, payload);
      } else {
        await createCategory(payload);
      }

      onClose();
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border border-card-border rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-card-border/60">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Kelola kategori buku kas & batas anggaran bulanan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-card-inner border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-card-inner rounded-full border border-card-border-subtle shadow-sm">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={cn(
                "py-2 rounded-full text-xs font-bold transition-all",
                type === "EXPENSE"
                  ? "bg-red-500/20 text-red-400 font-extrabold border border-red-500/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={cn(
                "py-2 rounded-full text-xs font-bold transition-all",
                type === "INCOME"
                  ? "bg-neon text-black font-extrabold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Pemasukan
            </button>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Nama Kategori
            </label>
            <Input
              type="text"
              placeholder="Contoh: Belanja Bulanan, Langganan AI..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl bg-card-inner border-card-border focus-visible:ring-neon/30"
              required
            />
          </div>

          {/* Monthly Budget (for Expenses) */}
          {type === "EXPENSE" && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Batas Anggaran Bulanan (Opsional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="3000000"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="pl-10 text-sm font-bold tabular-nums rounded-xl bg-card-inner border-card-border focus-visible:ring-neon/30"
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                Sistem akan memberi alert jika pengeluaran melebihi batas ini
              </span>
            </div>
          )}

          {/* Color Picker Presets */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Warna Penanda
            </label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-transform",
                    color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-card" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Presets */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Ikon Representasi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iconPresets.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  className={cn(
                    "p-2.5 rounded-xl text-[11px] font-medium border text-center transition-all",
                    icon === item.id
                      ? "bg-card border-neon text-neon font-bold shadow-sm"
                      : "bg-card-inner border-card-border-subtle text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full h-11 rounded-full text-xs font-extrabold bg-neon text-black hover:bg-neon/90 shadow-sm"
            >
              {isSubmitting
                ? "Menyimpan..."
                : isEditing
                ? "Perbarui Kategori"
                : "Simpan Kategori"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
