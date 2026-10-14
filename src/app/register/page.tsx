"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live password complexity checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok dengan password yang dimasukkan.");
      return;
    }

    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) {
      setErrorMessage("Password belum memenuhi syarat keamanan (minimal 8 karakter, huruf besar, huruf kecil, angka).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal mendaftarkan akun. Silakan coba kembali.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan server. Silakan coba beberapa saat lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Ambient Cyber-Forest background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neon/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-700/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Tenant Enterprise OS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Synapse<span className="text-neon">Flow</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Daftarkan akun personal operating system baru untuk mengelola seluruh pilar karier dan finansial Anda.
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-card-border shadow-xl backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground">Registrasi Akun Baru</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ruang kerja dan buku kas baru akan diinisialisasi otomatis untuk Anda
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
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-background border border-card-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-neon transition-colors"
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-background border border-card-border text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:border-neon transition-colors"
                />
              </div>
            </div>

            {/* Password Requirement Checklist */}
            <div className="p-3 rounded-xl bg-background border border-card-border/70 space-y-1.5 text-[11px]">
              <div className="font-semibold text-muted-foreground mb-1">
                Persyaratan Keamanan Password:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-muted-foreground">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-neon font-medium" : ""}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Min. 8 Karakter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? "text-neon font-medium" : ""}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 Huruf Besar</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? "text-neon font-medium" : ""}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 Huruf Kecil</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-neon font-medium" : ""}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1 Angka</span>
                </div>
              </div>
              {confirmPassword.length > 0 && (
                <div className={`pt-1 border-t border-card-border/40 flex items-center gap-1.5 ${isMatch ? "text-neon font-medium" : "text-rose-400 font-medium"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isMatch ? "Password cocok" : "Password belum cocok"}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-neon hover:bg-neon/90 text-black font-bold text-xs shadow-lg shadow-neon/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Mendaftarkan Akun...</span>
              ) : (
                <>
                  <span>Daftar & Inisialisasi Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-card-border/60 text-center">
            <p className="text-xs text-muted-foreground">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                href="/login"
                className="font-bold text-neon hover:underline"
              >
                Masuk ke Akun
              </Link>
            </p>
          </div>
        </div>

        {/* Security notice */}
        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          Setiap tenant memiliki isolasi data mandiri. Password disimpan dengan enkripsi bcrypt standar industri.
        </p>
      </div>
    </div>
  );
}
