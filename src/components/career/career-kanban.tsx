"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Calendar,
  Banknote,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
  Zap,
  ArrowRight,
  Search,
  MessageSquare,
  Loader2,
  Briefcase,
  MapPin,
} from "lucide-react";
import {
  StoredJobApplication,
  updateApplicationStatus,
  deleteJobApplication,
} from "@/actions/career.actions";
import { formatRupiah, formatDate, cn } from "@/lib/utils";

export interface CareerKanbanProps {
  applications: StoredJobApplication[];
  onRefresh: () => void;
  onEdit: (app: StoredJobApplication) => void;
  onOpenInterview: (app: StoredJobApplication) => void;
  onConvert: (app: StoredJobApplication) => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  statuses: StoredJobApplication["status"][];
  colorClass: string;
  badgeClass: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "WISHLIST",
    title: "📌 Wishlist",
    statuses: ["WISHLIST"],
    colorClass: "border-slate-500/30 text-slate-400",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
  {
    id: "APPLIED",
    title: "📤 Applied",
    statuses: ["APPLIED"],
    colorClass: "border-blue-500/30 text-blue-400",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    id: "SCREENING",
    title: "🔍 Screening",
    statuses: ["SCREENING"],
    colorClass: "border-cyan-500/30 text-cyan-400",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "INTERVIEW",
    title: "🎙️ Interview",
    statuses: ["INTERVIEW"],
    colorClass: "border-purple-500/30 text-purple-400",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  {
    id: "TECH_TEST",
    title: "💻 Tech Test",
    statuses: ["TECH_TEST"],
    colorClass: "border-amber-500/30 text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "OFFERING",
    title: "🎁 Offering",
    statuses: ["OFFERING"],
    colorClass: "border-emerald-500/30 text-emerald-400",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "ACCEPTED",
    title: "✅ Accepted",
    statuses: ["ACCEPTED"],
    colorClass: "border-neon/40 text-neon",
    badgeClass: "bg-neon/15 text-neon border-neon/40",
  },
  {
    id: "REJECTED",
    title: "❌ Rejected / Ghosted",
    statuses: ["REJECTED", "GHOSTED"],
    colorClass: "border-rose-500/30 text-rose-400",
    badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
];

const ALL_STATUSES: { value: StoredJobApplication["status"]; label: string }[] = [
  { value: "WISHLIST", label: "Wishlist" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "TECH_TEST", label: "Tech Test" },
  { value: "OFFERING", label: "Offering" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "GHOSTED", label: "Ghosted" },
];

const NEXT_STAGE_MAP: Partial<
  Record<StoredJobApplication["status"], { next: StoredJobApplication["status"]; label: string }>
> = {
  WISHLIST: { next: "APPLIED", label: "Applied" },
  APPLIED: { next: "SCREENING", label: "Screening" },
  SCREENING: { next: "INTERVIEW", label: "Interview" },
  INTERVIEW: { next: "TECH_TEST", label: "Tech Test" },
  TECH_TEST: { next: "OFFERING", label: "Offering" },
  OFFERING: { next: "ACCEPTED", label: "Accepted" },
};

export function CareerKanban({
  applications,
  onRefresh,
  onEdit,
  onOpenInterview,
  onConvert,
}: CareerKanbanProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery === "" ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation =
        locationFilter === "ALL" || app.workLocation === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [applications, searchQuery, locationFilter]);

  // Handle status change
  const handleStatusChange = async (
    id: string,
    newStatus: StoredJobApplication["status"]
  ) => {
    try {
      setLoadingId(id);
      await updateApplicationStatus(id, newStatus);
      onRefresh();
    } catch (err) {
      console.error("Gagal memperbarui status lamaran:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // Handle delete
  const handleDelete = async (app: StoredJobApplication) => {
    const isConfirmed = window.confirm(
      `Hapus lamaran posisi "${app.position}" di ${app.companyName}?`
    );
    if (!isConfirmed) return;

    try {
      setLoadingId(app.id);
      await deleteJobApplication(app.id);
      onRefresh();
    } catch (err) {
      console.error("Gagal menghapus lamaran:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // Location badge renderer
  const renderLocationBadge = (loc: StoredJobApplication["workLocation"]) => {
    switch (loc) {
      case "REMOTE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Remote
          </span>
        );
      case "HYBRID":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Hybrid
          </span>
        );
      case "ONSITE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <MapPin className="w-2.5 h-2.5" />
            Onsite
          </span>
        );
      default:
        return null;
    }
  };

  // Salary renderer
  const renderSalary = (app: StoredJobApplication) => {
    if (app.salaryOfferedMin && app.salaryOfferedMax) {
      if (app.salaryOfferedMin === app.salaryOfferedMax) {
        return formatRupiah(app.salaryOfferedMin);
      }
      return `${formatRupiah(app.salaryOfferedMin)} - ${formatRupiah(app.salaryOfferedMax)}`;
    }
    if (app.salaryOfferedMin) {
      return `${formatRupiah(app.salaryOfferedMin)}+`;
    }
    if (app.salaryOfferedMax) {
      return `Hingga ${formatRupiah(app.salaryOfferedMax)}`;
    }
    if (app.expectedSalary) {
      return `Ekspektasi: ${formatRupiah(app.expectedSalary)}`;
    }
    return "Negosiasi / TBD";
  };

  // Calculate elapsed days
  const getElapsedDaysText = (dateString: string) => {
    try {
      const applied = new Date(dateString);
      if (isNaN(applied.getTime())) return null;
      const today = new Date();
      const diffTime = today.getTime() - applied.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return "Hari ini";
      if (diffDays === 1) return "1 hari lalu";
      return `${diffDays} hari lalu`;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-card-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari perusahaan, posisi, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-card-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
          />
        </div>

        {/* Location Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline mr-1">
            Lokasi:
          </span>
          {[
            { id: "ALL", label: "Semua" },
            { id: "REMOTE", label: "Remote" },
            { id: "HYBRID", label: "Hybrid" },
            { id: "ONSITE", label: "Onsite" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLocationFilter(item.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                locationFilter === item.id
                  ? "bg-neon text-black shadow-sm font-bold"
                  : "bg-background/80 text-muted-foreground hover:text-foreground border border-card-border hover:border-card-border/80"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Container (Horizontal Scroll for 8 Columns) */}
      <div className="overflow-x-auto pb-6 pt-1 scrollbar-thin">
        <div className="flex gap-4 min-w-max items-start">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((app) =>
              col.statuses.includes(app.status)
            );

            return (
              <div
                key={col.id}
                className="w-80 min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col rounded-3xl bg-card border border-card-border shadow-sm overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-card-border bg-card/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {col.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-bold border",
                      col.badgeClass
                    )}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Column Body / Cards List */}
                <div className="p-3 space-y-3 min-h-[480px] max-h-[720px] overflow-y-auto scrollbar-thin bg-background/30">
                  {colApps.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-card-border/60 rounded-2xl p-4 text-center">
                      <Briefcase className="w-6 h-6 text-muted-foreground/40 mb-2" />
                      <p className="text-xs font-medium text-muted-foreground/60">
                        Belum ada lamaran
                      </p>
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const isBusy = loadingId === app.id;
                      const nextStage = NEXT_STAGE_MAP[app.status];
                      const elapsedText = getElapsedDaysText(app.appliedDate);

                      return (
                        <div
                          key={app.id}
                          className={cn(
                            "relative rounded-2xl bg-card border border-card-border p-4 space-y-3 transition-all duration-200 group hover:border-neon/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]",
                            isBusy && "opacity-60 pointer-events-none"
                          )}
                        >
                          {/* Loading Overlay */}
                          {isBusy && (
                            <div className="absolute inset-0 bg-card/70 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                              <Loader2 className="w-5 h-5 text-neon animate-spin" />
                            </div>
                          )}

                          {/* Card Header: Position, Company, Action Icons */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground group-hover:text-neon group-hover:drop-shadow-[0_0_8px_rgba(59,240,41,0.35)] transition-all truncate">
                                {app.position}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold truncate">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{app.companyName}</span>
                              </div>
                            </div>

                            {/* Action Buttons: Edit & Delete */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => onEdit(app)}
                                title="Edit lamaran"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-border/60 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(app)}
                                title="Hapus lamaran"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Location & Status Tag Row */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {renderLocationBadge(app.workLocation)}

                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka tautan lowongan kerja"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-card-border/40 text-muted-foreground hover:text-neon border border-card-border/60 transition-colors"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                Link
                              </a>
                            )}

                            {app.cvVersion && (
                              <span
                                title={app.cvVersion}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-card-border/30 text-muted-foreground border border-card-border/50 max-w-[120px] truncate"
                              >
                                <FileText className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{app.cvVersion}</span>
                              </span>
                            )}
                          </div>

                          {/* Salary Information */}
                          <div className="p-2.5 rounded-xl bg-background/60 border border-card-border/60 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                              <Banknote className="w-3.5 h-3.5 text-neon" />
                              Gaji:
                            </span>
                            <span className="font-bold text-foreground text-xs text-right">
                              {renderSalary(app)}
                            </span>
                          </div>

                          {/* Date & Elapsed Days Badge */}
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground/70" />
                              <span>{formatDate(app.appliedDate)}</span>
                            </span>
                            {elapsedText && (
                              <span className="px-1.5 py-0.5 rounded-md bg-card-border/50 text-[10px] font-medium text-muted-foreground">
                                {elapsedText}
                              </span>
                            )}
                          </div>

                          {/* Interview CRM Rounds Trigger */}
                          <button
                            type="button"
                            onClick={() => onOpenInterview(app)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-card-border/30 hover:bg-card-border/60 border border-card-border/50 hover:border-neon/30 text-xs font-semibold text-foreground transition-all group/crm"
                          >
                            <span className="flex items-center gap-1.5 text-muted-foreground group-hover/crm:text-foreground">
                              <MessageSquare className="w-3.5 h-3.5 text-neon" />
                              <span>Interview CRM</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon/15 text-neon font-bold text-[10px] border border-neon/30">
                              {app.interviewLogs?.length ?? 0} Tahap
                            </span>
                          </button>

                          {/* Convert to Employment CTA (Only for OFFERING or ACCEPTED) */}
                          {(app.status === "OFFERING" || app.status === "ACCEPTED") && (
                            <button
                              type="button"
                              onClick={() => onConvert(app)}
                              className="w-full py-2.5 px-3 rounded-xl bg-neon text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(59,240,41,0.35)] hover:shadow-[0_0_20px_rgba(59,240,41,0.55)] hover:bg-neon/90 active:scale-[0.98] transition-all"
                            >
                              <Zap className="w-3.5 h-3.5 fill-black" />
                              <span>Konversi ke Employment ⚡</span>
                            </button>
                          )}

                          {/* Status Management: Quick Advance + Status Dropdown */}
                          <div className="pt-2 border-t border-card-border/60 flex items-center gap-2">
                            {/* Status Selector Dropdown */}
                            <div className="flex-1 min-w-0">
                              <select
                                value={app.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    app.id,
                                    e.target.value as StoredJobApplication["status"]
                                  )
                                }
                                className="w-full px-2 py-1.5 text-[11px] font-semibold bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:border-neon cursor-pointer transition-colors"
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quick Next Step Advance Button */}
                            {nextStage && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(app.id, nextStage.next)
                                }
                                title={`Lanjut ke ${nextStage.label}`}
                                className="px-2.5 py-1.5 rounded-lg bg-card-border/50 hover:bg-neon hover:text-black text-foreground border border-card-border/80 text-[11px] font-bold flex items-center gap-1 transition-all flex-shrink-0"
                              >
                                <span>{nextStage.label}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
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
      </div>
    </div>
  );
}
