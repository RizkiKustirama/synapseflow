"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Wallet, PieChart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/money/quick-add-modal";
import { TransactionTable } from "@/components/money/transaction-table";
import {
  getTransactions,
  getMoneySummary,
  StoredTransaction,
} from "@/actions/money.actions";
import { formatRupiah } from "@/lib/utils";

export default function MoneyPage() {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [summary, setSummary] = useState({
    totalBalance: 24850000,
    monthlyIncome: 24500000,
    monthlyExpense: 535000,
    netCashflow: 23965000,
    savingsRate: 97.8,
    totalReceivables: 14500000,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trxData, summaryData] = await Promise.all([
        getTransactions(),
        getMoneySummary(),
      ]);
      setTransactions(trxData);
      setSummary(summaryData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Money & Cashflow Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Buku kas harian terpadu, sinkronisasi termin freelance, gaji kantor, dan tracking piutang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/money/budgets">
            <Button variant="outline" className="h-10 text-xs font-bold gap-2">
              <PieChart className="w-4 h-4 text-neon" /> Kategori & Anggaran
            </Button>
          </Link>

          <Button
            onClick={() => setModalOpen(true)}
            className="h-10 text-xs font-bold gap-2"
          >
            <Plus className="w-4 h-4" /> Catat Transaksi
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-card-border pb-3">
        <div className="px-4 py-2 rounded-2xl bg-card border border-card-border text-xs font-bold text-neon shadow-sm flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Buku Kas Terpadu
        </div>
        <Link
          href="/money/budgets"
          className="px-4 py-2 rounded-2xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card-border/30 transition-colors flex items-center gap-2"
        >
          <PieChart className="w-4 h-4" /> Kategori & Budget Limit
        </Link>
        <button
          onClick={loadData}
          className="ml-auto p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card-border/30 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">
            Total Saldo Kas
          </span>
          <p className="text-xl sm:text-2xl font-black text-foreground mt-1 tabular-nums">
            {formatRupiah(summary.totalBalance)}
          </p>
          <span className="text-[10px] text-neon font-medium mt-1 inline-block">
            Surplus Kas Aktif
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">
            Pemasukan Bulan Ini
          </span>
          <p className="text-xl sm:text-2xl font-black text-neon mt-1 tabular-nums">
            {formatRupiah(summary.monthlyIncome)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">
            Gaji + Freelance
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">
            Pengeluaran Bulan Ini
          </span>
          <p className="text-xl sm:text-2xl font-black text-red-400 mt-1 tabular-nums">
            {formatRupiah(summary.monthlyExpense)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">
            Biaya hidup & operasional
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">
            Total Piutang Aktif
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1 tabular-nums">
            {formatRupiah(summary.totalReceivables)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">
            Menunggu termin freelance
          </span>
        </div>
      </div>

      {/* TanStack Data Table for Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Daftar Seluruh Transaksi ({transactions.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            Multi-filter & real-time sorting aktif
          </span>
        </div>

        <TransactionTable data={transactions} onRefresh={loadData} />
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
