"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Zap,
  CheckCircle2,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  Receipt,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah, cn } from "@/lib/utils";
import {
  StoredEmployment,
  StoredPayrollRecord,
  syncPayrollToMoney,
} from "@/actions/employment.actions";
import { PayrollDialog } from "@/components/employment/payroll-dialog";

export interface PayrollTableProps {
  employment: StoredEmployment;
  onRefresh: () => void;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function PayrollTable({ employment, onRefresh }: PayrollTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);

  // Sort payroll records by Year desc, then Month desc
  const sortedRecords = useMemo(() => {
    if (!employment?.payrollRecords) return [];
    return [...employment.payrollRecords].sort((a, b) => {
      if (b.periodYear !== a.periodYear) {
        return b.periodYear - a.periodYear;
      }
      return b.periodMonth - a.periodMonth;
    });
  }, [employment?.payrollRecords]);

  // Aggregate statistics for the ribbon
  const stats = useMemo(() => {
    const totalCount = sortedRecords.length;
    const totalNetReceived = sortedRecords.reduce((acc, curr) => acc + curr.netSalary, 0);
    const syncedCount = sortedRecords.filter((r) => r.isSyncedToMoney).length;
    const pendingSyncCount = totalCount - syncedCount;
    return {
      totalCount,
      totalNetReceived,
      syncedCount,
      pendingSyncCount,
    };
  }, [sortedRecords]);

  // Handler for 1-Click Sync to Money Tracker
  const handleSync = async (payroll: StoredPayrollRecord) => {
    setSyncSuccessMsg(null);
    setSyncErrorMsg(null);
    setSyncingId(payroll.id);

    try {
      const res = await syncPayrollToMoney(payroll.id, employment.id);
      if (res && res.success) {
        const monthLabel =
          MONTH_NAMES[payroll.periodMonth - 1] || `Bulan ${payroll.periodMonth}`;
        setSyncSuccessMsg(
          `Slip gaji periode ${monthLabel} ${payroll.periodYear} (${formatRupiah(
            payroll.netSalary
          )}) berhasil dicatat ke Money Tracker!`
        );
        onRefresh();
      } else {
        setSyncErrorMsg(res?.error || "Gagal melakukan sinkronisasi slip gaji ke modul Money.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSyncErrorMsg(err.message);
      } else {
        setSyncErrorMsg("Terjadi kegagalan komunikasi saat sinkronisasi ke Money.");
      }
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header & Title (Stitch Card Light Mode) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center text-neon shadow-sm font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Riwayat Slip Gaji (Payroll Records)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Daftar slip pembayaran bulanan {employment.companyName} dan integrasi 1-klik ke Money Tracker.
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 self-start sm:self-auto shrink-0 bg-neon text-black hover:bg-neon/90 shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Catat Slip Gaji Baru
        </Button>
      </div>

      {/* Stats Quick Bar (Stitch Inner Cards) */}
      {sortedRecords.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Total Slip Tercatat
            </span>
            <p className="text-lg sm:text-xl font-black text-foreground tabular-nums">
              {stats.totalCount} Periode
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Total Gaji Diterima
            </span>
            <p className="text-lg sm:text-xl font-black text-neon tabular-nums">
              {formatRupiah(stats.totalNetReceived)}
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Tersinkron ke Money
            </span>
            <p className="text-lg sm:text-xl font-black text-emerald-500 tabular-nums flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {stats.syncedCount} Slip
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle shadow-sm space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Belum Tersinkron
            </span>
            <p
              className={cn(
                "text-lg sm:text-xl font-black tabular-nums",
                stats.pendingSyncCount > 0 ? "text-amber-500" : "text-muted-foreground"
              )}
            >
              {stats.pendingSyncCount} Slip
            </p>
          </div>
        </div>
      )}

      {/* Sync Notification Banners */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start justify-between gap-2.5 text-xs text-emerald-400 animate-in fade-in">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{syncSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSyncSuccessMsg(null)}
            className="text-emerald-400/70 hover:text-emerald-400 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {syncErrorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start justify-between gap-2.5 text-xs text-red-400 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{syncErrorMsg}</span>
          </div>
          <button
            onClick={() => setSyncErrorMsg(null)}
            className="text-red-400/70 hover:text-red-400 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Empty State */}
      {sortedRecords.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-neon/15 border border-neon/40 flex items-center justify-center text-neon shadow-sm">
            <Wallet className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-foreground">
              Belum Ada Riwayat Slip Gaji
            </h3>
            <p className="text-xs text-muted-foreground">
              Mulai catat slip gaji bulanan Anda untuk memantau take-home pay dan mengintegrasikannya langsung ke buku kas pemasukan Money Tracker.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="h-10 px-5 rounded-full text-xs font-extrabold gap-2 bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Catat Slip Gaji Pertama
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Stitch Card Light Mode) */}
          <div className="hidden lg:block overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] border border-card-border bg-card shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-card-border-subtle bg-card-inner text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-5">Periode</th>
                    <th className="py-4 px-4">Tanggal Bayar</th>
                    <th className="py-4 px-4">Gaji Pokok & Tunjangan</th>
                    <th className="py-4 px-4">Bonus / Potongan</th>
                    <th className="py-4 px-4">Net Take-Home Pay</th>
                    <th className="py-4 px-4 text-center">Status Sinkronisasi</th>
                    <th className="py-4 px-5 text-right">Slip File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border-subtle text-xs">
                  {sortedRecords.map((payroll) => {
                    const monthLabel =
                      MONTH_NAMES[payroll.periodMonth - 1] ||
                      `Bulan ${payroll.periodMonth}`;

                    return (
                      <tr
                        key={payroll.id}
                        className="hover:bg-card-inner/60 transition-colors"
                      >
                        {/* Periode */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-neon flex-shrink-0" />
                            <div>
                              <div className="font-extrabold text-foreground">
                                {monthLabel} {payroll.periodYear}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Payroll #{payroll.id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tanggal Bayar */}
                        <td className="py-4 px-4 whitespace-nowrap text-muted-foreground font-medium">
                          {formatDate(payroll.paidAt)}
                        </td>

                        {/* Gaji Pokok & Tunjangan */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="text-foreground font-bold">
                              {formatRupiah(payroll.baseSalary)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Tunjangan: +{formatRupiah(payroll.allowance)}
                            </div>
                          </div>
                        </td>

                        {/* Bonus / Potongan */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="text-emerald-500 font-semibold text-[11px]">
                              {payroll.incentiveBonus > 0
                                ? `+${formatRupiah(payroll.incentiveBonus)} (Bonus)`
                                : "-"}
                            </div>
                            <div className="text-rose-500 font-semibold text-[11px]">
                              {payroll.deductions > 0
                                ? `-${formatRupiah(payroll.deductions)} (Potongan)`
                                : "-"}
                            </div>
                          </div>
                        </td>

                        {/* Net Take-Home Pay */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-black text-neon text-sm">
                            {formatRupiah(payroll.netSalary)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Take-Home Pay
                          </div>
                        </td>

                        {/* Status Sinkronisasi */}
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          {payroll.isSyncedToMoney ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tersinkron ke Money</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSync(payroll)}
                              disabled={syncingId === payroll.id}
                              className="h-8 px-4 rounded-full text-xs font-extrabold gap-1.5 bg-neon hover:bg-neon/90 text-black shadow-sm"
                            >
                              {syncingId === payroll.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Zap className="w-3.5 h-3.5 fill-current" />
                              )}
                              Catat ke Money Tracker
                            </Button>
                          )}
                        </td>

                        {/* Slip File */}
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          {payroll.payslipUrl ? (
                            <a
                              href={payroll.payslipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-foreground bg-card-inner hover:bg-card-inner/80 border border-card-border-subtle transition-colors shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5 text-neon" />
                              <span>Lihat Slip</span>
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card View (Visible under lg) */}
          <div className="lg:hidden space-y-3">
            {sortedRecords.map((payroll) => {
              const monthLabel =
                MONTH_NAMES[payroll.periodMonth - 1] ||
                `Bulan ${payroll.periodMonth}`;

              return (
                <div
                  key={payroll.id}
                  className="p-5 rounded-[2rem] bg-card border border-card-border space-y-3.5 shadow-sm"
                >
                  {/* Top Bar: Periode & Slip link */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center text-neon">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-foreground">
                          {monthLabel} {payroll.periodYear}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Bayar: {formatDate(payroll.paidAt)}
                        </p>
                      </div>
                    </div>

                    {payroll.payslipUrl && (
                      <a
                        href={payroll.payslipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-foreground bg-card-inner hover:bg-card-inner/80 border border-card-border-subtle transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-neon" />
                        <span>Slip</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </a>
                    )}
                  </div>

                  {/* Components Breakdown */}
                  <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-card-inner border border-card-border-subtle text-[11px]">
                    <div>
                      <span className="text-muted-foreground block font-medium">Gaji Pokok:</span>
                      <span className="font-bold text-foreground">
                        {formatRupiah(payroll.baseSalary)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Tunjangan:</span>
                      <span className="font-bold text-foreground">
                        +{formatRupiah(payroll.allowance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Bonus KPI:</span>
                      <span className="font-semibold text-emerald-500">
                        {payroll.incentiveBonus > 0
                          ? `+${formatRupiah(payroll.incentiveBonus)}`
                          : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Potongan:</span>
                      <span className="font-semibold text-rose-500">
                        {payroll.deductions > 0
                          ? `-${formatRupiah(payroll.deductions)}`
                          : "-"}
                      </span>
                    </div>
                  </div>

                  {/* Net Take-Home Pay & Sync Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-card-border-subtle">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Take-Home Pay (Net)
                      </span>
                      <p className="text-base font-black text-neon">
                        {formatRupiah(payroll.netSalary)}
                      </p>
                    </div>

                    <div>
                      {payroll.isSyncedToMoney ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tersinkron ke Money</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSync(payroll)}
                          disabled={syncingId === payroll.id}
                          className="w-full sm:w-auto h-8 px-3 text-xs font-bold gap-1.5 bg-neon hover:bg-neon/90 text-black shadow-sm hover:shadow-[0_0_15px_rgba(59,240,41,0.35)]"
                        >
                          {syncingId === payroll.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 fill-current" />
                          )}
                          Catat ke Money Tracker
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Payroll Dialog Modal */}
      <PayrollDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employmentId={employment.id}
        defaultBaseSalary={employment.baseSalary}
        defaultAllowance={employment.fixedAllowance}
        onSuccess={() => {
          onRefresh();
          setSyncSuccessMsg("Slip gaji baru berhasil dicatat!");
        }}
      />
    </div>
  );
}
