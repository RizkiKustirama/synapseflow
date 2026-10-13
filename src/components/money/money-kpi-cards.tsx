"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, PiggyBank } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface MoneyKpiCardsProps {
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netCashflow: number;
    savingsRate: number;
    totalReceivables: number;
  };
}

export function MoneyKpiCards({ summary }: MoneyKpiCardsProps) {
  const totalFlow = summary.monthlyIncome + summary.monthlyExpense;
  const incomePercent = totalFlow > 0 ? Math.round((summary.monthlyIncome / totalFlow) * 100) : 50;
  const expensePercent = totalFlow > 0 ? 100 - incomePercent : 50;

  return (
    <div className="space-y-4">
      {/* 4 Primary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Balance */}
        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm space-y-1.5 hover:border-card-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Total Kas Likuid
            </span>
            <div className="w-8 h-8 rounded-xl bg-neon/15 text-neon flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
            {formatRupiah(summary.totalBalance)}
          </p>
          <span className="text-[10px] text-neon font-medium inline-block">
            Saldo kas aktif terverifikasi
          </span>
        </div>

        {/* 2. Monthly Income */}
        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm space-y-1.5 hover:border-card-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Pemasukan Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-neon tabular-nums">
            +{formatRupiah(summary.monthlyIncome)}
          </p>
          <span className="text-[10px] text-muted-foreground inline-block">
            Gaji Kantor + Termin Freelance
          </span>
        </div>

        {/* 3. Monthly Expense */}
        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm space-y-1.5 hover:border-card-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Pengeluaran Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-400 tabular-nums">
            -{formatRupiah(summary.monthlyExpense)}
          </p>
          <span className="text-[10px] text-muted-foreground inline-block">
            Biaya hidup & operasional
          </span>
        </div>

        {/* 4. Net Cashflow & Savings Rate */}
        <div className="p-5 rounded-3xl bg-card border border-card-border shadow-sm space-y-1.5 hover:border-card-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Net Surplus / Tabungan
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-400 tabular-nums">
            {formatRupiah(summary.netCashflow)}
          </p>
          <span className="text-[10px] text-neon font-bold inline-block">
            Savings Rate: {summary.savingsRate}%
          </span>
        </div>
      </div>

      {/* Cashflow Flow Ratio Gauge Bar */}
      <div className="p-4 rounded-2xl bg-card border border-card-border shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon" />
            <span className="font-semibold text-foreground">
              Pemasukan ({incomePercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">
              Pengeluaran ({expensePercent}%)
            </span>
            <span className="w-2 h-2 rounded-full bg-red-400" />
          </div>
        </div>

        <div className="w-full bg-red-400/20 h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-neon h-full transition-all duration-700"
            style={{ width: `${incomePercent}%` }}
          />
          <div
            className="bg-red-400 h-full transition-all duration-700"
            style={{ width: `${expensePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
