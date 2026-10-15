import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--card-border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          accent: "var(--sidebar-accent)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
          border: "var(--card-border)",
          inner: "var(--card-inner)",
          "border-subtle": "var(--card-border-subtle)",
        },
        hero: {
          bg: "var(--hero-card-bg)",
          fg: "var(--hero-card-fg)",
        },
        neon: {
          DEFAULT: "var(--neon-accent)",
          glow: "rgba(43, 240, 98, 0.35)",
        },
        muted: {
          DEFAULT: "var(--muted-text)",
          foreground: "var(--muted-text)",
        },
        badge: {
          processing: "var(--badge-processing)",
          done: "var(--badge-done)",
          pending: "var(--badge-pending)",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "2.5xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
