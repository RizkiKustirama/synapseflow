"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Gift,
  CheckCircle2,
  Sparkles,
  Loader2,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRupiah } from "@/lib/utils";
import {
  convertApplicationToEmployment,
  StoredJobApplication,
} from "@/actions/career.actions";

export interface ConvertEmploymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: StoredJobApplication | null;
  onSuccess: () => void;
}

type JobTypeOption = "FULL_TIME" | "CONTRACT" | "PART_TIME" | "INTERNSHIP";

const JOB_TYPE_OPTIONS: { value: JobTypeOption; label: string }[] = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "INTERNSHIP", label: "Magang" },
];

export function ConvertEmploymentDialog({
  isOpen,
  onClose,
  application,
  onSuccess,
}: ConvertEmploymentDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobType, setJobType] = useState<JobTypeOption>("FULL_TIME");
  const [payday, setPayday] = useState<number | string>(25);
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [fixedAllowance, setFixedAllowance] = useState<string>("0");
  const [startDate, setStartDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial values whenever modal opens or target application changes
  useEffect(() => {
    if (isOpen && application) {
      setCompanyName(application.companyName || "");
      setRole(application.position || "");
      setJobType("FULL_TIME");
      setPayday(25);

      const defaultSalary =
        application.salaryOfferedMax || application.expectedSalary || 0;
      setBaseSalary(defaultSalary > 0 ? defaultSalary.toString() : "");
      setFixedAllowance("0");
      setStartDate(new Date().toISOString().split("T")[0]);
      setErrorMessage(null);
      setIsCelebration(false);
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedBaseSalary = Number(baseSalary);
    const parsedAllowance = Number(fixedAllowance) || 0;
    const parsedPayday = Number(payday);

    if (!companyName.trim()) {
      setErrorMessage("Nama perusahaan wajib diisi.");
      return;
    }
    if (!role.trim()) {
      setErrorMessage("Role / jabatan wajib diisi.");
      return;
    }
    if (isNaN(parsedBaseSalary) || parsedBaseSalary <= 0) {
      setErrorMessage("Nominal gaji pokok harus lebih dari 0.");
      return;
    }
    if (isNaN(parsedPayday) || parsedPayday < 1 || parsedPayday > 31) {
      setErrorMessage("Tanggal gajian harus berada dalam rentang 1 - 31.");
      return;
    }
    if (!startDate) {
      setErrorMessage("Tanggal mulai kerja wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await convertApplicationToEmployment({
        applicationId: application.id,
        companyName: companyName.trim(),
        role: role.trim(),
        jobType,
        payday: parsedPayday,
        baseSalary: parsedBaseSalary,
        fixedAllowance: parsedAllowance,
        startDate,
      });

      if (result && result.success) {
        setIsCelebration(true);
        setTimeout(() => {
          setIsCelebration(false);
          onClose();
          onSuccess();
        }, 800);
      } else {
        setErrorMessage("Gagal melakukan konversi aplikasi ke employment.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat memproses konversi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting && !isCelebration) {
            onClose();
          }
        }}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-card-border rounded-3xl shadow-2xl p-5 sm:p-6 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-card-border gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1.5 px-3 py-1 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                1-Click Interkoneksi Modul Employment
              </Badge>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {application.companyName} &bull; {application.position}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Konfirmasi data untuk pendaftaran pekerjaan aktif
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isCelebration}
            className="p-1.5 rounded-xl bg-background border border-card-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Celebratory notice or Form content */}
        {isCelebration ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.4)] animate-bounce">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <Sparkles className="w-6 h-6 text-neon absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold text-foreground">
                Selamat! Pekerjaan aktif berhasil didaftarkan ke Modul Employment
              </h3>
              <p className="text-xs text-muted-foreground">
                Status lamaran diperbarui menjadi ACCEPTED dan data telah tersinkronisasi.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Explanation box */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300/90 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                Lamaran ini akan otomatis diubah statusnya menjadi{" "}
                <span className="font-bold text-emerald-300">ACCEPTED</span> dan
                profil pekerjaan aktif baru akan dibuat pada modul{" "}
                <span className="font-bold text-emerald-300">Employment</span>.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Company & Role Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Nama Perusahaan
                </label>
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. GoTo, Shopee, Tech Corp"
                  className="bg-background text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  Role / Jabatan
                </label>
                <Input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="bg-background text-sm"
                  required
                />
              </div>
            </div>

            {/* Job Type Selector (Tabs) */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Tipe Pekerjaan (Job Type)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-background rounded-2xl border border-card-border">
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setJobType(opt.value)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold transition-all text-center",
                      jobType === opt.value
                        ? "bg-neon/15 text-neon border border-neon/30 font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card-border/20 border border-transparent"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payday & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Tanggal Gajian (1 - 31)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={payday}
                  onChange={(e) => setPayday(e.target.value)}
                  placeholder="25"
                  className="bg-background text-sm tabular-nums"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Default tanggal {payday || 25} setiap bulan
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Tanggal Mulai Kerja
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background text-sm"
                  required
                />
              </div>
            </div>

            {/* Base Salary & Fixed Allowance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                  Gaji Pokok (Base Salary)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    min={1}
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-background text-sm font-semibold tabular-nums"
                    required
                  />
                </div>
                <p className="text-[11px] text-neon font-mono mt-1">
                  {formatRupiah(Number(baseSalary) || 0)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-muted-foreground" />
                  Tunjangan Tetap (Fixed Allowance)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={fixedAllowance}
                    onChange={(e) => setFixedAllowance(e.target.value)}
                    placeholder="0"
                    className="pl-10 bg-background text-sm font-semibold tabular-nums"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground font-mono mt-1">
                  {formatRupiah(Number(fixedAllowance) || 0)}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-card-border flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs h-10 px-4"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-bold h-10 px-5 gap-2 bg-neon text-black hover:bg-neon/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    Konfirmasi &amp; Konversi ke Employment
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
