"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createJobApplication,
  updateJobApplication,
  StoredJobApplication,
} from "@/actions/career.actions";

export interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  applicationToEdit?: StoredJobApplication | null;
}

type WorkLocation = "REMOTE" | "HYBRID" | "ONSITE";
type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "TECH_TEST"
  | "OFFERING"
  | "ACCEPTED"
  | "REJECTED"
  | "GHOSTED";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "WISHLIST", label: "Wishlist", color: "text-muted-foreground border-card-border" },
  { value: "APPLIED", label: "Applied", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { value: "SCREENING", label: "Screening (HR)", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { value: "INTERVIEW", label: "Interview", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { value: "TECH_TEST", label: "Technical Test", color: "text-neon border-neon/40 bg-neon/10" },
  { value: "OFFERING", label: "Offering Letter", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { value: "ACCEPTED", label: "Accepted", color: "text-neon border-neon/50 bg-neon/20 font-bold" },
  { value: "REJECTED", label: "Rejected", color: "text-red-400 border-red-500/30 bg-red-500/10" },
  { value: "GHOSTED", label: "Ghosted", color: "text-zinc-400 border-zinc-700 bg-zinc-800/40" },
];

const LOCATION_OPTIONS: { value: WorkLocation; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "REMOTE", label: "Remote", icon: Globe },
  { value: "HYBRID", label: "Hybrid", icon: Building2 },
  { value: "ONSITE", label: "Onsite", icon: MapPin },
];

export function ApplicationDialog({
  isOpen,
  onClose,
  onSuccess,
  applicationToEdit,
}: ApplicationDialogProps) {
  const isEditing = Boolean(applicationToEdit);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [workLocation, setWorkLocation] = useState<WorkLocation>("REMOTE");
  const [status, setStatus] = useState<ApplicationStatus>("APPLIED");
  const [salaryOfferedMin, setSalaryOfferedMin] = useState("");
  const [salaryOfferedMax, setSalaryOfferedMax] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [cvVersion, setCvVersion] = useState("");
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Sync state when opening or when applicationToEdit changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessNotice(false);

      if (applicationToEdit) {
        setCompanyName(applicationToEdit.companyName || "");
        setPosition(applicationToEdit.position || "");
        setWorkLocation(applicationToEdit.workLocation || "REMOTE");
        setStatus(applicationToEdit.status || "APPLIED");
        setSalaryOfferedMin(
          applicationToEdit.salaryOfferedMin !== null && applicationToEdit.salaryOfferedMin !== undefined
            ? applicationToEdit.salaryOfferedMin.toString()
            : ""
        );
        setSalaryOfferedMax(
          applicationToEdit.salaryOfferedMax !== null && applicationToEdit.salaryOfferedMax !== undefined
            ? applicationToEdit.salaryOfferedMax.toString()
            : ""
        );
        setExpectedSalary(
          applicationToEdit.expectedSalary !== null && applicationToEdit.expectedSalary !== undefined
            ? applicationToEdit.expectedSalary.toString()
            : ""
        );
        setJobUrl(applicationToEdit.jobUrl || "");
        setCvVersion(applicationToEdit.cvVersion || "");
        setAppliedDate(
          applicationToEdit.appliedDate
            ? applicationToEdit.appliedDate.split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setNotes(applicationToEdit.notes || "");
      } else {
        setCompanyName("");
        setPosition("");
        setWorkLocation("REMOTE");
        setStatus("APPLIED");
        setSalaryOfferedMin("");
        setSalaryOfferedMax("");
        setExpectedSalary("");
        setJobUrl("");
        setCvVersion("");
        setAppliedDate(new Date().toISOString().split("T")[0]);
        setNotes("");
      }
    }
  }, [isOpen, applicationToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!companyName.trim()) {
      setErrorMsg("Nama perusahaan wajib diisi.");
      return;
    }

    if (!position.trim()) {
      setErrorMsg("Posisi / Role lamaran wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const minSalary = salaryOfferedMin.trim() ? Number(salaryOfferedMin) : null;
      const maxSalary = salaryOfferedMax.trim() ? Number(salaryOfferedMax) : null;
      const expSalary = expectedSalary.trim() ? Number(expectedSalary) : null;

      if (isEditing && applicationToEdit) {
        await updateJobApplication(applicationToEdit.id, {
          companyName: companyName.trim(),
          position: position.trim(),
          workLocation,
          status,
          salaryOfferedMin: minSalary,
          salaryOfferedMax: maxSalary,
          expectedSalary: expSalary,
          jobUrl: jobUrl.trim() || null,
          cvVersion: cvVersion.trim() || null,
          appliedDate,
          notes: notes.trim() || null,
        });
      } else {
        await createJobApplication({
          companyName: companyName.trim(),
          position: position.trim(),
          workLocation,
          status,
          salaryOfferedMin: minSalary,
          salaryOfferedMax: maxSalary,
          expectedSalary: expSalary,
          jobUrl: jobUrl.trim() || null,
          cvVersion: cvVersion.trim() || null,
          appliedDate,
          notes: notes.trim() || null,
        });
      }

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onSuccess();
        onClose();
      }, 600);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || "Gagal menyimpan lamaran kerja.");
      } else {
        setErrorMsg("Terjadi kesalahan saat memproses data.");
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
        onClick={onClose}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-2xl bg-card border border-card-border rounded-3xl shadow-2xl z-10 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-card-border bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,240,41,0.2)]">
              {isEditing ? <Briefcase className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">
                {isEditing ? "Edit Lamaran Kerja" : "Tambah Lamaran Kerja"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui rincian tahapan karir & kompensasi"
                  : "Daftarkan peluang kerja baru ke dalam tracker karir Anda"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-background/60 border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success notification banner */}
        {successNotice ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-neon/20 border-2 border-neon text-neon flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(59,240,41,0.4)]">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <p className="text-base font-bold text-foreground">
              {isEditing ? "Lamaran Berhasil Diperbarui!" : "Lamaran Baru Berhasil Ditambahkan!"}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Data tersinkronisasi langsung ke sistem pipeline karir SynapseFlow.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {errorMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Company & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-neon" />
                  Nama Perusahaan <span className="text-neon">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. GoTo, Shopee, Traveloka"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-background/60 border-card-border focus-visible:ring-neon"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-neon" />
                  Posisi / Role <span className="text-neon">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="bg-background/60 border-card-border focus-visible:ring-neon"
                />
              </div>
            </div>

            {/* Row 2: Work Location (Tabs) & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Work Location Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neon" />
                  Work Location
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-background/80 rounded-2xl border border-card-border">
                  {LOCATION_OPTIONS.map((loc) => {
                    const isSelected = workLocation === loc.value;
                    return (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => setWorkLocation(loc.value)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all",
                          isSelected
                            ? "bg-neon text-black font-bold shadow-[0_0_10px_rgba(59,240,41,0.3)]"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <loc.icon className="w-3.5 h-3.5" />
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neon" />
                  Status Lamaran
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="flex h-10 w-full rounded-xl border border-card-border bg-background/60 px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Compensation (Min, Max, Expected) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-neon" />
                Estimasi Gaji & Ekspektasi (IDR)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Offered Min</span>
                  <Input
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="e.g. 25000000"
                    value={salaryOfferedMin}
                    onChange={(e) => setSalaryOfferedMin(e.target.value)}
                    className="bg-background/60 border-card-border focus-visible:ring-neon text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Offered Max</span>
                  <Input
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="e.g. 35000000"
                    value={salaryOfferedMax}
                    onChange={(e) => setSalaryOfferedMax(e.target.value)}
                    className="bg-background/60 border-card-border focus-visible:ring-neon text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground">Expected Salary</span>
                  <Input
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="e.g. 30000000"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="bg-background/60 border-card-border focus-visible:ring-neon text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Job URL & CV Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-neon" />
                  Link Lowongan (Job Post URL)
                </label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="bg-background/60 border-card-border focus-visible:ring-neon text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neon" />
                  Versi CV yang Dikirim
                </label>
                <Input
                  type="text"
                  placeholder="e.g. CV_Backend_v4_2026.pdf"
                  value={cvVersion}
                  onChange={(e) => setCvVersion(e.target.value)}
                  className="bg-background/60 border-card-border focus-visible:ring-neon text-xs"
                />
              </div>
            </div>

            {/* Row 5: Applied Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neon" />
                Tanggal Submit Lamaran
              </label>
              <Input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="bg-background/60 border-card-border focus-visible:ring-neon text-xs"
              />
            </div>

            {/* Row 6: Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neon" />
                Catatan Lamaran / Persiapan
              </label>
              <textarea
                rows={3}
                placeholder="Rincian recruiter, stack yang diutamakan, catatan referral, timeline negosiasi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-2xl border border-card-border bg-background/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1 resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 px-5 text-xs rounded-xl border-card-border hover:bg-card-border/40"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 text-xs font-bold rounded-xl gap-2 shadow-[0_0_15px_rgba(59,240,41,0.25)] hover:shadow-[0_0_20px_rgba(59,240,41,0.4)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    {isEditing ? "Simpan Perubahan" : "Tambah Lamaran"}
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
