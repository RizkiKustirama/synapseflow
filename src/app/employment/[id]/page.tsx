"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  ListTodo,
  Pencil,
  Receipt,
  RefreshCw,
  Sparkles,
  Wallet,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import {
  getEmploymentById,
  getCompanyWorkspaceStats,
  StoredEmployment,
} from "@/actions/employment.actions";
import { ContractCard } from "@/components/employment/contract-card";
import { ContractModal } from "@/components/employment/contract-modal";
import { OfficeTasks } from "@/components/employment/office-tasks";
import { PayrollTable } from "@/components/employment/payroll-table";

type SubTab = "CONTRACT" | "TASKS" | "PAYROLL";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employmentId = params?.id as string;

  const [employment, setEmployment] = useState<StoredEmployment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>("CONTRACT");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!employmentId) return;
    setIsLoading(true);
    try {
      const data = await getEmploymentById(employmentId);
      setEmployment(data);
    } catch (err) {
      console.error("Failed to load employment detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [employmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 rounded bg-muted/20" />
        <div className="h-10 w-96 rounded bg-muted/30" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-card/60 border border-card-border" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-card/60 border border-card-border" />
      </div>
    );
  }

  if (!employment) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-card border border-rose-500/20 text-center space-y-4 max-w-lg mx-auto mt-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Kontrak Kerja Tidak Ditemukan</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Perusahaan atau kontrak kerja dengan ID ini mungkin sudah dihapus atau bukan milik akun Anda.
          </p>
        </div>
        <Button
          onClick={() => router.push("/employment")}
          className="bg-neon text-black hover:bg-neon/90 font-bold gap-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Direktori Perusahaan
        </Button>
      </div>
    );
  }

  const stats = getCompanyWorkspaceStats(employment);

  const getStatusBadgeVariant = (status: StoredEmployment["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "processing";
      case "PROBATION":
        return "done";
      case "COMPLETED":
      case "RESIGNED":
      default:
        return "pending";
    }
  };

  const getStatusLabel = (status: StoredEmployment["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Aktif";
      case "PROBATION":
        return "Probation";
      case "COMPLETED":
        return "Selesai";
      case "RESIGNED":
        return "Resigned";
      default:
        return status;
    }
  };

  const getJobTypeLabel = (type: StoredEmployment["jobType"]) => {
    switch (type) {
      case "FULL_TIME":
        return "Full-time";
      case "PART_TIME":
        return "Part-time";
      case "CONTRACT":
        return "Kontrak";
      case "INTERNSHIP":
        return "Magang";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Navigation & Company Info */}
      <div className="space-y-3">
        {/* Back Link */}
        <div>
          <Link
            href="/employment"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-neon transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Direktori Perusahaan
          </Link>
        </div>

        {/* Company Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Workspace Perusahaan
              </span>
              <Badge variant={getStatusBadgeVariant(employment.status)} className="text-[10px]">
                {getStatusLabel(employment.status)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {getJobTypeLabel(employment.jobType)}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Building2 className="w-7 h-7 text-neon shrink-0" />
              <span>{employment.companyName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              <strong className="text-foreground">{employment.role}</strong>
              <span>•</span>
              <span>Mulai {formatDate(employment.startDate)}</span>
              {employment.endDate && <span> s/d {formatDate(employment.endDate)}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>

            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="h-10 text-xs font-bold gap-2 border-card-border hover:border-neon/40"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Kontrak
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Card Analysis (4 Bento KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tenure (Masa Kerja) */}
        <Card className="hover:border-neon/30 transition-all duration-200">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neon/15 text-neon flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Masa Kerja (Tenure)
              </span>
              <p className="text-lg sm:text-xl font-extrabold text-foreground truncate">
                {stats.tenure}
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">
                Sejak {formatDate(employment.startDate)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Payday Countdown */}
        <Card className="hover:border-neon/30 transition-all duration-200">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Gajian Berikutnya
              </span>
              <p className="text-lg sm:text-xl font-extrabold text-emerald-400 tabular-nums truncate">
                {stats.daysUntilPayday} Hari Lagi
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">
                Tanggal {employment.payday} setiap bulan
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Total Gaji Diterima dari Perusahaan Ini */}
        <Card className="hover:border-neon/30 transition-all duration-200">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Gaji Diterima
              </span>
              <p className="text-lg sm:text-xl font-extrabold text-blue-400 tabular-nums truncate">
                {formatRupiah(stats.totalPaidAmount)}
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">
                {employment.payrollRecords.length} slip gaji tercatat
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Task Completion Ratio */}
        <Card className="hover:border-neon/30 transition-all duration-200">
          <CardContent className="p-4 sm:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Task Selesai
              </span>
              <div className="flex items-baseline justify-between gap-1">
                <p className="text-lg sm:text-xl font-extrabold text-foreground tabular-nums">
                  {stats.completedTasksCount}/{stats.totalTasksCount}
                </p>
                <span className="text-xs font-bold text-amber-400 tabular-nums">
                  {stats.taskCompletionRatio}%
                </span>
              </div>
              <div className="w-full bg-card-border h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.taskCompletionRatio}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-card-border pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("CONTRACT")}
          className={cn(
            "flex items-center gap-2 py-3 px-4 text-xs font-bold rounded-t-2xl border-b-2 transition-all whitespace-nowrap",
            activeTab === "CONTRACT"
              ? "border-neon text-neon bg-neon/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/40"
          )}
        >
          <FileText className="w-4 h-4" />
          Detail Kontrak
        </button>

        <button
          onClick={() => setActiveTab("TASKS")}
          className={cn(
            "flex items-center gap-2 py-3 px-4 text-xs font-bold rounded-t-2xl border-b-2 transition-all whitespace-nowrap",
            activeTab === "TASKS"
              ? "border-neon text-neon bg-neon/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/40"
          )}
        >
          <ListTodo className="w-4 h-4" />
          Daily Sprint Tasks
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              activeTab === "TASKS"
                ? "bg-neon/20 text-neon"
                : "bg-card-border text-muted-foreground"
            )}
          >
            {employment.tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PAYROLL")}
          className={cn(
            "flex items-center gap-2 py-3 px-4 text-xs font-bold rounded-t-2xl border-b-2 transition-all whitespace-nowrap",
            activeTab === "PAYROLL"
              ? "border-neon text-neon bg-neon/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/40"
          )}
        >
          <Receipt className="w-4 h-4" />
          Payroll & Slip Gaji
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              activeTab === "PAYROLL"
                ? "bg-neon/20 text-neon"
                : "bg-card-border text-muted-foreground"
            )}
          >
            {employment.payrollRecords.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      <div className="pt-2">
        {activeTab === "CONTRACT" && (
          <div className="animate-in fade-in duration-200">
            <ContractCard employment={employment} onRefresh={loadData} />
          </div>
        )}

        {activeTab === "TASKS" && (
          <div className="animate-in fade-in duration-200">
            <OfficeTasks
              employmentId={employment.id}
              tasks={employment.tasks}
              onRefresh={loadData}
            />
          </div>
        )}

        {activeTab === "PAYROLL" && (
          <div className="animate-in fade-in duration-200">
            <PayrollTable employment={employment} onRefresh={loadData} />
          </div>
        )}
      </div>

      {/* 5. Edit Contract Modal */}
      <ContractModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          loadData();
        }}
        employmentToEdit={employment}
      />
    </div>
  );
}
