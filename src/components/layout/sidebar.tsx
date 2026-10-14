"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  FolderGit2,
  Wallet,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, logoutUser, AuthUser } from "@/actions/auth.actions";

interface SidebarProps {
  className?: string;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    title: "Career",
    href: "/career",
    icon: Briefcase,
    badge: undefined,
  },
  {
    title: "Employment",
    href: "/employment",
    icon: Building2,
    badge: undefined,
  },
  {
    title: "Freelance",
    href: "/freelance",
    icon: FolderGit2,
    badge: undefined,
  },
  {
    title: "Money",
    href: "/money",
    icon: Wallet,
    badge: undefined,
  },
];

function getInitials(name: string): string {
  if (!name) return "SF";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (userData) setUser(userData);
    });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.fullName || "Pengguna Synapse";
  const displayEmail = user?.email || "multi-tenant@synapse.app";
  const initials = getInitials(displayName);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 transition-all duration-300",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-neon/20 text-neon border border-neon/40 shadow-sm shadow-neon/20">
          <div className="w-4 h-4 rounded-full bg-neon animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tight text-white leading-none">
            Synapse<span className="text-neon">Flow</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mt-1">
            Personal OS
          </span>
        </div>
      </div>

      {/* User Mini Profile Card */}
      <div className="p-3 mb-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r="17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="106.8"
                strokeDashoffset="26.7"
                className="text-neon transition-all duration-1000"
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-emerald-800 to-black border border-white/20 flex items-center justify-center text-[11px] font-bold text-white uppercase">
              {initials}
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate" title={displayName}>
                {displayName}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neon/20 text-neon font-bold">
                Aktif
              </span>
            </div>
            <span className="text-[10px] text-white/60 truncate mt-0.5" title={displayEmail}>
              {displayEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Modul Utama
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/15 text-white font-semibold shadow-sm backdrop-blur-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-neon"
                      : "text-white/60 group-hover:text-neon"
                  )}
                />
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Preferensi & Akun
        </div>

        <Link
          href="/settings"
          className={cn(
            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-white/15 text-white font-semibold"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-white/60" />
            <span>Settings</span>
          </div>
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? "Keluar..." : "Keluar (Logout)"}</span>
        </button>
      </nav>

      {/* Footer Banner */}
      <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-neon/20 text-neon">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Multi-Tenant OS</span>
            <span className="text-[11px] text-white/60 leading-tight mt-0.5">
              Isolasi database aktif
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
