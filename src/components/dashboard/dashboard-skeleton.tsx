"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-6 sm:space-y-8 animate-in fade-in duration-300 select-none",
        className
      )}
    >
      {/* =======================================================================
          STITCH 2-COLUMN MAIN DASHBOARD GRID SKELETON (xl:grid-cols-12)
         ======================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* =====================================================================
            LEFT COLUMN (xl:col-span-7): Hero Welcome Banner + Tasks
           ===================================================================== */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* 1. Hero Greeting Banner Skeleton */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-card/60 border border-card-border shadow-sm p-6 sm:p-8 animate-pulse">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl w-full">
                <div className="h-8 w-3/4 sm:w-1/2 rounded-xl bg-muted/30" />
                <div className="h-4 w-4/5 rounded-md bg-muted/20" />
                <div className="h-4 w-2/3 rounded-md bg-muted/15" />
              </div>
              <div className="hidden lg:flex w-32 h-32 rounded-3xl bg-muted/20 rotate-6" />
            </div>

            {/* Bottom Floating White KPI Ribbon Skeleton */}
            <div className="mt-8 bg-white/10 rounded-2xl md:rounded-[1.5rem] p-4 flex items-center justify-between">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex-1 px-3 space-y-1">
                  <div className="h-3 w-16 rounded bg-muted/20" />
                  <div className="h-6 w-24 rounded-lg bg-muted/30" />
                </div>
              ))}
            </div>
          </section>

          {/* 2. Office Tasks & Deliverables Card Skeleton */}
          <section className="bg-card/60 rounded-[2.5rem] p-6 md:p-7 border border-card-border shadow-xl flex flex-col gap-4 animate-pulse">
            <div className="flex items-center justify-between pb-3 border-b border-card-border-subtle">
              <div className="h-5 w-48 rounded-lg bg-muted/30" />
              <div className="h-6 w-24 rounded-full bg-muted/20" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-card-inner border border-card-border-subtle flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-52 rounded bg-muted/30" />
                    <div className="h-4 w-24 rounded bg-muted/20" />
                  </div>
                  <div className="h-3 w-36 rounded bg-muted/15" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* =====================================================================
            RIGHT COLUMN (xl:col-span-5): 3 Highlights + Calendar + Workstreams
           ===================================================================== */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* 3 Highlight Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((h) => (
              <div
                key={h}
                className="rounded-[2rem] p-4 bg-card/60 border border-card-border h-[190px] flex flex-col items-center justify-between animate-pulse"
              >
                <div className="w-16 h-16 rounded-full bg-muted/20 my-auto" />
                <div className="h-3.5 w-20 rounded bg-muted/30" />
              </div>
            ))}
          </div>

          {/* Calendar Strip Skeleton */}
          <div className="rounded-[2rem] p-5 bg-card/60 border border-card-border shadow-xl space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-muted/30" />
              <div className="h-4 w-12 rounded bg-muted/20" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div key={d} className="h-10 rounded-xl bg-muted/20" />
              ))}
            </div>
          </div>

          {/* Synapse Workstreams Skeleton */}
          <div className="rounded-[2.5rem] p-6 bg-card/60 border border-card-border shadow-xl space-y-4 animate-pulse">
            <div className="flex items-center justify-between pb-2 border-b border-card-border-subtle">
              <div className="h-4 w-36 rounded bg-muted/30" />
              <div className="h-3 w-16 rounded bg-muted/20" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted/25 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-muted/30" />
                    <div className="h-2 w-full rounded-full bg-muted/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Analytics Skeleton */}
      <div className="rounded-[2.5rem] p-6 bg-card/60 border border-card-border shadow-xl h-64 animate-pulse flex items-center justify-center">
        <div className="h-8 w-48 rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}
