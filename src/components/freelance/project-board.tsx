"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Briefcase,
  Building2,
  Clock,
  ArrowRight,
  Check,
  CheckCircle2,
  Trash2,
  Search,
  Receipt,
  TrendingUp,
  TrendingDown,
  Coins,
  Loader2,
  Layers,
  Sparkles,
  HelpCircle,
  PlayCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah, cn } from "@/lib/utils";
import {
  StoredFreelanceProject,
  StoredClient,
  updateProjectStatus,
  deleteProject,
} from "@/actions/freelance.actions";
import { ProjectDialog } from "./project-dialog";

export interface ProjectBoardProps {
  projects: StoredFreelanceProject[];
  clients: StoredClient[];
  onRefresh: () => void;
  onOpenMilestones: (project: StoredFreelanceProject) => void;
  onOpenExpense: (project: StoredFreelanceProject) => void;
}

type StageKey = "PROSPECT" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

interface StageConfig {
  id: StageKey;
  title: string;
  subtitle: string;
  dotColor: string;
  badgeClass: string;
  headerIcon: React.ElementType;
}

const STAGES: StageConfig[] = [
  {
    id: "PROSPECT",
    title: "Prospect / Pitching",
    subtitle: "Lead & Negosiasi",
    dotColor: "bg-blue-400",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    headerIcon: HelpCircle,
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    subtitle: "Pengerjaan Aktif",
    dotColor: "bg-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    headerIcon: PlayCircle,
  },
  {
    id: "REVIEW",
    title: "Review / UAT",
    subtitle: "Evaluasi & Revisi",
    dotColor: "bg-purple-400",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    headerIcon: Eye,
  },
  {
    id: "COMPLETED",
    title: "Completed",
    subtitle: "Selesai & Serah Terima",
    dotColor: "bg-neon",
    badgeClass: "bg-neon/15 text-neon border-neon/40",
    headerIcon: CheckCircle2,
  },
];

const NEXT_STAGE_CONFIG: Record<
  string,
  {
    nextStatus: StoredFreelanceProject["status"];
    label: string;
    icon: React.ElementType;
  }
> = {
  PROSPECT: {
    nextStatus: "IN_PROGRESS",
    label: "Mulai Kerja",
    icon: ArrowRight,
  },
  IN_PROGRESS: {
    nextStatus: "REVIEW",
    label: "Masuk Review",
    icon: ArrowRight,
  },
  REVIEW: {
    nextStatus: "COMPLETED",
    label: "Tandai Selesai",
    icon: Check,
  },
};

/**
 * Calculate countdown and return styling badge
 */
function getDeadlineInfo(deadlineStr?: string | null) {
  if (!deadlineStr) {
    return {
      text: "Tanpa Deadline",
      className: "bg-background/60 text-muted-foreground border-card-border",
      isOverdue: false,
    };
  }

  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Lewat ${Math.abs(diffDays)} hari`,
      className: "bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold",
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return {
      text: "Deadline Hari Ini",
      className: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold animate-pulse",
      isOverdue: false,
    };
  }
  if (diffDays <= 3) {
    return {
      text: `Sisa ${diffDays} hari`,
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium",
      isOverdue: false,
    };
  }
  if (diffDays <= 7) {
    return {
      text: `Sisa ${diffDays} hari`,
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30 font-medium",
      isOverdue: false,
    };
  }
  return {
    text: `${diffDays} hari lagi`,
    className: "bg-background/80 text-muted-foreground border-card-border font-medium",
    isOverdue: false,
  };
}

export function ProjectBoard({
  projects,
  clients,
  onRefresh,
  onOpenMilestones,
  onOpenExpense,
}: ProjectBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.clientCompany && p.clientCompany.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  // Aggregate financial metrics across all projects
  const boardSummary = useMemo(() => {
    const totalPipeline = projects.reduce((acc, p) => acc + p.totalBudget, 0);
    const totalPaid = projects.reduce((acc, p) => acc + p.paidRevenue, 0);
    const totalReceivables = projects.reduce((acc, p) => acc + p.invoicedReceivables, 0);
    const totalExpenses = projects.reduce((acc, p) => acc + p.totalExpenses, 0);
    const totalNetProfit = totalPaid - totalExpenses;

    return {
      totalPipeline,
      totalPaid,
      totalReceivables,
      totalExpenses,
      totalNetProfit,
      count: projects.length,
    };
  }, [projects]);

  // Handle advancing a project to its next stage
  const handleAdvance = async (project: StoredFreelanceProject) => {
    const nextConfig = NEXT_STAGE_CONFIG[project.status];
    if (!nextConfig) return;

    setAdvancingId(project.id);
    try {
      await updateProjectStatus(project.id, nextConfig.nextStatus);
      onRefresh();
    } catch (err) {
      console.error("Gagal memajukan tahap proyek:", err);
    } finally {
      setAdvancingId(null);
    }
  };

  // Handle project deletion with prompt confirmation
  const handleDelete = async (project: StoredFreelanceProject) => {
    const ok = window.confirm(
      `Apakah Anda yakin ingin menghapus proyek "${project.title}"?\nSemua termin invoice dan pencatatan biaya terkait akan terhapus permanen.`
    );
    if (!ok) return;

    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      onRefresh();
    } catch (err) {
      console.error("Gagal menghapus proyek:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Project Board & Lifecycle
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitor pipeline freelance, termin piutang, dan margin laba bersih real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Proyek Baru
          </Button>
        </div>
      </div>

      {/* Financial Bar Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-5 rounded-[2rem] bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span className="uppercase tracking-wider">Total Nilai Kontrak</span>
            <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
            {formatRupiah(boardSummary.totalPipeline)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {boardSummary.count} Total Proyek
          </span>
        </div>

        <div className="p-5 rounded-[2rem] bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span className="uppercase tracking-wider">Kas Masuk (Paid)</span>
            <div className="w-7 h-7 rounded-full bg-neon/15 text-neon flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-neon tabular-nums">
            {formatRupiah(boardSummary.totalPaid)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Biaya: {formatRupiah(boardSummary.totalExpenses)}
          </span>
        </div>

        <div className="p-5 rounded-[2rem] bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span className="uppercase tracking-wider">Piutang Ditagih (Invoiced)</span>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-amber-400 tabular-nums">
            {formatRupiah(boardSummary.totalReceivables)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Menunggu pembayaran termin
          </span>
        </div>

        <div className="p-5 rounded-[2rem] bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span className="uppercase tracking-wider">Realized Net Margin</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p
            className={cn(
              "text-base sm:text-lg font-extrabold tabular-nums",
              boardSummary.totalNetProfit >= 0 ? "text-neon" : "text-rose-400"
            )}
          >
            {formatRupiah(boardSummary.totalNetProfit)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Kas Masuk dikurangi Pengeluaran
          </span>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Cari judul proyek, klien, atau lingkup kerja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-xs bg-card border-card-border focus-visible:ring-neon rounded-full"
          />
        </div>
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-xs text-muted-foreground hover:text-foreground h-10 rounded-full px-4"
          >
            Reset
          </Button>
        )}
      </div>

      {/* 4 Stages Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageProjects = filteredProjects.filter((p) => p.status === stage.id);
          const stageTotalBudget = stageProjects.reduce((acc, p) => acc + p.totalBudget, 0);
          const StageIcon = stage.headerIcon;

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border p-5 space-y-4 min-h-[480px] shadow-sm"
            >
              {/* Stage Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", stage.dotColor)} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <StageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <h3 className="text-xs font-bold text-foreground tracking-tight">
                        {stage.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      {stage.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border",
                      stage.badgeClass
                    )}
                  >
                    {stageProjects.length}
                  </span>
                </div>
              </div>

              {/* Stage Column Sub-total */}
              <div className="flex items-center justify-between text-[11px] px-1 text-muted-foreground">
                <span>Nilai Tahap:</span>
                <span className="font-bold text-foreground">
                  {formatRupiah(stageTotalBudget)}
                </span>
              </div>

              {/* Project Cards List */}
              <div className="space-y-3 flex-1">
                {stageProjects.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center rounded-2xl border border-dashed border-card-border-subtle bg-card-inner/40 text-center p-4">
                    <p className="text-xs text-muted-foreground font-medium">
                      Tidak ada proyek
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {searchQuery ? "Sesuai kata kunci pencarian" : "di tahap ini"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDialogOpen(true)}
                      className="mt-3 text-[11px] text-neon hover:text-neon hover:bg-neon/10 h-7 rounded-full"
                    >
                      + Tambah Proyek
                    </Button>
                  </div>
                ) : (
                  stageProjects.map((project) => {
                    const clientBadge =
                      project.clientCompany || project.clientName || "Klien Mandiri";
                    const deadlineInfo = getDeadlineInfo(project.deadline);
                    const nextConfig = NEXT_STAGE_CONFIG[project.status];

                    // Count unpaid/invoiced termin
                    const unpaidTermin = (project.milestones || []).filter(
                      (m) =>
                        m.status === "INVOICED" ||
                        m.status === "OVERDUE" ||
                        m.status === "DRAFT"
                    );
                    const invoicedTermin = (project.milestones || []).filter(
                      (m) => m.status === "INVOICED" || m.status === "OVERDUE"
                    );

                    return (
                      <div
                        key={project.id}
                        className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border hover:bg-card-inner/90 transition-all duration-200 shadow-sm space-y-3.5 group"
                      >
                        {/* Top Meta: Client Badge & Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-card-border text-[11px] font-semibold text-foreground truncate max-w-[200px]">
                            <Building2 className="w-3 h-3 text-neon shrink-0" />
                            <span className="truncate">{clientBadge}</span>
                          </div>

                          <button
                            type="button"
                            disabled={deletingId === project.id}
                            onClick={() => handleDelete(project)}
                            className="p-1.5 rounded-full text-muted-foreground/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                            title="Hapus proyek"
                            aria-label={`Hapus proyek ${project.title}`}
                          >
                            {deletingId === project.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                            {project.title}
                          </h4>
                          {project.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                              {project.description}
                            </p>
                          )}
                        </div>

                        {/* Deadline Countdown Badge */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] border flex items-center gap-1",
                              deadlineInfo.className
                            )}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{deadlineInfo.text}</span>
                          </div>
                        </div>

                        {/* Total Budget */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-card-border/60">
                          <span className="text-muted-foreground text-[11px]">Total Budget:</span>
                          <span className="text-foreground font-extrabold text-xs sm:text-sm">
                            {formatRupiah(project.totalBudget)}
                          </span>
                        </div>

                        {/* Net Profit Margin Pill */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-card-border-subtle text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                              Net Profit Margin
                            </span>
                            <span
                              className={cn(
                                "font-extrabold text-xs",
                                project.netProfitMargin >= 0 ? "text-neon" : "text-rose-400"
                              )}
                            >
                              {formatRupiah(project.netProfitMargin)}
                            </span>
                          </div>

                          <div
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1",
                              project.marginPercentage >= 70
                                ? "bg-neon/15 text-neon border-neon/30"
                                : project.marginPercentage >= 40
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : project.marginPercentage > 0
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            )}
                          >
                            {project.netProfitMargin >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{project.marginPercentage}%</span>
                          </div>
                        </div>

                        {/* Termin & Piutang Button */}
                        <button
                          type="button"
                          onClick={() => onOpenMilestones(project)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-card border border-card-border hover:border-neon/40 hover:bg-card/80 text-xs transition-all group/btn shadow-sm"
                        >
                          <div className="flex items-center gap-1.5 text-foreground font-semibold">
                            <Receipt className="w-3.5 h-3.5 text-neon group-hover/btn:scale-110 transition-transform" />
                            <span>Termin & Piutang</span>
                          </div>
                          <span
                            className={cn(
                              "px-2.5 py-0.5 text-[10px] font-bold rounded-full border",
                              invoicedTermin.length > 0
                                ? "bg-[#25dd59] text-black font-extrabold border-transparent"
                                : unpaidTermin.length > 0
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : project.milestones.length > 0
                                ? "bg-neon/15 text-neon border-neon/30"
                                : "bg-card border-card-border text-muted-foreground"
                            )}
                          >
                            {invoicedTermin.length > 0
                              ? `${invoicedTermin.length} Piutang Ditagih`
                              : unpaidTermin.length > 0
                              ? `${unpaidTermin.length} Belum Lunas`
                              : project.milestones.length > 0
                              ? "Semua Lunas"
                              : "0 Termin"}
                          </span>
                        </button>

                        {/* Bottom Row Actions: Catat Biaya & Stage Advance */}
                        <div className="flex items-center gap-2 pt-2 border-t border-card-border/60">
                          {/* + Catat Biaya */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenExpense(project)}
                            className="h-8 text-[11px] font-semibold rounded-full border-card-border bg-card text-foreground hover:border-amber-500/40 hover:text-amber-400 hover:bg-amber-500/10 gap-1 px-3"
                          >
                            <Coins className="w-3 h-3 text-amber-400" />
                            + Catat Biaya
                          </Button>

                          {/* Quick Stage Advance */}
                          {nextConfig ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={advancingId === project.id}
                              onClick={() => handleAdvance(project)}
                              className="h-8 text-[11px] font-bold rounded-full bg-neon/15 hover:bg-neon text-neon hover:text-black border border-neon/30 hover:border-neon/50 gap-1 ml-auto px-3.5 transition-all"
                            >
                              {advancingId === project.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <span>{nextConfig.label}</span>
                                  <nextConfig.icon className="w-3 h-3" />
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-black bg-[#25dd59] px-3 py-1 rounded-full ml-auto shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Selesai</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Dialog */}
      <ProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        clients={clients}
        onSuccess={() => {
          onRefresh();
        }}
      />
    </div>
  );
}
