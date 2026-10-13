"use client";

import React, { useState } from "react";
import { X, ArrowDownRight, ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRupiah } from "@/lib/utils";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const mockCategories = [
  { id: "cat-1", name: "Makan & Minum", type: "EXPENSE", color: "#F97316" },
  { id: "cat-2", name: "Transport & Bensin", type: "EXPENSE", color: "#3B82F6" },
  { id: "cat-3", name: "Hosting & Server", type: "EXPENSE", color: "#EC4899" },
  { id: "cat-4", name: "Gaji Kantor", type: "INCOME", color: "#22C55E" },
  { id: "cat-5", name: "Termin Freelance", type: "INCOME", color: "#3BF029" },
  { id: "cat-6", name: "Lain-lain", type: "EXPENSE", color: "#64748B" },
];

export function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("cat-1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [10000, 25000, 50000, 100000, 500000];

  const handleAddQuickAmount = (val: number) => {
    const current = parseInt(amount.replace(/[^0-9]/g, "") || "0", 10);
    setAmount((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsSubmitting(true);
    // Simulating instant mutation
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        setAmount("");
        setDescription("");
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    }, 400);
  };

  const filteredCategories = mockCategories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-neon/20 text-neon flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Quick-Add Transaksi
              </h3>
              <p className="text-xs text-muted-foreground">
                Catat pengeluaran / pemasukan dalam 3 detik
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

        {successNotice ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-neon/20 border-2 border-neon text-neon flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Transaksi Berhasil Disimpan!
            </p>
            <p className="text-xs text-muted-foreground">
              Saldo otomatis disinkronkan ke buku kas
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Type Selector (Tabs) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-background rounded-2xl border border-card-border">
              <button
                type="button"
                onClick={() => {
                  setType("EXPENSE");
                  setSelectedCategory("cat-1");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  type === "EXPENSE"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowDownRight className="w-4 h-4" />
                Pengeluaran
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("INCOME");
                  setSelectedCategory("cat-4");
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                  type === "INCOME"
                    ? "bg-neon/15 text-neon border border-neon/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowUpRight className="w-4 h-4" />
                Pemasukan
              </button>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Nominal (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-11 text-lg font-extrabold tabular-nums tracking-wide h-12"
                  autoFocus
                  required
                />
              </div>

              {/* Quick Chip Adders */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAddQuickAmount(q)}
                    className="px-2.5 py-1 rounded-lg bg-background hover:bg-card-border/40 border border-card-border text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +{formatRupiah(q).replace("Rp", "").trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Deskripsi
              </label>
              <Input
                type="text"
                placeholder="Contoh: Kopi susu & makan siang, Bayar hosting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Kategori
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-1">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all",
                        isSelected
                          ? "bg-card-border/50 border-neon text-foreground font-semibold shadow-sm"
                          : "bg-background border-card-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !amount || !description}
                className="w-full h-12 text-sm font-bold"
              >
                {isSubmitting ? "Menyimpan Transaksi..." : "Catat Transaksi Sekarang"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
