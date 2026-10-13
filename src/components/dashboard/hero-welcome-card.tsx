"use client";

import React, { useState, useEffect } from "react";
import { Wallet, Clock, Calendar } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";

export interface HeroWelcomeCardProps {
  user: {
    name: string;
    email: string;
  };
  metrics: {
    totalLiquidCash: number;
    currentMonthIncome: number;
    currentMonthExpense: number;
    netCashflow: number;
    savingsRate: number;
    freelanceReceivables: number;
    nextPayday: {
      companyName: string | null;
      role: string | null;
      baseSalary: number;
      payday: number;
      daysRemaining: number;
    };
  };
  upcomingInterviewsCount: number;
  pendingMilestonesCount: number;
  className?: string;
}

/**
 * Returns dynamic Indonesian greeting based on current local time:
 * - 04:00 - 10:59: "Selamat pagi"
 * - 11:00 - 14:59: "Selamat siang"
 * - 15:00 - 18:29: "Selamat sore"
 * - 18:30 - 03:59: "Selamat malam"
 */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  const minute = date.getMinutes();

  if (hour >= 4 && hour < 11) {
    return "Selamat pagi";
  }
  if (hour >= 11 && hour < 15) {
    return "Selamat siang";
  }
  if (hour >= 15 && (hour < 18 || (hour === 18 && minute < 30))) {
    return "Selamat sore";
  }
  return "Selamat malam";
}

export function HeroWelcomeCard({
  user,
  metrics,
  upcomingInterviewsCount,
  pendingMilestonesCount,
  className,
}: HeroWelcomeCardProps) {
  const [greeting, setGreeting] = useState<string>(() => getGreeting());
  const [isWinking, setIsWinking] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const handleMascotClick = () => {
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 800);
  };

  const isSurplus = metrics.netCashflow >= 0;
  const cashflowStatus = isSurplus ? "surplus" : "defisit";
  const formattedNetCashflow = formatRupiah(Math.abs(metrics.netCashflow));
  const paydayCompany = metrics.nextPayday?.companyName || "Pekerjaan Aktif";

  return (
    <section
      className={cn(
        "bg-white text-slate-900 border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all",
        className
      )}
    >
      {/* Ambient Neon Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          {/* Header Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/50 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Semi-ERP Multi-User Engine • Active
          </div>

          {/* Dynamic Greeting Heading */}
          <h1
            suppressHydrationWarning
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900"
          >
            {greeting},{" "}
            <span className="text-emerald-600">{user.name || "User"}</span>!
          </h1>

          {/* Dynamic Summary Text */}
          <p className="text-sm text-slate-600 leading-relaxed">
            Arus kas bulan ini {cashflowStatus}{" "}
            <strong className="text-slate-900">{formattedNetCashflow}</strong>. Anda
            memiliki{" "}
            <strong className="text-slate-900">
              {upcomingInterviewsCount} jadwal interview
            </strong>{" "}
            dan{" "}
            <strong className="text-slate-900">
              {pendingMilestonesCount} termin piutang freelance
            </strong>{" "}
            yang siap ditagihkan.
          </p>

          {/* 3 Quick KPI Cards inside Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {/* KPI 1: Total Kas Likuid */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                Total Kas Likuid
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums mt-1">
                {formatRupiah(metrics.totalLiquidCash)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                Saldo siap pakai
              </p>
            </div>

            {/* KPI 2: Piutang Freelance */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Piutang Freelance
              </span>
              <p className="text-lg sm:text-xl font-black text-amber-600 tabular-nums mt-1">
                {formatRupiah(metrics.freelanceReceivables)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                Menunggu pencairan
              </p>
            </div>

            {/* KPI 3: Gajian Berikutnya */}
            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Gajian Berikutnya
              </span>
              <p className="text-lg sm:text-xl font-black text-emerald-600 tabular-nums mt-1">
                {metrics.nextPayday.daysRemaining} Hari Lagi
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                {paydayCompany}
              </p>
            </div>
          </div>
        </div>

        {/* 3D Cyber Mascot Asset (visible on lg screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center relative select-none">
          <div className="relative w-40 h-40 flex items-center justify-center animate-float">
            <div
              onClick={handleMascotClick}
              className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-emerald-500 via-lime-400 to-green-600 shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-12 transition-transform duration-500 cursor-pointer group"
              title="SynapseBot AI Companion"
            >
              {/* Cyber Visor */}
              <div className="w-20 h-20 rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-2 shadow-inner transition-transform group-hover:scale-105 duration-300">
                {/* Neon Pulsing Eyes */}
                <div className="flex gap-2 mb-1.5 items-center h-4">
                  {isWinking ? (
                    <>
                      <span className="w-3 h-0.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon-accent,#3BF029)]" />
                      <span className="w-3 h-3 rounded-full bg-neon animate-pulse shadow-[0_0_8px_var(--neon-accent,#3BF029)]" />
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-neon animate-pulse shadow-[0_0_8px_var(--neon-accent,#3BF029)]" />
                      <span className="w-3 h-3 rounded-full bg-neon animate-pulse shadow-[0_0_8px_var(--neon-accent,#3BF029)]" />
                    </>
                  )}
                </div>
                {/* Mouth Line */}
                <div className="w-8 h-1 rounded-full bg-white/40 group-hover:bg-neon/80 transition-colors" />
              </div>
            </div>
          </div>
          {/* Ambient Shadow Glow Below */}
          <div className="w-24 h-4 rounded-full bg-emerald-300/40 blur-md -mt-2 animate-pulse-glow" />
        </div>
      </div>
    </section>
  );
}
