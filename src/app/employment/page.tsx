"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah, getDaysUntilPayday } from "@/lib/utils";

export default function EmploymentPage() {
  const { daysRemaining } = getDaysUntilPayday(25);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Employment (Kerja Kantor & Kontrak)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Profil kontrak aktif, task sprint harian, dan pencatatan slip gaji dengan auto-sync ke Money.
          </p>
        </div>

        <Button className="h-10 text-xs font-bold gap-2">
          <Plus className="w-4 h-4" /> Catat Slip Gaji Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profil Pekerjaan Aktif</CardTitle>
              <Badge variant="processing">Full-time • Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl bg-background border border-card-border space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">PT Tech Innovasi Nusantara</h3>
                  <p className="text-xs text-muted-foreground">Senior Fullstack Engineer</p>
                </div>
                <span className="text-xs text-muted-foreground font-semibold">Tgl Gajian: Setiap tgl 25</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-card border border-card-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Gaji Pokok</span>
                  <p className="text-sm font-extrabold text-foreground">{formatRupiah(18500000)}</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-card-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Tunjangan Tetap</span>
                  <p className="text-sm font-extrabold text-foreground">{formatRupiah(2500000)}</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-card-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Countdown Payday</span>
                  <p className="text-sm font-extrabold text-neon">{daysRemaining} Hari Lagi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Log Sprint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { task: "Implement Multi-tenant User Filter", status: "DONE" },
              { task: "Review Pull Request #412 API V2", status: "IN_PROGRESS" },
              { task: "Weekly Sprint Retro & Planning", status: "TODO" },
            ].map((t, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-background border border-card-border flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{t.task}</span>
                <Badge variant={t.status === "DONE" ? "done" : "processing"} className="text-[9px]">
                  {t.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
