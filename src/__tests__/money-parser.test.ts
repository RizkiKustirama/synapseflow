import { describe, it, expect } from "bun:test";
import { parseTransactionWithLocalHeuristics } from "@/lib/parsers/local-money-parser";
import { parsedTransactionSchema } from "@/lib/validations/money-parser.schema";

describe("Money Smart Natural Language Parser", () => {
  const mockCategories = [
    { id: "cat-1", name: "Makan & Minum", type: "EXPENSE" as const },
    { id: "cat-2", name: "Transport & Bensin", type: "EXPENSE" as const },
    { id: "cat-3", name: "Hosting & Tools", type: "EXPENSE" as const },
    { id: "cat-4", name: "Belanja & Hiburan", type: "EXPENSE" as const },
    { id: "cat-5", name: "Gaji Kantor", type: "INCOME" as const },
    { id: "cat-6", name: "Termin Freelance", type: "INCOME" as const },
  ];

  describe("Expense Parsing", () => {
    it("should parse thousands with 'rb' and match food category", () => {
      const result = parseTransactionWithLocalHeuristics(
        "beli makan siang 45rb di warteg",
        mockCategories
      );
      expect(result.type).toBe("EXPENSE");
      expect(result.amount).toBe(45000);
      expect(result.categoryId).toBe("cat-1");
      expect(result.categoryName).toBe("Makan & Minum");
      expect(result.description.toLowerCase()).toContain("makan siang");
    });

    it("should parse thousands with 'k' and match coffee/cafe", () => {
      const result = parseTransactionWithLocalHeuristics(
        "kopi janji jiwa 28k",
        mockCategories
      );
      expect(result.type).toBe("EXPENSE");
      expect(result.amount).toBe(28000);
      expect(result.categoryId).toBe("cat-1");
    });

    it("should parse standard formatted IDR currency and match fuel/transport", () => {
      const result = parseTransactionWithLocalHeuristics(
        "isi bensin pertalite 50.000",
        mockCategories
      );
      expect(result.type).toBe("EXPENSE");
      expect(result.amount).toBe(50000);
      expect(result.categoryId).toBe("cat-2");
      expect(result.categoryName).toBe("Transport & Bensin");
    });

    it("should parse tech tools and match hosting/tools category", () => {
      const result = parseTransactionWithLocalHeuristics(
        "langganan domain dan server aws 350rb",
        mockCategories
      );
      expect(result.type).toBe("EXPENSE");
      expect(result.amount).toBe(350000);
      expect(result.categoryId).toBe("cat-3");
    });
  });

  describe("Income Parsing", () => {
    it("should parse millions with 'jt' and match freelance category", () => {
      const result = parseTransactionWithLocalHeuristics(
        "gaji freelance web landing page 3.5jt",
        mockCategories
      );
      expect(result.type).toBe("INCOME");
      expect(result.amount).toBe(3500000);
      expect(result.categoryId).toBe("cat-6");
      expect(result.categoryName).toBe("Termin Freelance");
    });

    it("should parse income with 'juta' comma notation", () => {
      const result = parseTransactionWithLocalHeuristics(
        "terima fee konsultasi 2,5 juta",
        mockCategories
      );
      expect(result.type).toBe("INCOME");
      expect(result.amount).toBe(2500000);
      expect(result.categoryId).toBe("cat-6");
    });

    it("should detect office salary keyword", () => {
      const result = parseTransactionWithLocalHeuristics(
        "gaji payroll bulan ini 15.000.000",
        mockCategories
      );
      expect(result.type).toBe("INCOME");
      expect(result.amount).toBe(15000000);
      expect(result.categoryId).toBe("cat-5");
    });
  });

  describe("Unmatched Category Handling", () => {
    it("should leave categoryId as null when category is not found or ambiguous", () => {
      // User requirement: jika kategori tidak ada biarkan kosong tanpa action (tidak memilih apapun)
      const result = parseTransactionWithLocalHeuristics(
        "bayar iuran kas rt 50rb",
        mockCategories
      );
      expect(result.type).toBe("EXPENSE");
      expect(result.amount).toBe(50000);
      expect(result.categoryId).toBeNull();
      expect(result.categoryName).toBeNull();
    });

    it("should leave categoryId as null for random money transfer", () => {
      const result = parseTransactionWithLocalHeuristics(
        "transfer uang ke rekening bca 100k",
        mockCategories
      );
      expect(result.amount).toBe(100000);
      expect(result.categoryId).toBeNull();
    });
  });

  describe("Date Extraction", () => {
    it("should detect 'kemarin' and set date to yesterday", () => {
      const result = parseTransactionWithLocalHeuristics(
        "beli martabak 35rb kemarin",
        mockCategories
      );
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expectedDate = yesterday.toISOString().split("T")[0];
      expect(result.date).toBe(expectedDate);
    });

    it("should detect '2 hari lalu'", () => {
      const result = parseTransactionWithLocalHeuristics(
        "isi bensin 30k 2 hari lalu",
        mockCategories
      );
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const expectedDate = twoDaysAgo.toISOString().split("T")[0];
      expect(result.date).toBe(expectedDate);
    });
  });

  describe("Validation Schema", () => {
    it("should validate parsed transaction against parsedTransactionSchema", () => {
      const parsed = parseTransactionWithLocalHeuristics(
        "beli sarapan bubur ayam 15000",
        mockCategories
      );
      const validation = parsedTransactionSchema.safeParse({
        ...parsed,
        source: "LOCAL_FALLBACK",
      });
      expect(validation.success).toBe(true);
    });
  });
});
