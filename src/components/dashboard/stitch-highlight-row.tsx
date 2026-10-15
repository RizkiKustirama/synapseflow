"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export interface StitchHighlightRowProps {
  savingsRate: number;
  netCashflow: number;
  freelanceReceivables: number;
  activeProjectsCount: number;
  activeInterviewsCount: number;
  totalApplicationsCount: number;
  topTargetRole?: string | null;
}

export function StitchHighlightRow({
  savingsRate,
  netCashflow,
  freelanceReceivables,
  activeProjectsCount,
  activeInterviewsCount,
  totalApplicationsCount,
  topTargetRole,
}: StitchHighlightRowProps) {
  const clampedRate = Math.max(0, Math.min(savingsRate, 100));
  const circumference = 2 * Math.PI * 40; // ~251.327
  const strokeDashoffset = circumference - (circumference * clampedRate) / 100;
  const isSurplus = netCashflow >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-purpose="highlight-cards-row">
      {/* =======================================================================
          HIGHLIGHT 1: SAVINGS TARGET / CASHFLOW GAUGE CARD (WHITE THEME)
         ======================================================================= */}
      <Link href="/money" className="group block">
        <div className="bg-white rounded-[2rem] p-4 flex flex-col items-center justify-between text-center shadow-lg text-gray-900 h-full min-h-[190px] border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="relative w-20 h-20 my-1">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r="40"
                stroke="#25e85d"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="6"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-extrabold text-gray-900 tabular-nums">
                {savingsRate}%
              </span>
            </div>
          </div>
          <div>
            <p className="font-bold text-xs text-gray-900">Target Tabungan</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5 truncate max-w-[120px]">
              {isSurplus ? "Surplus: " : "Defisit: "}
              {formatRupiah(Math.abs(netCashflow))}
            </p>
          </div>
        </div>
      </Link>

      {/* =======================================================================
          HIGHLIGHT 2: FREELANCE LEDGER (BLACK CYBER CARD WITH MINI BOT)
         ======================================================================= */}
      <Link href="/freelance" className="group block">
        <div className="bg-black rounded-[2rem] p-4 flex flex-col justify-between shadow-lg border border-[#217036] relative overflow-hidden h-full min-h-[190px] text-white hover:border-neon transition-all duration-200">
          {/* Mini Neon Bot Graphic */}
          <div className="w-full h-16 flex items-center justify-center">
            <svg className="w-14 h-14 text-[#38e54d]" viewBox="0 0 100 100">
              <rect
                fill="#133d1e"
                height="42"
                rx="14"
                stroke="#2bf062"
                strokeWidth="2"
                width="50"
                x="25"
                y="20"
              />
              <circle cx="40" cy="40" fill="#2bf062" r="4" />
              <circle cx="60" cy="40" fill="#2bf062" r="4" />
              <path
                d="M42 52h16"
                stroke="#2bf062"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <rect
                fill="#081c0f"
                height="26"
                rx="8"
                stroke="#2bf062"
                strokeWidth="1.5"
                width="28"
                x="36"
                y="65"
              />
              <line
                stroke="#2bf062"
                strokeWidth="2"
                x1="20"
                x2="25"
                y1="36"
                y2="36"
              />
              <line
                stroke="#2bf062"
                strokeWidth="2"
                x1="75"
                x2="80"
                y1="36"
                y2="36"
              />
            </svg>
          </div>
          <div className="mt-2">
            <p className="text-xs font-bold text-white leading-tight">Freelance Ledger</p>
            <p className="text-[11px] font-semibold text-[#38e54d] mt-0.5 whitespace-nowrap tabular-nums">
              {formatRupiah(freelanceReceivables)}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {activeProjectsCount} Proyek Aktif
            </p>
          </div>
        </div>
      </Link>

      {/* =======================================================================
          HIGHLIGHT 3: CAREER PIPELINE (VIBRANT LIME-GREEN CARD)
         ======================================================================= */}
      <Link href="/career" className="group block">
        <div className="bg-[#78e354] rounded-[2rem] p-4 flex flex-col justify-between shadow-lg text-black relative overflow-hidden h-full min-h-[190px] hover:bg-[#6ed94a] transition-all duration-200">
          <div>
            <p className="text-xs font-extrabold leading-tight text-emerald-950">
              Pipeline Karier
            </p>
            <p className="text-[11px] font-bold text-emerald-900 mt-0.5">
              {activeInterviewsCount} Tahap Interview
            </p>
          </div>

          {/* Center Graphic Badge */}
          <div className="w-full flex justify-center my-1">
            <div className="w-14 h-14 rounded-2xl bg-[#144721] flex items-center justify-center border-2 border-white/60 shadow-md">
              <span className="text-white text-xs font-black tracking-wider uppercase">
                {totalApplicationsCount} APP
              </span>
            </div>
          </div>

          <p className="text-[10px] font-black text-emerald-950 text-center truncate">
            {topTargetRole ? `Target: ${topTargetRole}` : "Siap Lamaran Baru"}
          </p>
        </div>
      </Link>
    </div>
  );
}
