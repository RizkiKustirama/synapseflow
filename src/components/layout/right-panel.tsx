"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatRupiah, getDaysUntilPayday } from "@/lib/utils";

interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className }: RightPanelProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

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

  const { daysRemaining } = getDaysUntilPayday(25);

  return (
    <aside
      className={cn(
        "hidden 2xl:flex flex-col w-80 h-screen sticky top-0 bg-background border-l border-card-border p-5 space-y-5 overflow-y-auto select-none",
        className
      )}
    >
      {/* 1. Weekly Horizontal Calendar Strip */}
      <div className="p-4 rounded-3xl bg-card border border-card-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon" />
            <span className="text-xs font-bold text-foreground">Timeline Minggu Ini</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {today.toLocaleString("id-ID", { month: "short", year: "numeric" })}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((w) => {
            const isSelected = selectedDay === w.dayNumber;
            return (
              <button
                key={w.dayNumber}
                onClick={() => setSelectedDay(w.dayNumber)}
                className={cn(
                  "flex flex-col items-center py-2 px-1 rounded-2xl transition-all duration-200",
                  isSelected
                    ? "bg-neon text-black font-extrabold shadow-[0_0_12px_rgba(59,240,41,0.4)]"
                    : w.isToday
                    ? "bg-neon/15 text-neon font-bold"
                    : "text-muted-foreground hover:bg-card-border/40 hover:text-foreground"
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
      <div className="p-4 rounded-3xl bg-card border border-card-border shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Payday Countdown</span>
          <Badge variant="processing" className="text-[10px]">
            Tgl 25
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {/* Circular Countdown Progress */}
          <div className="relative flex items-center justify-center">
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
                strokeDashoffset={163.3 * (daysRemaining / 30)}
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

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">
              PT Tech Innovasi
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              Gaji Pokok: {formatRupiah(18500000)}
            </span>
            <span className="text-[10px] text-neon font-medium mt-1">
              • Auto-sync ke Money siap
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Deliverable Milestones */}
      <div className="p-4 rounded-3xl bg-card border border-card-border shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Proyek & Milestones</span>
          <span className="text-[10px] text-neon font-semibold">2 Aktif</span>
        </div>

        {/* Milestone 1 */}
        <div className="p-3 rounded-2xl bg-background border border-card-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
              E-Commerce Redesign
            </span>
            <Badge variant="processing" className="text-[9px]">
              DP Lunas
            </Badge>
          </div>
          <div className="w-full bg-card-border h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-neon h-full rounded-full transition-all"
              style={{ width: "70%" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Termin 2 (Progress 40%)</span>
            <span className="text-foreground font-semibold">{formatRupiah(8000000)}</span>
          </div>
        </div>

        {/* Milestone 2 */}
        <div className="p-3 rounded-2xl bg-background border border-card-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground truncate max-w-[150px]">
              Design System SaaS
            </span>
            <Badge variant="done" className="text-[9px]">
              Pelunasan
            </Badge>
          </div>
          <div className="w-full bg-card-border h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all"
              style={{ width: "90%" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Invoiced (Piutang)</span>
            <span className="text-foreground font-semibold">{formatRupiah(6500000)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
