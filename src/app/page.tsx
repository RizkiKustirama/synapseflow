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
      {/* 1. High-Contrast Hero Welcome Banner & 3D Cyber Mascot */}
      <HeroWelcomeCard
        user={data.user}
        metrics={data.metrics}
        upcomingInterviewsCount={data.upcomingInterviews.length}
        pendingMilestonesCount={data.activeDeliverables.length}
      />

      {/* 2. Recharts Financial Analytics Suite */}
      <FinancialAnalytics
        cashflowHistory={data.cashflowHistory}
        revenueStreams={data.revenueStreams}
        savingsRate={data.metrics.savingsRate}
        netCashflow={data.metrics.netCashflow}
        totalIncomeMonth={data.metrics.currentMonthIncome}
        totalExpenseMonth={data.metrics.currentMonthExpense}
      />

      {/* 3. The 4 Core Pillars Bento Grid & Operational Streams */}
      <BentoWidgetGrid
        fourPillars={data.fourPillars}
        todaysTasks={data.todaysTasks}
        upcomingInterviews={data.upcomingInterviews}
        activeDeliverables={data.activeDeliverables}
        recentTransactions={data.recentTransactions}
        onTaskToggle={handleTaskToggle}
      />
    </div>
  );
}
