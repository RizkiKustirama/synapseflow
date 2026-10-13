"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export default function FreelancePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Freelance & Client Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manajemen deliverable, milestone invoicing (termin), dan kalkulasi otomatis Net Profit Margin.
          </p>
        </div>

        <Button className="h-10 text-xs font-bold gap-2">
          <Plus className="w-4 h-4" /> Proyek Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>E-Commerce Multi-Vendor App</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Client: PT Maju Bersama</p>
            </div>
            <Badge variant="processing">In Progress</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Total Budget:</span>
              <span className="text-foreground font-bold">{formatRupiah(20000000)}</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-card-border">
              <div className="bg-neon h-full rounded-full" style={{ width: "30%" }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-background border border-card-border">
                <span className="text-[10px] text-muted-foreground">Dibayar (DP 30%)</span>
                <p className="font-extrabold text-neon">{formatRupiah(6000000)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-background border border-card-border">
                <span className="text-[10px] text-muted-foreground">Sisa Piutang (70%)</span>
                <p className="font-extrabold text-amber-400">{formatRupiah(14000000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Design System & Mobile UI</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Client: FinCorp Singapore</p>
            </div>
            <Badge variant="done">Review / Pelunasan</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Total Budget:</span>
              <span className="text-foreground font-bold">{formatRupiah(15000000)}</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-card-border">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: "90%" }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-background border border-card-border">
                <span className="text-[10px] text-muted-foreground">Dibayar</span>
                <p className="font-extrabold text-neon">{formatRupiah(8500000)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-background border border-card-border">
                <span className="text-[10px] text-muted-foreground">Tagihan Aktif</span>
                <p className="font-extrabold text-amber-400">{formatRupiah(6500000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
