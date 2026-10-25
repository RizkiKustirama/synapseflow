"use client";

import React from "react";
import { User, Database, Sparkles, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function SettingsPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-card-border text-[11px] font-semibold text-muted-foreground w-fit mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-neon" />
          Multi-Tenant Configuration & Design System
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Pengaturan Sistem & Identitas Brand
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Konfigurasi preferensi multi-tenant, aset merek resmi SynapseFlow, dan arsitektur database.
        </p>
      </div>

      {/* Brand Identity & Logo Suite Showcase */}
      <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-card-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon/15 text-neon border border-neon/30 flex items-center justify-center font-bold shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Identitas Merek Resmi (Brand Logo Suite)
              </h2>
              <p className="text-xs text-muted-foreground">
                Aset logo SVG, PNG, dan Landscape resmi yang disesuaikan dengan palet warna light mode dan dark mode.
              </p>
            </div>
          </div>
          <Badge variant="processing" className="text-[10px] hidden sm:inline-flex">
            Default: Light Mode
          </Badge>
        </div>

        {/* Landscape Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col items-center justify-center text-center gap-3 shadow-sm">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Landscape Logo (Light Mode Variant)
            </span>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm w-full flex items-center justify-center">
              <BrandLogo variant="landscape" size="md" href="" showText={false} />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Diterapkan pada halaman login, registrasi, dan laporan mode terang.
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col items-center justify-center text-center gap-3 shadow-sm">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Landscape Logo (Dark Mode Variant)
            </span>
            <div className="p-4 bg-[#0a120b] rounded-xl border border-[#18371F] shadow-sm w-full flex items-center justify-center">
              <BrandLogo variant="landscape" size="md" href="" showText={false} />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Diterapkan otomatis saat beralih ke mode gelap.
            </span>
          </div>
        </div>

        {/* Emblem Variants */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col items-center justify-center text-center gap-2.5 shadow-sm">
            <BrandLogo variant="white-bg" size="lg" showText={false} href="" />
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">White Emblem</p>
              <span className="text-[10px] text-muted-foreground">Light Cards & Header</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col items-center justify-center text-center gap-2.5 shadow-sm">
            <BrandLogo variant="black-bg" size="lg" showText={false} href="" />
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">Black Emblem</p>
              <span className="text-[10px] text-muted-foreground">Dark Sidebar & Drawer</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col items-center justify-center text-center gap-2.5 shadow-sm">
            <BrandLogo variant="green-bg" size="lg" showText={false} href="" />
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">Neon Lime Emblem</p>
              <span className="text-[10px] text-muted-foreground">Highlight Accent</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col items-center justify-center text-center gap-2.5 shadow-sm">
            <BrandLogo variant="svg" size="lg" showText={false} href="" />
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">Vector SVG Mark</p>
              <span className="text-[10px] text-muted-foreground">Scalable Master Vector</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings & Multi-Tenant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-card-border/60">
            <div className="w-8 h-8 rounded-full bg-neon/15 text-neon flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Profil Pengguna Multi-Tenant</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-card-border-subtle">
              <span className="text-muted-foreground">Nama Lengkap</span>
              <span className="font-bold text-foreground">Tenant Terautentikasi</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border-subtle">
              <span className="text-muted-foreground">Email Terdaftar</span>
              <span className="font-bold text-foreground">user@synapseflow.app</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border-subtle">
              <span className="text-muted-foreground">Status Isolasi Data</span>
              <Badge variant="processing" className="text-[10px]">Tenant-per-User Active</Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Mata Uang Utama</span>
              <span className="font-bold text-foreground">IDR (Indonesian Rupiah)</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-card-border/60">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Koneksi Database & ORM</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-card-border-subtle">
              <span className="text-muted-foreground">Provider Database</span>
              <span className="font-bold text-foreground">PostgreSQL 18</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border-subtle">
              <span className="text-muted-foreground">ORM Engine</span>
              <span className="font-bold text-foreground">Prisma Client</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border-subtle">
              <span className="text-muted-foreground">Tabel Relasional</span>
              <span className="font-bold text-foreground">12 Normalized Relational Tables</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Integritas Relasi</span>
              <Badge variant="processing" className="text-[10px]">ON DELETE CASCADE Enforced</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
