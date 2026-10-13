"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Video,
  ExternalLink,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  Briefcase,
  HelpCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  addInterviewLog,
  deleteInterviewLog,
  StoredJobApplication,
  StoredInterviewLog,
} from "@/actions/career.actions";

export interface InterviewLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: StoredJobApplication | null;
  onRefresh: () => void;
}

const ROUND_PRESETS = [
  "HR Screening",
  "User Interview",
  "Technical Live Coding",
  "System Design",
  "VP / Culture Fit",
  "Final Offer Call",
];

function formatInterviewDateTime(dateTimeStr: string): string {
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateTimeStr;
  }
}

function getDefaultDateTime(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function InterviewLogModal({
  isOpen,
  onClose,
  application,
  onRefresh,
}: InterviewLogModalProps) {
  // Local interview logs state for instant responsive UI
  const [logs, setLogs] = useState<StoredInterviewLog[]>([]);

  // Add round form state
  const [roundName, setRoundName] = useState("");
  const [scheduledAt, setScheduledAt] = useState(getDefaultDateTime());
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewerInfo, setInterviewerInfo] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Sync logs when application changes or modal opens
  useEffect(() => {
    if (isOpen && application) {
      setLogs(application.interviewLogs || []);
      setFormError(null);
      setActionSuccess(null);
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionSuccess(null);

    if (!roundName.trim()) {
      setFormError("Nama tahapan interview wajib diisi.");
      return;
    }

    if (!scheduledAt) {
      setFormError("Waktu pelaksanaan wajib ditentukan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledIso = new Date(scheduledAt).toISOString();
      const res = await addInterviewLog({
        applicationId: application.id,
        roundName: roundName.trim(),
        scheduledAt: scheduledIso,
        meetingLink: meetingLink.trim() || null,
        interviewerInfo: interviewerInfo.trim() || null,
        questionsAsked: questionsAsked.trim() || null,
        feedbackNotes: feedbackNotes.trim() || null,
      });

      if (res && res.data) {
        const created: StoredInterviewLog = {
          id: res.data.id,
          applicationId: application.id,
          roundName: res.data.roundName,
          scheduledAt: typeof res.data.scheduledAt === "string" ? res.data.scheduledAt : res.data.scheduledAt.toISOString(),
          meetingLink: res.data.meetingLink,
          interviewerInfo: res.data.interviewerInfo,
          questionsAsked: res.data.questionsAsked,
          feedbackNotes: res.data.feedbackNotes,
        };
        setLogs((prev) => [...prev, created].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
      }

      // Reset form
      setRoundName("");
      setScheduledAt(getDefaultDateTime());
      setMeetingLink("");
      setInterviewerInfo("");
      setQuestionsAsked("");
      setFeedbackNotes("");

      setActionSuccess("Tahap interview berhasil ditambahkan!");
      setTimeout(() => setActionSuccess(null), 3000);

      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message || "Gagal menambahkan tahap interview.");
      } else {
        setFormError("Terjadi kesalahan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRound = async (logId: string) => {
    if (!confirm("Hapus jadwal interview ini?")) return;

    setDeletingId(logId);
    try {
      await deleteInterviewLog(logId, application.id);
      setLogs((prev) => prev.filter((item) => item.id !== logId));
      onRefresh();
    } catch {
      // Error handling
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-card border border-card-border rounded-3xl shadow-2xl z-10 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border bg-card/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,240,41,0.2)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Interview CRM Stages
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold border-neon/30 text-neon">
                  {application.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-foreground">{application.companyName}</span>
                <span>•</span>
                <span>{application.position}</span>
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

        {/* Modal Content: Split View (Timeline on Left, Form on Right) */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timeline / List of Existing Rounds (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon" />
                <h4 className="text-sm font-bold text-foreground">
                  Daftar Tahapan Interview
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sidebar-accent border border-card-border text-foreground">
                  {logs.length}
                </span>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="py-12 px-6 rounded-2xl bg-background/50 border border-dashed border-card-border flex flex-col items-center justify-center text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-sidebar-accent flex items-center justify-center text-muted-foreground">
                  <Briefcase className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-foreground">
                  Belum ada tahapan interview yang dijadwalkan
                </p>
                <p className="text-[11px] text-muted-foreground max-w-sm">
                  Gunakan formulir di sebelah kanan untuk menambahkan jadwal interview pertama dengan tim recruiter / hiring manager.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-card-border">
                {logs.map((log) => {
                  const isDeleting = deletingId === log.id;
                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-neon border-2 border-card shadow-[0_0_8px_rgba(59,240,41,0.6)]" />

                      {/* Card Content */}
                      <div className="p-4 rounded-2xl bg-background/70 border border-card-border hover:border-neon/40 transition-all space-y-3">
                        {/* Round Header & Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-bold text-foreground">
                              {log.roundName}
                            </h5>
                            <div className="flex items-center gap-1.5 text-xs text-neon font-semibold mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatInterviewDateTime(log.scheduledAt)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteRound(log.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Hapus tahapan ini"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Interviewer & Meeting Link Badge */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {log.interviewerInfo && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] bg-sidebar-accent border border-card-border text-foreground font-medium">
                              <User className="w-3 h-3 text-neon" />
                              {log.interviewerInfo}
                            </span>
                          )}

                          {log.meetingLink && (
                            <a
                              href={log.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-neon/15 text-neon border border-neon/30 hover:bg-neon hover:text-black transition-all shadow-[0_0_10px_rgba(59,240,41,0.2)]"
                            >
                              <Video className="w-3 h-3" />
                              <span>Buka Meeting</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Questions & Preparation Notes */}
                        {log.questionsAsked && (
                          <div className="p-2.5 rounded-xl bg-card border border-card-border text-xs space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                              <HelpCircle className="w-3 h-3 text-neon" /> Topik & Pertanyaan
                            </span>
                            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {log.questionsAsked}
                            </p>
                          </div>
                        )}

                        {log.feedbackNotes && (
                          <div className="p-2.5 rounded-xl bg-card border border-card-border text-xs space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                              <FileText className="w-3 h-3 text-neon" /> Catatan & Feedback
                            </span>
                            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {log.feedbackNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Add Interview Stage Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-5 rounded-3xl bg-background/80 border border-card-border space-y-4 sticky top-0">
              <div className="flex items-center justify-between pb-2 border-b border-card-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-neon/15 text-neon flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">
                    Jadwalkan Tahapan Baru
                  </h4>
                </div>
              </div>

              {actionSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neon/15 border border-neon/30 text-neon text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold">Pilih Cepat Nama Tahap:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ROUND_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRoundName(preset)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-sidebar-accent border border-card-border text-foreground hover:border-neon/40 hover:text-neon transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddRound} className="space-y-3.5">
                {/* Round Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Nama Tahap <span className="text-neon">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Technical Live Coding"
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    className="h-9 bg-card border-card-border focus-visible:ring-neon text-xs"
                  />
                </div>

                {/* Scheduled At */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neon" />
                    Waktu & Tanggal <span className="text-neon">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="h-9 bg-card border-card-border focus-visible:ring-neon text-xs"
                  />
                </div>

                {/* Meeting Link */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Video className="w-3 h-3 text-neon" />
                    Link Meeting (Meet / Zoom)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="h-9 bg-card border-card-border focus-visible:ring-neon text-xs"
                  />
                </div>

                {/* Interviewer Info */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <User className="w-3 h-3 text-neon" />
                    Interviewer Info
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Budi Santoso (VP Engineering)"
                    value={interviewerInfo}
                    onChange={(e) => setInterviewerInfo(e.target.value)}
                    className="h-9 bg-card border-card-border focus-visible:ring-neon text-xs"
                  />
                </div>

                {/* Questions Asked & Preparation Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-neon" />
                    Pertanyaan / Kisi-kisi Topik
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Kisi-kisi arsitektur, live coding algorithms, system design..."
                    value={questionsAsked}
                    onChange={(e) => setQuestionsAsked(e.target.value)}
                    className="flex w-full rounded-xl border border-card-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3 text-neon" />
                    Catatan Persiapan & Evaluasi
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Catatan feedback, hal yang harus diperbaiki, persiapan portfolio..."
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    className="flex w-full rounded-xl border border-card-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1 resize-none"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 text-xs font-bold rounded-xl gap-2 shadow-[0_0_12px_rgba(59,240,41,0.25)] hover:shadow-[0_0_16px_rgba(59,240,41,0.35)] mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menjadwalkan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Simpan Jadwal Interview
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
