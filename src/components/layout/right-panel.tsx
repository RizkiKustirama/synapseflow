"use client";

import React, { useState, useEffect } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatRupiah, getDaysUntilPayday } from "@/lib/utils";
import { getExecutiveDashboardData, ExecutiveDashboardData } from "@/actions/dashboard.actions";

interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className }: RightPanelProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);

  // Generate 7 days of current week
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday
  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(today);
    // Align around current date
    d.setDate(today.getDate() - currentDayOfWeek + index);
    return {
      dayName: daysOfWeek[d.getDay()],
      dayNumber: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      fullDate: d,
    };
  });

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const res = await getExecutiveDashboardData();
        if (mounted) setData(res);
      } catch (err) {
        console.error("RightPanel load error:", err);
      }
    }
    loadData();

    const handleRefresh = () => {
      loadData();
    };
    window.addEventListener("synapseflow:transaction-created", handleRefresh);
    return () => {
      mounted = false;
      window.removeEventListener("synapseflow:transaction-created", handleRefresh);
    };
  }, []);

  const fallbackDays = getDaysUntilPayday(25).daysRemaining;
  const paydayNumber = data?.metrics.nextPayday.payday || 25;
  const daysRemaining = data?.metrics.nextPayday.daysRemaining ?? fallbackDays;
  const companyName = data?.metrics.nextPayday.companyName || "Pekerjaan Aktif";
  const baseSalary = data?.metrics.nextPayday.baseSalary || 0;
  const deliverables = data?.activeDeliverables || [];

  return (
    <aside
      className={cn(
        "hidden 2xl:flex flex-col w-80 h-screen sticky top-0 bg-background border-l border-card-border p-5 space-y-5 overflow-y-auto select-none",
        className
      )}
    >
      {/* 1. Weekly Horizontal Calendar Strip */}
      <div className="p-5 rounded-[2rem] bg-card border border-card-border shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon" />
            <span className="text-xs font-bold text-foreground">Timeline Minggu Ini</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {today.toLocaleString("id-ID", { month: "short", year: "numeric" })}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((w) => {
            const isSelected = selectedDay === w.dayNumber;
            return (
              <button
                key={w.dayNumber}
                onClick={() => setSelectedDay(w.dayNumber)}
                className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "bg-neon text-black font-extrabold shadow-[0_0_12px_rgba(43,240,98,0.4)]"
                    : w.isToday
                    ? "bg-neon/15 text-neon font-bold"
                    : "text-muted-foreground hover:bg-card-inner hover:text-foreground"
                )}
              >
                <span className="text-[10px] uppercase font-semibold">{w.dayName}</span>
                <span className="text-sm mt-0.5">{w.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Payday Countdown Circular Card */}
      <div className="p-5 rounded-[2rem] bg-card border border-card-border shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Payday Countdown</span>
          <Badge variant="processing" className="text-[10px]">
            Tgl {paydayNumber}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {/* Circular Countdown Progress */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="4"
                className="text-card-border"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 * (Math.max(0, Math.min(30, daysRemaining)) / 30)}
                className="text-neon transition-all duration-1000"
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-foreground tabular-nums">
                {daysRemaining}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                Hari
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              {companyName}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Gaji Pokok: {formatRupiah(baseSalary)}
            </span>
            <span className="text-[10px] text-neon font-medium mt-1">
              • Auto-sync ke Money siap
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Deliverable Milestones */}
      <div className="p-5 rounded-[2rem] bg-card border border-card-border shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Proyek & Milestones</span>
          <span className="text-[10px] text-neon font-semibold">{deliverables.length} Aktif</span>
        </div>

        {deliverables.length === 0 ? (
          <div className="p-4 rounded-2xl bg-card-inner border border-dashed border-card-border-subtle text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-neon mx-auto opacity-70" />
            <p className="text-xs font-semibold text-foreground">Semua Termin Selesai</p>
            <p className="text-[10px] text-muted-foreground">Tidak ada piutang jatuh tempo</p>
          </div>
        ) : (
          deliverables.slice(0, 3).map((item) => (
            <div key={item.id} className="p-3.5 rounded-2xl bg-card-inner border border-card-border-subtle hover:border-card-border hover:bg-card-inner/90 transition-all duration-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
                  {item.projectName}
                </span>
                <Badge
                  variant={item.status === "PAID" ? "done" : item.status === "INVOICED" ? "processing" : "pending"}
                  className="text-[9px]"
                >
                  {item.status === "PAID" ? "Lunas" : item.status === "INVOICED" ? "Invoiced" : "Draft"}
                </Badge>
              </div>
              <div className="w-full bg-card-border-subtle h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    item.status === "PAID" ? "bg-neon w-full" : "bg-[#e28460] w-3/4"
                  )}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="truncate max-w-[140px]">{item.title}</span>
                <span className="text-foreground font-semibold">{formatRupiah(item.amount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
