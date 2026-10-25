export interface CategoryRef {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export interface LocalParsedTransaction {
  type: "EXPENSE" | "INCOME";
  amount: number | null;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  date: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  makan: [
    "makan",
    "minum",
    "jajan",
    "kopi",
    "cafe",
    "warteg",
    "resto",
    "nasi",
    "mie",
    "sate",
    "bakso",
    "burger",
    "sarapan",
    "lunch",
    "dinner",
    "ayam",
    "snack",
    "es teh",
  ],
  transport: [
    "bensin",
    "pertalite",
    "pertamax",
    "spbu",
    "ojol",
    "gojek",
    "grab",
    "maxim",
    "parkir",
    "tol",
    "kereta",
    "krl",
    "busway",
    "tiket",
    "cuci motor",
    "tambal ban",
    "service motor",
  ],
  hosting: [
    "hosting",
    "domain",
    "server",
    "aws",
    "vps",
    "github",
    "vercel",
    "openai",
    "claude",
    "cursor",
    "figma",
    "internet",
    "wifi",
    "indihome",
    "biznet",
  ],
  belanja: [
    "belanja",
    "shopee",
    "tokopedia",
    "baju",
    "sepatu",
    "mall",
    "nonton",
    "bioskop",
    "netflix",
    "spotify",
    "steam",
    "game",
    "skincare",
  ],
  freelance: [
    "freelance",
    "termin",
    "proyek",
    "project",
    "klien",
    "client",
    "dp",
    "pelunasan",
    "fee",
    "honor",
    "konsultasi",
    "jasa",
    "invoice",
  ],
  gaji: ["gaji", "payroll", "tunjangan", "bonus kantor", "thr"],
};

export function parseTransactionWithLocalHeuristics(
  rawText: string,
  userCategories: CategoryRef[] = []
): LocalParsedTransaction {
  const text = (rawText || "").slice(0, 500).trim();
  const lower = text.toLowerCase();

  // 1. Transaction Type Detection
  const incomeTriggers = [
    "gaji",
    "terima",
    "dapat",
    "transfer dari",
    "fee",
    "termin",
    "bonus",
    "cashback",
    "laku",
    "masuk",
    "penjualan",
    "honor",
    "dividen",
    "upah",
  ];

  let detectedType: "EXPENSE" | "INCOME" = "EXPENSE";
  for (const trigger of incomeTriggers) {
    if (lower.includes(trigger)) {
      detectedType = "INCOME";
      break;
    }
  }

  // 2. Nominal / Amount Extraction
  let detectedAmount: number | null = null;
  let matchedAmountText = "";

  // Pattern A: Millions like "3.5jt", "3,5 juta", "2jt", "1.5 jt"
  const millionsRegex =
    /(?:rp\.?\s*|idr\s*)?(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i;
  const millionsMatch = text.match(millionsRegex);

  if (millionsMatch) {
    const num = parseFloat(millionsMatch[1].replace(",", "."));
    if (!isNaN(num) && num > 0) {
      detectedAmount = Math.round(num * 1000000);
      matchedAmountText = millionsMatch[0];
    }
  }

  // Pattern B: Thousands like "45k", "45rb", "45 ribu", "50 k"
  if (detectedAmount === null) {
    const thousandsRegex =
      /(?:rp\.?\s*|idr\s*)?(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu)\b/i;
    const thousandsMatch = text.match(thousandsRegex);
    if (thousandsMatch) {
      const num = parseFloat(thousandsMatch[1].replace(",", "."));
      if (!isNaN(num) && num > 0) {
        detectedAmount = Math.round(num * 1000);
        matchedAmountText = thousandsMatch[0];
      }
    }
  }

  // Pattern C: Standard Indonesian formatted currency e.g. "Rp 50.000", "50000", "Rp150.000"
  if (detectedAmount === null) {
    const standardRegex =
      /(?:rp\.?\s*|idr\s*)?(\d{1,3}(?:\.\d{3})+|\d{4,9})\b/i;
    const standardMatch = text.match(standardRegex);
    if (standardMatch) {
      const cleanedNumStr = standardMatch[1].replace(/\./g, "");
      const num = parseInt(cleanedNumStr, 10);
      if (!isNaN(num) && num > 0) {
        detectedAmount = num;
        matchedAmountText = standardMatch[0];
      }
    }
  }

  // Pattern D: Plain 2 or 3 digit numbers preceded by amount indicators (e.g. "beli makan 45000")
  if (detectedAmount === null) {
    const fallbackNumberRegex = /\b(\d+)\b/;
    const fallbackMatch = text.match(fallbackNumberRegex);
    if (fallbackMatch) {
      const num = parseInt(fallbackMatch[1], 10);
      if (!isNaN(num) && num > 0) {
        // If user typed 25, could mean 25k if context is small purchase, but keep explicit
        detectedAmount = num < 1000 ? num * 1000 : num;
        matchedAmountText = fallbackMatch[0];
      }
    }
  }

  // 3. Date Detection
  let detectedDate = new Date().toISOString().split("T")[0];
  let matchedDateText = "";

  if (lower.includes("kemarin") || lower.includes("kemaren")) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    detectedDate = d.toISOString().split("T")[0];
    matchedDateText = lower.includes("kemarin") ? "kemarin" : "kemaren";
  } else {
    const daysAgoMatch = lower.match(/(\d+)\s*hari\s*lalu/);
    if (daysAgoMatch) {
      const days = parseInt(daysAgoMatch[1], 10);
      const d = new Date();
      d.setDate(d.getDate() - days);
      detectedDate = d.toISOString().split("T")[0];
      matchedDateText = daysAgoMatch[0];
    } else {
      const tglMatch = lower.match(/(?:tgl|tanggal)\s*(\d{1,2})/);
      if (tglMatch) {
        const day = parseInt(tglMatch[1], 10);
        if (day >= 1 && day <= 31) {
          const d = new Date();
          d.setDate(day);
          detectedDate = d.toISOString().split("T")[0];
          matchedDateText = tglMatch[0];
        }
      }
    }
  }

  // 4. Category Matching against User Categories
  const availableCategories = userCategories.filter((c) => c.type === detectedType);
  let matchedCategoryId: string | null = null;
  let matchedCategoryName: string | null = null;

  // Direct exact/partial match with user's category names
  for (const cat of availableCategories) {
    const catLower = cat.name.toLowerCase();
    if (lower.includes(catLower)) {
      matchedCategoryId = cat.id;
      matchedCategoryName = cat.name;
      break;
    }
  }

  // Keyword dictionary match if direct name match didn't find anything
  if (!matchedCategoryId) {
    let bestKey: string | null = null;

    for (const [groupKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          bestKey = groupKey;
          break;
        }
      }
      if (bestKey) break;
    }

    if (bestKey) {
      // Find matching user category by group key
      const found = availableCategories.find((c) => {
        const cLower = c.name.toLowerCase();
        if (bestKey === "makan") return cLower.includes("makan") || cLower.includes("minum") || cLower.includes("food");
        if (bestKey === "transport") return cLower.includes("transport") || cLower.includes("bensin") || cLower.includes("kendaraan");
        if (bestKey === "hosting") return cLower.includes("hosting") || cLower.includes("tools") || cLower.includes("software");
        if (bestKey === "belanja") return cLower.includes("belanja") || cLower.includes("hiburan") || cLower.includes("shopping");
        if (bestKey === "gaji") return cLower.includes("gaji") || cLower.includes("salary") || cLower.includes("payroll");
        if (bestKey === "freelance") return cLower.includes("freelance") || cLower.includes("termin") || cLower.includes("proyek");
        return false;
      });

      if (found) {
        matchedCategoryId = found.id;
        matchedCategoryName = found.name;
      }
    }
  }

  // IMPORTANT: If no category matches, leave matchedCategoryId as null
  // Do NOT force a fallback category.

  // 5. Cleaned Description Extraction
  let cleanDesc = text;
  if (matchedAmountText) {
    const escapedAmount = matchedAmountText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleanDesc = cleanDesc.replace(new RegExp(escapedAmount, "gi"), "");
  }
  if (matchedDateText) {
    const escapedDate = matchedDateText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleanDesc = cleanDesc.replace(new RegExp(escapedDate, "gi"), "");
  }

  // Remove common artifacts, strip HTML tags, and sanitize whitespace
  cleanDesc = cleanDesc
    .replace(/[<>]/g, "")
    .replace(/\b(?:rp\.?|idr|sebesar|seharga|senilai|pada|di|ke)\b/gi, "")
    .replace(/[,\-:;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // If text became empty after stripping, construct a meaningful default
  if (!cleanDesc) {
    cleanDesc = matchedCategoryName
      ? matchedCategoryName
      : detectedType === "EXPENSE"
      ? "Pengeluaran"
      : "Pemasukan";
  } else {
    // Capitalize first letter
    cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
  }

  return {
    type: detectedType,
    amount: detectedAmount,
    description: cleanDesc,
    categoryId: matchedCategoryId,
    categoryName: matchedCategoryName,
    date: detectedDate,
  };
}
