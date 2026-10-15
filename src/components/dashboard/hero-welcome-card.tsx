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

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const isSurplus = metrics.netCashflow >= 0;
  const cashflowStatus = isSurplus ? "surplus" : "defisit";
  const formattedNetCashflow = formatRupiah(Math.abs(metrics.netCashflow));
  const paydayCompany = metrics.nextPayday?.companyName || "Pekerjaan Aktif";

  return (
    <section
      className={cn(
        "relative rounded-[2.5rem] p-7 md:p-8 overflow-hidden shadow-xl border text-[#07240f] select-none transition-all",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, rgb(164, 246, 83) 0%, rgb(117, 231, 48) 65%, rgb(98, 220, 33) 100%)",
        borderColor: "rgb(136, 239, 64)",
      }}
    >
      <div className="relative z-10 max-w-[70%] sm:max-w-[65%]">
        {/* Dynamic Greeting Heading */}
        <h2
          suppressHydrationWarning
          className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-[#072510]"
        >
          {greeting},
          <br />
          {user.name || "User"}
        </h2>

        {/* Dynamic Summary Text */}
        <p className="text-xs md:text-sm font-semibold text-[#0d3d19] mt-2.5 leading-relaxed">
          Arus kas bulan ini {cashflowStatus}{" "}
          <span className="font-black text-[#072510]">{formattedNetCashflow}</span>.
          Anda memiliki{" "}
          <span className="font-black text-[#072510]">
            {upcomingInterviewsCount} agenda interview
          </span>{" "}
          dan{" "}
          <span className="font-black text-[#072510]">
            {pendingMilestonesCount} termin piutang freelance
          </span>{" "}
          siap ditagihkan.
        </p>
      </div>

      {/* Stylized Cybernetic Mascot Visual Graphic (SVG Vector from Stitch) */}
      <div className="absolute right-2 -bottom-2 sm:right-6 sm:bottom-0 w-44 h-48 md:w-56 md:h-60 z-10 pointer-events-none select-none">
        <svg
          className="w-full h-full drop-shadow-2xl animate-float"
          fill="none"
          viewBox="0 0 220 240"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pedestal */}
          <rect
            fill="#0c4a1e"
            height="42"
            rx="10"
            stroke="#2bf062"
            strokeWidth="2"
            width="80"
            x="70"
            y="195"
          />
          <path
            d="M75 210h70M80 225h60"
            stroke="#38e54d"
            strokeDasharray="4 3"
            strokeWidth="1.5"
          />
          {/* Legs & Torso */}
          <rect
            fill="#0d1b11"
            height="48"
            rx="16"
            stroke="#2bf062"
            strokeWidth="2.5"
            width="50"
            x="85"
            y="150"
          />
          <circle cx="110" cy="174" fill="#2bf062" fillOpacity="0.8" r="8" />
          <line
            stroke="#38e54d"
            strokeWidth="2"
            x1="94"
            x2="126"
            y1="188"
            y2="188"
          />
          {/* Head with Visor */}
          <rect
            fill="#08140c"
            height="98"
            rx="36"
            stroke="#25e85d"
            strokeWidth="3"
            width="116"
            x="52"
            y="45"
          />
          {/* Ears / Antennas */}
          <rect
            fill="#133d1e"
            height="32"
            rx="8"
            stroke="#2bf062"
            strokeWidth="2"
            width="16"
            x="36"
            y="78"
          />
          <rect
            fill="#133d1e"
            height="32"
            rx="8"
            stroke="#2bf062"
            strokeWidth="2"
            width="16"
            x="168"
            y="78"
          />
          <circle cx="110" cy="38" fill="#2bf062" r="6" />
          <rect fill="#133d1e" height="6" width="4" x="108" y="42" />
          {/* Visor Digital Screen */}
          <rect fill="#051c0b" height="72" rx="22" width="92" x="64" y="58" />
          {/* Glowing Diamond Cyber Eyes */}
          <polygon
            className="animate-pulse"
            fill="#2bf062"
            points="88,86 96,75 104,86 96,97"
          />
          <polygon
            className="animate-pulse"
            fill="#2bf062"
            points="120,86 128,75 136,86 128,97"
          />
          {/* Circuit Lines */}
          <path
            d="M72 70h12v15M148 70h-12v15M96 110v12M128 110v12M74 114h20M126 114h20"
            stroke="#1f8a41"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Bottom Floating KPI Metric Ribbon (Stitch exact layout) */}
      <div className="mt-8 bg-white rounded-2xl md:rounded-[1.5rem] p-4 md:p-5 shadow-lg flex items-center justify-between text-gray-800 z-10 relative">
        {/* KPI 1: Total Kas Likuid */}
        <div className="flex-1 border-r border-gray-200/80 pr-3 sm:pr-4">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-gray-400" />
            Total Kas Likuid
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight tabular-nums">
              {formatRupiah(metrics.totalLiquidCash)}
            </span>
          </div>
        </div>

        {/* KPI 2: Piutang Freelance */}
        <div className="flex-1 border-r border-gray-200/80 px-3 sm:px-4">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Piutang Freelance
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-amber-600 tracking-tight tabular-nums">
              {formatRupiah(metrics.freelanceReceivables)}
            </span>
          </div>
        </div>

        {/* KPI 3: Gajian Berikutnya */}
        <div className="flex-1 pl-3 sm:pl-4">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Gajian Berikutnya
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-600 tracking-tight tabular-nums">
              {metrics.nextPayday.daysRemaining} Hari Lagi
            </span>
            <span className="hidden sm:inline text-[11px] font-bold text-gray-400 truncate max-w-[120px]">
              {paydayCompany}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
