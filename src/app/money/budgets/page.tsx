"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Wallet, PieChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "@/components/money/category-modal";
import { BudgetProgressCard } from "@/components/money/budget-progress-card";
import {
  getCategoryBudgetsWithSpent,
  getCategories,
  StoredCategory,
} from "@/actions/money.actions";
import { formatRupiah } from "@/lib/utils";

interface CategoryBudgetWithSpent extends StoredCategory {
  totalSpent: number;
  budget: number;
  percentage: number;
  status: "HEALTHY" | "WARNING" | "OVER_BUDGET";
  remaining: number;
}

export default function BudgetsPage() {
  const [expenseBudgets, setExpenseBudgets] = useState<CategoryBudgetWithSpent[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<StoredCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoredCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [expenseData, incomeData] = await Promise.all([
        getCategoryBudgetsWithSpent(),
        getCategories("INCOME"),
      ]);
      setExpenseBudgets(expenseData);
      setIncomeCategories(incomeData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (cat: StoredCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const totalAllocatedBudget = expenseBudgets.reduce((acc, c) => acc + c.budget, 0);
  const totalSpentAll = expenseBudgets.reduce((acc, c) => acc + c.totalSpent, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/money"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Buku Kas
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Kategori & Anggaran Bulanan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Atur batas pengeluaran per kategori untuk menjaga cashflow tetap sehat.
          </p>
        </div>

        <Button onClick={handleCreate} className="h-10 text-xs font-bold gap-2">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Button>
      </div>

      {/* Aggregate Budget Summary Card */}
      <div className="p-6 rounded-3xl bg-card border border-card-border shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Total Anggaran Dialokasikan
          </span>
          <p className="text-xl sm:text-2xl font-black text-foreground mt-1 tabular-nums">
            {formatRupiah(totalAllocatedBudget)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Batas pengeluaran per bulan
          </span>
        </div>

        <div>
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Realisasi Pengeluaran
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1 tabular-nums">
            {formatRupiah(totalSpentAll)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Total belanja bulan berjalan
          </span>
        </div>

        <div>
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Sisa Kuota Anggaran
          </span>
          <p className="text-xl sm:text-2xl font-black text-neon mt-1 tabular-nums">
            {formatRupiah(Math.max(0, totalAllocatedBudget - totalSpentAll))}
          </p>
          <span className="text-[11px] text-neon flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3" /> Dana aman terkontrol
          </span>
        </div>
      </div>

      {/* Expense Categories with Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-neon" />
            <h2 className="text-base font-bold text-foreground">
              Kategori Pengeluaran ({expenseBudgets.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Monitor realisasi anggaran per pos belanja
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Memuat kategori anggaran...
          </div>
        ) : expenseBudgets.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-card border border-card-border text-xs text-muted-foreground">
            Belum ada kategori pengeluaran. Klik &quot;Tambah Kategori&quot; untuk membuat.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseBudgets.map((item) => (
              <BudgetProgressCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Income Categories */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">
              Kategori Pemasukan ({incomeCategories.length})
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Sumber pendapatan profesional & sampingan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-card border border-card-border flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{cat.name}</h4>
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                    Income Stream
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(cat)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Category CRUD Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={loadData}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}
