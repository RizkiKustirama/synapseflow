"use client";

import React, { useState } from "react";
import { AlertCircle, Clock, CheckCircle2, ChevronRight, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import { createTransaction } from "@/actions/money.actions";

interface ReceivableItem {
  id: string;
  projectTitle: string;
  clientName: string;
  milestoneTitle: string;
  amount: number;
  dueDate: string;
  status: "INVOICED" | "OVERDUE";
}

const initialReceivables: ReceivableItem[] = [
  {
    id: "m-1",
    projectTitle: "E-Commerce Multi-Vendor App",
    clientName: "PT Maju Bersama",
    milestoneTitle: "Termin 2 (Progress 40%)",
    amount: 8000000,
    dueDate: "2026-10-18",
    status: "INVOICED",
  },
  {
    id: "m-2",
    projectTitle: "Design System & Mobile UI",
    clientName: "FinCorp Singapore",
    milestoneTitle: "Pelunasan 30%",
    amount: 6500000,
    dueDate: "2026-10-22",
    status: "INVOICED",
  },
];

interface ReceivablesCardProps {
  onSettled?: () => void;
}

export function ReceivablesCard({ onSettled }: ReceivablesCardProps) {
  const [items, setItems] = useState<ReceivableItem[]>(initialReceivables);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const totalReceivables = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSettle = async (item: ReceivableItem) => {
    if (confirm(`Tandai termin "${item.milestoneTitle}" sebagai LUNAS? Nominal ${formatRupiah(item.amount)} akan otomatis dicatat sebagai Pemasukan di buku kas.`)) {
      setSettlingId(item.id);
      try {
        await createTransaction({
          categoryId: "c1111111-0000-0000-0000-000000000002", // Termin Freelance category
          type: "INCOME",
          amount: item.amount,
          date: new Date().toISOString(),
          description: `Pelunasan: ${item.milestoneTitle} (${item.projectTitle})`,
          notes: `Klien: ${item.clientName} • Auto-synced dari Invoicing`,
          sourceType: "FREELANCE_MILESTONE",
        });

        setItems((prev) => prev.filter((i) => i.id !== item.id));
        if (onSettled) onSettled();
      } finally {
        setSettlingId(null);
      }
    }
  };

  return (
    <Card className="border border-card-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Piutang & Ekspektasi Dana Masuk (Receivables)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tagihan termin freelance yang berstatus Invoiced dan menunggu pelunasan klien.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase">
            Total Piutang
          </span>
          <p className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
            {formatRupiah(totalReceivables)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground bg-background rounded-2xl border border-card-border">
            Seluruh tagihan termin telah lunas. Tidak ada piutang tertunda!
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-background border border-card-border hover:border-card-border/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {item.milestoneTitle}
                  </span>
                  <Badge variant="done" className="text-[9px] text-amber-400">
                    Jatuh Tempo: {formatDate(item.dueDate)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.projectTitle} • Klien: <span className="text-foreground font-semibold">{item.clientName}</span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-card-border/40">
                <span className="text-sm font-black text-amber-400 tabular-nums">
                  {formatRupiah(item.amount)}
                </span>
                <button
                  onClick={() => handleSettle(item)}
                  disabled={settlingId === item.id}
                  className="px-3 py-1.5 rounded-xl bg-neon/15 hover:bg-neon text-neon hover:text-black text-xs font-bold border border-neon/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {settlingId === item.id ? "Memproses..." : "Tandai Lunas"}
                </button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
