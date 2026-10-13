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
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onOpenQuickAdd: () => void;
}

const navItems = [
  { title: "Home", href: "/", icon: LayoutDashboard },
  { title: "Career", href: "/career", icon: Briefcase },
  { title: "Jobs", href: "/employment", icon: Building2 },
  { title: "Freelance", href: "/freelance", icon: FolderGit2 },
  { title: "Money", href: "/money", icon: Wallet },
];

export function MobileBottomNav({ onOpenQuickAdd }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Floating Action Button (Quick Add) */}
      <button
        onClick={onOpenQuickAdd}
        className="lg:hidden fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-neon text-black shadow-[0_4px_20px_rgba(59,240,41,0.5)] active:scale-95 transition-transform"
        aria-label="Quick Add Transaction"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 bg-card/95 backdrop-blur-lg border-t border-card-border px-2 pb-safe">
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
                "flex flex-col items-center justify-center w-full h-full text-[10px] font-medium transition-colors",
                isActive
                  ? "text-neon font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-xl transition-all",
                  isActive && "bg-neon/15"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="mt-0.5">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
