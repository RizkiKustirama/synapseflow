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
        <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border overflow-hidden shadow-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neon/15 text-neon border border-neon/40 flex items-center justify-center shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">
              Belum Ada Kontrak Kerja Aktif
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Daftarkan pekerjaan tetap, kontrak, atau magang Anda untuk mulai memantau sprint pekerjaan harian,
              hitung mundur gajian (payday), serta pencatatan slip gaji dengan auto-sync ke modul Money.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Kontrak Kerja
          </Button>
        </div>

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
      <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border overflow-hidden shadow-xl">
        {/* Header Section */}
        <div className="p-6 sm:p-7 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-neon/15 border border-neon/40 text-neon flex items-center justify-center font-extrabold shrink-0 shadow-sm">
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
            className="h-10 px-5 rounded-full text-xs font-bold gap-2 bg-card-inner border-card-border text-foreground hover:bg-card-inner/80 transition-all shrink-0 self-start sm:self-center shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Kontrak
          </Button>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Payday Countdown Widget */}
          <div className="p-5 sm:p-6 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
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
                  <span className="text-2xl font-black tracking-tight text-foreground leading-none">
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
                  <Badge variant="default" className="text-[10px] font-bold py-0.5 px-2.5 rounded-full">
                    Tgl {paydayDay}
                  </Badge>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-foreground">
                  {daysRemaining === 0 ? (
                    <span className="text-neon flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-spin" /> Hari Ini Hari Gajian!
                    </span>
                  ) : daysRemaining <= 3 ? (
                    <span className="text-amber-500 font-extrabold">
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
            <div className="w-full md:w-auto md:text-right border-t md:border-t-0 border-card-border-subtle pt-3 md:pt-0 flex flex-col md:items-end justify-center space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Siklus Payroll Bulanan
              </span>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
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
              <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle space-y-2 hover:border-card-border transition-colors">
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
              <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle space-y-2 hover:border-card-border transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-emerald-500" />
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
              <div className="p-4 rounded-2xl bg-[#78e354]/15 border border-[#5cd625]/40 space-y-2 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-950" />
                    Total Take-Home Pay
                  </span>
                  <Badge variant="default" className="text-[10px] font-extrabold py-0.5 px-2 rounded-full">
                    Gross THP
                  </Badge>
                </div>
                <p className="text-lg sm:text-xl font-black text-emerald-950 font-mono">
                  {formatRupiah(totalTakeHomePay)}
                </p>
                <p className="text-[11px] text-emerald-900 font-medium">
                  Gaji pokok + tunjangan tetap
                </p>
              </div>
            </div>
          </div>

          {/* Timeline & Contract Metadata */}
          <div className="pt-3 border-t border-card-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
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
        </div>
      </div>

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
