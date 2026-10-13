"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, Moon, Sun, Menu, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenQuickAdd?: () => void;
  className?: string;
}

export function Header({ onToggleMobileMenu, onOpenQuickAdd, className }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial dark mode from document or localStorage
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode || true);
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-card-border transition-colors",
        className
      )}
    >
      {/* Left: Mobile Menu Trigger + Date badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-foreground hover:bg-card border border-card-border transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">
            {todayStr}
          </span>
          <span className="text-sm font-bold text-foreground">
            Workspace Hub
          </span>
        </div>
      </div>

      {/* Center / Right: Global Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Pill Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, jobs, cashflow..."
            className="w-64 lg:w-80 h-9 pl-10 pr-4 text-xs rounded-full bg-card border border-card-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon/40 transition-all"
          />
        </div>

        {/* Desktop Quick-Add Transaction Button */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon/15 hover:bg-neon/25 text-neon border border-neon/40 text-xs font-bold transition-all"
            title="Catat Cepat Transaksi (Alt+N)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Catat Cepat</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.2 bg-black/40 text-[9px] font-mono text-neon/80 rounded border border-neon/30">
              Alt+N
            </kbd>
          </button>
        )}

        {/* Theme Toggle (Light / Dark mode) */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-card border border-card-border text-foreground hover:border-neon/40 hover:text-neon transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl bg-card border border-card-border text-foreground hover:border-neon/40 hover:text-neon transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon animate-pulse" />
        </button>
      </div>
    </header>
  );
}
