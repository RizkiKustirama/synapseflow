"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Wallet, PieChart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/money/quick-add-modal";
import { TransactionTable } from "@/components/money/transaction-table";
import { MoneyKpiCards } from "@/components/money/money-kpi-cards";
import { ReceivablesCard } from "@/components/money/receivables-card";
import {
  getTransactions,
  getMoneySummary,
  getReceivables,
  StoredTransaction,
  StoredReceivableItem,
} from "@/actions/money.actions";
import { cn } from "@/lib/utils";

export default function MoneyPage() {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [receivables, setReceivables] = useState<StoredReceivableItem[]>([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    netCashflow: 0,
    savingsRate: 0,
    totalReceivables: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trxData, summaryData, receivablesData] = await Promise.all([
        getTransactions(),
        getMoneySummary(),
        getReceivables(),
      ]);
      setTransactions(trxData);
      setSummary(summaryData);
      setReceivables(receivablesData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleCreated = () => {
      loadData();
    };
    window.addEventListener("synapseflow:transaction-created", handleCreated);
    return () => window.removeEventListener("synapseflow:transaction-created", handleCreated);
  }, [loadData]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-card-border text-[11px] font-semibold text-muted-foreground w-fit mb-2 shadow-sm">
            <Wallet className="w-3.5 h-3.5 text-neon" />
            Buku Kas Terpadu & Multi-Stream Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Money & Cashflow Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Buku kas harian terpadu, sinkronisasi termin freelance, gaji kantor, dan tracking piutang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadData}
            className="p-2.5 rounded-full bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>

          <Link href="/money/budgets">
            <Button
              variant="outline"
              className="h-10 px-5 rounded-full text-xs font-bold gap-2 bg-card-inner border-card-border text-foreground hover:bg-card-inner/80 shadow-sm"
            >
              <PieChart className="w-4 h-4 text-neon" /> Kategori & Anggaran
            </Button>
          </Link>

          <Button
            onClick={() => setModalOpen(true)}
            className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Catat Transaksi
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Stitch Pill Style) */}
      <div className="flex items-center justify-between gap-2 border-b border-card-border pb-4">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-card border border-card-border shadow-sm">
          <div className="px-4 py-2 rounded-full text-xs font-extrabold bg-neon text-black shadow-sm flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Buku Kas Terpadu
          </div>
          <Link
            href="/money/budgets"
            className="px-4 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card-border/30 transition-all flex items-center gap-2"
          >
            <PieChart className="w-4 h-4" /> Kategori & Budget Limit
          </Link>
        </div>
      </div>

      {/* Real-time KPI Cards & Ratio Gauge */}
      <MoneyKpiCards summary={summary} />

      {/* Receivables (Piutang Tracker) Card */}
      <ReceivablesCard items={receivables} onSettled={loadData} />

      {/* TanStack Data Table for Transactions */}
      <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Daftar Seluruh Transaksi ({transactions.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-filter & real-time sorting aktif
            </p>
          </div>
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
