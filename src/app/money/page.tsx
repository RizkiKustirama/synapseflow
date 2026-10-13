"use client";

import React, { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, Filter, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/money/quick-add-modal";
import { formatRupiah } from "@/lib/utils";

const mockTransactions = [
  { id: "1", desc: "DP 30% Termin Proyek E-Commerce", type: "INCOME", source: "FREELANCE", category: "Freelance", amount: 6000000, date: "12 Okt 2026" },
  { id: "2", desc: "Beli Domain & Cloudflare Pro", type: "EXPENSE", source: "PROJECT_EXPENSE", category: "Hosting/Domain", amount: 450000, date: "10 Okt 2026" },
  { id: "3", desc: "Makan Siang & Kopi Tim", type: "EXPENSE", source: "MANUAL", category: "Makan & Minum", amount: 85000, date: "09 Okt 2026" },
  { id: "4", desc: "Gaji Pokok Kantor Bulan September", type: "INCOME", source: "EMPLOYMENT", category: "Gaji Kantor", amount: 18500000, date: "25 Sep 2026" },
];

export default function MoneyPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Money & Cashflow Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Buku kas harian terpadu, sinkronisasi termin freelance, gaji kantor, dan tracking piutang.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="h-10 text-xs font-bold gap-2">
          <Plus className="w-4 h-4" /> Catat Transaksi
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">Total Saldo Kas</span>
          <p className="text-xl font-extrabold text-foreground mt-1">{formatRupiah(24850000)}</p>
          <span className="text-[10px] text-neon font-medium mt-1 inline-block">Surplus +14% bln ini</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">Pemasukan Bulan Ini</span>
          <p className="text-xl font-extrabold text-neon mt-1">{formatRupiah(28500000)}</p>
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">Gaji + Freelance</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">Pengeluaran Bulan Ini</span>
          <p className="text-xl font-extrabold text-red-400 mt-1">{formatRupiah(11200000)}</p>
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">Biaya hidup & operasional</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">Total Piutang Aktif</span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{formatRupiah(14500000)}</p>
          <span className="text-[10px] text-muted-foreground mt-1 inline-block">Menunggu termin klien</span>
        </Card>
      </div>

      {/* Transactions Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Transaksi Terpadu</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Ekspor
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTransactions.map((trx) => (
            <div
              key={trx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-card-border hover:border-neon/30 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    trx.type === "INCOME"
                      ? "bg-neon/20 text-neon"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {trx.type === "INCOME" ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{trx.desc}</span>
                    <Badge variant={trx.type === "INCOME" ? "default" : "outline"} className="text-[9px]">
                      {trx.category}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{trx.date}</span>
                </div>
              </div>
              <span
                className={`text-sm font-extrabold tabular-nums ${
                  trx.type === "INCOME" ? "text-neon" : "text-red-400"
                }`}
              >
                {trx.type === "INCOME" ? "+" : "-"}
                {formatRupiah(trx.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <QuickAddModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
