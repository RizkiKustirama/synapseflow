"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Briefcase,
  Building2,
  FolderGit2,
  Wallet,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { title: "Dashboard Overview", href: "/", icon: LayoutDashboard },
  { title: "Career Pipeline", href: "/career", icon: Briefcase },
  { title: "Employment (Kerja Kantor)", href: "/employment", icon: Building2 },
  { title: "Freelance & Projects", href: "/freelance", icon: FolderGit2 },
  { title: "Money & Cashflow Ledger", href: "/money", icon: Wallet },
  { title: "Settings & System", href: "/settings", icon: Settings },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-sidebar text-sidebar-foreground p-5 shadow-2xl z-10 transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div onClick={onClose}>
            <BrandLogo variant="emblem-sidebar" size="md" showText={true} href="/" />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-5 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#2bf062"
                  strokeWidth="3"
                  strokeDasharray="125.6"
                  strokeDashoffset="31.4"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-white text-xs">
                AP
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-white text-black text-[9px] font-black shadow-sm">
                ★ 7.5
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">Alex Pratama</p>
              <p className="text-[11px] text-white/70 truncate">Fullstack Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
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
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white font-semibold shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-neon" : "text-white/60"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between">
          <span>SynapseFlow v1.0</span>
          <span className="text-neon flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Ready
          </span>
        </div>
      </div>
    </div>
  );
}
