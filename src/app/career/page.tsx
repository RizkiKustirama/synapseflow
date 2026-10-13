"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  LayoutGrid,
  List,
  Briefcase,
  Users,
  Award,
  DollarSign,
  Building2,
  ExternalLink,
  Trash2,
  Edit,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, cn } from "@/lib/utils";
import {
  getJobApplications,
  getCareerStats,
  deleteJobApplication,
  StoredJobApplication,
} from "@/actions/career.actions";
import { CareerKanban } from "@/components/career/career-kanban";
import { ApplicationDialog } from "@/components/career/application-dialog";
import { InterviewLogModal } from "@/components/career/interview-log-modal";
import { ConvertEmploymentDialog } from "@/components/career/convert-employment-dialog";

export default function CareerPage() {
  const [applications, setApplications] = useState<StoredJobApplication[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    activePipeline: 0,
    totalInterviews: 0,
    offerRate: 0,
    avgExpectedSalary: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"KANBAN" | "TABLE">("KANBAN");

  // Modals state
  const [selectedApp, setSelectedApp] = useState<StoredJobApplication | null>(null);
  const [isAppDialogOpen, setIsAppDialogOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appsData, statsData] = await Promise.all([
        getJobApplications(),
        getCareerStats(),
      ]);
      setApplications(appsData);
      setStats(statsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (app: StoredJobApplication) => {
    setSelectedApp(app);
    setIsAppDialogOpen(true);
  };

  const handleOpenInterview = (app: StoredJobApplication) => {
    setSelectedApp(app);
    setIsInterviewModalOpen(true);
  };

  const handleConvert = (app: StoredJobApplication) => {
    setSelectedApp(app);
    setIsConvertDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedApp(null);
    setIsAppDialogOpen(true);
  };

  const handleDelete = async (id: string, company: string) => {
    if (confirm(`Hapus lamaran di "${company}"?`)) {
      await deleteJobApplication(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Job Hunting CRM & Interview Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Career Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pantau seluruh lamaran dari Wishlist hingga Offering, log jadwal interview, dan konversi 1-klik ke Employment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-card border border-card-border">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "KANBAN"
                  ? "bg-background text-neon shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === "TABLE"
                  ? "bg-background text-neon shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>

          {/* Create Application CTA */}
          <Button onClick={handleAddNew} className="h-10 text-xs font-bold gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Lamaran
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Active Pipeline */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Pipeline Aktif
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {stats.activePipeline}
            </span>
            <span className="text-[11px] text-muted-foreground">
              dari {stats.totalApplications} total
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Lamaran dalam proses seleksi
          </p>
        </div>

        {/* KPI 2: Total Interviews */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Sesi Interview
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {stats.totalInterviews}
            </span>
            <span className="text-[11px] text-purple-400 font-semibold">
              terjadwal & dicatat
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Log CRM wawancara lintas tahap
          </p>
        </div>

        {/* KPI 3: Offer Rate */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Offer Rate
            </span>
            <div className="w-7 h-7 rounded-xl bg-neon/15 text-neon flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-neon tabular-nums">
              {stats.offerRate}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              rasio offering
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tahap Offering & Accepted
          </p>
        </div>

        {/* KPI 4: Avg Expected Salary */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Rata-rata Target Gaji
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground tabular-nums truncate">
              {formatRupiah(stats.avgExpectedSalary)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Ekspektasi kompensasi bulanan
          </p>
        </div>
      </div>

      {/* 3. Main Career View (Kanban vs Table) */}
      {viewMode === "KANBAN" ? (
        <CareerKanban
          applications={applications}
          onRefresh={loadData}
          onEdit={handleEdit}
          onOpenInterview={handleOpenInterview}
          onConvert={handleConvert}
        />
      ) : (
        /* High-Density Table View */
        <div className="rounded-3xl bg-card border border-card-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Daftar Lamaran Kerja ({applications.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Klik nama perusahaan untuk detail & aksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background/80 text-muted-foreground border-b border-card-border">
                <tr>
                  <th className="py-3 px-4 font-bold">Perusahaan</th>
                  <th className="py-3 px-4 font-bold">Posisi</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Lokasi</th>
                  <th className="py-3 px-4 font-bold">Gaji Target / Ditawarkan</th>
                  <th className="py-3 px-4 font-bold">Interview</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-card-border/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{app.companyName}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-neon"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-medium">
                      {app.position}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          app.status === "ACCEPTED" || app.status === "OFFERING"
                            ? "default"
                            : app.status === "REJECTED" || app.status === "GHOSTED"
                            ? "destructive"
                            : "processing"
                        }
                        className="text-[10px]"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {app.workLocation}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {app.salaryOfferedMax
                        ? formatRupiah(app.salaryOfferedMax)
                        : app.expectedSalary
                        ? formatRupiah(app.expectedSalary)
                        : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenInterview(app)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-card-border hover:border-purple-500/40 text-purple-400 font-bold text-[11px]"
                      >
                        <Users className="w-3 h-3" />
                        {app.interviewLogs.length} Sesi
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {(app.status === "OFFERING" || app.status === "ACCEPTED") && (
                          <button
                            onClick={() => handleConvert(app)}
                            className="px-2.5 py-1 rounded-lg bg-neon/15 hover:bg-neon/25 text-neon border border-neon/40 text-[10px] font-bold"
                            title="Konversi ke Employment"
                          >
                            ⚡ Konversi
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(app)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background"
                          title="Edit Lamaran"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id, app.companyName)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-background"
                          title="Hapus Lamaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Application Dialog (Create / Edit) */}
      <ApplicationDialog
        isOpen={isAppDialogOpen}
        onClose={() => {
          setIsAppDialogOpen(false);
          setSelectedApp(null);
        }}
        onSuccess={loadData}
        applicationToEdit={selectedApp}
      />

      {/* 5. Interview CRM Stage Logger Modal */}
      <InterviewLogModal
        isOpen={isInterviewModalOpen}
        onClose={() => {
          setIsInterviewModalOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        onRefresh={loadData}
      />

      {/* 6. Convert to Employment Modal */}
      <ConvertEmploymentDialog
        isOpen={isConvertDialogOpen}
        onClose={() => {
          setIsConvertDialogOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        onSuccess={loadData}
      />
    </div>
  );
}
