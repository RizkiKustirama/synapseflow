"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Total Balance */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border shadow-sm space-y-2 hover:border-neon/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              Total Kas Likuid
            </span>
            <div className="w-9 h-9 rounded-full bg-neon/15 text-neon flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums truncate">
            {formatRupiah(summary.totalBalance)}
          </p>
          <span className="text-[11px] text-neon font-medium inline-block">
            Saldo kas aktif terverifikasi
          </span>
        </div>

        {/* 2. Monthly Income */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border shadow-sm space-y-2 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              Pemasukan Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-neon tabular-nums truncate">
            +{formatRupiah(summary.monthlyIncome)}
          </p>
          <span className="text-[11px] text-muted-foreground inline-block">
            Gaji Kantor + Termin Freelance
          </span>
        </div>

        {/* 3. Monthly Expense */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border shadow-sm space-y-2 hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              Pengeluaran Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-red-400 tabular-nums truncate">
            -{formatRupiah(summary.monthlyExpense)}
          </p>
          <span className="text-[11px] text-muted-foreground inline-block">
            Biaya hidup & operasional
          </span>
        </div>

        {/* 4. Net Cashflow & Savings Rate */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border shadow-sm space-y-2 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              Net Surplus / Tabungan
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-400 tabular-nums truncate">
            {formatRupiah(summary.netCashflow)}
          </p>
          <span className="text-[11px] text-neon font-bold inline-block">
            Savings Rate: {summary.savingsRate}%
          </span>
        </div>
      </div>

      {/* Cashflow Flow Ratio Gauge Bar */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon" />
            <span className="font-bold text-foreground">
              Pemasukan ({incomePercent}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-muted-foreground">
              Pengeluaran ({expensePercent}%)
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          </div>
        </div>

        <div className="w-full bg-card-inner h-3 rounded-full overflow-hidden flex border border-card-border-subtle p-0.5">
          <div
            className="bg-neon h-full rounded-full transition-all duration-700"
            style={{ width: `${incomePercent}%` }}
          />
          <div
            className="bg-red-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${expensePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
