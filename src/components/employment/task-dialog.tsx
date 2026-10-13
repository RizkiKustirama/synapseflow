"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
  Check,
  Flag,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createEmploymentTask } from "@/actions/employment.actions";

export interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employmentId: string;
  onSuccess: () => void;
}

type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  badgeClass: string;
}[] = [
  {
    value: "TODO",
    label: "To Do",
    badgeClass: "border-slate-500/40 text-slate-300 bg-slate-500/10",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    badgeClass: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  },
  {
    value: "BLOCKED",
    label: "Blocked",
    badgeClass: "border-red-500/40 text-red-400 bg-red-500/10",
  },
  {
    value: "DONE",
    label: "Done",
    badgeClass: "border-neon/40 text-neon bg-neon/10",
  },
];

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  badgeClass: string;
}[] = [
  {
    value: "LOW",
    label: "LOW",
    badgeClass: "border-slate-500/40 text-slate-400 bg-slate-500/10",
  },
  {
    value: "MEDIUM",
    label: "MEDIUM",
    badgeClass: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  },
  {
    value: "HIGH",
    label: "HIGH",
    badgeClass: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  },
  {
    value: "URGENT",
    label: "URGENT",
    badgeClass: "border-red-500/50 text-red-400 bg-red-500/15",
  },
];

export function TaskDialog({
  isOpen,
  onClose,
  employmentId,
  onSuccess,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate("");
      setErrorMsg(null);
      setSuccessNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Judul tugas wajib diisi.");
      return;
    }

    if (!employmentId) {
      setErrorMsg("ID pekerjaan tidak valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createEmploymentTask({
        employmentId,
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate ? dueDate : null,
      });

      if (!res.success) {
        setErrorMsg("Gagal menyimpan task kantor.");
        return;
      }

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onSuccess();
        onClose();
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || "Gagal membuat task baru.");
      } else {
        setErrorMsg("Terjadi kesalahan sistem saat menyimpan task.");
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

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-3xl shadow-2xl z-10 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-card-border bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,240,41,0.2)]">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">
                Tambah Sprint Task
              </h3>
              <p className="text-xs text-muted-foreground">
                Catat backlog atau aktivitas sprint kantor baru
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

        {/* Success Notice Banner */}
        {successNotice ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-neon/20 border-2 border-neon text-neon flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(59,240,41,0.4)]">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <p className="text-base font-bold text-foreground">
              Task Berhasil Ditambahkan!
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Daftar sprint tugas diperbarui secara otomatis.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Title field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                Judul Task <span className="text-red-400">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Slicing UI dashboard sprint 4..."
                className="bg-background border-card-border focus-visible:ring-neon"
                autoFocus
                required
              />
            </div>

            {/* Description field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Deskripsi / Acceptance Criteria
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail pengerjaan tugas, PR review checklist, atau blocker..."
                rows={3}
                className="w-full rounded-xl border border-card-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon/60 resize-none transition-all"
              />
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status Pengerjaan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_OPTIONS.map((item) => {
                  const isSelected = status === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStatus(item.value)}
                      className={cn(
                        "py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center",
                        item.badgeClass,
                        isSelected
                          ? "ring-2 ring-neon shadow-[0_0_10px_rgba(59,240,41,0.25)] font-bold scale-[1.02]"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-neon" />
                Prioritas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((item) => {
                  const isSelected = priority === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPriority(item.value)}
                      className={cn(
                        "py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center",
                        item.badgeClass,
                        isSelected
                          ? "ring-2 ring-neon shadow-[0_0_10px_rgba(59,240,41,0.25)] font-bold scale-[1.02]"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                Tenggat Waktu (Due Date)
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-background border-card-border focus-visible:ring-neon"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-card-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border-card-border text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="rounded-xl text-xs font-bold gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Tambah Task
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
