"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Zap,
  Receipt,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingDown,
  Briefcase,
  User,
  Trash2,
  Loader2,
  Sparkles,
  PieChart,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  StoredFreelanceProject,
  StoredMilestone,
  updateMilestoneStatus,
  deleteMilestone,
} from "@/actions/freelance.actions";
import { MilestoneDialog } from "./milestone-dialog";
import { ProjectExpenseDialog } from "./project-expense-dialog";

export interface MilestoneManagerProps {
  isOpen: boolean;
  onClose: () => void;
  project: StoredFreelanceProject | null;
  onRefresh: () => void;
}

export function MilestoneManager({
  isOpen,
  onClose,
  project,
  onRefresh,
}: MilestoneManagerProps) {
  const [activeTab, setActiveTab] = useState<"milestones" | "expenses">("milestones");
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Action loading state (milestone ID being operated on)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDeleteMilestoneId, setConfirmDeleteMilestoneId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        isOpen &&
        !isMilestoneDialogOpen &&
        !isExpenseDialogOpen &&
        !loadingActionId
      ) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMilestoneDialogOpen, isExpenseDialogOpen, loadingActionId, onClose]);

  // Clear toast after timeout
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  if (!isOpen || !project) return null;

  // 1-Click Action: Tandai Lunas & Sync ke Money
  const handleMarkPaid = async (milestoneId: string) => {
    setLoadingActionId(milestoneId);
    setActionError(null);
    try {
      const res = await updateMilestoneStatus(milestoneId, "PAID", project.id);
      if (!res.success) {
        setActionError("Gagal memperbarui status termin.");
        return;
      }
      setSuccessToast("Termin berhasil dilunasi & otomatis tercatat di Money Tracker!");
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Terjadi kesalahan saat menandai lunas.");
      }
    } finally {
      setLoadingActionId(null);
    }
  };

  // Action: Terbitkan Tagihan (Invoice)
  const handleIssueInvoice = async (milestoneId: string) => {
    setLoadingActionId(milestoneId);
    setActionError(null);
    try {
      const res = await updateMilestoneStatus(milestoneId, "INVOICED", project.id);
      if (!res.success) {
        setActionError("Gagal menerbitkan faktur tagihan.");
        return;
      }
      setSuccessToast("Faktur tagihan diterbitkan! Berstatus Piutang Aktif.");
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Terjadi kesalahan saat menerbitkan tagihan.");
      }
    } finally {
      setLoadingActionId(null);
    }
  };

  // Action: Hapus Milestone
  const handleDeleteMilestone = async (milestoneId: string) => {
    setLoadingActionId(milestoneId);
    setActionError(null);
    try {
      const res = await deleteMilestone(milestoneId, project.id);
      if (!res.success) {
        setActionError("Gagal menghapus termin pembayaran.");
        return;
      }
      setConfirmDeleteMilestoneId(null);
      setSuccessToast("Termin pembayaran berhasil dihapus.");
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Terjadi kesalahan saat menghapus termin.");
      }
    } finally {
      setLoadingActionId(null);
    }
  };

  // Helper status badge for project
  const renderProjectStatusBadge = (status: StoredFreelanceProject["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            Sedang Berjalan
          </span>
        );
      case "REVIEW":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Review / UAT
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neon/15 text-neon border border-neon/30">
            Selesai (Completed)
          </span>
        );
      case "PROSPECT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            Prospek
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  // Helper status badge for milestone
  const renderMilestoneStatusBadge = (status: StoredMilestone["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-neon/15 text-neon border-neon/40 font-bold gap-1 px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3" /> Lunas
          </Badge>
        );
      case "INVOICED":
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/40 font-bold gap-1 px-2.5 py-0.5">
            <Clock className="w-3 h-3" /> Ditagihkan
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge className="bg-red-500/15 text-red-400 border-red-500/40 font-bold gap-1 px-2.5 py-0.5">
            <AlertCircle className="w-3 h-3" /> Jatuh Tempo
          </Badge>
        );
      case "DRAFT":
      default:
        return (
          <Badge variant="outline" className="border-card-border text-muted-foreground font-medium gap-1 px-2 py-0.5">
            <FileText className="w-3 h-3" /> Draft
          </Badge>
        );
    }
  };

  // Financial health status based on margin percentage
  const marginPercent = project.marginPercentage;
  let healthLabel = "Margin Stabil";
  let healthColor = "text-lime-400";
  let healthBg = "bg-lime-500/10 border-lime-500/30";
  let healthBarColor = "bg-lime-400";

  if (project.netProfitMargin < 0 || marginPercent < 0) {
    healthLabel = "Defisit Operasional";
    healthColor = "text-red-400";
    healthBg = "bg-red-500/10 border-red-500/30";
    healthBarColor = "bg-red-500";
  } else if (marginPercent >= 70) {
    healthLabel = "Sangat Prima";
    healthColor = "text-neon";
    healthBg = "bg-neon/10 border-neon/30";
    healthBarColor = "bg-neon";
  } else if (marginPercent >= 40) {
    healthLabel = "Sehat & Kuat";
    healthColor = "text-emerald-400";
    healthBg = "bg-emerald-500/10 border-emerald-500/30";
    healthBarColor = "bg-emerald-400";
  } else if (marginPercent < 20) {
    healthLabel = "Margin Kritis";
    healthColor = "text-amber-400";
    healthBg = "bg-amber-500/10 border-amber-500/30";
    healthBarColor = "bg-amber-400";
  }

  // Budget realization rate
  const paidRatio =
    project.totalBudget > 0
      ? Math.min(100, Math.round((project.paidRevenue / project.totalBudget) * 100))
      : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          onClick={() => {
            if (!loadingActionId) onClose();
          }}
        />

        {/* Modal Dialog Content */}
        <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-card border border-card-border rounded-3xl shadow-2xl z-10 overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-card-border flex items-start justify-between gap-4 bg-card/60 backdrop-blur-sm">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {project.title}
                </h2>
                {renderProjectStatusBadge(project.status)}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground/90">
                  <User className="w-3.5 h-3.5 text-neon" />
                  {project.clientName || "Klien Mandiri"}
                </span>
                {project.clientCompany && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building className="w-3.5 h-3.5 text-muted-foreground" />
                    {project.clientCompany}
                  </span>
                )}
                {project.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Target: {formatDate(project.deadline)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={Boolean(loadingActionId)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors disabled:opacity-50"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Alert / Notification */}
          {actionError && (
            <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {successToast && (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-neon/10 border border-neon/30 flex items-center gap-2 text-xs text-neon font-bold animate-in fade-in">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{successToast}</span>
              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="text-neon hover:opacity-80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Financial Summary Ribbon */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-neon" />
                  Financial Health & Revenue Ribbon
                </h3>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Realisasi Kas: <strong className="text-foreground">{paidRatio}%</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Total Budget */}
                <div className="p-3.5 rounded-2xl bg-sidebar-accent/50 border border-card-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Total Budget
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-foreground truncate">
                    {formatRupiah(project.totalBudget)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">Nilai total kontrak</p>
                </div>

                {/* 2. Paid Revenue */}
                <div className="p-3.5 rounded-2xl bg-sidebar-accent/50 border border-card-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neon flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-neon" /> Pendapatan Masuk
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-neon truncate">
                    {formatRupiah(project.paidRevenue)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {paidRatio}% dari total kontrak
                  </p>
                </div>

                {/* 3. Invoiced Receivables */}
                <div className="p-3.5 rounded-2xl bg-sidebar-accent/50 border border-card-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> Piutang Aktif
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-amber-400 truncate">
                    {formatRupiah(project.invoicedReceivables)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">Tagihan terbit menunggu bayar</p>
                </div>

                {/* 4. Total Expenses */}
                <div className="p-3.5 rounded-2xl bg-sidebar-accent/50 border border-card-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-rose-400" /> Biaya Proyek
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-rose-400 truncate">
                    {formatRupiah(project.totalExpenses)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {project.expenses.length} pos operasional
                  </p>
                </div>

                {/* 5. Net Profit Margin & Health Gauge */}
                <div className={`col-span-2 lg:col-span-1 p-3.5 rounded-2xl border space-y-1.5 ${healthBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-neon" /> Net Profit Margin
                    </span>
                    <span className={`text-[10px] font-black uppercase ${healthColor}`}>
                      {healthLabel}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm sm:text-base font-black truncate ${healthColor}`}>
                      {formatRupiah(project.netProfitMargin)}
                    </p>
                    <span className="text-xs font-black text-foreground">
                      {marginPercent}%
                    </span>
                  </div>

                  {/* Health Percentage Gauge Bar */}
                  <div className="w-full bg-background/80 h-1.5 rounded-full overflow-hidden border border-card-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${healthBarColor}`}
                      style={{
                        width: `${Math.max(0, Math.min(100, marginPercent))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-card-border">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-sidebar-accent/80 border border-card-border self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab("milestones")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "milestones"
                      ? "bg-card text-foreground shadow-sm border border-card-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 text-neon" />
                  Termin Pembayaran ({project.milestones.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("expenses")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "expenses"
                      ? "bg-card text-foreground shadow-sm border border-card-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  Biaya Operasional ({project.expenses.length})
                </button>
              </div>

              {/* Action Buttons corresponding to active tab */}
              <div className="flex items-center gap-2">
                {activeTab === "milestones" ? (
                  <Button
                    type="button"
                    onClick={() => setIsMilestoneDialogOpen(true)}
                    className="h-9 text-xs font-bold gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Tambah Termin
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsExpenseDialogOpen(true)}
                    className="h-9 text-xs font-bold gap-1.5 bg-rose-500 hover:bg-rose-600 text-white shadow-none"
                  >
                    <Plus className="w-4 h-4" /> Catat Biaya Proyek
                  </Button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: MILESTONES (TERMIN) */}
            {activeTab === "milestones" && (
              <div className="space-y-3">
                {project.milestones.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-sidebar-accent/30 border border-dashed border-card-border text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-sidebar-accent flex items-center justify-center text-muted-foreground">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Belum Ada Termin Pembayaran
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                        Bagi pembayaran proyek menjadi termin (DP, Milestone Sprint, Pelunasan) untuk menjaga arus kas tetap sehat.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setIsMilestoneDialogOpen(true)}
                      variant="outline"
                      className="text-xs font-bold gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-neon" /> Tambah Termin Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.milestones.map((m, index) => {
                      const isActionBusy = loadingActionId === m.id;
                      const isConfirmingDelete = confirmDeleteMilestoneId === m.id;

                      return (
                        <div
                          key={m.id}
                          className="p-4 sm:p-5 rounded-2xl bg-card border border-card-border hover:border-card-border/80 transition-all space-y-3"
                        >
                          {/* Row 1: Title, Status, and Amount */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground bg-sidebar-accent px-2 py-0.5 rounded-md">
                                  #{index + 1}
                                </span>
                                <h4 className="text-sm sm:text-base font-bold text-foreground">
                                  {m.title}
                                </h4>
                                {renderMilestoneStatusBadge(m.status)}
                                {m.invoiceNumber && (
                                  <span className="text-[11px] font-mono font-bold bg-sidebar-accent border border-card-border px-2 py-0.5 rounded-md text-foreground/80 flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                    {m.invoiceNumber}
                                  </span>
                                )}
                              </div>

                              {/* Dates info */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {m.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Jatuh Tempo: {formatDate(m.dueDate)}
                                  </span>
                                )}
                                {m.paidDate && (
                                  <span className="flex items-center gap-1 text-neon font-medium">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Lunas Pada: {formatDate(m.paidDate)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Amount Display */}
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                Nilai Termin
                              </span>
                              <span className="text-base sm:text-lg font-extrabold text-foreground">
                                {formatRupiah(m.amount)}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Actions Bar */}
                          <div className="pt-2 border-t border-card-border flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1-Click Action: Tandai Lunas & Sync ke Money */}
                              {m.status !== "PAID" && (
                                <Button
                                  type="button"
                                  onClick={() => handleMarkPaid(m.id)}
                                  disabled={isActionBusy}
                                  className="h-8 text-xs font-bold gap-1.5 shadow-sm"
                                >
                                  {isActionBusy ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Zap className="w-3.5 h-3.5 fill-black" />
                                  )}
                                  Tandai Lunas & Sync ke Money
                                </Button>
                              )}

                              {/* Terbitkan Tagihan (Invoice) */}
                              {m.status === "DRAFT" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleIssueInvoice(m.id)}
                                  disabled={isActionBusy}
                                  className="h-8 text-xs font-bold gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                                >
                                  {isActionBusy ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Receipt className="w-3.5 h-3.5" />
                                  )}
                                  Terbitkan Tagihan (Invoice)
                                </Button>
                              )}

                              {m.status === "PAID" && (
                                <span className="text-[11px] font-semibold text-neon flex items-center gap-1.5 bg-neon/10 px-2.5 py-1 rounded-xl border border-neon/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Tersinkronisasi dengan Money Tracker
                                </span>
                              )}
                            </div>

                            {/* Delete Button & Inline Confirmation */}
                            <div>
                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-red-400 font-medium">
                                    Hapus termin ini?
                                  </span>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteMilestone(m.id)}
                                    disabled={isActionBusy}
                                    className="h-7 px-2.5 text-[11px] font-bold"
                                  >
                                    {isActionBusy ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "Ya, Hapus"
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmDeleteMilestoneId(null)}
                                    disabled={isActionBusy}
                                    className="h-7 px-2 text-[11px]"
                                  >
                                    Batal
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteMilestoneId(m.id)}
                                  disabled={isActionBusy}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                  title="Hapus termin"
                                  aria-label="Hapus termin"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PROJECT EXPENSES */}
            {activeTab === "expenses" && (
              <div className="space-y-3">
                {project.expenses.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-sidebar-accent/30 border border-dashed border-card-border text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-sidebar-accent flex items-center justify-center text-muted-foreground">
                      <TrendingDown className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Belum Ada Biaya Operasional
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                        Catat biaya langsung seperti sewa VPS, domain, aset desain, atau fee rekan kerja untuk menghitung margin keuntungan bersih sebenarnya.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setIsExpenseDialogOpen(true)}
                      className="text-xs font-bold gap-1.5 bg-rose-500 hover:bg-rose-600 text-white shadow-none"
                    >
                      <Plus className="w-3.5 h-3.5" /> Catat Biaya Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {project.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3.5 sm:p-4 rounded-2xl bg-card border border-card-border flex items-center justify-between gap-3 hover:border-card-border/80 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {exp.description}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {exp.categoryName || "Biaya Operasional"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(exp.date)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-black text-rose-400">
                            -{formatRupiah(exp.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 border-t border-card-border flex items-center justify-between gap-3 bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-neon" />
              <span>Semua termin & biaya terhubung otomatis ke Buku Kas SynapseFlow.</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={Boolean(loadingActionId)}
              className="text-xs font-bold"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>

      {/* Child Dialog: Tambah Termin */}
      <MilestoneDialog
        isOpen={isMilestoneDialogOpen}
        onClose={() => setIsMilestoneDialogOpen(false)}
        projectId={project.id}
        onSuccess={() => {
          onRefresh();
          setSuccessToast("Termin pembayaran berhasil ditambahkan!");
        }}
      />

      {/* Child Dialog: Catat Biaya Proyek */}
      <ProjectExpenseDialog
        isOpen={isExpenseDialogOpen}
        onClose={() => setIsExpenseDialogOpen(false)}
        projectId={project.id}
        onSuccess={() => {
          onRefresh();
          setSuccessToast("Biaya proyek berhasil dicatat & disinkronkan ke Money!");
        }}
      />
    </>
  );
}
