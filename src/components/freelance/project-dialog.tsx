"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupiah, cn } from "@/lib/utils";
import {
  createProject,
  StoredClient,
} from "@/actions/freelance.actions";

export interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clients: StoredClient[];
  onSuccess: () => void;
}

type ProjectStatusOption = "PROSPECT" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

const STATUS_CONFIG: {
  value: ProjectStatusOption;
  label: string;
  badgeClass: string;
  desc: string;
}[] = [
  {
    value: "PROSPECT",
    label: "Prospect / Lead",
    badgeClass: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    desc: "Negosiasi & pitching awal",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    badgeClass: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    desc: "Sedang tahap pengerjaan aktif",
  },
  {
    value: "REVIEW",
    label: "Review / UAT",
    badgeClass: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    desc: "Tahap evaluasi revisi & serah terima",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    badgeClass: "text-neon border-neon/40 bg-neon/10",
    desc: "Proyek selesai & lunas",
  },
];

const PRESET_BUDGETS = [5_000_000, 15_000_000, 25_000_000, 50_000_000];

export function ProjectDialog({
  isOpen,
  onClose,
  clients,
  onSuccess,
}: ProjectDialogProps) {
  // Form fields
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [status, setStatus] = useState<ProjectStatusOption>("IN_PROGRESS");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setClientId("");
      setTotalBudget("");
      setStatus("IN_PROGRESS");
      setStartDate(new Date().toISOString().split("T")[0]);
      setDeadline("");
      setDescription("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const numericBudget = totalBudget ? parseInt(totalBudget.replace(/\D/g, ""), 10) || 0 : 0;

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setTotalBudget(rawVal);
  };

  const handleApplyPreset = (amount: number) => {
    setTotalBudget(amount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Judul proyek wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createProject({
        title: title.trim(),
        clientId: clientId || null,
        totalBudget: numericBudget,
        status,
        startDate: startDate ? startDate : null,
        deadline: deadline ? deadline : null,
        description: description.trim() ? description.trim() : null,
      });

      if (res && res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage("Gagal menyimpan proyek. Silakan coba lagi.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan saat memproses data proyek.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-card-border rounded-3xl shadow-2xl z-10 text-foreground my-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-card-border bg-card/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,240,41,0.2)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Tambah Proyek Freelance Baru
              </h3>
              <p className="text-xs text-muted-foreground">
                Atur judul, relasi klien, total budget kontrak, dan jadwal deadline.
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

          {/* Row 1: Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-neon" />
              Judul Proyek <span className="text-neon">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Redesign Web Platform SaaS & CMS Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-card-border focus-visible:ring-neon"
            />
          </div>

          {/* Row 2: Client select & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-neon" />
                Pilih Klien
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs sm:text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1"
              >
                <option value="" className="bg-card text-muted-foreground">
                  — Tanpa Klien / Klien Mandiri —
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-card text-foreground">
                    {c.company ? `${c.name} (${c.company})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neon" />
                Tahap Status Proyek
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatusOption)}
                className="flex h-10 w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs sm:text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1"
              >
                {STATUS_CONFIG.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Total Budget with Rupiah Formatter */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-background/60 border border-card-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-neon" />
                Total Budget Kontrak (IDR)
              </label>
              <span className="text-xs font-extrabold text-neon">
                {formatRupiah(numericBudget)}
              </span>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 25000000"
              value={totalBudget ? Number(totalBudget).toLocaleString("id-ID") : ""}
              onChange={handleBudgetChange}
              className="bg-card border-card-border focus-visible:ring-neon font-mono font-bold"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground mr-1">Preset cepat:</span>
              {PRESET_BUDGETS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleApplyPreset(amount)}
                  className={cn(
                    "px-2 py-0.5 text-[11px] rounded-lg border transition-all",
                    numericBudget === amount
                      ? "bg-neon/20 border-neon/50 text-neon font-bold"
                      : "bg-background border-card-border text-muted-foreground hover:text-foreground hover:border-card-border/80"
                  )}
                >
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Start Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neon" />
                Tanggal Mulai (Kickoff)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-card-border focus-visible:ring-neon"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neon" />
                Target Deadline
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-background border-card-border focus-visible:ring-neon"
              />
            </div>
          </div>

          {/* Row 5: Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neon" />
              Deskripsi & Lingkup Kerja (Deliverables)
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan ruang lingkup pekerjaan, stack teknologi, atau perjanjian deliverable khusus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1 resize-y"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-card-border text-foreground hover:bg-background"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-neon text-black hover:bg-neon/90 font-bold px-5 shadow-[0_0_15px_rgba(59,240,41,0.25)] flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simpan Proyek
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
