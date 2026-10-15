"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  FolderKanban,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Loader2,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StoredClient, deleteClient } from "@/actions/freelance.actions";
import { ClientModal } from "./client-modal";
import { cn } from "@/lib/utils";

export interface ClientDirectoryProps {
  clients: StoredClient[];
  onRefresh: () => void;
  onSelectClientProjects?: (clientId: string) => void;
}

/**
 * Extracts 1-2 initials from client name for avatar display
 */
function getInitials(name: string): string {
  if (!name) return "CL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Normalizes phone number into WhatsApp international format
 * e.g. "08123456789" -> "628123456789"
 */
function getWhatsAppUrl(phone?: string | null): string | null {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, "");
  if (!clean) return null;
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  return `https://wa.me/${clean}`;
}

export function ClientDirectory({
  clients,
  onRefresh,
  onSelectClientProjects,
}: ClientDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<StoredClient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Real-time search filter for client name and company
  const filteredClients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return clients;

    return clients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(query);
      const companyMatch = client.company?.toLowerCase().includes(query) ?? false;
      const emailMatch = client.email?.toLowerCase().includes(query) ?? false;
      const phoneMatch = client.phone?.toLowerCase().includes(query) ?? false;
      return nameMatch || companyMatch || emailMatch || phoneMatch;
    });
  }, [clients, searchQuery]);

  // Handle client delete with confirmation prompt
  const handleDelete = async (client: StoredClient) => {
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus klien "${client.name}"?\nHistori proyek yang terhubung akan tetap tersimpan.`
    );
    if (!isConfirmed) return;

    setDeletingId(client.id);
    try {
      const res = await deleteClient(client.id);
      if (res?.success) {
        onRefresh();
      } else {
        alert("Gagal menghapus klien. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Terjadi kesalahan teknis saat menghapus klien.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenAddModal = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: StoredClient) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-sm shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Direktori Klien (CRM)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neon/10 text-neon border border-neon/30">
                {clients.length} Klien
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar kontak bisnis, status proyek, dan aksi cepat WhatsApp/Email.
            </p>
          </div>
        </div>

        {/* Action Controls: Search & Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Cari nama, PT, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 bg-card border-card-border text-foreground text-xs sm:text-sm focus-visible:ring-neon h-10 rounded-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Client Button */}
          <Button
            onClick={handleOpenAddModal}
            className="h-10 px-5 rounded-full font-extrabold gap-2 text-xs sm:text-sm bg-neon text-black hover:bg-neon/90 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Klien</span>
          </Button>
        </div>
      </div>

      {/* Search Result Feedback if Filtering */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Menemukan <strong className="text-foreground">{filteredClients.length}</strong> dari{" "}
            {clients.length} klien untuk &quot;{searchQuery}&quot;
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-neon hover:underline cursor-pointer font-bold"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Client Cards Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredClients.map((client) => {
            const waUrl = getWhatsAppUrl(client.phone);
            const initials = getInitials(client.name);
            const projectCount = client.projectCount ?? 0;

            return (
              <div
                key={client.id}
                className="group relative flex flex-col justify-between rounded-[2rem] lg:rounded-[2.5rem] border border-card-border bg-card p-6 text-foreground shadow-xl transition-all duration-200 hover:border-card-border/90 hover:shadow-2xl"
              >
                {/* Card Top Section: Avatar, Name, Company & Project Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar / Initials with Cyber-Forest Neon Glow */}
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full bg-neon/15 text-neon border border-neon/40 flex items-center justify-center font-extrabold text-sm sm:text-base tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                          {initials}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon border-2 border-card shadow-sm" />
                      </div>

                      {/* Name & Company */}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-foreground truncate group-hover:text-neon transition-colors">
                          {client.name}
                        </h3>
                        <div className="mt-1">
                          {client.company ? (
                            <Badge
                              variant="outline"
                              className="bg-card-inner border-card-border-subtle text-foreground/90 font-medium px-2.5 py-0.5 text-[11px] rounded-full inline-flex items-center gap-1 max-w-[160px] sm:max-w-[180px] truncate"
                              title={client.company}
                            >
                              <Building2 className="w-3 h-3 text-neon shrink-0" />
                              <span className="truncate">{client.company}</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-card-inner/60 border-card-border-subtle text-muted-foreground/80 font-normal px-2.5 py-0.5 text-[10px] rounded-full"
                            >
                              Personal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Active Projects Count Badge */}
                    <button
                      type="button"
                      onClick={() => onSelectClientProjects?.(client.id)}
                      disabled={!onSelectClientProjects}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                        projectCount > 0
                          ? "bg-neon/15 text-neon border-neon/40 shadow-sm"
                          : "bg-card-inner text-muted-foreground border-card-border-subtle",
                        onSelectClientProjects
                          ? "cursor-pointer hover:bg-neon/25 hover:border-neon hover:scale-105 active:scale-95"
                          : "cursor-default"
                      )}
                      title={
                        onSelectClientProjects
                          ? `Filter proyek untuk ${client.name} (${projectCount} proyek)`
                          : `${projectCount} proyek terdaftar`
                      }
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>{projectCount} Proyek</span>
                      {onSelectClientProjects && projectCount > 0 && (
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                      )}
                    </button>
                  </div>

                  {/* Contact Info: Email & Phone */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                      <Mail className="w-3.5 h-3.5 text-neon shrink-0" />
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="hover:text-neon hover:underline truncate transition-colors text-foreground/90 font-medium"
                          title={`Kirim email ke ${client.email}`}
                        >
                          {client.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Email belum diatur</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                      <Phone className="w-3.5 h-3.5 text-neon shrink-0" />
                      {client.phone ? (
                        <span className="text-foreground/90 font-mono text-[11px]">
                          {client.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Nomor belum diatur</span>
                      )}
                    </div>
                  </div>

                  {/* Notes Snippet (if available) */}
                  {client.notes && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-card-inner border border-card-border-subtle text-[11px] text-muted-foreground flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-neon/70 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed">{client.notes}</p>
                    </div>
                  )}
                </div>

                {/* Card Footer: Quick Direct Actions + Edit/Delete */}
                <div className="mt-5 pt-4 border-t border-card-border/80 flex flex-wrap items-center justify-between gap-2">
                  {/* Direct Action Buttons: WhatsApp & Email */}
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp Direct Chat */}
                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/60 transition-all shadow-sm"
                        title="Chat WhatsApp langsung di tab baru"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-card-inner text-muted-foreground/40 border border-card-border-subtle cursor-not-allowed"
                        title="Nomor telepon belum diatur"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </span>
                    )}

                    {/* Email Direct Link */}
                    {client.email ? (
                      <a
                        href={`mailto:${client.email}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neon/10 text-neon border border-neon/30 hover:bg-neon/20 hover:border-neon/60 transition-all shadow-sm"
                        title={`Buka email klien (${client.email})`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-card-inner text-muted-foreground/40 border border-card-border-subtle cursor-not-allowed"
                        title="Email belum diatur"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </span>
                    )}
                  </div>

                  {/* Management Buttons: Edit & Delete */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(client)}
                      className="h-8 px-3 rounded-full border-card-border bg-card-inner text-foreground/80 hover:text-foreground hover:border-neon/40 hover:bg-card-inner/80 transition-all gap-1 text-xs font-semibold"
                      title="Edit profil klien"
                    >
                      <Pencil className="w-3 h-3 text-neon" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client)}
                      disabled={deletingId === client.id}
                      className="h-8 px-3 rounded-full border-card-border bg-card-inner text-red-400 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/10 transition-all gap-1 text-xs font-semibold disabled:opacity-50"
                      title="Hapus data klien"
                    >
                      {deletingId === client.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Hapus</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchQuery ? (
        /* Empty State: Search filter not matched */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-[2rem] lg:rounded-[2.5rem] border border-dashed border-card-border bg-card shadow-xl">
          <div className="w-12 h-12 rounded-full bg-card-inner border border-card-border flex items-center justify-center text-muted-foreground mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            Tidak Ada Klien Ditemukan
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Tidak ada klien yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-4 h-9 px-5 rounded-full border-card-border text-neon hover:bg-card-inner text-xs font-semibold"
          >
            Bersihkan Pencarian
          </Button>
        </div>
      ) : (
        /* Empty State: No clients registered yet */
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-[2rem] lg:rounded-[2.5rem] border border-dashed border-card-border bg-card shadow-xl">
          <div className="w-14 h-14 rounded-full bg-neon/10 border border-neon/30 text-neon flex items-center justify-center mb-4 shadow-sm">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Belum Ada Klien Terdaftar
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1 mb-6">
            Tambahkan kontak klien freelance pertama Anda untuk mempermudah komunikasi
            via WhatsApp, tracking invoicing, dan manajemen proyek.
          </p>
          <Button
            onClick={handleOpenAddModal}
            className="h-10 px-5 rounded-full font-extrabold gap-2 text-xs sm:text-sm bg-neon text-black hover:bg-neon/90 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Klien Pertama</span>
          </Button>
        </div>
      )}

      {/* Client Modal for Add and Edit */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setClientToEdit(null);
        }}
        onSuccess={() => {
          onRefresh();
        }}
        clientToEdit={clientToEdit}
      />
    </div>
  );
}
