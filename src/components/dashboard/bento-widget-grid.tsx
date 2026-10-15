"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  FolderGit2,
  Wallet,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Check,
  ListTodo,
  Receipt,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRupiah, formatDate } from "@/lib/utils";
import {
  ExecutiveDashboardData,
  DashboardTaskItem,
  DashboardInterviewItem,
  DashboardDeliverableItem,
} from "@/actions/dashboard.actions";

export interface BentoWidgetGridProps {
  fourPillars: ExecutiveDashboardData["fourPillars"];
  todaysTasks: DashboardTaskItem[];
  upcomingInterviews: DashboardInterviewItem[];
  activeDeliverables: DashboardDeliverableItem[];
  recentTransactions: ExecutiveDashboardData["recentTransactions"];
  onTaskToggle?: (taskId: string, currentStatus: string) => Promise<void>;
}

function getSourceBadge(
  sourceType: "MANUAL" | "EMPLOYMENT_PAYROLL" | "FREELANCE_MILESTONE" | "PROJECT_EXPENSE"
) {
  switch (sourceType) {
    case "EMPLOYMENT_PAYROLL":
      return {
        label: "Gaji Kantor",
        className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      };
    case "FREELANCE_MILESTONE":
      return {
        label: "Freelance",
        className: "bg-neon/15 text-neon border-neon/30",
      };
    case "PROJECT_EXPENSE":
      return {
        label: "Biaya Proyek",
        className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    case "MANUAL":
    default:
      return {
        label: "Kasual",
        className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
      };
  }
}

function getPriorityBadge(priority: DashboardTaskItem["priority"]) {
  switch (priority) {
    case "URGENT":
      return {
        label: "URGENT",
        className: "bg-red-500/15 text-red-400 border-red-500/30",
      };
    case "HIGH":
      return {
        label: "HIGH",
        className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    case "MEDIUM":
      return {
        label: "MEDIUM",
        className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      };
    case "LOW":
    default:
      return {
        label: "LOW",
        className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      };
  }
}

function getDeliverableStatusBadge(status: DashboardDeliverableItem["status"]) {
  switch (status) {
    case "INVOICED":
      return {
        label: "Tertagih",
        variant: "processing" as const,
      };
    case "OVERDUE":
      return {
        label: "Jatuh Tempo",
        variant: "destructive" as const,
      };
    case "PAID":
      return {
        label: "Lunas",
        variant: "done" as const,
      };
    case "DRAFT":
    default:
      return {
        label: "Draft",
        variant: "outline" as const,
      };
  }
}

function formatInterviewDateTime(isoString: string): {
  dateStr: string;
  timeStr: string;
} {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { dateStr: "-", timeStr: "-" };
    const dateStr = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
    const timeStr =
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d) + " WIB";
    return { dateStr, timeStr };
  } catch {
    return { dateStr: "-", timeStr: "-" };
  }
}

export function BentoWidgetGrid({
  fourPillars,
  todaysTasks,
  upcomingInterviews,
  activeDeliverables,
  recentTransactions,
  onTaskToggle,
}: BentoWidgetGridProps) {
  // Local optimistic task state
  const [localTaskStatuses, setLocalTaskStatuses] = useState<
    Record<string, DashboardTaskItem["status"]>
  >({});
  const [loadingTaskIds, setLoadingTaskIds] = useState<
    Record<string, boolean>
  >({});

  const handleTaskToggle = async (task: DashboardTaskItem) => {
    const currentStatus = localTaskStatuses[task.id] ?? task.status;
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    // Optimistic toggle
    setLocalTaskStatuses((prev) => ({ ...prev, [task.id]: newStatus }));
    setLoadingTaskIds((prev) => ({ ...prev, [task.id]: true }));

    try {
      if (onTaskToggle) {
        await onTaskToggle(task.id, currentStatus);
      }
    } catch (error) {
      // Revert optimistic update on failure
      setLocalTaskStatuses((prev) => ({ ...prev, [task.id]: currentStatus }));
      console.error("Gagal memperbarui status task:", error);
    } finally {
      setLoadingTaskIds((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const netCashflowMonth =
    fourPillars.money.totalIncomeMonth - fourPillars.money.totalExpenseMonth;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* =======================================================================
          SECTION 1: THE 4 CORE PILLARS BENTO GRID
         ======================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Career Pipeline */}
        <Link href="/career" className="group block h-full">
          <Card className="h-full flex flex-col justify-between hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_20px_rgba(59,240,41,0.08)] transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                1. Career Pipeline
              </span>
              <div className="p-2 rounded-xl bg-neon/15 text-neon group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {fourPillars.career.totalApplications} Lamaran
                  </span>
                  <Badge variant="processing" className="text-[10px]">
                    {fourPillars.career.activeInterviews} Interview
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  {fourPillars.career.topTarget || "Belum ada target lamaran aktif"}
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-neon group-hover:translate-x-1 transition-transform pt-2">
                Buka Kanban Funnel <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 2: Employment */}
        <Link href="/employment" className="group block h-full">
          <Card className="h-full flex flex-col justify-between hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_20px_rgba(59,240,41,0.08)] transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                2. Employment
              </span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {fourPillars.employment.hasActive
                      ? fourPillars.employment.companyName || "1 Kontrak Aktif"
                      : "Belum Ada Kontrak"}
                  </span>
                  <Badge
                    variant={
                      fourPillars.employment.pendingTasksCount > 0
                        ? "done"
                        : "outline"
                    }
                    className="text-[10px]"
                  >
                    {fourPillars.employment.pendingTasksCount} Task Pending
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  {fourPillars.employment.hasActive
                    ? `${fourPillars.employment.role || "Karyawan"} • Gaji Pokok ${formatRupiah(
                        fourPillars.employment.baseSalary
                      )}`
                    : "Belum ada pekerjaan tetap terdaftar di sistem."}
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform pt-2">
                Task Kantor & Slip Gaji{" "}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Freelance */}
        <Link href="/freelance" className="group block h-full">
          <Card className="h-full flex flex-col justify-between hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_20px_rgba(59,240,41,0.08)] transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                3. Freelance
              </span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {fourPillars.freelance.activeProjectsCount} Proyek Aktif
                  </span>
                  <Badge
                    variant={
                      fourPillars.freelance.unpaidReceivables > 0
                        ? "processing"
                        : "outline"
                    }
                    className="text-[10px]"
                  >
                    Piutang {formatRupiah(fourPillars.freelance.unpaidReceivables)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  Total Budget {formatRupiah(fourPillars.freelance.totalBudget)} •
                  Margin Rata-rata ~{fourPillars.freelance.netMarginAvg}%
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform pt-2">
                Milestones & Termin{" "}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 4: Money Ledger */}
        <Link href="/money" className="group block h-full">
          <Card className="h-full flex flex-col justify-between hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_20px_rgba(59,240,41,0.08)] transition-all duration-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                4. Money Ledger
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {netCashflowMonth >= 0 ? "+" : ""}
                    {formatRupiah(netCashflowMonth)}
                  </span>
                  <Badge variant="default" className="text-[10px]">
                    {fourPillars.money.transactionCountThisMonth} Transaksi
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                  Masuk: {formatRupiah(fourPillars.money.totalIncomeMonth)} •
                  Keluar: {formatRupiah(fourPillars.money.totalExpenseMonth)}
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform pt-2">
                Buku Kas & Piutang{" "}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* =======================================================================
          SECTION 2: INTERACTIVE OPERATIONAL STREAMS (2 COLUMNS ON LG)
         ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* LEFT COLUMN: Buku Kas Terpadu & Termin Piutang */}
        <div className="space-y-5 sm:space-y-6">
          {/* Card 2A: Buku Kas Terpadu (Recent Ledger) */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-neon/15 text-neon">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    Buku Kas Terpadu
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sinkronisasi transaksi terbaru lintas modul
                </p>
              </div>
              <Link href="/money">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl hover:border-neon/40 h-8"
                >
                  Lihat Semua
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {recentTransactions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-card border border-card-border text-muted-foreground flex items-center justify-center">
                    <Receipt className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Belum ada riwayat transaksi
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Transaksi dari slip gaji kantor, termin freelance, atau pencatatan kasual akan muncul di sini.
                  </p>
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  const sourceMeta = getSourceBadge(tx.sourceType);

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border hover:bg-card-inner/90 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                            isIncome
                              ? "bg-neon/15 text-neon border-neon/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          )}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {tx.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full font-semibold border",
                                sourceMeta.className
                              )}
                            >
                              {sourceMeta.label}
                            </span>
                            <span className="text-muted-foreground px-1.5 py-0.5 rounded-md bg-card border border-card-border/60">
                              {tx.categoryName}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(tx.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-extrabold tabular-nums",
                            isIncome ? "text-neon" : "text-red-400"
                          )}
                        >
                          {isIncome ? "+" : "-"}
                          {formatRupiah(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Card 2B: Termin & Piutang Aktif */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    Termin & Piutang Aktif
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Milestone freelance siap tagih atau menunggu pelunasan
                </p>
              </div>
              <Link href="/freelance">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl hover:border-amber-500/40 h-8"
                >
                  Kelola Freelance
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {activeDeliverables.length === 0 ? (
                <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-card border border-card-border text-muted-foreground flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-neon opacity-70" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Semua piutang telah lunas
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Tidak ada invoice atau termin freelance yang menunggu pembayaran saat ini.
                  </p>
                </div>
              ) : (
                activeDeliverables.map((item) => {
                  const statusMeta = getDeliverableStatusBadge(item.status);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border hover:bg-card-inner/90 transition-all duration-200"
                    >
                      <div className="min-w-0 pr-3 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {item.title}
                          </p>
                          <Badge
                            variant={statusMeta.variant}
                            className="text-[9px] px-2 py-0.5"
                          >
                            {statusMeta.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="truncate">
                            {item.clientName} • {item.projectName}
                          </span>
                          {item.dueDate && (
                            <span className="shrink-0 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {formatDate(item.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-neon tabular-nums">
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sprint Tasks Kantor & Agenda Wawancara */}
        <div className="space-y-5 sm:space-y-6">
          {/* Card 2C: Sprint Tasks Kantor Hari Ini */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    Sprint Tasks Kantor Hari Ini
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Checklist pekerjaan prioritas kantor
                </p>
              </div>
              <Link href="/employment">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl hover:border-blue-500/40 h-8"
                >
                  Buka Tasks
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {todaysTasks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-card border border-card-border text-muted-foreground flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-neon opacity-70" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Semua task kantor beres
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Tidak ada pending sprint tasks untuk hari ini. Waktunya fokus atau eksplorasi proyek freelance.
                  </p>
                </div>
              ) : (
                todaysTasks.map((task) => {
                  const currentStatus =
                    localTaskStatuses[task.id] ?? task.status;
                  const isDone = currentStatus === "DONE";
                  const isUpdating = !!loadingTaskIds[task.id];
                  const priorityMeta = getPriorityBadge(task.priority);

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200",
                        isDone
                          ? "bg-card-inner/50 border-card-border-subtle/50 opacity-60"
                          : "bg-card-inner border-card-border-subtle hover:border-card-border hover:bg-card-inner/90"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleTaskToggle(task)}
                        disabled={isUpdating}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 border cursor-pointer",
                          isDone
                            ? "bg-neon border-neon text-black shadow-[0_0_10px_rgba(43,240,98,0.4)]"
                            : "bg-card border-card-border text-transparent hover:border-neon/60 hover:text-neon/40",
                          isUpdating && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label={
                          isDone ? "Tandai belum selesai" : "Tandai selesai"
                        }
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
                        ) : isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : null}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-xs sm:text-sm font-semibold transition-all",
                              isDone
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {task.title}
                          </p>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                              priorityMeta.className
                            )}
                          >
                            {priorityMeta.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="truncate text-muted-foreground/90 font-medium">
                            {task.companyName}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Card 2D: Agenda Wawancara & Interview */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-neon/15 text-neon">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    Agenda Wawancara & Interview
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Jadwal tahapan seleksi karir mendatang
                </p>
              </div>
              <Link href="/career">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl hover:border-neon/40 h-8"
                >
                  Kanban Karir
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {upcomingInterviews.length === 0 ? (
                <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-card border border-card-border text-muted-foreground flex items-center justify-center">
                    <Calendar className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Belum ada agenda interview
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Jadwal interview kerja yang dicatat di pipeline karir akan muncul di sini beserta tautan meeting.
                  </p>
                </div>
              ) : (
                upcomingInterviews.map((interview) => {
                  const { dateStr, timeStr } = formatInterviewDateTime(
                    interview.scheduledAt
                  );

                  return (
                    <div
                      key={interview.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border hover:bg-card-inner/90 transition-all duration-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {interview.position}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              @ {interview.companyName}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-neon">
                            {interview.roundName}
                          </p>
                        </div>

                        {interview.meetingLink && (
                          <a
                            href={
                              interview.meetingLink.startsWith("http")
                                ? interview.meetingLink
                                : `https://${interview.meetingLink}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon text-black text-xs font-bold hover:bg-neon/90 hover:shadow-[0_0_12px_rgba(43,240,98,0.35)] transition-all shrink-0"
                          >
                            <span>Meeting</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-card-border-subtle">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-neon" />
                          <span className="font-semibold text-foreground/90">
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
