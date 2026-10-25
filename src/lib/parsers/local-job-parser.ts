import { sanitizeSafeUrl } from "@/lib/security";

export interface LocalParsedResult {
  companyName: string;
  position: string;
  workLocation: "REMOTE" | "HYBRID" | "ONSITE";
  salaryOfferedMin: number | null;
  salaryOfferedMax: number | null;
  jobUrl: string | null;
  notes: string;
}

export function parseWithLocalHeuristics(rawText: string): LocalParsedResult {
  // ReDoS and payload defense: bound maximum parsed text to 10,000 characters
  const text = (rawText || "").slice(0, 10000).trim();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let detectedUrl: string | null = null;
  const urlMatch = text.match(/https?:\/\/[^\s<>"')]+/i);
  if (urlMatch) {
    const rawUrl = urlMatch[0].replace(/[.,;:)]+$/, "");
    detectedUrl = sanitizeSafeUrl(rawUrl);
  }

  // Work Location Detection
  let detectedLocation: "REMOTE" | "HYBRID" | "ONSITE" = "REMOTE";
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("hybrid") ||
    lowerText.includes("wfo 2") ||
    lowerText.includes("wfo 3") ||
    lowerText.includes("wfh 2") ||
    lowerText.includes("wfh 3")
  ) {
    detectedLocation = "HYBRID";
  } else if (
    lowerText.includes("onsite") ||
    lowerText.includes("on-site") ||
    lowerText.includes("wfo full") ||
    lowerText.includes("full wfo") ||
    lowerText.includes("kantor jakarta") ||
    lowerText.includes("kantor bandung")
  ) {
    detectedLocation = "ONSITE";
  } else if (
    lowerText.includes("remote") ||
    lowerText.includes("wfh") ||
    lowerText.includes("anywhere")
  ) {
    detectedLocation = "REMOTE";
  }

  // Salary Range Detection
  let salaryMin: number | null = null;
  let salaryMax: number | null = null;

  // Regex for patterns like "15jt - 25jt", "15 - 25 jt", "Rp 15.000.000 - Rp 25.000.000"
  const rangeJtRegex =
    /(?:(?:gaji|salary|budget|rate|kompensasi)[^0-9\n]{0,50})?(\d+(?:[.,]\d+)?)\s*(?:jt|juta)?\s*(?:-|sampai|to)\s*(\d+(?:[.,]\d+)?)\s*(jt|juta|k|ribu)?/i;
  const rangeMatch = text.match(rangeJtRegex);

  if (rangeMatch) {
    const val1 = parseFloat(rangeMatch[1].replace(",", "."));
    const val2 = parseFloat(rangeMatch[2].replace(",", "."));
    const unit = (rangeMatch[3] || "jt").toLowerCase();
    const multiplier = unit === "k" || unit === "ribu" ? 1000 : 1000000;

    salaryMin = Math.round(val1 * (val1 < 1000 ? multiplier : 1));
    salaryMax = Math.round(val2 * (val2 < 1000 ? multiplier : 1));
  } else {
    // Single nominal detection e.g. "20jt", "IDR 25.000.000"
    const singleJtRegex =
      /(?:(?:gaji|salary|budget|rate)[^0-9\n]{0,50})?(\d+(?:[.,]\d+)?)\s*(jt|juta)/i;
    const singleMatch = text.match(singleJtRegex);
    if (singleMatch) {
      const val = parseFloat(singleMatch[1].replace(",", "."));
      salaryMin = Math.round(val * 1000000);
    }
  }

  // Company Name Detection
  let detectedCompany = "";
  const ptMatch = text.match(/(?:PT|CV)\s+[A-Za-z0-9 &.-]{3,40}/i);
  const atCompanyMatch = text.match(
    /(?:di|at|company|perusahaan)[:\s]+([A-Za-z0-9 &.-]{3,35})/i
  );

  if (ptMatch) {
    detectedCompany = ptMatch[0].split(/\r?\n/)[0].trim();
  } else if (atCompanyMatch) {
    detectedCompany = atCompanyMatch[1].split(/\r?\n/)[0].trim();
  } else if (lines.length > 0) {
    // Fallback: Check if first line resembles a company or title
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes("http")) {
      detectedCompany = firstLine;
    }
  }

  // Position / Role Detection
  let detectedPosition = "";
  const posRegex =
    /(?:posisi|role|position|job title|hiring for|dicari|butuh|open position)[:\s]+([A-Za-z0-9\s/().&+-]{3,60})/i;
  const posMatch = text.match(posRegex);

  if (posMatch) {
    detectedPosition = posMatch[1].split(/[!\n]/)[0].trim();
  } else {
    // Look for common role keywords in lines
    const roleKeywords = [
      "developer",
      "engineer",
      "frontend",
      "backend",
      "fullstack",
      "full stack",
      "devops",
      "designer",
      "ui/ux",
      "product manager",
      "data analyst",
      "qa",
      "lead",
      "architect",
      "intern",
      "specialist",
    ];

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (
        roleKeywords.some((k) => lineLower.includes(k)) &&
        line.length < 80 &&
        !line.includes("http")
      ) {
        detectedPosition = line.replace(/^[#*•\-\s]+/, "").trim();
        break;
      }
    }
  }

  // Fallback if empty
  if (!detectedCompany && lines.length > 0) {
    detectedCompany = lines[0].substring(0, 50).trim();
  }
  if (!detectedPosition && lines.length > 1) {
    detectedPosition = lines[1].substring(0, 50).trim();
  }

  // Extract requirements & key notes
  const notesLines: string[] = [];
  for (const line of lines) {
    if (
      line.startsWith("-") ||
      line.startsWith("•") ||
      line.startsWith("*") ||
      line.toLowerCase().includes("stack") ||
      line.toLowerCase().includes("kualifikasi") ||
      line.toLowerCase().includes("requirement")
    ) {
      notesLines.push(line);
    }
  }

  const detectedNotes =
    notesLines.length > 0
      ? notesLines.slice(0, 8).join("\n")
      : lines.slice(0, 3).join("\n");

  return {
    companyName: detectedCompany,
    position: detectedPosition,
    workLocation: detectedLocation,
    salaryOfferedMin: salaryMin,
    salaryOfferedMax: salaryMax,
    jobUrl: detectedUrl,
    notes: detectedNotes,
  };
}
