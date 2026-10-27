import { describe, it, expect } from "bun:test";
import { parseWithLocalHeuristics } from "@/lib/parsers/local-job-parser";
import { parsedJobDataSchema } from "@/lib/validations/career.schema";
import { parseJobDescriptionAction } from "@/actions/career-parser.actions";

describe("Career Auto-Fill - Local Heuristics Parser", () => {
  it("extracts company, position, remote, and salary range correctly", () => {
    const rawPost = `
      Lagi buka lowongan nih di PT Teknologi Bangsa!
      Dicari: Senior Fullstack Engineer (React & Go)
      Sistem kerja: WFH Remote full.
      Range gaji: 20jt - 30jt per bulan.
      Kualifikasi: Min 3 tahun pengalaman, menguasai PostgreSQL.
      Kirim CV ke: https://teknologibangsa.co.id/career
    `;

    const result = parseWithLocalHeuristics(rawPost);

    expect(result.companyName).toBe("PT Teknologi Bangsa");
    expect(result.position).toBe("Senior Fullstack Engineer (React & Go)");
    expect(result.workLocation).toBe("REMOTE");
    expect(result.salaryOfferedMin).toBe(20000000);
    expect(result.salaryOfferedMax).toBe(30000000);
    expect(result.jobUrl).toBe("https://teknologibangsa.co.id/career");
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it("detects hybrid and onsite work locations", () => {
    const hybridPost = `
      Company: Bukalapak
      Position: Product Designer
      Work setup: Hybrid 2 days at office Jakarta.
      Salary: 15jt - 22jt
    `;
    const hybridRes = parseWithLocalHeuristics(hybridPost);
    expect(hybridRes.workLocation).toBe("HYBRID");

    const onsitePost = `
      Lowongan Onsite kantor Jakarta Selatan
      Posisi: Staff Admin & Finance
      PT Sumber Makmur
    `;
    const onsiteRes = parseWithLocalHeuristics(onsitePost);
    expect(onsiteRes.workLocation).toBe("ONSITE");
  });

  it("handles posts without salary gracefully without NaN", () => {
    const noSalaryPost = `
      PT Astra International
      Hiring for: Cyber Security Analyst
      Work location: Remote
      Link: https://astra.co.id/jobs/123
    `;
    const res = parseWithLocalHeuristics(noSalaryPost);
    expect(res.salaryOfferedMin).toBeNull();
    expect(res.salaryOfferedMax).toBeNull();
    expect(res.position).toBe("Cyber Security Analyst");
    expect(res.companyName).toBe("PT Astra International");
  });

  it("validates parsed output against parsedJobDataSchema", () => {
    const rawPost = "PT Unicorn Indonesia\nPosisi: Engineering Lead\nRemote\nGaji 35jt - 50jt";
    const parsed = parseWithLocalHeuristics(rawPost);
    const schemaValidation = parsedJobDataSchema.safeParse(parsed);
    expect(schemaValidation.success).toBe(true);
  });
});

describe("Career Auto-Fill - Server Action Integration", () => {
  it("rejects empty text with informative error", async () => {
    const res = await parseJobDescriptionAction("   ");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Teks deskripsi lowongan tidak boleh kosong.");
  });

  it("successfully parses job description via action", async () => {
    const sample = `
      PT Maju Bersama Digital
      Role: Senior Backend Engineer
      WFH Full Remote
      Gaji: 25jt - 35jt
      Apply here: https://majudigital.com/apply
      Notes: Must know Docker and Kubernetes.
    `;
    const res = await parseJobDescriptionAction(sample);
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.companyName.length).toBeGreaterThan(0);
    expect(res.data?.position.length).toBeGreaterThan(0);
    expect(res.data?.workLocation).toBe("REMOTE");
    expect(res.data?.salaryOfferedMin).toBe(25000000);
    expect(res.data?.salaryOfferedMax).toBe(35000000);
    expect(res.data?.jobUrl).toBe("https://majudigital.com/apply");
  }, 30000);
});
