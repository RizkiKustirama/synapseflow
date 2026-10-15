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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-card-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all shadow-sm"
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

        <Button
          onClick={handleCreate}
          className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Kategori
        </Button>
      </div>

      {/* Aggregate Budget Summary Card */}
      <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card-inner border border-card-border-subtle space-y-1.5 shadow-sm">
          <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            Total Anggaran Dialokasikan
          </span>
          <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
            {formatRupiah(totalAllocatedBudget)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Batas pengeluaran per bulan
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-card-inner border border-card-border-subtle space-y-1.5 shadow-sm">
          <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            Realisasi Pengeluaran
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
            {formatRupiah(totalSpentAll)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Total belanja bulan berjalan
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-card-inner border border-card-border-subtle space-y-1.5 shadow-sm">
          <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            Sisa Kuota Anggaran
          </span>
          <p className="text-xl sm:text-2xl font-black text-neon tabular-nums">
            {formatRupiah(Math.max(0, totalAllocatedBudget - totalSpentAll))}
          </p>
          <span className="text-[11px] text-neon flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Dana aman terkontrol
          </span>
        </div>
      </div>

      {/* Expense Categories with Progress Bar */}
      <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neon/15 text-neon flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Kategori Pengeluaran ({expenseBudgets.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Monitor realisasi anggaran per pos belanja
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Memuat kategori anggaran...
          </div>
        ) : expenseBudgets.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-card-inner border border-card-border-subtle text-xs text-muted-foreground">
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
      <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Kategori Pemasukan ({incomeCategories.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Sumber pendapatan profesional & sampingan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle flex items-center justify-between hover:border-card-border transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{cat.name}</h4>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                    Income Stream
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleEdit(cat)}
                className="px-3.5 py-1.5 rounded-full bg-card border border-card-border text-xs font-bold text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all shadow-sm"
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
