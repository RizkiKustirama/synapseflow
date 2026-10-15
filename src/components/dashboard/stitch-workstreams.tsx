"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ExecutiveDashboardData } from "@/actions/dashboard.actions";

export interface StitchWorkstreamsProps {
  fourPillars: ExecutiveDashboardData["fourPillars"];
}

export function StitchWorkstreams({ fourPillars }: StitchWorkstreamsProps) {
  const pillarsList = [
    {
      code: "CR",
      badgeClass: "bg-[#25dd59] text-black",
      title: "Pipeline Lamaran Karier",
      subtitle: `${fourPillars.career.totalApplications} Lamaran • ${fourPillars.career.activeInterviews} Interview`,
      pct: Math.min(100, Math.max(25, fourPillars.career.totalApplications * 15)),
      barColor: "bg-[#38e54d]",
      href: "/career",
    },
    {
      code: "EM",
      badgeClass: "bg-slate-800 text-white",
      title: fourPillars.employment.hasActive
        ? fourPillars.employment.companyName || "Kontrak Aktif Kantor"
        : "Kontrak Kerja Kantor",
      subtitle: `${fourPillars.employment.pendingTasksCount} Sprint Task Pending`,
      pct: fourPillars.employment.hasActive ? 85 : 30,
      barColor: "bg-[#2bf062]",
      href: "/employment",
    },
    {
      code: "FL",
      badgeClass: "bg-amber-600 text-white",
      title: `${fourPillars.freelance.activeProjectsCount} Proyek Freelance Aktif`,
      subtitle: `Margin Profit Rata-rata ~${fourPillars.freelance.netMarginAvg}%`,
      pct: Math.min(100, Math.max(30, fourPillars.freelance.netMarginAvg || 65)),
      barColor: "bg-[#f59e0b]",
      href: "/freelance",
    },
    {
      code: "ML",
      badgeClass: "bg-cyan-900 text-cyan-200",
      title: "Buku Kas & Alokasi Anggaran",
      subtitle: `${fourPillars.money.transactionCountThisMonth} Transaksi Tercatat Bulan Ini`,
      pct: Math.min(100, Math.max(40, fourPillars.money.transactionCountThisMonth * 8)),
      barColor: "bg-[#06b6d4]",
      href: "/money",
    },
  ];

  return (
    <div
      className="bg-card rounded-[2.5rem] p-6 border border-card-border shadow-xl flex flex-col gap-4 select-none"
      data-purpose="ongoing-courses"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-card-border-subtle">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-wide">
            Synapse Workstreams
          </h3>
          <span className="text-xs text-muted-foreground">4 Core Pillars Active</span>
        </div>
        <span className="text-xs font-semibold text-neon">Sinkronisasi</span>
      </div>

      {/* Course Rows */}
      <div className="flex flex-col gap-3.5 mt-1">
        {pillarsList.map((p) => (
          <Link
            key={p.code}
            href={p.href}
            className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-2xl hover:bg-card-inner transition-colors group"
          >
            {/* Square Rounded Thumbnail Badge */}
            <div
              className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs border border-white/10 shadow-sm ${p.badgeClass}`}
            >
              {p.code}
            </div>

            {/* Content & Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-foreground truncate max-w-[200px] group-hover:text-neon transition-colors">
                  {p.title}
                </span>
                <span className="text-muted-foreground tabular-nums text-[11px] font-bold">
                  {p.pct}%
                </span>
              </div>
              <div className="w-full bg-card-border-subtle rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${p.barColor}`}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                {p.subtitle}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
