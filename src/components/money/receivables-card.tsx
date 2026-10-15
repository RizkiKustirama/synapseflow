"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
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
    <div className="rounded-[2rem] lg:rounded-[2.5rem] bg-card border border-card-border shadow-xl p-6 sm:p-7 space-y-5">
      <div className="flex flex-row items-center justify-between pb-2 border-b border-card-border/60">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Piutang & Ekspektasi Dana Masuk (Receivables)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tagihan termin freelance yang berstatus Invoiced dan menunggu pelunasan klien.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Total Piutang
          </span>
          <p className="text-base sm:text-xl font-black text-amber-400 tabular-nums">
            {formatRupiah(totalReceivables)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
            Memuat daftar piutang aktif...
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground bg-card-inner rounded-2xl border border-card-border-subtle">
            Seluruh tagihan termin telah lunas. Tidak ada piutang tertunda.
          </div>
        ) : (
          items.map((item) => {
            const isOverdue = item.status === "OVERDUE";
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {item.milestoneTitle}
                    </span>
                    {item.invoiceNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-card text-muted-foreground border border-card-border">
                        #{item.invoiceNumber}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isOverdue
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      Jatuh Tempo: {formatDate(item.dueDate)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.projectTitle} • Klien:{" "}
                    <span className="text-foreground font-semibold">{item.clientName}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-0 border-card-border/40">
                  <span className="text-sm sm:text-base font-black text-amber-400 tabular-nums">
                    {formatRupiah(item.amount)}
                  </span>
                  <button
                    onClick={() => handleSettle(item)}
                    disabled={settlingId === item.id}
                    className="px-4 py-2 rounded-full bg-neon hover:bg-neon/90 text-black text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    {settlingId === item.id ? "Memproses..." : "Tandai Lunas"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
