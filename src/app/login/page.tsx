"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { loginUser } from "@/actions/auth.actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal masuk. Periksa kembali email dan password Anda.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan server. Silakan coba kembali dalam beberapa saat.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-card border border-card-border shadow-xl backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground">Masuk ke Akun Anda</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Masukkan kredensial terdaftar untuk melanjutkan ke dashboard
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-background border border-card-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-neon transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-background border border-card-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-neon transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 rounded-xl bg-neon hover:bg-neon/90 text-black font-bold text-xs shadow-lg shadow-neon/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span>Memproses Otentikasi...</span>
          ) : (
            <>
              <span>Masuk ke SynapseFlow</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-card-border/60 text-center">
        <p className="text-xs text-muted-foreground">
          Belum memiliki akun terdaftar?{" "}
          <Link
            href="/register"
            className="font-bold text-neon hover:underline"
          >
            Daftar Akun Baru
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Ambient Cyber-Forest background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-700/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Tenant Enterprise OS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Synapse<span className="text-neon">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Masuk ke personal operating system untuk mengelola karier, pekerjaan kantor, freelance, dan arus kas.
          </p>
        </div>

        {/* Auth Form with Suspense Boundary for useSearchParams */}
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-muted-foreground bg-card border border-card-border rounded-3xl">
              Memuat antarmuka otentikasi...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Privacy & Tenant notice */}
        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          Setiap tenant memiliki database terisolasi. Seluruh sesi dilindungi enkripsi JWT HS256 & HTTP-only cookies.
        </p>
      </div>
    </div>
  );
}
