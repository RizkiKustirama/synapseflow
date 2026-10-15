"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RightPanel } from "@/components/layout/right-panel";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { QuickAddModal } from "@/components/money/quick-add-modal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Global keyboard shortcut: Alt + N (Quick Add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setQuickAddOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // For public auth pages (login / register), render clean layout without navigation chrome
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. Desktop Left Sidebar */}
      <Sidebar />

      {/* 2. Mobile Slide-over Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* 3. Center Canvas Column (Header + Main Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-[1440px] mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* 4. Desktop Right Panel (Calendar, Payday, Milestones) for sub-pages */}
      {pathname !== "/" && <RightPanel />}

      {/* 5. Mobile Bottom Navigation + Floating Quick-Add */}
      <MobileBottomNav onOpenQuickAdd={() => setQuickAddOpen(true)} />

      {/* 6. Global Quick-Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={() => {
          router.refresh();
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("synapseflow:transaction-created")
            );
          }
        }}
      />
    </div>
  );
}
