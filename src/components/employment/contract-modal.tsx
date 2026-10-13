"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Gift,
  Coins,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import {
  createEmployment,
  updateEmployment,
  StoredEmployment,
} from "@/actions/employment.actions";
import { EmploymentFormInput } from "@/lib/validations/employment.schema";

export interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employmentToEdit?: StoredEmployment | null;
}

type JobTypeOption = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
type EmploymentStatusOption = "ACTIVE" | "PROBATION" | "COMPLETED" | "RESIGNED";

const JOB_TYPE_OPTIONS: { value: JobTypeOption; label: string }[] = [
  { value: "FULL_TIME", label: "Full-Time (Tetap)" },
  { value: "PART_TIME", label: "Part-Time (Paruh Waktu)" },
  { value: "CONTRACT", label: "Contract (PKWT / Kontrak)" },
  { value: "INTERNSHIP", label: "Internship (Magang)" },
];

const STATUS_OPTIONS: { value: EmploymentStatusOption; label: string }[] = [
  { value: "ACTIVE", label: "Aktif (Active)" },
  { value: "PROBATION", label: "Masa Percobaan (Probation)" },
  { value: "COMPLETED", label: "Selesai (Completed)" },
  { value: "RESIGNED", label: "Resigned (Berhenti)" },
];

export function ContractModal({
  isOpen,
  onClose,
  onSuccess,
  employmentToEdit,
}: ContractModalProps) {
  const isEditing = Boolean(employmentToEdit);

  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [jobType, setJobType] = useState<JobTypeOption>("FULL_TIME");
  const [status, setStatus] = useState<EmploymentStatusOption>("ACTIVE");
  const [payday, setPayday] = useState<number | string>(25);
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [fixedAllowance, setFixedAllowance] = useState<string>("0");
  const [startDate, setStartDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state whenever modal opens or employmentToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (employmentToEdit) {
        setCompanyName(employmentToEdit.companyName || "");
        setRole(employmentToEdit.role || "");
        setJobType(employmentToEdit.jobType || "FULL_TIME");
        setStatus(employmentToEdit.status || "ACTIVE");
        setPayday(employmentToEdit.payday || 25);
        setBaseSalary(
          employmentToEdit.baseSalary !== undefined && employmentToEdit.baseSalary !== null
            ? employmentToEdit.baseSalary.toString()
            : ""
        );
        setFixedAllowance(
          employmentToEdit.fixedAllowance !== undefined && employmentToEdit.fixedAllowance !== null
            ? employmentToEdit.fixedAllowance.toString()
            : "0"
        );
        setStartDate(
          employmentToEdit.startDate
            ? employmentToEdit.startDate.split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setEndDate(
          employmentToEdit.endDate ? employmentToEdit.endDate.split("T")[0] : ""
        );
      } else {
        setCompanyName("");
        setRole("");
        setJobType("FULL_TIME");
        setStatus("ACTIVE");
        setPayday(25);
        setBaseSalary("");
        setFixedAllowance("0");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
      }
      setErrorMessage(null);
    }
  }, [isOpen, employmentToEdit]);

  if (!isOpen) return null;

  const numBaseSalary = Number(baseSalary) || 0;
  const numAllowance = Number(fixedAllowance) || 0;
  const numPayday = Number(payday) || 25;
  const totalTakeHomePay = numBaseSalary + numAllowance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName.trim()) {
      setErrorMessage("Nama perusahaan wajib diisi.");
      return;
    }

    if (!role.trim()) {
      setErrorMessage("Posisi / Role wajib diisi.");
      return;
    }

    if (isNaN(numBaseSalary) || numBaseSalary <= 0) {
      setErrorMessage("Gaji pokok harus lebih dari 0.");
      return;
    }

    if (numPayday < 1 || numPayday > 31) {
      setErrorMessage("Tanggal gajian harus di antara 1 sampai 31.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: EmploymentFormInput = {
        companyName: companyName.trim(),
        role: role.trim(),
        jobType,
        status,
        payday: numPayday,
        baseSalary: numBaseSalary,
        fixedAllowance: numAllowance,
        startDate,
        endDate: endDate.trim() ? endDate.trim() : null,
      };

      if (isEditing && employmentToEdit?.id) {
        const res = await updateEmployment(employmentToEdit.id, payload);
        if (res?.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMessage("Gagal memperbarui data kontrak kerja.");
        }
      } else {
        const res = await createEmployment(payload);
        if (res?.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMessage("Gagal mendaftarkan kontrak kerja baru.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat memproses data kontrak.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-card-border rounded-3xl shadow-2xl z-10 text-foreground my-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-card-border bg-card/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,240,41,0.2)]">
              {isEditing ? <FileText className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {isEditing ? "Edit Profil Kontrak Kerja" : "Tambah Kontrak Kerja Baru"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui rincian pekerjaan aktif, jadwal gajian, dan kompensasi"
                  : "Daftarkan profil pekerjaan tetap, kontrak, atau magang Anda"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl bg-background/60 border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all disabled:opacity-50"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Row 1: Company Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-neon" />
                Nama Perusahaan <span className="text-neon">*</span>
              </label>
              <Input
                required
                placeholder="e.g. PT Tech Innovasi Nusantara"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-background border-card-border focus-visible:ring-neon"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-neon" />
                Posisi / Role <span className="text-neon">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Senior Fullstack Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-background border-card-border focus-visible:ring-neon"
              />
            </div>
          </div>

          {/* Row 2: Job Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-neon" />
                Jenis Pekerjaan (Job Type)
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobTypeOption)}
                className="flex h-10 w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs sm:text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1"
              >
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neon" />
                Status Pekerjaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmploymentStatusOption)}
                className="flex h-10 w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs sm:text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payday Setting */}
          <div className="p-4 rounded-2xl bg-background/80 border border-card-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neon" />
                Tanggal Gajian Bulanan (Payday)
              </label>
              <Badge variant="default" className="text-[11px] font-bold">
                Tgl {numPayday} Tiap Bulan
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                max="31"
                required
                value={payday}
                onChange={(e) => setPayday(e.target.value)}
                className="w-32 bg-card border-card-border focus-visible:ring-neon text-center font-bold text-sm"
              />
              <span className="text-xs text-muted-foreground">
                (Rentang 1 - 31, default tgl 25)
              </span>
            </div>
          </div>

          {/* Compensation Breakdown Inputs */}
          <div className="space-y-3 p-4 rounded-2xl bg-background/60 border border-card-border">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5 text-neon" />
              Rincian Kompensasi & Gaji
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-neon" />
                    Gaji Pokok (Rp) <span className="text-neon">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-neon font-semibold">
                    {formatRupiah(numBaseSalary)}
                  </span>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="50000"
                  required
                  placeholder="e.g. 18500000"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  className="bg-card border-card-border focus-visible:ring-neon font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-neon" />
                    Tunjangan Tetap (Rp)
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    {formatRupiah(numAllowance)}
                  </span>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="50000"
                  placeholder="e.g. 2500000"
                  value={fixedAllowance}
                  onChange={(e) => setFixedAllowance(e.target.value)}
                  className="bg-card border-card-border focus-visible:ring-neon font-mono"
                />
              </div>
            </div>

            {/* Total Take-Home Pay Preview */}
            <div className="p-3.5 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Estimasi Total Take-Home Pay (Gaji Pokok + Tunjangan)
                </span>
                <span className="text-xs text-muted-foreground">
                  Sebelum potongan pajak / BPJS
                </span>
              </div>
              <span className="text-base sm:text-lg font-black text-neon font-mono">
                {formatRupiah(totalTakeHomePay)}
              </span>
            </div>
          </div>

          {/* Dates: Start & End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neon" />
                Tanggal Mulai (Start Date) <span className="text-neon">*</span>
              </label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-card-border focus-visible:ring-neon text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Tanggal Berakhir (End Date, Opsional)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Kosongkan jika kontrak permanen"
                className="bg-background border-card-border focus-visible:ring-neon text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-card-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 text-xs font-bold gap-2 bg-neon text-black hover:bg-neon/90 shadow-[0_0_15px_rgba(59,240,41,0.25)]"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Simpan Kontrak"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
