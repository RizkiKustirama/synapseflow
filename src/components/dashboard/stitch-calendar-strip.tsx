"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StitchCalendarStripProps {
  payday?: number;
  daysRemaining?: number;
}

export function StitchCalendarStrip({
  payday = 25,
  daysRemaining,
}: StitchCalendarStripProps) {
  const [currentOffsetWeeks, setCurrentOffsetWeeks] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const baseToday = new Date();
  const currentWeekDate = new Date(baseToday);
  currentWeekDate.setDate(baseToday.getDate() + currentOffsetWeeks * 7);

  const monthYearLabel = currentWeekDate.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const dayOfWeek = currentWeekDate.getDay(); // 0 is Sunday
  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(currentWeekDate);
    d.setDate(currentWeekDate.getDate() - dayOfWeek + index);
    const isToday = d.toDateString() === baseToday.toDateString();
    const isSelected = d.toDateString() === selectedDate.toDateString();

    return {
      name: daysOfWeek[d.getDay()],
      dateNumber: d.getDate(),
      fullDate: d,
      isToday,
      isSelected,
    };
  });

  return (
    <div
      className="bg-card rounded-[2rem] p-5 border border-card-border shadow-xl select-none"
      data-purpose="calendar-strip"
    >
      {/* Header with Month and Arrow Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-neon" />
          <h3 className="text-sm font-bold text-foreground capitalize">
            {monthYearLabel}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {daysRemaining !== undefined && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neon/15 text-neon border border-neon/30">
              Gajian: Tgl {payday} ({daysRemaining}h lagi)
            </span>
          )}
          <button
            onClick={() => setCurrentOffsetWeeks((prev) => prev - 1)}
            aria-label="Minggu sebelumnya"
            className="p-1.5 rounded-lg hover:bg-card-inner text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentOffsetWeeks((prev) => prev + 1)}
            aria-label="Minggu berikutnya"
            className="p-1.5 rounded-lg hover:bg-card-inner text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Strip Grid */}
      <div className="grid grid-cols-7 text-center gap-1.5 text-xs">
        {/* Day Names */}
        {weekDays.map((w, idx) => (
          <div key={`name-${idx}`} className="text-muted-foreground text-[10px] font-semibold py-0.5">
            {w.name}
          </div>
        ))}

        {/* Day Numbers */}
        {weekDays.map((w, idx) => (
          <button
            key={`date-${idx}`}
            onClick={() => setSelectedDate(w.fullDate)}
            className={cn(
              "py-2 rounded-xl font-bold transition-all duration-200 cursor-pointer flex flex-col items-center justify-center",
              w.isSelected
                ? "bg-neon text-black font-extrabold shadow-md scale-105"
                : w.isToday
                ? "bg-neon/15 text-neon"
                : "text-foreground hover:bg-card-inner"
            )}
          >
            <span className="text-xs tabular-nums">{w.dateNumber}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
