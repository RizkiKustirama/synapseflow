"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import { getReceivables, StoredReceivableItem } from "@/actions/money.actions";
import { updateMilestoneStatus } from "@/actions/freelance.actions";

export interface ReceivablesCardProps {
  items?: StoredReceivableItem[];
  onSettled?: () => void;
}

export function ReceivablesCard({ items: propItems, onSettled }: ReceivablesCardProps) {
  const [internalItems, setInternalItems] = useState<StoredReceivableItem[]>([]);
  const [isLoading, setIsLoading] = useState(propItems === undefined);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const isControlled = propItems !== undefined;
  const items = isControlled ? propItems : internalItems;

  const loadReceivables = useCallback(async () => {
    if (isControlled) return;
    setIsLoading(true);
    try {
      const data = await getReceivables();
      setInternalItems(data);
    } catch (err) {
      console.error("Gagal memuat piutang freelance:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isControlled]);

  useEffect(() => {
    if (!isControlled) {
      loadReceivables();
    }
  }, [isControlled, loadReceivables]);

  const totalReceivables = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSettle = async (item: StoredReceivableItem) => {
    if (
      confirm(
        `Tandai termin "${item.milestoneTitle}" sebagai LUNAS? Nominal ${formatRupiah(item.amount)} akan otomatis dicatat sebagai Pemasukan di buku kas.`
      )
    ) {
      setSettlingId(item.id);
      try {
        await updateMilestoneStatus(item.id, "PAID", item.projectId);

        if (!isControlled) {
          setInternalItems((prev) => prev.filter((i) => i.id !== item.id));
        }

        if (onSettled) {
          onSettled();
        }
      } catch (err) {
        console.error("Gagal melunasi termin piutang:", err);
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
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Memuat daftar piutang aktif...
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground bg-background rounded-2xl border border-card-border">
            Seluruh tagihan termin telah lunas. Tidak ada piutang tertunda.
          </div>
        ) : (
          items.map((item) => {
            const isOverdue = item.status === "OVERDUE";
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-background border border-card-border hover:border-card-border/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {item.milestoneTitle}
                    </span>
                    {item.invoiceNumber && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-card-border">
                        #{item.invoiceNumber}
                      </span>
                    )}
                    <Badge
                      variant="done"
                      className={`text-[9px] flex items-center gap-1 ${
                        isOverdue
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "text-amber-400"
                      }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <Clock className="w-2.5 h-2.5" />
                      )}
                      Jatuh Tempo: {formatDate(item.dueDate)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.projectTitle} • Klien:{" "}
                    <span className="text-foreground font-semibold">{item.clientName}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-card-border/40">
                  <span className="text-sm font-black text-amber-400 tabular-nums">
                    {formatRupiah(item.amount)}
                  </span>
                  <button
                    onClick={() => handleSettle(item)}
                    disabled={settlingId === item.id}
                    className="px-3 py-1.5 rounded-xl bg-neon/15 hover:bg-neon text-neon hover:text-black text-xs font-bold border border-neon/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {settlingId === item.id ? "Memproses..." : "Tandai Lunas"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
