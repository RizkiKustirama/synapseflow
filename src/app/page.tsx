"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Building2,
  FolderGit2,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, getDaysUntilPayday } from "@/lib/utils";

export default function DashboardPage() {
  const { daysRemaining } = getDaysUntilPayday(25);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* =======================================================================
          1. HERO WELCOME CARD (HIGH CONTRAST WHITE CANVAS + 3D CYBER MASCOT)
         ======================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-xl p-6 sm:p-8 transition-all">
        {/* Ambient Neon Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Semi-ERP Multi-User Engine • Active
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Selamat datang kembali, <span className="text-emerald-600">Alex</span>!
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Arus kas bulan ini surplus <strong className="text-slate-900">Rp 17.300.000</strong>. Anda memiliki <strong className="text-slate-900">2 jadwal interview</strong> dan <strong className="text-slate-900">1 termin piutang freelance</strong> yang siap ditagihkan.
            </p>

            {/* Quick KPI Strip inside Hero Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Kas Likuid
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                  {formatRupiah(24850000)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Piutang Freelance
                </span>
                <p className="text-lg sm:text-xl font-black text-amber-600 tabular-nums">
                  {formatRupiah(14500000)}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Gajian Berikutnya
                </span>
                <p className="text-lg sm:text-xl font-black text-emerald-600 tabular-nums">
                  {daysRemaining} Hari Lagi
                </p>
              </div>
            </div>
          </div>

          {/* 3D Cyber Mascot Asset Widget */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            <div className="relative w-40 h-40 flex items-center justify-center animate-float">
              {/* Gradient Mascot Sphere */}
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-emerald-500 via-lime-400 to-green-600 shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-12 transition-transform duration-500">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-2 shadow-inner">
                  <div className="flex gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-neon animate-pulse" />
                    <span className="w-3 h-3 rounded-full bg-neon animate-pulse" />
                  </div>
                  <div className="w-8 h-1 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
            {/* Ambient shadow glow */}
            <div className="w-24 h-4 rounded-full bg-emerald-300/40 blur-md -mt-2 animate-pulse-glow" />
          </div>
        </div>
      </section>

      {/* =======================================================================
          2. THE 4 CORE PILLARS BENTO GRID
         ======================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Module 1: Career Pipeline */}
        <Link href="/career" className="group">
          <Card className="h-full hover:-translate-y-1 hover:border-neon/40 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                1. Career Pipeline
              </span>
              <div className="p-2 rounded-xl bg-neon/15 text-neon group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  5 Lamaran
                </span>
                <Badge variant="processing" className="text-[10px]">
                  2 Interview
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Tech Lead di GoTo (User Interview) & Senior Engineer di Shopee.
              </p>
              <div className="flex items-center text-xs font-semibold text-neon group-hover:translate-x-1 transition-transform">
                Buka Kanban Funnel <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 2: Employment (Kerja Kantor) */}
        <Link href="/employment" className="group">
          <Card className="h-full hover:-translate-y-1 hover:border-neon/40 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                2. Employment
              </span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  1 Kontrak Aktif
                </span>
                <Badge variant="done" className="text-[10px]">
                  Full-time
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                PT Tech Innovasi • Gaji Pokok {formatRupiah(18500000)}
              </p>
              <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                Task Kantor & Slip Gaji <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 3: Freelance & Projects */}
        <Link href="/freelance" className="group">
          <Card className="h-full hover:-translate-y-1 hover:border-neon/40 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                3. Freelance
              </span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  2 Proyek
                </span>
                <Badge variant="processing" className="text-[10px]">
                  Net Margin 78%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Total Budget Rp 35.000.000 • Piutang Rp 14.500.000 belum lunas.
              </p>
              <div className="flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                Milestones & Termin <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 4: Money Ledger */}
        <Link href="/money" className="group">
          <Card className="h-full hover:-translate-y-1 hover:border-neon/40 transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                4. Money Ledger
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground tabular-nums">
                  +60.7%
                </span>
                <Badge variant="default" className="text-[10px]">
                  Savings Rate
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Masuk: {formatRupiah(28500000)} • Keluar: {formatRupiah(11200000)}
              </p>
              <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Buku Kas & Piutang <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* =======================================================================
          3. RECENT CROSS-MODULE TRANSACTIONS & SPRINT TASKS
         ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Unified Cashflow Stream (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Buku Kas Terpadu (Unified Ledger)</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Sinkronisasi otomatis dari Gaji Kantor, Termin Freelance, dan Pengeluaran Harian
              </p>
            </div>
            <Link href="/money">
              <Button variant="outline" size="sm" className="text-xs">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Transaction item 1: Freelance Milestone */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-card-border/60 hover:border-card-border transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neon/20 text-neon flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      Termin 1 (DP 30%) — E-Commerce
                    </span>
                    <Badge variant="default" className="text-[9px]">
                      Freelance
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    12 Okt 2026 • Auto-synced dari Milestone
                  </span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-neon tabular-nums">
                +{formatRupiah(6000000)}
              </span>
            </div>

            {/* Transaction item 2: Employment Payroll */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-card-border/60 hover:border-card-border transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      Slip Gaji September 2026
                    </span>
                    <Badge variant="default" className="text-[9px]">
                      Gaji Kantor
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    25 Sep 2026 • PT Tech Innovasi
                  </span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-blue-400 tabular-nums">
                +{formatRupiah(18500000)}
              </span>
            </div>

            {/* Transaction item 3: Project Expense */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-card-border/60 hover:border-card-border transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      Beli Domain & Cloudflare Pro
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      Biaya Proyek
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    10 Okt 2026 • Tag: E-Commerce Redesign
                  </span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-red-400 tabular-nums">
                -{formatRupiah(450000)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Today's High Priority Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Sprint & Agenda Hari Ini</CardTitle>
            <p className="text-xs text-muted-foreground">
              Tugas kantor & jadwal interview terdekat
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-2xl bg-background border border-card-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="processing" className="text-[9px]">
                  Career • 14:00 WIB
                </Badge>
                <span className="text-[10px] text-muted-foreground">Google Meet</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                Technical Interview (GoTo)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Materi: System Design & Next.js App Router
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-background border border-card-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="done" className="text-[9px]">
                  Kantor • In Progress
                </Badge>
                <span className="text-[10px] text-muted-foreground">Sprint 14</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                Refactor Authentication Guard
              </p>
              <p className="text-[11px] text-muted-foreground">
                Multi-tenant tenant isolation check
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-background border border-card-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="pending" className="text-[9px]">
                  Freelance • Piutang
                </Badge>
                <span className="text-[10px] text-muted-foreground">Due 18 Okt</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                Kirim Invoice Termin 2 (Rp 8.000.000)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Client: PT Maju Bersama
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
