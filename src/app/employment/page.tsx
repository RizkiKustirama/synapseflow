"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, cn } from "@/lib/utils";
import {
  getEmployments,
  getActiveEmployment,
  getEmploymentSummary,
  StoredEmployment,
} from "@/actions/employment.actions";
import { ContractCard } from "@/components/employment/contract-card";
import { ContractModal } from "@/components/employment/contract-modal";
import { OfficeTasks } from "@/components/employment/office-tasks";
import { PayrollTable } from "@/components/employment/payroll-table";

type SubTab = "OVERVIEW" | "TASKS" | "PAYROLL";

export default function EmploymentPage() {
  const [activeEmp, setActiveEmp] = useState<StoredEmployment | null>(null);
  const [allEmps, setAllEmps] = useState<StoredEmployment[]>([]);
  const [summary, setSummary] = useState({
    hasActiveEmployment: false,
    companyName: "-",
    role: "-",
    payday: 25,
    totalBaseSalary: 0,
    totalFixedAllowance: 0,
    totalTakeHomePay: 0,
    pendingTasks: 0,
    urgentTasks: 0,
    totalSyncedPayroll: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>("OVERVIEW");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [primaryEmp, list, stats] = await Promise.all([
        getActiveEmployment(),
        getEmployments(),
        getEmploymentSummary(),
      ]);
      setActiveEmp(primaryEmp);
      setAllEmps(list);
      setSummary(stats);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Semi-ERP Office & Payroll Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Employment (Kerja Kantor & Kontrak)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manajemen profil kontrak aktif, task sprint harian, dan pencatatan slip gaji dengan auto-sync ke buku kas Money.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-card border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>

          {/* Add Contract CTA */}
          <Button
            onClick={() => setIsContractModalOpen(true)}
            className="h-10 text-xs font-bold gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Tambah Kontrak
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Summary Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Take Home Pay */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Estimasi THP Bulanan
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground tabular-nums truncate">
              {formatRupiah(summary.totalTakeHomePay)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {summary.companyName !== "-" ? summary.companyName : "Belum ada kontrak aktif"}
          </p>
        </div>

        {/* KPI 2: Payday Cycle */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Siklus Payday
            </span>
            <div className="w-7 h-7 rounded-xl bg-neon/15 text-neon flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-neon tabular-nums">
              Tgl {summary.payday}
            </span>
            <span className="text-[11px] text-muted-foreground">
              setiap bulan
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Jadwal transfer gaji kantor
          </p>
        </div>

        {/* KPI 3: Sprint Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tugas Sprint
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {summary.pendingTasks}
            </span>
            {summary.urgentTasks > 0 ? (
              <span className="text-[11px] text-red-400 font-semibold">
                ({summary.urgentTasks} urgent)
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            To-do list harian kantor
          </p>
        </div>

        {/* KPI 4: Total Synced to Ledger */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-card-border space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Tersinkron ke Money
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-foreground tabular-nums truncate">
              {formatRupiah(summary.totalSyncedPayroll)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Total penerimaan tercatat di kas
          </p>
        </div>
      </div>

      {/* 3. Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-card-border pb-3">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all",
            activeTab === "OVERVIEW"
              ? "bg-card border border-card-border text-neon shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card-border/30"
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Kontrak & Ringkasan</span>
        </button>

        <button
          onClick={() => setActiveTab("TASKS")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all",
            activeTab === "TASKS"
              ? "bg-card border border-card-border text-neon shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card-border/30"
          )}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Daily Sprint Tasks</span>
          {activeEmp && activeEmp.tasks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-card-border text-[10px] text-foreground font-semibold">
              {activeEmp.tasks.filter((t) => t.status !== "DONE").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("PAYROLL")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all",
            activeTab === "PAYROLL"
              ? "bg-card border border-card-border text-neon shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-card-border/30"
          )}
        >
          <DollarSign className="w-4 h-4" />
          <span>Slip Gaji & Sync Money</span>
          {activeEmp && activeEmp.payrollRecords.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-card-border text-[10px] text-foreground font-semibold">
              {activeEmp.payrollRecords.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6 sm:space-y-8">
          {/* Active Contract Card */}
          <ContractCard employment={activeEmp} onRefresh={loadData} />

          {/* Dual Column: Quick Sprint Preview + Quick Payroll Preview */}
          {activeEmp && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sprint Tasks Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-neon" />
                    Sprint Checklist Kantor
                  </h3>
                  <button
                    onClick={() => setActiveTab("TASKS")}
                    className="text-xs text-neon hover:underline font-semibold"
                  >
                    Buka Seluruh Task →
                  </button>
                </div>
                <OfficeTasks
                  employmentId={activeEmp.id}
                  tasks={activeEmp.tasks.slice(0, 5)}
                  onRefresh={loadData}
                />
              </div>

              {/* Payroll Records Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Slip Gaji Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab("PAYROLL")}
                    className="text-xs text-neon hover:underline font-semibold"
                  >
                    Buka Riwayat Slip →
                  </button>
                </div>
                <PayrollTable employment={activeEmp} onRefresh={loadData} />
              </div>
            </div>
          )}

          {/* List of other employments if multiple exist */}
          {allEmps.length > 1 && (
            <div className="p-4 rounded-2xl bg-card border border-card-border space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Riwayat Pekerjaan Lainnya ({allEmps.length - 1})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allEmps
                  .filter((e) => e.id !== activeEmp?.id)
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3 rounded-xl bg-background border border-card-border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{emp.companyName}</p>
                        <p className="text-[11px] text-muted-foreground">{emp.role} • {emp.status}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveEmp(emp)}
                        className="text-[10px] h-7 px-2.5 font-bold"
                      >
                        Lihat Profil
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "TASKS" && activeEmp && (
        <OfficeTasks
          employmentId={activeEmp.id}
          tasks={activeEmp.tasks}
          onRefresh={loadData}
        />
      )}

      {activeTab === "PAYROLL" && activeEmp && (
        <PayrollTable employment={activeEmp} onRefresh={loadData} />
      )}

      {/* Global Contract Creation Modal */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
