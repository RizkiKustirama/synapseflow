"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  Plus,
  Briefcase,
  Building2,
  FolderGit2,
  Wallet,
  PieChart,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenQuickAdd?: () => void;
  className?: string;
}

const SEARCH_ITEMS = [
  { title: "Buku Kas & Transaksi", href: "/money", icon: Wallet, group: "Keuangan" },
  { title: "Anggaran Kategori Bulanan", href: "/money/budgets", icon: PieChart, group: "Keuangan" },
  { title: "Pipeline Karier & Lamaran", href: "/career", icon: Briefcase, group: "Karier" },
  { title: "Pekerjaan Kantor & Kontrak", href: "/employment", icon: Building2, group: "Kantor" },
  { title: "Proyek Freelance & Piutang", href: "/freelance", icon: FolderGit2, group: "Freelance" },
  { title: "Pengaturan Akun & Sistem", href: "/settings", icon: Settings, group: "Sistem" },
];

export function Header({ onToggleMobileMenu, onOpenQuickAdd, className }: HeaderProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode || true);
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
    }

    // Keyboard shortcut: Ctrl+K or / to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const filteredItems = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

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
          className="lg:hidden p-2.5 rounded-full text-foreground hover:bg-card border border-card-border transition-colors"
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
        {/* Functional Search Bar with Dropdown */}
        <div ref={searchContainerRef} className="relative hidden md:flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Cari modul, proyek, kas (Ctrl+K)..."
            className="w-64 lg:w-80 h-10 pl-10 pr-12 text-xs rounded-full bg-card border border-card-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon/40 shadow-sm transition-all"
          />
          <kbd className="absolute right-3 hidden lg:inline-block px-1.5 py-0.5 bg-card-border/60 text-[10px] font-mono text-muted-foreground rounded border border-card-border">
            Ctrl+K
          </kbd>

          {/* Quick Search Palette Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-12 left-0 w-80 lg:w-96 rounded-[1.5rem] bg-card border border-card-border shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-card-border/60 flex items-center justify-between">
                <span>Navigasi Cepat</span>
                <span className="text-neon flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> SynapseFlow
                </span>
              </div>
              <div className="py-1.5 max-h-64 overflow-y-auto space-y-1">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleSelectItem(item.href)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-card-inner hover:border-card-border-subtle border border-transparent transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-card-border/40 flex items-center justify-center text-neon group-hover:bg-neon/20 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground group-hover:text-neon transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {item.group}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-neon group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    Tidak ada modul yang cocok dengan &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Quick-Add Transaction Button */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-neon hover:bg-neon/90 text-black text-xs font-bold shadow-sm hover:shadow-[0_0_15px_rgba(43,240,98,0.35)] transition-all cursor-pointer"
            title="Catat Cepat Transaksi (Alt+N)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Catat Cepat</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.2 bg-black/20 text-[9px] font-mono text-black/80 rounded border border-black/20">
              Alt+N
            </kbd>
          </button>
        )}

        {/* Theme Toggle (Light / Dark mode) */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-card-border text-foreground hover:border-neon/40 hover:text-neon shadow-sm transition-all cursor-pointer"
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
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-card border border-card-border text-foreground hover:border-neon/40 hover:text-neon shadow-sm transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-neon animate-pulse" />
        </button>
      </div>
    </header>
  );
}
