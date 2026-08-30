/**
 * OCR Engine — frontend-only.
 *
 * PDF  : pdfjs-dist mengekstrak teks digital (dengan batas baris).
 * Gambar: Tesseract.js (eng+ind).
 * Setelah teks diperoleh, dicocokkan dengan template dokumen dan —
 * bila tersedia — dengan data pengajuan/usaha (OcrContext).
 */

import type {
  DocumentOcrResult,
  OcrContext,
  OcrFieldCheck,
  OcrStatus,
} from "@/lib/types";
import { DOC_TEMPLATES, detectTemplate, type FieldRule } from "@/lib/doc-templates";

// ─── Ekstraksi teks ─────────────────────────────────────────────────

async function extractTextFromPdf(dataUrl: string): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    let line = "";
    for (const item of content.items as any[]) {
      if (!("str" in item)) continue;
      line += item.str;
      // pdfjs menandai akhir baris lewat `hasEOL`
      if (item.hasEOL) {
        fullText += line.trimEnd() + "\n";
        line = "";
      } else {
        line += " ";
      }
    }
    if (line.trim()) fullText += line.trimEnd() + "\n";
    fullText += "\n";
  }

  return normalizeText(fullText);
}

async function extractTextFromImage(dataUrl: string): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const { data } = await Tesseract.recognize(dataUrl, "eng+ind", {
    logger: () => {},
  });
  return normalizeText(data.text ?? "");
}

/** Rapikan spasi berlebih, tapi pertahankan newline sebagai batas field. */
function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, "  ")
    .trim();
}

async function extractText(file: File, dataUrl: string): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.type.startsWith("image/");

  if (isPdf) return extractTextFromPdf(dataUrl);
  if (isImage) return extractTextFromImage(dataUrl);

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(normalizeText((reader.result as string) ?? ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

// ─── Pembanding nilai ───────────────────────────────────────────────

function bersih(value: string): string {
  let s = value
    .replace(/\s+/g, " ")
    .replace(/^[\s:#\-]+/, "")
    .replace(/[\s.,;:]+$/, "")
    .trim();

  // Buang kurung / kurung siku penutup di ujung hanya bila tidak ada
  // pasangannya — supaya "Wholly Obtained (WO)" tidak terpotong jadi
  // "Wholly Obtained (WO", tapi "Rattan Furniture)" tetap dirapikan.
  while (/[)\]]$/.test(s)) {
    const penutup = s[s.length - 1];
    const pembuka = penutup === ")" ? "(" : "[";
    const jumlahBuka = s.split(pembuka).length - 1;
    const jumlahTutup = s.split(penutup).length - 1;
    if (jumlahTutup <= jumlahBuka) break;
    s = s.slice(0, -1).replace(/[\s.,;:]+$/, "");
  }

  return s.trim();
}

function hanyaAngka(value: string): string {
  return value.replace(/\D+/g, "");
}

/** Ambil bagian bilangan bulat dari nilai uang: "USD 15.000,00" → "15000". */
function angkaUang(value: string): string {
  let s = value.replace(/[^\d.,]/g, "");
  s = s.replace(/[.,]\d{1,2}$/, ""); // buang bagian desimal
  return s.replace(/\D+/g, "");
}

function normTeks(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teksMirip(a: string, b: string): boolean {
  const na = normTeks(a);
  const nb = normTeks(b);
  if (!na || !nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const setA = new Set(na.split(" ").filter((t) => t.length > 2));
  const tokB = nb.split(" ").filter((t) => t.length > 2);
  return tokB.some((t) => setA.has(t));
}

// ─── Validasi ───────────────────────────────────────────────────────

interface FieldHasil {
  check: OcrFieldCheck;
  /** true bila field wajib tapi tidak terdeteksi sama sekali. */
  hilang: boolean;
  /** true bila nilai angka/uang berbeda dari data pengajuan. */
  bedaKeras: boolean;
}

function periksaField(rule: FieldRule, text: string, context: OcrContext): FieldHasil {
  const ada = rule.cari.test(text);
  const harapanKonteks = rule.konteks ? (context[rule.konteks] ?? "").trim() : "";
  const diharapkan = harapanKonteks || rule.diharapkan;

  if (!ada) {
    return {
      check: {
        field: rule.label,
        terbaca: "Tidak ditemukan",
        diharapkan,
        sesuai: false,
        catatan: rule.wajib ? "Field wajib tidak ditemukan dalam dokumen." : undefined,
      },
      hilang: rule.wajib,
      bedaKeras: false,
    };
  }

  const cocokAmbil = rule.ambil ? text.match(rule.ambil) : null;
  const nilai = cocokAmbil && cocokAmbil[1] ? bersih(cocokAmbil[1]) : "";

  if (!nilai) {
    return {
      check: {
        field: rule.label,
        terbaca: "✓ Terdeteksi (nilai tidak terbaca otomatis)",
        diharapkan,
        sesuai: true,
      },
      hilang: false,
      bedaKeras: false,
    };
  }

  // Tidak ada pembanding → cukup tampilkan yang terbaca.
  if (!harapanKonteks || !rule.banding) {
    return {
      check: { field: rule.label, terbaca: nilai, diharapkan, sesuai: true },
      hilang: false,
      bedaKeras: false,
    };
  }

  if (rule.banding === "teks") {
    const mirip = teksMirip(nilai, harapanKonteks);
    return {
      check: {
        field: rule.label,
        terbaca: nilai,
        diharapkan: harapanKonteks,
        sesuai: true, // nama bisa beda format (nama merek vs badan hukum) — jangan gagalkan
        catatan: mirip
          ? undefined
          : `Terbaca "${nilai}", pada data tercatat "${harapanKonteks}". Pastikan konsisten.`,
      },
      hilang: false,
      bedaKeras: false,
    };
  }

  // banding angka / uang
  const kiri = rule.banding === "uang" ? angkaUang(nilai) : hanyaAngka(nilai);
  const kanan = rule.banding === "uang" ? angkaUang(harapanKonteks) : hanyaAngka(harapanKonteks);
  const cocok = kiri.length > 0 && kanan.length > 0 && kiri === kanan;

  return {
    check: {
      field: rule.label,
      terbaca: nilai,
      diharapkan: harapanKonteks,
      sesuai: cocok,
      catatan: cocok
        ? undefined
        : `Terbaca "${nilai}", seharusnya "${harapanKonteks}" sesuai data pengajuan.`,
    },
    hilang: false,
    bedaKeras: !cocok,
  };
}

export function validateText(docId: string, text: string, context: OcrContext): DocumentOcrResult {
  const nowIso = new Date().toISOString();
  const teksMentah = text.slice(0, 1800);
  let template = DOC_TEMPLATES[docId];

  // 1. Pastikan file yang diunggah memang jenis dokumen yang diminta.
  if (template) {
    const cocokJenis = template.identifikasi.some((r) => r.test(text));
    if (!cocokJenis) {
      const terdeteksi = detectTemplate(text);
      return {
        status: "gagal_baca",
        ringkas: terdeteksi
          ? `Dokumen terbaca sebagai ${terdeteksi.templateName}, bukan ${template.templateName}. Pastikan file yang diunggah benar.`
          : `Teks tidak mengandung kata kunci ${template.templateName}. Pastikan file benar dan bukan hasil scan buram.`,
        diperiksaPada: nowIso,
        template: terdeteksi ? terdeteksi.templateName : "Tidak dikenali",
        temuan: [],
        teksMentah,
      };
    }
  } else {
    const terdeteksi = detectTemplate(text);
    if (!terdeteksi) {
      return {
        status: "gagal_baca",
        ringkas: "Tidak dapat mengidentifikasi jenis dokumen. Pastikan file benar.",
        diperiksaPada: nowIso,
        template: "Tidak dikenali",
        temuan: [],
        teksMentah,
      };
    }
    template = terdeteksi;
  }

  // 2. Teks terlalu pendek → kemungkinan scan gambar tanpa teks digital.
  if (text.replace(/\s/g, "").length < 40) {
    return {
      status: "gagal_baca",
      ringkas: "Nyaris tidak ada teks yang terbaca. Bila ini hasil scan, unggah versi yang lebih tajam atau PDF asli.",
      diperiksaPada: nowIso,
      template: template.templateName,
      temuan: [],
      teksMentah,
    };
  }

  // 3. Periksa tiap field.
  const hasil = template.fields.map((rule) => periksaField(rule, text, context));
  const temuan = hasil.map((h) => h.check);
  const hilang = hasil.filter((h) => h.hilang).map((h) => h.check.field);
  const bedaKeras = hasil.filter((h) => h.bedaKeras).map((h) => h.check.field);
  const softNote = hasil.filter((h) => !h.bedaKeras && !h.hilang && h.check.catatan).length;

  let status: OcrStatus = hilang.length + bedaKeras.length === 0 ? "cocok" : "perlu_perbaikan";

  let ringkas: string;
  if (status === "cocok") {
    ringkas =
      softNote > 0
        ? `Field penting terbaca dan cocok. ${softNote} nilai teks (nama/negara) perlu dicek manual — lihat catatan.`
        : `Semua field penting terbaca dan cocok dengan data pengajuan. Sesuai ${template.templateName}.`;
  } else {
    const bagian: string[] = [];
    if (hilang.length) bagian.push(`${hilang.length} field wajib tidak terbaca (${hilang.join(", ")})`);
    if (bedaKeras.length) bagian.push(`${bedaKeras.length} nilai berbeda dari pengajuan (${bedaKeras.join(", ")})`);
    ringkas = `Perlu diperiksa: ${bagian.join("; ")}.`;
  }

  return {
    status,
    ringkas,
    diperiksaPada: nowIso,
    template: template.templateName,
    temuan,
    teksMentah,
  };
}

// ─── API publik ─────────────────────────────────────────────────────

/**
 * Jalankan OCR + validasi pada file yang baru diunggah.
 * `context` berisi data pengajuan/usaha untuk pencocokan silang (opsional).
 */
export async function runOcr(
  docId: string,
  file: File,
  dataUrl: string,
  context: OcrContext = {},
): Promise<DocumentOcrResult> {
  try {
    const text = await extractText(file, dataUrl);
    return validateText(docId, text, context);
  } catch (err) {
    console.error("[OCR] Error:", err);
    return {
      status: "gagal_baca",
      ringkas: "Terjadi kesalahan saat membaca dokumen. Coba unggah ulang.",
      diperiksaPada: new Date().toISOString(),
      template: DOC_TEMPLATES[docId]?.templateName ?? "Tidak dikenali",
      temuan: [],
    };
  }
}
