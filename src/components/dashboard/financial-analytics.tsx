"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, cn } from "@/lib/utils";
import { CashflowHistoryPoint, RevenueStreamItem } from "@/actions/dashboard.actions";

export interface FinancialAnalyticsProps {
  cashflowHistory: CashflowHistoryPoint[];
  revenueStreams: RevenueStreamItem[];
  savingsRate: number;
  netCashflow: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
}

interface CashflowTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: CashflowHistoryPoint;
}

interface CustomCashflowTooltipProps {
  active?: boolean;
  payload?: CashflowTooltipPayloadItem[];
  label?: string;
}

function CustomCashflowTooltip({
  active,
  payload,
}: CustomCashflowTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const income = dataPoint.income ?? 0;
    const expense = dataPoint.expense ?? 0;
    const selisih = dataPoint.net ?? income - expense;

    return (
      <div className="rounded-2xl border border-card-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md min-w-[210px]">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-card-border/60">
          <span className="text-xs font-bold text-foreground">
            {dataPoint.month} {dataPoint.year}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              selisih >= 0
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            )}
          >
            {selisih >= 0 ? "Surplus" : "Defisit"}
          </span>
        </div>
        <div className="space-y-1.5 pt-2 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              Pemasukan
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {formatRupiah(income)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              Pengeluaran
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {formatRupiah(expense)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-card-border/40">
            <span className="font-medium text-muted-foreground">Selisih Net</span>
            <span
              className={cn(
                "font-extrabold tabular-nums",
                selisih >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {selisih >= 0 ? "+" : ""}
              {formatRupiah(selisih)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

interface PieTooltipPayloadItem {
  name: string;
  value: number;
  payload: RevenueStreamItem;
}

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: PieTooltipPayloadItem[];
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    const data = item.payload;
    if (data.name === "Belum Ada Data") return null;

    return (
      <div className="rounded-xl border border-card-border bg-card/95 p-2.5 shadow-lg backdrop-blur-md text-xs min-w-[150px]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-bold text-foreground">{data.name}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-muted-foreground">
          <span>{formatRupiah(data.value)}</span>
          <span className="font-bold text-foreground">{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
}

function FinancialAnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-pulse">
      {/* Component A Skeleton */}
      <div className="lg:col-span-2 rounded-2xl lg:rounded-3xl border border-card-border bg-card p-5 sm:p-6 h-[460px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-card-border/60 rounded-md" />
            <div className="h-3 w-64 bg-card-border/40 rounded-md" />
          </div>
          <div className="h-8 w-24 bg-card-border/40 rounded-full" />
        </div>
        <div className="h-[280px] w-full bg-card-border/20 rounded-xl" />
        <div className="flex gap-4">
          <div className="h-3 w-28 bg-card-border/40 rounded-md" />
          <div className="h-3 w-28 bg-card-border/40 rounded-md" />
        </div>
      </div>

      {/* Right Column Skeletons */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        {/* Component B Skeleton */}
        <div className="rounded-2xl lg:rounded-3xl border border-card-border bg-card p-5 sm:p-6 h-[255px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-card-border/60 rounded-md" />
            <div className="h-3 w-48 bg-card-border/40 rounded-md" />
          </div>
          <div className="h-24 w-24 rounded-full bg-card-border/20 mx-auto" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-card-border/40 rounded-md" />
            <div className="h-3 w-full bg-card-border/40 rounded-md" />
          </div>
        </div>

        {/* Component C Skeleton */}
        <div className="rounded-2xl lg:rounded-3xl border border-card-border bg-card p-5 sm:p-6 h-[190px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-5 w-36 bg-card-border/60 rounded-md" />
            <div className="h-3 w-44 bg-card-border/40 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-card-border/20" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-card-border/40 rounded-md" />
              <div className="h-6 w-24 bg-card-border/60 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinancialAnalytics({
  cashflowHistory,
  revenueStreams,
  savingsRate,
  netCashflow,
  totalIncomeMonth,
  totalExpenseMonth,
}: FinancialAnalyticsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <FinancialAnalyticsSkeleton />;
  }

  // Format Y-Axis values in millions (e.g. 5M, 10M)
  const formatMillionTick = (val: number): string => {
    if (val === 0) return "0";
    const inMillions = val / 1_000_000;
    if (Number.isInteger(inMillions)) {
      return `${inMillions}M`;
    }
    return `${inMillions.toFixed(1)}M`;
  };

  // Prepare Pie Chart data fallback if zero income recorded
  const totalStreamValue = revenueStreams.reduce((acc, curr) => acc + curr.value, 0);
  const hasRevenueData = totalStreamValue > 0;
  const pieData = hasRevenueData
    ? revenueStreams.filter((item) => item.value > 0)
    : [{ name: "Belum Ada Data", value: 1, color: "rgba(125, 163, 123, 0.2)", percentage: 0 }];

  // Circular gauge calculations
  const clampedRate = Math.max(0, Math.min(savingsRate, 100));
  const circumference = 2 * Math.PI * 40; // ~251.327
  const strokeDashoffset = circumference - (circumference * clampedRate) / 100;

  // Savings status badge styling & indicator
  let statusBadge: {
    label: string;
    badgeClass: string;
    gaugeColor: string;
    icon: React.ReactNode;
  };

  if (savingsRate >= 50) {
    statusBadge = {
      label: "Sangat Sehat (Target > 50%)",
      badgeClass:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.35)]",
      gaugeColor: "#22C55E",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    };
  } else if (savingsRate >= 20) {
    statusBadge = {
      label: "Sehat (Target 20-50%)",
      badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      gaugeColor: "#F59E0B",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    };
  } else {
    statusBadge = {
      label: "Perlu Penghematan (< 20%)",
      badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30",
      gaugeColor: "#EF4444",
      icon: <ArrowDownRight className="w-3.5 h-3.5" />,
    };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* =======================================================================
          COMPONENT A: 6-MONTH CASHFLOW HISTORY CHART
         ======================================================================= */}
      <Card className="lg:col-span-2 flex flex-col justify-between">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <CardTitle>Arus Kas 6 Bulan Terakhir</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Histori perbandingan pemasukan & pengeluaran kas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-muted-foreground">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-muted-foreground">Pengeluaran</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-6">
          <div className="w-full h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cashflowHistory}
                margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-card-border/60"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={{ stroke: "var(--card-border)" }}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatMillionTick}
                />
                <Tooltip
                  content={<CustomCashflowTooltip />}
                  cursor={{ fill: "rgba(125, 163, 123, 0.08)" }}
                />
                <Legend
                  wrapperStyle={{ display: "none" }}
                  verticalAlign="top"
                />
                <Bar
                  dataKey="income"
                  name="Pemasukan"
                  fill="#22C55E"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expense"
                  name="Pengeluaran"
                  fill="#EF4444"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 mt-3 border-t border-card-border/40">
            <div className="p-2.5 rounded-xl bg-background/50 border border-card-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Pemasukan Bulan Ini
              </span>
              <span className="text-sm font-black text-emerald-400 tabular-nums">
                {formatRupiah(totalIncomeMonth)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-background/50 border border-card-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Pengeluaran Bulan Ini
              </span>
              <span className="text-sm font-black text-red-400 tabular-nums">
                {formatRupiah(totalExpenseMonth)}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-background/50 border border-card-border/60">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Surplus / Defisit
              </span>
              <span
                className={cn(
                  "text-sm font-black tabular-nums",
                  netCashflow >= 0 ? "text-neon" : "text-red-400"
                )}
              >
                {netCashflow >= 0 ? "+" : ""}
                {formatRupiah(netCashflow)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =======================================================================
          RIGHT COLUMN: COMPONENT B & COMPONENT C
         ======================================================================= */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        {/* Component B: Komposisi Sumber Pemasukan */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-neon/15 text-neon">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">Sumber Pemasukan</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribusi pendapatan bulan berjalan
            </p>
          </CardHeader>

          <CardContent className="space-y-3 pb-5">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-full h-[170px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={hasRevenueData ? 4 : 0}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="var(--card)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Masuk
                </span>
                <span className="text-xs font-black text-foreground tabular-nums">
                  {formatRupiah(totalIncomeMonth)}
                </span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 pt-1">
              {revenueStreams.map((stream) => (
                <div
                  key={stream.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-card-border/50 text-xs hover:border-card-border transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stream.color }}
                    />
                    <span className="font-medium text-foreground">{stream.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground tabular-nums">
                      {formatRupiah(stream.value)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] tabular-nums font-bold px-1.5 py-0 border-card-border"
                    >
                      {stream.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Component C: Savings Rate Health Gauge */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">Kesehatan Tabungan</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rasio tabungan & net akumulasi kas
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pb-5">
            <div className="flex items-center gap-4">
              {/* Circular Visual Meter */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-card-border/80"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={statusBadge.gaugeColor}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-foreground tabular-nums">
                    {savingsRate}%
                  </span>
                  <span className="text-[8px] font-semibold uppercase text-muted-foreground tracking-wider">
                    Tabungan
                  </span>
                </div>
              </div>

              {/* Status Badge & Target Info */}
              <div className="space-y-2 flex-1">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all",
                    statusBadge.badgeClass
                  )}
                >
                  {statusBadge.icon}
                  <span>{statusBadge.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Target rasio tabungan ideal minimal 20% dari total pemasukan per bulan.
                </p>
              </div>
            </div>

            {/* Net Cashflow Monthly Indicator */}
            <div className="p-3 rounded-2xl bg-background/60 border border-card-border/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block">
                  Net tabungan bulan ini
                </span>
                <span
                  className={cn(
                    "text-base font-black tabular-nums tracking-tight",
                    netCashflow >= 0 ? "text-neon" : "text-red-400"
                  )}
                >
                  {netCashflow >= 0 ? "+" : ""}
                  {formatRupiah(netCashflow)}
                </span>
              </div>
              <div
                className={cn(
                  "p-2 rounded-xl flex items-center justify-center",
                  netCashflow >= 0 ? "bg-neon/15 text-neon" : "bg-red-500/15 text-red-400"
                )}
              >
                {netCashflow >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FinancialAnalytics;
