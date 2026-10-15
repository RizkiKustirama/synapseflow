"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Check,
  Receipt,
  Loader2,
} from "lucide-react";
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
  todaysTasks,
  upcomingInterviews,
  activeDeliverables,
  recentTransactions,
  onTaskToggle,
}: BentoWidgetGridProps) {
  const [activeTab, setActiveTab] = useState<"tasks" | "deliverables" | "transactions" | "interviews">("tasks");
  const [localTaskStatuses, setLocalTaskStatuses] = useState<
    Record<string, DashboardTaskItem["status"]>
  >({});
  const [loadingTaskIds, setLoadingTaskIds] = useState<
    Record<string, boolean>
  >({});

  const handleTaskToggle = async (task: DashboardTaskItem) => {
    const currentStatus = localTaskStatuses[task.id] ?? task.status;
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    setLocalTaskStatuses((prev) => ({ ...prev, [task.id]: newStatus }));
    setLoadingTaskIds((prev) => ({ ...prev, [task.id]: true }));

    try {
      if (onTaskToggle) {
        await onTaskToggle(task.id, currentStatus);
      }
    } catch (error) {
      setLocalTaskStatuses((prev) => ({ ...prev, [task.id]: currentStatus }));
      console.error("Gagal memperbarui status task:", error);
    } finally {
      setLoadingTaskIds((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const pendingTasksCount = todaysTasks.filter(
    (t) => (localTaskStatuses[t.id] ?? t.status) !== "DONE"
  ).length;

  return (
    <section
      className="bg-card rounded-[2.5rem] p-6 md:p-7 border border-card-border shadow-xl flex flex-col gap-5 select-none"
      data-purpose="space-tasks"
    >
      {/* =======================================================================
          STITCH HEADER: Office Tasks & Deliverables + Active Count Pill
         ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-card-border-subtle">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg font-bold text-foreground tracking-wide">
            Office Tasks &amp; Deliverables
          </h3>
          <span className="text-xs font-semibold text-emerald-300 bg-sidebar px-3 py-0.5 rounded-full border border-emerald-500/20">
            Tasks: {pendingTasksCount}
          </span>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-card-inner p-1 rounded-xl border border-card-border-subtle text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0",
              activeTab === "tasks"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sprint Tasks ({todaysTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("deliverables")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0",
              activeTab === "deliverables"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Piutang ({activeDeliverables.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0",
              activeTab === "transactions"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Buku Kas ({recentTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interviews")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0",
              activeTab === "interviews"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Interview ({upcomingInterviews.length})
          </button>
        </div>
      </div>

      {/* =======================================================================
          TAB 1: SPRINT TASKS KANTOR (STITCH ROW DESIGN)
         ======================================================================= */}
      {activeTab === "tasks" && (
        <div className="flex flex-col gap-3.5">
          {todaysTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-neon opacity-70" />
              <p className="text-xs font-semibold text-foreground">
                Semua task kantor beres
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Tidak ada sprint task pending hari ini. Buka modul Employment untuk menambah agenda kerja baru.
              </p>
              <Link
                href="/employment"
                className="mt-2 text-xs font-bold text-neon hover:underline"
              >
                Kelola Employment &rarr;
              </Link>
            </div>
          ) : (
            todaysTasks.map((task) => {
              const currentStatus = localTaskStatuses[task.id] ?? task.status;
              const isDone = currentStatus === "DONE";
              const isUpdating = !!loadingTaskIds[task.id];
              const priorityMeta = getPriorityBadge(task.priority);
              const progressPct = isDone ? 100 : task.priority === "URGENT" ? 30 : 65;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3.5 sm:p-4 rounded-2xl bg-card-inner hover:bg-card-inner/90 border border-card-border-subtle transition-all",
                    isDone && "opacity-60"
                  )}
                  data-purpose="task-item"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTaskToggle(task)}
                        disabled={isUpdating}
                        className={cn(
                          "w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 border cursor-pointer",
                          isDone
                            ? "bg-neon border-neon text-black shadow-[0_0_10px_rgba(43,240,98,0.4)]"
                            : "bg-card border-card-border text-transparent hover:border-neon/60 hover:text-neon/40",
                          isUpdating && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
                        ) : isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : null}
                      </button>

                      <h4
                        className={cn(
                          "text-sm font-semibold transition-all truncate max-w-[260px] sm:max-w-md",
                          isDone ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {/* Progress Bar from Stitch */}
                      <div className="w-20 sm:w-24 bg-card-border-subtle rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#38e54d] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium w-8 text-right tabular-nums">
                        {progressPct}%
                      </span>

                      {/* Status Chip matching Stitch */}
                      {isDone ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#e28460] text-black">
                          Task done
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#25dd59] text-black tracking-wide">
                          Processing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Meta details */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1.5 border-t border-card-border-subtle">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        Deadline: {formatDate(task.dueDate)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      {task.companyName}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.2 rounded-full text-[9px] font-bold border",
                        priorityMeta.className
                      )}
                    >
                      {priorityMeta.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =======================================================================
          TAB 2: TERMIN & PIUTANG FREELANCE
         ======================================================================= */}
      {activeTab === "deliverables" && (
        <div className="flex flex-col gap-3.5">
          {activeDeliverables.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-neon opacity-70" />
              <p className="text-xs font-semibold text-foreground">
                Semua piutang telah lunas
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Tidak ada termin freelance yang menunggu pembayaran saat ini.
              </p>
            </div>
          ) : (
            activeDeliverables.map((item) => {
              const isPaid = item.status === "PAID";
              const isInvoiced = item.status === "INVOICED";

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-card-inner hover:bg-card-inner/90 border border-card-border-subtle transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.clientName} • {item.projectName}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-neon tabular-nums">
                        {formatRupiah(item.amount)}
                      </span>
                      {isPaid ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#e28460] text-black">
                          Lunas
                        </span>
                      ) : isInvoiced ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#25dd59] text-black">
                          Tertagih
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-white text-black">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1.5 border-t border-card-border-subtle">
                    {item.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Jatuh Tempo: {formatDate(item.dueDate)}
                      </span>
                    )}
                    <Link
                      href="/freelance"
                      className="text-neon hover:underline font-semibold ml-auto text-[11px]"
                    >
                      Buka di Freelance &rarr;
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =======================================================================
          TAB 3: BUKU KAS TERPADU (RECENT LEDGER)
         ======================================================================= */}
      {activeTab === "transactions" && (
        <div className="flex flex-col gap-3.5">
          {recentTransactions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
              <Receipt className="w-8 h-8 text-muted-foreground opacity-40" />
              <p className="text-xs font-semibold text-foreground">
                Belum ada transaksi tercatat
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Transaksi dari slip gaji kantor, termin freelance, atau pengeluaran akan muncul di sini.
              </p>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const sourceMeta = getSourceBadge(tx.sourceType);

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-card-inner hover:bg-card-inner/90 border border-card-border-subtle transition-all flex items-center justify-between"
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
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {tx.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] mt-0.5">
                        <span
                          className={cn(
                            "px-2 py-0.2 rounded-full font-semibold border",
                            sourceMeta.className
                          )}
                        >
                          {sourceMeta.label}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-xs sm:text-sm font-extrabold tabular-nums shrink-0",
                      isIncome ? "text-neon" : "text-red-400"
                    )}
                  >
                    {isIncome ? "+" : "-"}
                    {formatRupiah(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =======================================================================
          TAB 4: AGENDA WAWANCARA & INTERVIEW
         ======================================================================= */}
      {activeTab === "interviews" && (
        <div className="flex flex-col gap-3.5">
          {upcomingInterviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle flex flex-col items-center justify-center text-center space-y-2">
              <Calendar className="w-8 h-8 text-muted-foreground opacity-40" />
              <p className="text-xs font-semibold text-foreground">
                Belum ada jadwal interview mendatang
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Jadwal interview kerja yang dicatat di pipeline karir akan muncul di sini beserta tautan meeting online.
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
                  className="p-3.5 sm:p-4 rounded-2xl bg-card-inner hover:bg-card-inner/90 border border-card-border-subtle transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          {interview.position}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @ {interview.companyName}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-neon mt-0.5">
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

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1.5 border-t border-card-border-subtle">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1 text-neon font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {timeStr}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
