"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-6 sm:space-y-8 animate-in fade-in duration-300",
        className
      )}
    >
      {/* =======================================================================
          1. HERO WELCOME CARD SKELETON
         ======================================================================= */}
      <section className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-card/60 border border-card-border shadow-sm p-6 sm:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-xl w-full">
            {/* Status Pill Badge */}
            <div className="h-6 w-48 rounded-full bg-muted/20" />

            {/* Title Line */}
            <div className="h-9 w-3/4 sm:w-2/3 rounded-xl bg-muted/30" />

            {/* Description Lines */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded-md bg-muted/15" />
              <div className="h-4 w-4/5 rounded-md bg-muted/15" />
            </div>

            {/* 3 KPI Strips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {[1, 2, 3].map((k) => (
                <div
                  key={k}
                  className="p-3.5 rounded-2xl bg-card border border-card-border/60 space-y-2"
                >
                  <div className="h-3 w-20 rounded bg-muted/20" />
                  <div className="h-6 w-28 rounded-lg bg-muted/30" />
                </div>
              ))}
            </div>
          </div>

          {/* 3D Mascot Sphere Placeholder */}
          <div className="hidden lg:flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-3xl bg-muted/20 rotate-6" />
            <div className="w-24 h-3 rounded-full bg-muted/15 mt-3" />
          </div>
        </div>
      </section>

      {/* =======================================================================
          2. THE 4 CORE PILLARS BENTO GRID SKELETON
         ======================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((pillar) => (
          <Card
            key={pillar}
            className="h-full bg-card/60 border-card-border animate-pulse flex flex-col justify-between"
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="h-3.5 w-24 rounded bg-muted/25" />
              <div className="w-8 h-8 rounded-xl bg-muted/20" />
            </CardHeader>
            <CardContent className="space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div className="h-7 w-28 rounded-lg bg-muted/30" />
                  <div className="h-5 w-16 rounded-full bg-muted/20" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-3 w-full rounded bg-muted/15" />
                  <div className="h-3 w-4/5 rounded bg-muted/15" />
                </div>
              </div>
              <div className="h-3.5 w-28 rounded bg-muted/20 pt-1" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* =======================================================================
          3. CHARTS / ANALYTICS SKELETON
         ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cashflow Bar / Area Chart Skeleton (2 cols) */}
        <Card className="lg:col-span-2 bg-card/60 border-card-border animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1.5">
              <div className="h-5 w-44 rounded-lg bg-muted/30" />
              <div className="h-3 w-64 rounded bg-muted/15" />
            </div>
            <div className="h-7 w-24 rounded-xl bg-muted/20" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex items-end justify-between gap-3 px-2 sm:px-6 pb-2 border-b border-card-border/60">
              {[45, 65, 30, 80, 55, 90].map((heightPct, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full max-w-[40px] rounded-t-xl bg-muted/25 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="h-2.5 w-8 rounded bg-muted/15" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Streams Donut / Distribution Skeleton (1 col) */}
        <Card className="bg-card/60 border-card-border animate-pulse">
          <CardHeader className="pb-2">
            <div className="space-y-1.5">
              <div className="h-5 w-36 rounded-lg bg-muted/30" />
              <div className="h-3 w-48 rounded bg-muted/15" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-2">
            {/* Donut ring placeholder */}
            <div className="w-36 h-36 rounded-full border-8 border-muted/20 border-t-muted/35 my-2" />
            {/* Stream legends */}
            <div className="w-full space-y-2 pt-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted/30" />
                    <div className="h-3 w-20 rounded bg-muted/20" />
                  </div>
                  <div className="h-3 w-12 rounded bg-muted/20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =======================================================================
          4. INTERACTIVE OPERATIONAL STREAMS SKELETON (2 COLUMNS ON LG)
         ======================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Column Skeletons */}
        <div className="space-y-5 sm:space-y-6">
          {/* Card 2A: Buku Kas Terpadu Skeleton */}
          <Card className="bg-card/60 border-card-border animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1.5">
                <div className="h-5 w-36 rounded-lg bg-muted/30" />
                <div className="h-3 w-56 rounded bg-muted/15" />
              </div>
              <div className="h-8 w-20 rounded-xl bg-muted/20" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-card-border/50"
                >
                  <div className="flex items-center gap-3 flex-1 pr-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/20 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-3/4 rounded bg-muted/25" />
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-16 rounded-full bg-muted/15" />
                        <div className="h-2.5 w-12 rounded bg-muted/15" />
                      </div>
                    </div>
                  </div>
                  <div className="h-4 w-20 rounded bg-muted/25 shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 2B: Termin & Piutang Aktif Skeleton */}
          <Card className="bg-card/60 border-card-border animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1.5">
                <div className="h-5 w-40 rounded-lg bg-muted/30" />
                <div className="h-3 w-60 rounded bg-muted/15" />
              </div>
              <div className="h-8 w-24 rounded-xl bg-muted/20" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-background/50 border border-card-border/50"
                >
                  <div className="space-y-1.5 flex-1 pr-3">
                    <div className="h-3.5 w-2/3 rounded bg-muted/25" />
                    <div className="h-2.5 w-40 rounded bg-muted/15" />
                  </div>
                  <div className="h-4 w-24 rounded bg-muted/25 shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column Skeletons */}
        <div className="space-y-5 sm:space-y-6">
          {/* Card 2C: Sprint Tasks Kantor Skeleton */}
          <Card className="bg-card/60 border-card-border animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1.5">
                <div className="h-5 w-48 rounded-lg bg-muted/30" />
                <div className="h-3 w-52 rounded bg-muted/15" />
              </div>
              <div className="h-8 w-20 rounded-xl bg-muted/20" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[1, 2, 3, 4].map((task) => (
                <div
                  key={task}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-background/50 border border-card-border/50"
                >
                  <div className="w-5 h-5 rounded-lg bg-muted/25 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-1/2 rounded bg-muted/25" />
                      <div className="h-3 w-12 rounded-full bg-muted/15" />
                    </div>
                    <div className="h-2.5 w-32 rounded bg-muted/15" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 2D: Agenda Wawancara Skeleton */}
          <Card className="bg-card/60 border-card-border animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1.5">
                <div className="h-5 w-48 rounded-lg bg-muted/30" />
                <div className="h-3 w-56 rounded bg-muted/15" />
              </div>
              <div className="h-8 w-24 rounded-xl bg-muted/20" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[1, 2].map((interview) => (
                <div
                  key={interview}
                  className="p-3.5 rounded-2xl bg-background/50 border border-card-border/50 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-2/3 rounded bg-muted/25" />
                      <div className="h-2.5 w-24 rounded bg-muted/20" />
                    </div>
                    <div className="h-7 w-20 rounded-xl bg-muted/20 shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 pt-1 border-t border-card-border/30">
                    <div className="h-2.5 w-20 rounded bg-muted/15" />
                    <div className="h-2.5 w-16 rounded bg-muted/15" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
