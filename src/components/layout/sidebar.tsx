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
  },
  {
    title: "Career",
    href: "/career",
    icon: Briefcase,
  },
  {
    title: "Employment",
    href: "/employment",
    icon: Building2,
  },
  {
    title: "Freelance",
    href: "/freelance",
    icon: FolderGit2,
  },
  {
    title: "Money Ledger",
    href: "/money",
    icon: Wallet,
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
        "hidden lg:flex flex-col w-[260px] flex-shrink-0 bg-sidebar text-sidebar-foreground rounded-[2rem] p-5 my-2.5 ml-2.5 h-[calc(100vh-1.25rem)] shadow-xl relative select-none border border-white/10 transition-all duration-300",
        className
      )}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center gap-2.5 px-1 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-[#187413] dark:text-[#187413] text-lg tracking-tighter shadow-sm">
          S
        </div>
        <span className="text-xl font-extrabold tracking-wider text-white uppercase">
          SYNAPSEFLOW
        </span>
      </div>

      {/* User Profile Card with Circular Progress Meter */}
      <div className="flex flex-col items-center my-1 text-center w-full">
        <div className="relative w-20 h-20 mb-2">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              fill="transparent"
              r="44"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              fill="transparent"
              r="44"
              stroke="#ffffff"
              strokeDasharray="276"
              strokeDashoffset="65"
              strokeLinecap="round"
              strokeWidth="4.5"
            />
          </svg>
          <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-white/60 bg-[#144721] flex items-center justify-center shadow-inner text-sm font-black text-white uppercase">
            {initials}
          </div>
        </div>

        <h3 className="font-bold text-sm text-white tracking-tight truncate max-w-[200px]" title={displayName}>
          {displayName}
        </h3>
        <p className="text-[11px] text-white/80 font-medium mb-1 truncate max-w-[180px]" title={displayEmail}>
          {displayEmail}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-semibold text-white">
          <span className="text-yellow-300">★</span> 7.5
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="w-full mt-5 flex-1 flex flex-col gap-1 overflow-y-auto">
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
                "flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-200 text-sm",
                isActive
                  ? "bg-background text-foreground font-bold shadow-md"
                  : "text-white/85 hover:bg-white/10 hover:text-white font-medium"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-neon" : "opacity-80"
                )}
              />
              <span className="tracking-wide">{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
          Preferences
        </div>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3.5 px-4 py-2.5 rounded-2xl transition-all duration-200 text-sm",
            pathname === "/settings"
              ? "bg-background text-foreground font-bold shadow-md"
              : "text-white/85 hover:bg-white/10 hover:text-white font-medium"
          )}
        >
          <Settings
            className={cn(
              "w-4 h-4 transition-colors",
              pathname === "/settings" ? "text-neon" : "opacity-80"
            )}
          />
          <span className="tracking-wide">Settings</span>
        </Link>
      </nav>

      {/* Bottom Card: Workspace Connected Info & Logout */}
      <div className="mt-auto pt-3 border-t border-white/15 flex flex-col items-center text-center">
        <div className="flex items-center -space-x-1.5 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-[#187413] dark:border-[#187413] flex items-center justify-center text-[10px] font-bold text-emerald-900">
            SF
          </div>
          <div className="w-8 h-8 rounded-full bg-white border-2 border-[#187413] dark:border-[#187413] flex items-center justify-center text-[11px] font-bold text-emerald-900 shadow">
            OS
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-950 text-white border-2 border-[#187413] dark:border-[#187413] flex items-center justify-center text-[10px] font-bold">
            4
          </div>
        </div>

        <p className="text-xs font-semibold text-white/95 leading-tight">
          SynapseFlow Workspace
          <br />
          <span className="font-normal opacity-85 text-[10px]">
            4 Modules Connected
          </span>
        </p>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-black/20 hover:bg-rose-500/25 text-white/80 hover:text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isLoggingOut ? "Keluar..." : "Keluar (Logout)"}</span>
        </button>
      </div>
    </aside>
  );
}
