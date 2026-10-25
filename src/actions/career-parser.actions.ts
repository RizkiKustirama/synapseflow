"use server";

import { geminiClient, GEMINI_MODEL_PRIMARY, GEMINI_MODEL_FALLBACK } from "@/lib/gemini";
import { parseWithLocalHeuristics } from "@/lib/parsers/local-job-parser";
import { getCurrentUserId } from "@/lib/user";
import { ParsedJobData } from "@/lib/validations/career.schema";
import { sanitizePromptInput, sanitizeSafeUrl } from "@/lib/security";

export interface ParseJobResponse {
  success: boolean;
  data?: ParsedJobData;
  error?: string;
  source?: "AI_GEMINI" | "LOCAL_FALLBACK";
}

export async function parseJobDescriptionAction(rawText: string): Promise<ParseJobResponse> {
  try {
    // 1. Verify user session
    await getCurrentUserId();

    // 2. Sanitize and bound text to prevent Prompt Injection delimiter breakout and Token Exhaustion DoS
    const cleanText = sanitizePromptInput(rawText, 8000);
    if (!cleanText) {
      return {
        success: false,
        error: "Teks deskripsi lowongan tidak boleh kosong.",
      };
    }

    // 3. If Gemini is not configured, fallback to local heuristics directly
    if (!geminiClient) {
      const localResult = parseWithLocalHeuristics(cleanText);
      return {
        success: true,
        data: {
          ...localResult,
          jobUrl: sanitizeSafeUrl(localResult.jobUrl),
          source: "LOCAL_FALLBACK",
        },
        source: "LOCAL_FALLBACK",
      };
    }

    // 4. Structured system prompt isolated from user input
    const systemInstruction = `Anda adalah asisten AI parser lowongan kerja profesional.
Tugas Anda: Analisis teks lowongan kerja dan ekstrak entitas ke format JSON murni.

Aturan Ekstraksi:
1. companyName: Nama perusahaan penyelenggara lowongan (string, wajib diisi estimasi terbaik).
2. position: Nama jabatan / role (string, wajib diisi estimasi terbaik).
3. workLocation: Pilih salah satu: "REMOTE", "HYBRID", atau "ONSITE".
4. salaryOfferedMin: Angka batas bawah gaji per bulan dalam IDR (number/null, misal "15jt" -> 15000000).
5. salaryOfferedMax: Angka batas atas gaji per bulan dalam IDR (number/null, misal "25 juta" -> 25000000).
6. jobUrl: URL link pendaftaran jika ada (string/null, hanya protokol http/https).
7. notes: Ringkasan singkat kualifikasi kunci dan tech stack dalam bentuk teks bullet points.

PENTING: Output HANYA berupa JSON valid tanpa markdown fence.`;

    const userContent = `Teks Lowongan:\n"""\n${cleanText}\n"""`;

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
      console.warn("Primary Gemini model failed, trying fallback model:", primaryErr);
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

    if (!responseText) {
      throw new Error("Empty response from AI model.");
    }

    const parsedJson = JSON.parse(responseText);

    const validatedData: ParsedJobData = {
      companyName: typeof parsedJson.companyName === "string" ? parsedJson.companyName.trim() : "",
      position: typeof parsedJson.position === "string" ? parsedJson.position.trim() : "",
      workLocation:
        parsedJson.workLocation === "HYBRID" || parsedJson.workLocation === "ONSITE"
          ? parsedJson.workLocation
          : "REMOTE",
      salaryOfferedMin:
        typeof parsedJson.salaryOfferedMin === "number" && !isNaN(parsedJson.salaryOfferedMin)
          ? parsedJson.salaryOfferedMin
          : null,
      salaryOfferedMax:
        typeof parsedJson.salaryOfferedMax === "number" && !isNaN(parsedJson.salaryOfferedMax)
          ? parsedJson.salaryOfferedMax
          : null,
      jobUrl: sanitizeSafeUrl(parsedJson.jobUrl),
      notes: typeof parsedJson.notes === "string" ? parsedJson.notes.trim() : "",
      source: "AI_GEMINI",
    };

    return {
      success: true,
      data: validatedData,
      source: "AI_GEMINI",
    };
  } catch (error: unknown) {
    console.warn("Gemini parsing error, falling back to local heuristic parser:", error);
    const localResult = parseWithLocalHeuristics(rawText || "");
    return {
      success: true,
      data: {
        ...localResult,
        jobUrl: sanitizeSafeUrl(localResult.jobUrl),
        source: "LOCAL_FALLBACK",
      },
      source: "LOCAL_FALLBACK",
    };
  }
}
