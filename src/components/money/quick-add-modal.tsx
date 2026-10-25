"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Sparkles,
  Plus,
  Clipboard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRupiah } from "@/lib/utils";
import {
  getCategories,
  createTransaction,
  createCategory,
  StoredCategory,
} from "@/actions/money.actions";
import { parseTransactionTextAction } from "@/actions/money-parser.actions";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_COLORS = ["#3BF029", "#F97316", "#3B82F6", "#EC4899", "#A855F7", "#EAB308"];

export function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [categories, setCategories] = useState<StoredCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Smart Natural Input states
  const [naturalText, setNaturalText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseNotice, setParseNotice] = useState<string | null>(null);

  // Inline Category Creator states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Load categories dynamically
  const loadCategories = useCallback(async (targetType?: "EXPENSE" | "INCOME") => {
    const activeType = targetType || type;
    const list = await getCategories(activeType);
    setCategories(list);
    return list;
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      loadCategories().then((list) => {
        if (!selectedCategory && list.length > 0) {
          setSelectedCategory(list[0].id);
        }
      });
      setNaturalText("");
      setParseNotice(null);
      setIsAddingCategory(false);
      setNewCatName("");
    }
  }, [isOpen, loadCategories]);

  if (!isOpen) return null;

  const quickAmounts = [10000, 25000, 50000, 100000, 500000];

  const handleAddQuickAmount = (val: number) => {
    const current = parseInt(amount.replace(/[^0-9]/g, "") || "0", 10);
    setAmount((current + val).toString());
  };

  const handlePasteClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setNaturalText(text);
        }
      }
    } catch {
      // Browser permission blocked, user can still type or paste manually
    }
  };

  const handleSmartParse = async () => {
    const cleanNatural = naturalText.trim();
    if (!cleanNatural) return;

    setIsParsing(true);
    setParseNotice(null);
    try {
      const res = await parseTransactionTextAction(cleanNatural);
      if (res.success && res.data) {
        const d = res.data;
        setType(d.type);

        if (d.amount !== null && d.amount !== undefined) {
          setAmount(d.amount.toString());
        }
        if (d.description) {
          setDescription(d.description);
        }
        if (d.date) {
          setDate(d.date);
        }

        // Fetch categories matching detected type
        const updatedCats = await loadCategories(d.type);

        if (d.categoryId) {
          setSelectedCategory(d.categoryId);
          const engineName = res.source === "AI_GEMINI" ? "AI Gemini" : "Local Engine";
          setParseNotice(`Data terisi via ${engineName}: Kategori "${d.categoryName}"`);
        } else {
          // If category is not matched or ambiguous, leave it unselected per user instruction
          setSelectedCategory("");
          const engineName = res.source === "AI_GEMINI" ? "AI Gemini" : "Local Engine";
          setParseNotice(
            `Data terisi via ${engineName}. Kategori belum terdeteksi, silakan pilih kategori di bawah atau buat baru.`
          );
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Gagal mengekstrak teks transaksi";
      setParseNotice(`Terjadi kesalahan: ${errMsg}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleTypeChange = (newType: "EXPENSE" | "INCOME") => {
    setType(newType);
    setIsAddingCategory(false);
    loadCategories(newType).then((list) => {
      // Check if current selectedCategory belongs to new type list
      const exists = list.some((c) => c.id === selectedCategory);
      if (!exists) {
        setSelectedCategory(list.length > 0 ? list[0].id : "");
      }
    });
  };

  const handleSaveNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCatName = newCatName.replace(/[<>]/g, "").trim();
    if (!cleanCatName) return;

    setIsSavingCategory(true);
    try {
      const res = await createCategory({
        name: cleanCatName,
        type,
        color: newCatColor,
        icon: "tag",
      });

      if (res.success && res.data) {
        await loadCategories(type);
        setSelectedCategory(res.data.id);
        setIsAddingCategory(false);
        setNewCatName("");
      }
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    const cleanDescription = description.replace(/[<>]/g, "").trim();
    if (!numAmount || numAmount <= 0 || !cleanDescription || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      await createTransaction({
        categoryId: selectedCategory,
        type,
        amount: numAmount,
        date: new Date(date).toISOString(),
        description: cleanDescription,
        sourceType: "MANUAL",
      });

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        setAmount("");
        setDescription("");
        setNaturalText("");
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 z-10 transition-transform max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-card-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neon/15 text-neon flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Quick-Add Transaksi
              </h3>
              <p className="text-xs text-muted-foreground">
                Catat pengeluaran / pemasukan dengan teks alami
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-card-inner border border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successNotice ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-neon/20 border-2 border-neon text-neon flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Transaksi Berhasil Disimpan!
            </p>
            <p className="text-xs text-muted-foreground">
              Saldo otomatis disinkronkan ke buku kas terpadu
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Smart Natural Input Section */}
            <div className="p-3.5 rounded-2xl bg-card-inner border border-card-border/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-neon" /> Smart Natural Text Auto-Fill
                </span>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="text-neon hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  <Clipboard className="w-3 h-3" /> Tempel
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Ketik: 'beli makan siang 45rb' atau 'fee freelance 2.5jt'..."
                  value={naturalText}
                  onChange={(e) => setNaturalText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSmartParse();
                    }
                  }}
                  className="h-10 text-xs rounded-xl bg-card border-card-border focus-visible:ring-neon/30 text-foreground"
                />
                <Button
                  type="button"
                  onClick={handleSmartParse}
                  disabled={isParsing || !naturalText.trim()}
                  className="h-10 px-4 rounded-xl text-xs font-extrabold bg-neon text-black hover:bg-neon/90 shrink-0"
                >
                  {isParsing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Ekstrak"
                  )}
                </Button>
              </div>

              {parseNotice && (
                <p className="text-[11px] font-medium text-neon animate-in fade-in leading-relaxed">
                  {parseNotice}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector (Pills) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-card-inner rounded-full border border-card-border-subtle shadow-sm">
                <button
                  type="button"
                  onClick={() => handleTypeChange("EXPENSE")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all",
                    type === "EXPENSE"
                      ? "bg-red-500/20 text-red-400 font-extrabold border border-red-500/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange("INCOME")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all",
                    type === "INCOME"
                      ? "bg-neon text-black font-extrabold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  Pemasukan
                </button>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Nominal (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-lg font-extrabold tabular-nums tracking-wide h-12 rounded-2xl bg-card-inner border-card-border focus-visible:ring-neon/30"
                    required
                  />
                </div>

                {/* Quick Chip Adders */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAddQuickAmount(q)}
                      className="px-3 py-1.5 rounded-full bg-card-inner hover:bg-card border border-card-border-subtle text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                    >
                      +{formatRupiah(q).replace("Rp", "").trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Deskripsi
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: Kopi susu, Server AWS..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl bg-card-inner border-card-border focus-visible:ring-neon/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl bg-card-inner border-card-border focus-visible:ring-neon/30"
                    required
                  />
                </div>
              </div>

              {/* Category Selector with Inline Creation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Kategori
                  </label>
                  {!selectedCategory && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      * Pilih atau buat kategori
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-card-border/50 rounded-2xl bg-card-inner/30">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border text-left transition-all",
                          isSelected
                            ? "bg-card border-neon text-foreground font-bold shadow-sm ring-1 ring-neon/40"
                            : "bg-card-inner border-card-border-subtle text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}

                  {/* Inline + Kategori Baru Trigger Button */}
                  {!isAddingCategory && (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border border-dashed border-card-border text-muted-foreground hover:text-foreground hover:border-neon/40 transition-all bg-card-inner/50"
                    >
                      <Plus className="w-3.5 h-3.5 text-neon" />
                      <span>Kategori Baru</span>
                    </button>
                  )}
                </div>

                {/* Inline Category Creator Form */}
                {isAddingCategory && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-card-inner border border-card-border animate-in fade-in space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span>Buat Kategori {type === "EXPENSE" ? "Pengeluaran" : "Pemasukan"} Baru</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Nama kategori (misal: Iuran RT, Gym)..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="h-9 text-xs rounded-xl bg-card border-card-border focus-visible:ring-neon/30"
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={handleSaveNewCategory}
                        disabled={isSavingCategory || !newCatName.trim()}
                        className="h-9 px-3.5 rounded-xl text-xs font-bold bg-neon text-black hover:bg-neon/90 shrink-0"
                      >
                        {isSavingCategory ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </div>

                    {/* Color Presets */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-muted-foreground">Warna:</span>
                      <div className="flex items-center gap-1.5">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewCatColor(c)}
                            className={cn(
                              "w-5 h-5 rounded-full transition-all border",
                              newCatColor === c ? "ring-2 ring-foreground scale-110 border-white" : "border-transparent opacity-80 hover:opacity-100"
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !amount || !description.trim() || !selectedCategory}
                  className="w-full h-12 rounded-full text-xs font-extrabold bg-neon text-black hover:bg-neon/90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Menyimpan Transaksi..."
                    : !selectedCategory
                    ? "Pilih Kategori Terlebih Dahulu"
                    : "Catat Transaksi Sekarang"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
