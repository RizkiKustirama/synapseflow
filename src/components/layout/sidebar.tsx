"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  FolderGit2,
  Wallet,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    badge: "3",
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
    badge: "2",
  },
  {
    title: "Money Ledger",
    href: "/money",
    icon: Wallet,
    badge: undefined,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-accent/30 p-4 select-none z-30 transition-all",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4">
        {/* Möbius Ribbon Logo */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-lime-500 to-neon shadow-[0_0_20px_rgba(59,240,41,0.3)]">
          <div className="w-5 h-5 rounded-full border-2 border-white/90 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight">
            Synapse<span className="text-neon">Flow</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">
            Semi-ERP OS
          </span>
        </div>
      </div>

      {/* User Level Profile Card */}
      <div className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Avatar with Circular Ring Progress */}
          <div className="relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="125.6"
                strokeDashoffset="35.1"
                className="text-neon transition-all duration-1000"
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-emerald-800 to-black border-2 border-sidebar-foreground/20 flex items-center justify-center text-xs font-bold text-white">
              SF
            </div>
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">
                Alex Pratama
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon/20 text-neon font-bold">
                Lv. 7
              </span>
            </div>
            <span className="text-[11px] text-white/60 truncate">
              Senior Fullstack
            </span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-neon h-full rounded-full transition-all duration-700"
                style={{ width: "72%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Main Modules
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

              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded-full transition-all",
                    isActive
                      ? "bg-neon text-black"
                      : "bg-white/10 text-white group-hover:bg-neon/20 group-hover:text-neon"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
          Preferences
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
      </nav>

      {/* Footer Banner / Community Card */}
      <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-neon/20 text-neon">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Synapse Pro</span>
            <span className="text-[11px] text-white/60 leading-tight mt-0.5">
              Multi-tenant sync active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
