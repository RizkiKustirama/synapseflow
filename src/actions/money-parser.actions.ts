"use server";

import { geminiClient, GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK } from "@/lib/gemini";
import { getCategories } from "@/actions/money.actions";
import { getCurrentUserId } from "@/lib/user";
import { sanitizePromptInput } from "@/lib/security";
import { parseTransactionWithLocalHeuristics } from "@/lib/parsers/local-money-parser";
import {
  parsedTransactionSchema,
  ParsedTransactionData,
} from "@/lib/validations/money-parser.schema";

export interface ParseTransactionResponse {
  success: boolean;
  data?: ParsedTransactionData;
  error?: string;
  source?: "AI_GEMINI" | "LOCAL_FALLBACK";
}

export async function parseTransactionTextAction(rawText: string): Promise<ParseTransactionResponse> {
  try {
    // 1. Verify user authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Sesi tidak valid. Silakan login kembali.",
      };
    }

    // 2. Sanitize and bound input text (max 500 chars)
    const cleanText = sanitizePromptInput(rawText, 500);
    if (!cleanText) {
      return {
        success: false,
        error: "Teks transaksi tidak boleh kosong.",
      };
    }

    // 3. Load user's active categories for semantic matching
    const userCategories = await getCategories();
    const categoryRefList = userCategories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    }));

    // 4. Fallback directly if Gemini client is not configured
    if (!geminiClient) {
      const localResult = parseTransactionWithLocalHeuristics(cleanText, categoryRefList);
      return {
        success: true,
        data: {
          ...localResult,
          source: "LOCAL_FALLBACK",
          confidence: localResult.categoryId ? "HIGH" : "MEDIUM",
        },
        source: "LOCAL_FALLBACK",
      };
    }

    // 5. Structure prompt with user category isolation
    const todayStr = new Date().toISOString().split("T")[0];
    const systemInstruction = `Anda adalah asisten AI akuntansi pribadi untuk ekstraksi transaksi keuangan dari kalimat alami pengguna.
Tugas Anda: Analisis kalimat transaksi dan ekstrak menjadi format JSON murni.

Aturan Ekstraksi:
1. type: "EXPENSE" (pengeluaran) atau "INCOME" (pemasukan).
2. amount: Angka positif nominal Rupiah (misal "45rb" -> 45000, "3.5jt" -> 3500000, "50.000" -> 50000). Jika tidak ditemukan nominal, berikan null.
3. description: Deskripsi ringkas aktivitas transaksi yang rapi tanpa nominal (contoh: "Makan siang di warteg", "Beli bensin pertalite").
4. categoryId: Pilih salah satu ID dari daftar kategori yang disediakan jika ada kecocokan yang relevan. JIKA TIDAK ADA KATEGORI YANG COCOK ATAU AMBIGU, WAJIB BERIKAN null (JANGAN MEMAKSA MEMILIH KATEGORI YANG SALAH).
5. categoryName: Nama kategori yang dipilih atau null jika categoryId null.
6. date: Tanggal transaksi format YYYY-MM-DD. Jika memuat "kemarin", hitung tanggal kemarin. Default: hari ini (${todayStr}).
7. confidence: "HIGH" jika nominal dan kategori sangat jelas, "MEDIUM" jika kategori kurang pasti, "LOW" jika ambigu.

Daftar Kategori Tersedia Pengguna:
${JSON.stringify(categoryRefList)}

PENTING: Output HANYA berupa JSON valid tanpa markdown fence.`;

    const userContent = `Teks Transaksi:\n"""\n${cleanText}\n"""`;

    let responseText = "";
    try {
      const res = await geminiClient.models.generateContent({
        model: GEMINI_MODEL_PRIMARY,
        contents: userContent,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      responseText = res.text || "";
    } catch (primaryErr) {
      console.warn("Primary Gemini model failed for money parsing, trying fallback model:", primaryErr);
      const fallbackRes = await geminiClient.models.generateContent({
        model: GEMINI_MODEL_FALLBACK,
        contents: userContent,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      responseText = fallbackRes.text || "";
    }

    // 6. Clean and parse JSON response
    const cleanJson = responseText.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
    const rawParsed = JSON.parse(cleanJson);

    // 7. Validate with Zod
    const validated = parsedTransactionSchema.parse({
      ...rawParsed,
      source: "AI_GEMINI",
    });

    // 8. Multi-tenant verification: Ensure returned categoryId belongs to user
    let verifiedCategoryId: string | null = null;
    let verifiedCategoryName: string | null = null;

    if (validated.categoryId) {
      const matched = categoryRefList.find(
        (c) => c.id === validated.categoryId && c.type === validated.type
      );
      if (matched) {
        verifiedCategoryId = matched.id;
        verifiedCategoryName = matched.name;
      }
    }

    const cleanDescription = (validated.description || "").replace(/[<>]/g, "").slice(0, 255).trim();

    return {
      success: true,
      data: {
        ...validated,
        description: cleanDescription,
        categoryId: verifiedCategoryId,
        categoryName: verifiedCategoryName,
        source: "AI_GEMINI",
      },
      source: "AI_GEMINI",
    };
  } catch {
    // If Gemini parsing fails or JSON invalid, gracefully fallback to local parser
    const fallbackUserId = await getCurrentUserId();
    const userCategories = fallbackUserId ? await getCategories() : [];
    const localResult = parseTransactionWithLocalHeuristics(
      rawText,
      userCategories.map((c) => ({ id: c.id, name: c.name, type: c.type }))
    );

    return {
      success: true,
      data: {
        ...localResult,
        source: "LOCAL_FALLBACK",
        confidence: localResult.categoryId ? "HIGH" : "MEDIUM",
      },
      source: "LOCAL_FALLBACK",
    };
  }
}
