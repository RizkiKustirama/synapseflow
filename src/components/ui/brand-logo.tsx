"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoVariant =
  | "landscape"
  | "emblem-sidebar"
  | "emblem"
  | "white-bg"
  | "black-bg"
  | "green-bg"
  | "svg";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BrandLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showText?: boolean;
  href?: string;
  priority?: boolean;
}

const SIZE_CONFIG = {
  landscape: {
    xs: { width: 120, height: 36, class: "h-9 w-auto" },
    sm: { width: 150, height: 45, class: "h-11 w-auto" },
    md: { width: 190, height: 57, class: "h-14 w-auto" },
    lg: { width: 230, height: 69, class: "h-16 w-auto" },
    xl: { width: 280, height: 84, class: "h-20 w-auto" },
  },
  emblem: {
    xs: { width: 28, height: 28, class: "w-7 h-7" },
    sm: { width: 36, height: 36, class: "w-9 h-9" },
    md: { width: 40, height: 40, class: "w-10 h-10" },
    lg: { width: 48, height: 48, class: "w-12 h-12" },
    xl: { width: 64, height: 64, class: "w-16 h-16" },
  },
};

export function BrandLogo({
  variant = "emblem-sidebar",
  size = "md",
  className,
  showText = true,
  href = "/",
  priority = false,
}: BrandLogoProps) {
  // 1. Landscape variant with automated theme matching (Light mode: white bg, Dark mode: black bg)
  if (variant === "landscape") {
    const config = SIZE_CONFIG.landscape[size];
    const content = (
      <div className={cn("inline-flex items-center", className)}>
        {/* Light Mode Landscape Logo */}
        <Image
          src="/logo/landscape-logo-text-white-bg.jpg"
          alt="SynapseFlow Logo"
          width={config.width}
          height={config.height}
          priority={priority}
          className={cn("dark:hidden object-contain rounded-xl", config.class)}
        />
        {/* Dark Mode Landscape Logo */}
        <Image
          src="/logo/landscape-logo-text-black-bg.jpg"
          alt="SynapseFlow Logo"
          width={config.width}
          height={config.height}
          priority={priority}
          className={cn("hidden dark:block object-contain rounded-xl", config.class)}
        />
      </div>
    );

    return href ? (
      <Link href={href} className="inline-block transition-transform hover:opacity-95">
        {content}
      </Link>
    ) : (
      content
    );
  }

  // 2. Sidebar variant (Desktop and Mobile Drawer on dark pine forest background)
  if (variant === "emblem-sidebar") {
    const config = SIZE_CONFIG.emblem[size];
    const content = (
      <div className={cn("flex items-center gap-3 select-none", className)}>
        <div
          className={cn(
            "rounded-xl overflow-hidden bg-[#071309] border border-emerald-500/30 ring-1 ring-white/10 flex items-center justify-center shadow-lg shadow-black/40 shrink-0 transition-transform group-hover:scale-105 p-0.5",
            config.class
          )}
        >
          <Image
            src="/logo/black-bg-green-logo.png"
            alt="SynapseFlow Emblem"
            width={config.width}
            height={config.height}
            priority={priority}
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(37,221,89,0.4)]"
          />
        </div>
        {showText && (
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white uppercase leading-none font-sans">
              SYNAPSE<span className="text-[#25dd59]">FLOW</span>
            </span>
            <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase mt-0.5">
              Operating System
            </span>
          </div>
        )}
      </div>
    );

    return href ? (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    ) : (
      content
    );
  }

  // 3. Specific palette variants
  let logoSrc = "/logo/black-bg-green-logo.png";
  if (variant === "white-bg") {
    logoSrc = "/logo/white-bg-green-logo.png";
  } else if (variant === "green-bg") {
    logoSrc = "/logo/green-bg-black-logo.png";
  } else if (variant === "svg") {
    logoSrc = "/logo/logo.svg";
  }

  const config = SIZE_CONFIG.emblem[size];
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "rounded-xl overflow-hidden shadow-sm shrink-0 border border-card-border/60 transition-transform",
          config.class
        )}
      >
        <Image
          src={logoSrc}
          alt="SynapseFlow Logo"
          width={config.width}
          height={config.height}
          priority={priority}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className="text-base font-extrabold tracking-tight text-foreground uppercase">
          Synapse<span className="text-neon">Flow</span>
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
}
