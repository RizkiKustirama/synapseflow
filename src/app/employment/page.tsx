"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  DollarSign,
  Plus,
  RefreshCw,
  Sparkles,
  Wallet,
  Search,
  ChevronRight,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, calculateTenure, cn } from "@/lib/utils";
import {
  getEmployments,
  getEmploymentSummary,
  deleteEmployment,
  StoredEmployment,
} from "@/actions/employment.actions";
import { ContractModal } from "@/components/employment/contract-modal";

type StatusFilter = "ALL" | "ACTIVE" | "PROBATION" | "COMPLETED_RESIGNED";

export default function EmploymentMasterPage() {
  const [employments, setEmployments] = useState<StoredEmployment[]>([]);
  const [summary, setSummary] = useState({
    hasActiveEmployment: false,
    activeEmploymentsCount: 0,
    totalEmploymentsCount: 0,
    companyName: "-",
    role: "-",
    payday: 25,
    totalBaseSalary: 0,
    totalFixedAllowance: 0,
    totalTakeHomePay: 0,
    totalAccumulatedMonthlySalary: 0,
    totalPaidPayrollAllTime: 0,
    pendingTasks: 0,
    urgentTasks: 0,
    totalSyncedPayroll: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [employmentToEdit, setEmploymentToEdit] = useState<StoredEmployment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, stats] = await Promise.all([
        getEmployments(),
        getEmploymentSummary(),
      ]);
      setEmployments(list);
      setSummary(stats);
    } catch (err) {
      console.error("Failed to load employments:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`Hapus kontrak kerja "${companyName}"? Seluruh task dan slip gaji perusahaan ini akan ikut terhapus.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteEmployment(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete employment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered employments
  const filteredEmployments = useMemo(() => {
    return employments.filter((emp) => {
      // 1. Status Filter
      if (statusFilter === "ACTIVE" && emp.status !== "ACTIVE") return false;
      if (statusFilter === "PROBATION" && emp.status !== "PROBATION") return false;
      if (
        statusFilter === "COMPLETED_RESIGNED" &&
        emp.status !== "COMPLETED" &&
        emp.status !== "RESIGNED"
      ) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCompany = emp.companyName.toLowerCase().includes(query);
        const matchRole = emp.role.toLowerCase().includes(query);
        if (!matchCompany && !matchRole) return false;
      }

      return true;
    });
  }, [employments, statusFilter, searchQuery]);

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
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-card-border text-[11px] font-semibold text-muted-foreground w-fit mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-neon" />
            Semi-ERP Company & Contract Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Employment (Direktori Perusahaan & Kontrak)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola berbagai kontrak kerja aktif, masa kerja, daily sprint tasks, dan riwayat slip gaji per perusahaan.
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

          {/* Add Contract CTA */}
          <Button
            onClick={() => {
              setEmploymentToEdit(null);
              setIsContractModalOpen(true);
            }}
            className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Kontrak Baru
          </Button>
        </div>
      </div>

      {/* 2. Global Summary Bar (Stitch 3 Highlight Cards with Lime Center) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Total Kontrak Aktif */}
        <div className="bg-card rounded-[2rem] p-5 sm:p-6 border border-card-border shadow-sm flex flex-col justify-between min-h-[170px] hover:border-neon/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Kontrak Aktif
            </span>
            <div className="w-9 h-9 rounded-full bg-neon/15 text-neon flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
              {summary.activeEmploymentsCount} Perusahaan
            </div>
            <p className="text-xs text-muted-foreground">
              Dari total {summary.totalEmploymentsCount} kontrak kerja tercatat
            </p>
          </div>
        </div>

        {/* Card 2: Akumulasi Estimasi Gaji Bulanan (Stitch Signature Lime Green Card) */}
        <div className="bg-[#78e354] rounded-[2rem] p-5 sm:p-6 text-black border border-[#5cd625] shadow-md flex flex-col justify-between min-h-[170px] hover:bg-[#6ed94a] transition-all">
          <div className="flex items-center justify-between text-emerald-950">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Akumulasi Gaji Bulanan
            </span>
            <div className="w-9 h-9 rounded-full bg-black/15 text-emerald-950 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tabular-nums">
              {formatRupiah(summary.totalAccumulatedMonthlySalary)}
            </div>
            <p className="text-xs text-emerald-900 font-bold">
              Total gaji pokok & tunjangan dari seluruh kontrak aktif
            </p>
          </div>
        </div>

        {/* Card 3: Total Gaji Terbayar (All Time) */}
        <div className="bg-card rounded-[2rem] p-5 sm:p-6 border border-card-border shadow-sm flex flex-col justify-between min-h-[170px] hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Gaji Terbayar
            </span>
            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-500 tabular-nums">
              {formatRupiah(summary.totalPaidPayrollAllTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total take-home pay dari seluruh slip gaji yang tercatat
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Status Filter Pills (Stitch Pill Style) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-card border border-card-border shadow-sm overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap",
              statusFilter === "ALL"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semua ({employments.length})
          </button>

          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap",
              statusFilter === "ACTIVE"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Aktif ({employments.filter((e) => e.status === "ACTIVE").length})
          </button>

          <button
            onClick={() => setStatusFilter("PROBATION")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap",
              statusFilter === "PROBATION"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Probation ({employments.filter((e) => e.status === "PROBATION").length})
          </button>

          <button
            onClick={() => setStatusFilter("COMPLETED_RESIGNED")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap",
              statusFilter === "COMPLETED_RESIGNED"
                ? "bg-neon text-black font-extrabold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Selesai / Resigned (
            {
              employments.filter(
                (e) => e.status === "COMPLETED" || e.status === "RESIGNED"
              ).length
            }
            )
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari perusahaan atau role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-10 text-xs rounded-full bg-card border-card-border shadow-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-neon"
          />
        </div>
      </div>

      {/* 4. Company Cards Grid */}
      {filteredEmployments.length === 0 ? (
        <div className="p-12 text-center rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-dashed border-card-border shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-card-inner border border-card-border-subtle text-muted-foreground flex items-center justify-center mx-auto shadow-sm">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Tidak ada perusahaan ditemukan
              </h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery || statusFilter !== "ALL"
                  ? "Coba ubah filter status atau kata kunci pencarian Anda."
                  : "Belum ada kontrak kerja kantor terdaftar. Tambahkan kontrak pertama Anda."}
              </p>
            </div>
            <Button
              onClick={() => {
                setEmploymentToEdit(null);
                setIsContractModalOpen(true);
              }}
              className="bg-neon text-black hover:bg-neon/90 text-xs font-extrabold gap-2 rounded-full h-10 px-5 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Kontrak Baru
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployments.map((emp) => {
            const pendingTasksCount = emp.tasks.filter((t) => t.status !== "DONE").length;
            const tenureStr = calculateTenure(emp.startDate, emp.endDate);
            const totalMonthly = emp.baseSalary + emp.fixedAllowance;

            return (
              <div
                key={emp.id}
                className="group relative flex flex-col justify-between rounded-[2rem] lg:rounded-[2.5rem] border border-card-border bg-card p-6 sm:p-7 text-foreground shadow-sm hover:shadow-xl hover:border-neon/40 transition-all duration-200"
              >
                {/* Card Header */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-neon/15 text-neon border border-neon/40 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <Badge
                          variant={getStatusBadgeVariant(emp.status)}
                          className="text-[10px] rounded-full px-2.5 py-0.5"
                        >
                          {getStatusLabel(emp.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEmploymentToEdit(emp);
                          setIsContractModalOpen(true);
                        }}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-card-inner transition-colors"
                        title="Edit Kontrak"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.companyName)}
                        disabled={deletingId === emp.id}
                        className="p-1.5 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Kontrak"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-neon transition-colors line-clamp-1">
                      {emp.companyName}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3 h-3 text-neon" />
                      <span>{emp.role}</span>
                      <span>•</span>
                      <span className="text-foreground">{getJobTypeLabel(emp.jobType)}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body Metrics */}
                <div className="space-y-3.5 pt-4">
                  {/* Financial Ribbon */}
                  <div className="p-3.5 rounded-2xl bg-card-inner border border-card-border-subtle space-y-1.5 shadow-sm">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Gaji Bulanan</span>
                      <span className="font-extrabold text-foreground tabular-nums">
                        {formatRupiah(totalMonthly)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neon" />
                        Gajian tiap tgl {emp.payday}
                      </span>
                      <span>Pokok: {formatRupiah(emp.baseSalary)}</span>
                    </div>
                  </div>

                  {/* Operational Tags */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-card-inner border border-card-border-subtle flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-neon shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block font-medium">Masa Kerja</span>
                        <span className="font-bold text-foreground text-[11px] truncate block">
                          {tenureStr}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-card-inner border border-card-border-subtle flex items-center gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block font-medium">Sprint Tasks</span>
                        <span className="font-bold text-foreground text-[11px] truncate block">
                          {emp.tasks.length} ({pendingTasksCount} aktif)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Workspace CTA Button */}
                  <Link href={`/employment/${emp.id}`} className="block w-full pt-1">
                    <div className="w-full h-10 px-5 rounded-full text-xs font-bold justify-between bg-card-inner hover:bg-card-inner/80 border border-card-border-subtle text-foreground hover:text-neon group shadow-sm transition-all flex items-center">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-neon" />
                        Buka Workspace Perusahaan
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create / Edit Contract Modal */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setEmploymentToEdit(null);
        }}
        onSuccess={() => {
          setIsContractModalOpen(false);
          setEmploymentToEdit(null);
          loadData();
        }}
        employmentToEdit={employmentToEdit}
      />
    </div>
  );
}
