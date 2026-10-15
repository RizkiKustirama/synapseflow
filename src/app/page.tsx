"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getExecutiveDashboardData,
  toggleDashboardTaskStatus,
  ExecutiveDashboardData,
} from "@/actions/dashboard.actions";
import { HeroWelcomeCard } from "@/components/dashboard/hero-welcome-card";
import { FinancialAnalytics } from "@/components/dashboard/financial-analytics";
import { BentoWidgetGrid } from "@/components/dashboard/bento-widget-grid";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { StitchHighlightRow } from "@/components/dashboard/stitch-highlight-row";
import { StitchCalendarStrip } from "@/components/dashboard/stitch-calendar-strip";
import { StitchWorkstreams } from "@/components/dashboard/stitch-workstreams";

export default function DashboardPage() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const res = await getExecutiveDashboardData();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      const msg = err instanceof Error ? err.message : "Gagal memuat data dashboard.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Listen to global quick-add and cross-module transactions
    const handleRefresh = () => {
      loadDashboardData();
    };

    window.addEventListener("synapseflow:transaction-created", handleRefresh);
    return () => {
      window.removeEventListener("synapseflow:transaction-created", handleRefresh);
    };
  }, [loadDashboardData]);

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    // Optimistic local update
    if (data) {
      const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE";
      setData({
        ...data,
        todaysTasks: data.todaysTasks.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        ),
      });
    }

    try {
      await toggleDashboardTaskStatus(taskId, currentStatus);
      // Background reload to ensure exact sync
      loadDashboardData();
    } catch (err) {
      console.error("Error toggling task status:", err);
      // Rollback
      loadDashboardData();
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8 rounded-3xl bg-card border border-rose-500/20 text-center space-y-4 max-w-lg mx-auto mt-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Kendala Sinkronisasi</h2>
          <p className="text-sm text-muted-foreground">
            {error || "Tidak dapat memuat ringkasan eksekutif dashboard."}
          </p>
        </div>
        <Button
          onClick={() => {
            setLoading(true);
            loadDashboardData();
          }}
          className="bg-neon text-black hover:bg-neon/90 font-bold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Muat Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* =======================================================================
          STITCH 2-COLUMN MAIN DASHBOARD GRID (xl:grid-cols-12)
         ======================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* =====================================================================
            LEFT COLUMN (xl:col-span-7): Hero Welcome Banner + Office Tasks
           ===================================================================== */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* 1. Hero Greeting Banner */}
          <HeroWelcomeCard
            user={data.user}
            metrics={data.metrics}
            upcomingInterviewsCount={data.upcomingInterviews.length}
            pendingMilestonesCount={data.activeDeliverables.length}
          />

          {/* 2. Office Tasks & Deliverables Card */}
          <BentoWidgetGrid
            fourPillars={data.fourPillars}
            todaysTasks={data.todaysTasks}
            upcomingInterviews={data.upcomingInterviews}
            activeDeliverables={data.activeDeliverables}
            recentTransactions={data.recentTransactions}
            onTaskToggle={handleTaskToggle}
          />
        </div>

        {/* =====================================================================
            RIGHT COLUMN (xl:col-span-5): 3 Highlight Cards + Calendar + Workstreams
           ===================================================================== */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* 3. Row of 3 Highlight Cards */}
          <StitchHighlightRow
            savingsRate={data.metrics.savingsRate}
            netCashflow={data.metrics.netCashflow}
            freelanceReceivables={data.metrics.freelanceReceivables}
            activeProjectsCount={data.fourPillars.freelance.activeProjectsCount}
            activeInterviewsCount={data.fourPillars.career.activeInterviews}
            totalApplicationsCount={data.fourPillars.career.totalApplications}
            topTargetRole={data.fourPillars.career.topTarget}
          />

          {/* 4. Calendar Strip Widget */}
          <StitchCalendarStrip
            payday={data.metrics.nextPayday?.payday || 25}
            daysRemaining={data.metrics.nextPayday?.daysRemaining}
          />

          {/* 5. Synapse Workstreams (4 Core Pillars Active) */}
          <StitchWorkstreams fourPillars={data.fourPillars} />
        </div>
      </div>

      {/* =======================================================================
          FINANCIAL ANALYTICS SUITE (6-Month Cashflow History & Revenue Streams)
         ======================================================================= */}
      <FinancialAnalytics
        cashflowHistory={data.cashflowHistory}
        revenueStreams={data.revenueStreams}
        savingsRate={data.metrics.savingsRate}
        netCashflow={data.metrics.netCashflow}
        totalIncomeMonth={data.metrics.currentMonthIncome}
        totalExpenseMonth={data.metrics.currentMonthExpense}
      />
    </div>
  );
}
