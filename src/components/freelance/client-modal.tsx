"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createClient,
  updateClient,
  StoredClient,
} from "@/actions/freelance.actions";
import { clientSchema, ClientFormInput } from "@/lib/validations/freelance.schema";

export interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientToEdit?: StoredClient | null;
}

export function ClientModal({
  isOpen,
  onClose,
  onSuccess,
  clientToEdit,
}: ClientModalProps) {
  const isEditing = Boolean(clientToEdit);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens or clientToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setName(clientToEdit.name || "");
        setCompany(clientToEdit.company || "");
        setEmail(clientToEdit.email || "");
        setPhone(clientToEdit.phone || "");
        setNotes(clientToEdit.notes || "");
      } else {
        setName("");
        setCompany("");
        setEmail("");
        setPhone("");
        setNotes("");
      }
      setErrorMessage(null);
    }
  }, [isOpen, clientToEdit]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Nama klien wajib diisi.");
      return;
    }

    const trimmedEmail = email.trim();
    const payload: ClientFormInput = {
      name: trimmedName,
      company: company.trim() || null,
      email: trimmedEmail || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    };

    const validationResult = clientSchema.safeParse(payload);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message;
      setErrorMessage(firstError || "Format data klien tidak valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (clientToEdit) {
        const res = await updateClient(clientToEdit.id, validationResult.data);
        if (res?.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMessage("Gagal memperbarui klien. Silakan coba lagi.");
        }
      } else {
        const res = await createClient(validationResult.data);
        if (res?.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMessage("Gagal menambahkan klien baru. Silakan coba lagi.");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan pada sistem.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-3xl shadow-2xl z-10 text-foreground my-auto flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-card-border bg-card/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,240,41,0.2)]">
              {isEditing ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h3
                id="client-modal-title"
                className="text-base sm:text-lg font-bold text-foreground tracking-tight"
              >
                {isEditing ? "Edit Profil Klien" : "Tambah Klien Baru"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui kontak, instansi, dan preferensi klien"
                  : "Daftarkan klien baru untuk integrasi proyek & invoicing"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Client Name (Required) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neon" />
              Nama Klien <span className="text-neon">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Budi Santoso / Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="bg-background border-card-border focus-visible:ring-neon text-sm"
              autoFocus
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-neon" />
              Perusahaan / Brand
            </label>
            <Input
              placeholder="e.g. PT Maju Digital Mandiri / Apex Fin SG"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isSubmitting}
              className="bg-background border-card-border focus-visible:ring-neon text-sm"
            />
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neon" />
                Email
              </label>
              <Input
                type="email"
                placeholder="budi@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-background border-card-border focus-visible:ring-neon text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-neon" />
                Nomor Telepon / WhatsApp
              </label>
              <Input
                type="tel"
                placeholder="081234567890 / +6281..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
                className="bg-background border-card-border focus-visible:ring-neon text-sm"
              />
            </div>
          </div>

          {/* Notes (Textarea) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neon" />
              Catatan Klien (Notes)
            </label>
            <textarea
              rows={3}
              placeholder="Catatan preferensi komunikasi, riwayat kerja sama, terms pembayaran, dll..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="flex w-full rounded-xl border border-card-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-xs font-semibold border-card-border hover:bg-card"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 text-xs font-bold gap-2 bg-neon text-black hover:bg-neon/90 shadow-[0_0_15px_rgba(59,240,41,0.25)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? "Perbarui Klien" : "Simpan Klien"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
