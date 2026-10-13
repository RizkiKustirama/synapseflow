"use client";

import React from "react";
import { User, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Pengaturan Sistem & Akun
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Konfigurasi preferensi multi-tenant, mata uang, dan tema tampilan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-neon" />
              <CardTitle>Profil Pengguna</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-card-border">
              <span className="text-muted-foreground">Nama Lengkap</span>
              <span className="font-bold text-foreground">Alex Pratama</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border">
              <span className="text-muted-foreground">Email Terdaftar</span>
              <span className="font-bold text-foreground">alex@synapseflow.id</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border">
              <span className="text-muted-foreground">Status Multi-Tenant</span>
              <Badge variant="default" className="text-[10px]">Tenant-per-User Active</Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Mata Uang Utama</span>
              <span className="font-bold text-foreground">IDR (Indonesian Rupiah)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <CardTitle>Koneksi Database & ORM</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-card-border">
              <span className="text-muted-foreground">Provider DB</span>
              <span className="font-bold text-foreground">PostgreSQL 18</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border">
              <span className="text-muted-foreground">ORM Engine</span>
              <span className="font-bold text-foreground">Prisma Client</span>
            </div>
            <div className="flex justify-between py-2 border-b border-card-border">
              <span className="text-muted-foreground">Tabel Terisolasi</span>
              <span className="font-bold text-foreground">12 Normalized Relational Tables</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Keamanan Relasi</span>
              <Badge variant="processing" className="text-[10px]">ON DELETE CASCADE Enforced</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
