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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Semi-ERP Company & Contract Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Employment (Direktori Perusahaan & Kontrak)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola berbagai kontrak kerja aktif, masa kerja, daily sprint tasks, dan riwayat slip gaji per perusahaan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-colors"
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
            className="h-10 text-xs font-bold gap-2 bg-neon text-black hover:bg-neon/90"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Kontrak Baru
          </Button>
        </div>
      </div>

      {/* 2. Global Summary Bar (3 High-Impact Bento Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Total Kontrak Aktif */}
        <Card className="hover:border-neon/40 transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Kontrak Aktif
            </span>
            <div className="p-2 rounded-xl bg-neon/15 text-neon">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
              {summary.activeEmploymentsCount} Perusahaan
            </div>
            <p className="text-xs text-muted-foreground">
              Dari total {summary.totalEmploymentsCount} kontrak kerja tercatat
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Akumulasi Estimasi Gaji Bulanan */}
        <Card className="hover:border-neon/40 transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Akumulasi Gaji Bulanan
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
              {formatRupiah(summary.totalAccumulatedMonthlySalary)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total gaji pokok & tunjangan dari seluruh kontrak aktif
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Gaji Terbayar (All Time) */}
        <Card className="hover:border-neon/40 transition-all duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Gaji Terbayar
            </span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-400 tabular-nums">
              {formatRupiah(summary.totalPaidPayrollAllTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total take-home pay dari seluruh slip gaji yang tercatat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search Bar & Status Filter Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-card-border overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              statusFilter === "ALL"
                ? "bg-neon text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card-border/40"
            )}
          >
            Semua ({employments.length})
          </button>

          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              statusFilter === "ACTIVE"
                ? "bg-neon text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card-border/40"
            )}
          >
            Aktif ({employments.filter((e) => e.status === "ACTIVE").length})
          </button>

          <button
            onClick={() => setStatusFilter("PROBATION")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              statusFilter === "PROBATION"
                ? "bg-neon text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card-border/40"
            )}
          >
            Probation ({employments.filter((e) => e.status === "PROBATION").length})
          </button>

          <button
            onClick={() => setStatusFilter("COMPLETED_RESIGNED")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap",
              statusFilter === "COMPLETED_RESIGNED"
                ? "bg-neon text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card-border/40"
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
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari perusahaan atau role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-card border-card-border"
          />
        </div>
      </div>

      {/* 4. Company Cards Grid */}
      {filteredEmployments.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-card-border">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-card-border/60 text-muted-foreground flex items-center justify-center mx-auto">
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
              className="bg-neon text-black hover:bg-neon/90 text-xs font-bold gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Kontrak Baru
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployments.map((emp) => {
            const pendingTasksCount = emp.tasks.filter((t) => t.status !== "DONE").length;
            const tenureStr = calculateTenure(emp.startDate, emp.endDate);
            const totalMonthly = emp.baseSalary + emp.fixedAllowance;

            return (
              <Card
                key={emp.id}
                className="flex flex-col justify-between hover:-translate-y-1 hover:border-neon/40 hover:shadow-[0_0_24px_rgba(59,240,41,0.08)] transition-all duration-200"
              >
                {/* Card Header */}
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-2xl bg-neon/15 text-neon">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <Badge
                          variant={getStatusBadgeVariant(emp.status)}
                          className="text-[9px]"
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
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card-border/40 transition-colors"
                        title="Edit Kontrak"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.companyName)}
                        disabled={deletingId === emp.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
                      <Briefcase className="w-3 h-3" />
                      <span>{emp.role}</span>
                      <span>•</span>
                      <span className="text-foreground">{getJobTypeLabel(emp.jobType)}</span>
                    </p>
                  </div>
                </CardHeader>

                {/* Card Body Metrics */}
                <CardContent className="space-y-3.5 pt-0">
                  {/* Financial Ribbon */}
                  <div className="p-3 rounded-2xl bg-background/80 border border-card-border/60 space-y-1.5">
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
                    <div className="p-2.5 rounded-xl bg-card-border/20 border border-card-border/40 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-neon shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block">Masa Kerja</span>
                        <span className="font-bold text-foreground text-[11px] truncate block">
                          {tenureStr}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-card-border/20 border border-card-border/40 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block">Sprint Tasks</span>
                        <span className="font-bold text-foreground text-[11px] truncate block">
                          {emp.tasks.length} ({pendingTasksCount} aktif)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Workspace CTA Button */}
                  <Link href={`/employment/${emp.id}`} className="block w-full pt-1">
                    <Button
                      variant="outline"
                      className="w-full h-10 text-xs font-bold justify-between border-card-border hover:border-neon hover:text-neon group"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-neon" />
                        Buka Workspace Perusahaan
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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
