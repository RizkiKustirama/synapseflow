"use client";

import React, { useState } from "react";
import {
  Building2,
  Briefcase,
  Calendar,
  Pencil,
  Wallet,
  Banknote,
  Gift,
  Clock,
  Sparkles,
  Plus,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate, getDaysUntilPayday } from "@/lib/utils";
import { StoredEmployment } from "@/actions/employment.actions";
import { ContractModal } from "./contract-modal";

export interface ContractCardProps {
  employment: StoredEmployment | null;
  onRefresh: () => void;
}

export function ContractCard({ employment, onRefresh }: ContractCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute payday stats
  const paydayDay = employment?.payday ?? 25;
  const { daysRemaining, nextDate } = getDaysUntilPayday(paydayDay);

  // Circular progress ring calculation
  const totalCycleDays = 30;
  const clampedDays = Math.min(Math.max(daysRemaining, 0), totalCycleDays);
  const progressPercent = (totalCycleDays - clampedDays) / totalCycleDays;
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - progressPercent * ringCircumference;

  // Compensation calculation
  const baseSalary = employment?.baseSalary ?? 0;
  const fixedAllowance = employment?.fixedAllowance ?? 0;
  const totalTakeHomePay = baseSalary + fixedAllowance;

  // Helper for Job Type badge display
  const renderJobTypeBadge = (type?: string) => {
    switch (type) {
      case "FULL_TIME":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-semibold px-2.5 py-0.5 text-xs"
          >
            Full-Time
          </Badge>
        );
      case "PART_TIME":
        return (
          <Badge
            variant="outline"
            className="border-sky-500/40 text-sky-400 bg-sky-500/10 font-semibold px-2.5 py-0.5 text-xs"
          >
            Part-Time
          </Badge>
        );
      case "CONTRACT":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-400 bg-amber-500/10 font-semibold px-2.5 py-0.5 text-xs"
          >
            Kontrak (PKWT)
          </Badge>
        );
      case "INTERNSHIP":
        return (
          <Badge
            variant="outline"
            className="border-purple-500/40 text-purple-400 bg-purple-500/10 font-semibold px-2.5 py-0.5 text-xs"
          >
            Magang
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {type || "Unknown"}
          </Badge>
        );
    }
  };

  // Helper for Employment Status badge display
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="default"
            className="gap-1.5 px-3 py-0.5 text-xs font-bold shadow-[0_0_10px_rgba(59,240,41,0.2)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            Aktif
          </Badge>
        );
      case "PROBATION":
        return (
          <Badge variant="done" className="text-xs font-semibold px-2.5 py-0.5">
            Masa Percobaan
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="pending" className="text-xs font-semibold px-2.5 py-0.5">
            Selesai
          </Badge>
        );
      case "RESIGNED":
        return (
          <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5">
            Resigned
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  // Empty state if no employment record exists
  if (!employment) {
    return (
      <>
        <Card className="bg-card border-card-border overflow-hidden shadow-sm">
          <CardHeader className="pb-3 border-b border-card-border">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Briefcase className="w-5 h-5 text-neon" />
                Profil Kontrak Kerja
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shadow-[0_0_20px_rgba(59,240,41,0.15)]">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Belum Ada Kontrak Kerja Aktif
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Daftarkan pekerjaan tetap, kontrak, atau magang Anda untuk mulai memantau sprint pekerjaan harian,
                hitung mundur gajian (payday), serta pencatatan slip gaji dengan auto-sync ke modul Money.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs font-bold gap-2 bg-neon text-black hover:bg-neon/90 shadow-[0_0_15px_rgba(59,240,41,0.25)]"
            >
              <Plus className="w-4 h-4" /> Tambah Kontrak Kerja
            </Button>
          </CardContent>
        </Card>

        <ContractModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            onRefresh();
          }}
          employmentToEdit={null}
        />
      </>
    );
  }

  return (
    <>
      <Card className="bg-card border-card-border overflow-hidden shadow-sm">
        {/* Header Section */}
        <CardHeader className="pb-4 border-b border-card-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-neon/15 border border-neon/30 text-neon flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,240,41,0.2)]">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                    {employment.companyName}
                  </h3>
                  {renderJobTypeBadge(employment.jobType)}
                  {renderStatusBadge(employment.status)}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neon" />
                  {employment.role}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-9 px-3.5 text-xs font-semibold gap-1.5 border-card-border hover:border-neon/40 text-foreground hover:text-neon transition-all shrink-0 self-start sm:self-center"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Kontrak
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Payday Countdown Widget */}
          <div className="p-5 rounded-2xl bg-background/80 border border-card-border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Left: Progress Ring */}
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 96 96">
                  {/* Background Track */}
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-card-border"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Animated Neon Progress Ring */}
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    className="stroke-neon transition-all duration-700 ease-out"
                    strokeWidth="7"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Ring Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black tracking-tight text-neon leading-none">
                    {daysRemaining}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                    Hari
                  </span>
                </div>
              </div>

              {/* Payday Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neon" />
                    Hitung Mundur Gajian
                  </span>
                  <Badge variant="default" className="text-[10px] font-semibold py-0 px-2">
                    Tgl {paydayDay}
                  </Badge>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                  {daysRemaining === 0 ? (
                    <span className="text-neon flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-spin" /> Hari Ini Hari Gajian!
                    </span>
                  ) : daysRemaining <= 3 ? (
                    <span className="text-amber-400">
                      Gajian Segera Tiba ({daysRemaining} Hari Lagi)
                    </span>
                  ) : (
                    <span>{daysRemaining} Hari Menuju Gajian</span>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Gajian berikutnya:{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(nextDate)}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Routine note & status banner */}
            <div className="w-full md:w-auto md:text-right border-t md:border-t-0 border-card-border pt-3 md:pt-0 flex flex-col md:items-end justify-center space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Siklus Payroll Bulanan
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Rutin setiap tanggal {paydayDay} per bulan
              </div>
            </div>
          </div>

          {/* Financial Compensation Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-neon" />
                Struktur Kompensasi & Pendapatan
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Per Periode Bulanan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Gaji Pokok */}
              <div className="p-4 rounded-2xl bg-background border border-card-border space-y-2 hover:border-card-border/80 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-neon" />
                    Gaji Pokok
                  </span>
                </div>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">
                  {formatRupiah(baseSalary)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Kompensasi dasar per bulan
                </p>
              </div>

              {/* 2. Tunjangan Tetap */}
              <div className="p-4 rounded-2xl bg-background border border-card-border space-y-2 hover:border-card-border/80 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-400" />
                    Tunjangan Tetap
                  </span>
                </div>
                <p className="text-base sm:text-lg font-black text-foreground font-mono">
                  {formatRupiah(fixedAllowance)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Fasilitas & tunjangan rutin
                </p>
              </div>

              {/* 3. Total Take-Home Pay */}
              <div className="p-4 rounded-2xl bg-neon/10 border border-neon/30 space-y-2 relative overflow-hidden shadow-[0_0_15px_rgba(59,240,41,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-neon" />
                    Total Take-Home Pay
                  </span>
                  <Badge variant="default" className="text-[10px] font-bold py-0 px-1.5">
                    Gross THP
                  </Badge>
                </div>
                <p className="text-lg sm:text-xl font-black text-neon font-mono">
                  {formatRupiah(totalTakeHomePay)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Gaji pokok + tunjangan tetap
                </p>
              </div>
            </div>
          </div>

          {/* Timeline & Contract Metadata */}
          <div className="pt-3 border-t border-card-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neon" />
                Mulai:{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(employment.startDate)}
                </span>
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Berakhir:{" "}
                <span className="font-semibold text-foreground">
                  {employment.endDate ? formatDate(employment.endDate) : "Permanen (PKWTT)"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-neon" />
              <span>Status kontrak terlindungi & tersinkronisasi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Contract Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onRefresh();
        }}
        employmentToEdit={employment}
      />
    </>
  );
}
