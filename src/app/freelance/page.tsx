"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderKanban,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate, cn } from "@/lib/utils";
import {
  getFreelanceProjects,
  getClients,
  getFreelanceSummary,
  updateMilestoneStatus,
  StoredFreelanceProject,
  StoredClient,
} from "@/actions/freelance.actions";
import { ProjectBoard } from "@/components/freelance/project-board";
import { ProjectDialog } from "@/components/freelance/project-dialog";
import { ClientDirectory } from "@/components/freelance/client-directory";
import { ClientModal } from "@/components/freelance/client-modal";
import { MilestoneManager } from "@/components/freelance/milestone-manager";
import { ProjectExpenseDialog } from "@/components/freelance/project-expense-dialog";

type SubTab = "PROJECTS" | "CLIENTS" | "RECEIVABLES";

export default function FreelancePage() {
  const [projects, setProjects] = useState<StoredFreelanceProject[]>([]);
  const [clients, setClients] = useState<StoredClient[]>([]);
  const [summary, setSummary] = useState({
    totalClients: 0,
    activeProjects: 0,
    totalProjects: 0,
    totalContractValue: 0,
    totalPaidRevenue: 0,
    totalInvoicedReceivables: 0,
    totalProjectExpenses: 0,
    overallNetProfit: 0,
    overallMarginPercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>("PROJECTS");

  // Modals state
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [selectedProjectForMilestones, setSelectedProjectForMilestones] =
    useState<StoredFreelanceProject | null>(null);
  const [selectedProjectForExpense, setSelectedProjectForExpense] =
    useState<StoredFreelanceProject | null>(null);
  const [syncingMilestoneId, setSyncingMilestoneId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projData, clientData, stats] = await Promise.all([
        getFreelanceProjects(),
        getClients(),
        getFreelanceSummary(),
      ]);
      setProjects(projData);
      setClients(clientData);
      setSummary(stats);

      // Keep selected project in sync if modal is open
      if (selectedProjectForMilestones) {
        const updated = projData.find((p) => p.id === selectedProjectForMilestones.id);
        if (updated) setSelectedProjectForMilestones(updated);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectForMilestones]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenMilestones = (project: StoredFreelanceProject) => {
    setSelectedProjectForMilestones(project);
  };

  const handleOpenExpense = (project: StoredFreelanceProject) => {
    setSelectedProjectForExpense(project);
    setIsExpenseDialogOpen(true);
  };

  const handleSyncMilestone = async (milestoneId: string, projectId: string) => {
    setSyncingMilestoneId(milestoneId);
    try {
      await updateMilestoneStatus(milestoneId, "PAID", projectId);
      await loadData();
    } finally {
      setSyncingMilestoneId(null);
    }
  };

  // Extract all invoiced/unpaid receivables across projects
  const allReceivables = projects.flatMap((p) =>
    p.milestones
      .filter((m) => m.status === "INVOICED" || m.status === "OVERDUE")
      .map((m) => ({ ...m, projectTitle: p.title, clientName: p.clientName || p.clientCompany }))
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-card-border text-[11px] font-semibold text-muted-foreground w-fit mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-neon" />
            Freelance Business & Client CRM Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Freelance & Client Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manajemen deliverable, milestone invoicing (termin), direktori klien, dan kalkulasi otomatis Net Profit Margin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-2.5 rounded-full bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>

          {/* Add Client CTA */}
          <Button
            variant="outline"
            onClick={() => setIsClientModalOpen(true)}
            className="h-10 px-5 rounded-full text-xs font-bold gap-2 bg-card-inner border-card-border text-foreground hover:bg-card-inner/80 shadow-sm"
          >
            <Users className="w-4 h-4 text-neon" /> Tambah Klien
          </Button>

          {/* Add Project CTA */}
          <Button
            onClick={() => setIsProjectDialogOpen(true)}
            className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Proyek Baru
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Summary Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Kontrak */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Nilai Proyek
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground tabular-nums truncate">
              {formatRupiah(summary.totalContractValue)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {summary.activeProjects} proyek aktif berjalan
          </p>
        </div>

        {/* KPI 2: Paid Revenue */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Kas Masuk (Lunas)
            </span>
            <div className="w-8 h-8 rounded-full bg-neon/15 text-neon flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-neon tabular-nums truncate">
              {formatRupiah(summary.totalPaidRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Termin berhasil dicairkan
          </p>
        </div>

        {/* KPI 3: Piutang Ditagih */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Piutang Tertagih
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-amber-400 tabular-nums truncate">
              {formatRupiah(summary.totalInvoicedReceivables)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {allReceivables.length} termin menunggu transfer
          </p>
        </div>

        {/* KPI 4: Net Profit Margin */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-card border border-card-border space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Net Profit Margin
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground tabular-nums truncate">
              {formatRupiah(summary.overallNetProfit)}
            </span>
            <span className="text-xs text-neon font-extrabold">
              ({summary.overallMarginPercentage}%)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Setelah beban operasional proyek
          </p>
        </div>
      </div>

      {/* 3. Sub-Tabs Navigation (Stitch Pill Style) */}
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-card border border-card-border shadow-sm">
        <button
          onClick={() => setActiveTab("PROJECTS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
            activeTab === "PROJECTS"
              ? "bg-neon text-black font-extrabold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card-inner"
          )}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Board Proyek</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold",
              activeTab === "PROJECTS" ? "bg-black/20 text-black" : "bg-card-inner text-foreground"
            )}
          >
            {projects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CLIENTS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
            activeTab === "CLIENTS"
              ? "bg-neon text-black font-extrabold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card-inner"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Direktori Klien CRM</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold",
              activeTab === "CLIENTS" ? "bg-black/20 text-black" : "bg-card-inner text-foreground"
            )}
          >
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("RECEIVABLES")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
            activeTab === "RECEIVABLES"
              ? "bg-neon text-black font-extrabold shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card-inner"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Termin & Piutang</span>
          {allReceivables.length > 0 && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                activeTab === "RECEIVABLES" ? "bg-black text-[#25dd59]" : "bg-amber-500/20 text-amber-400"
              )}
            >
              {allReceivables.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "PROJECTS" && (
        <ProjectBoard
          projects={projects}
          clients={clients}
          onRefresh={loadData}
          onOpenMilestones={handleOpenMilestones}
          onOpenExpense={handleOpenExpense}
        />
      )}

      {activeTab === "CLIENTS" && (
        <ClientDirectory
          clients={clients}
          onRefresh={loadData}
          onSelectClientProjects={() => setActiveTab("PROJECTS")}
        />
      )}

      {activeTab === "RECEIVABLES" && (
        <div className="space-y-4">
          <div className="p-6 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                Rekap Piutang Termin Freelance ({allReceivables.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daftar tagihan termin yang berstatus INVOICED atau OVERDUE. Klik tombol sinkronisasi saat klien melunasi.
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Ekspektasi Dana
              </span>
              <p className="text-lg font-black text-amber-400">
                {formatRupiah(summary.totalInvoicedReceivables)}
              </p>
            </div>
          </div>

          {allReceivables.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl">
              <div className="w-12 h-12 rounded-full bg-neon/15 text-neon flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-foreground">
                Tidak Ada Piutang Tertunda!
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Seluruh termin proyek freelance sudah lunas atau belum diterbitkan tagihannya.
              </p>
            </div>
          ) : (
            <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border p-6 shadow-xl overflow-hidden">
              <div className="overflow-x-auto rounded-2xl border border-card-border-subtle bg-card-inner">
                <table className="w-full text-left text-xs">
                  <thead className="bg-card border-b border-card-border text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Proyek & Termin</th>
                      <th className="py-3.5 px-4 font-bold">Klien</th>
                      <th className="py-3.5 px-4 font-bold">Invoice #</th>
                      <th className="py-3.5 px-4 font-bold">Jatuh Tempo</th>
                      <th className="py-3.5 px-4 font-bold">Nominal</th>
                      <th className="py-3.5 px-4 font-bold text-right">Aksi Pelunasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border-subtle">
                    {allReceivables.map((rec) => (
                      <tr key={rec.id} className="hover:bg-card/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-foreground">{rec.title}</p>
                          <p className="text-[11px] text-muted-foreground">{rec.projectTitle}</p>
                        </td>
                        <td className="py-3.5 px-4 text-foreground font-medium">
                          {rec.clientName || "-"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                          {rec.invoiceNumber || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {formatDate(rec.dueDate)}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-amber-400">
                          {formatRupiah(rec.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSyncMilestone(rec.id, rec.projectId)}
                            disabled={syncingMilestoneId === rec.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neon text-black font-extrabold text-xs shadow-sm hover:bg-neon/90 transition-all disabled:opacity-50"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>
                              {syncingMilestoneId === rec.id
                                ? "Menyinkronkan..."
                                : "Tandai Lunas & Sync Money"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Modals */}
      <ProjectDialog
        isOpen={isProjectDialogOpen}
        onClose={() => setIsProjectDialogOpen(false)}
        clients={clients}
        onSuccess={loadData}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={loadData}
      />

      <MilestoneManager
        isOpen={!!selectedProjectForMilestones}
        onClose={() => setSelectedProjectForMilestones(null)}
        project={selectedProjectForMilestones}
        onRefresh={loadData}
      />

      {selectedProjectForExpense && (
        <ProjectExpenseDialog
          isOpen={isExpenseDialogOpen}
          onClose={() => {
            setIsExpenseDialogOpen(false);
            setSelectedProjectForExpense(null);
          }}
          projectId={selectedProjectForExpense.id}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
