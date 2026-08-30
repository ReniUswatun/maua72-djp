/**
 * OCR Engine — frontend-only.
 *
 * Untuk PDF: gunakan pdfjs-dist untuk mengekstrak teks digital.
 * Untuk gambar (JPG/PNG): gunakan Tesseract.js untuk OCR.
 * Setelah teks diperoleh, cocokkan dengan template dokumen.
 */

import type { DocumentOcrResult, OcrFieldCheck, OcrStatus } from "@/lib/types";
import { DOC_TEMPLATES, detectTemplate } from "@/lib/doc-templates";

// ─── Text extraction ────────────────────────────────────────────────

async function extractTextFromPdf(dataUrl: string): Promise<string> {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");
  // Point worker to the bundled worker file
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  // Convert data-URI to Uint8Array
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

async function extractTextFromImage(dataUrl: string): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const { data } = await Tesseract.recognize(dataUrl, "eng+ind", {
    logger: () => {}, // suppress progress logs
  });
  return data.text ?? "";
}

async function extractText(file: File, dataUrl: string): Promise<string> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.type.startsWith("image/");

  if (isPdf) {
    return extractTextFromPdf(dataUrl);
  } else if (isImage) {
    return extractTextFromImage(dataUrl);
  }
  // Fallback: try to treat as plain text (txt, csv)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) ?? "");
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

// ─── Validation ─────────────────────────────────────────────────────

function validateText(docId: string, text: string): DocumentOcrResult {
  let template = DOC_TEMPLATES[docId];
  
  if (template) {
    const matched = template.identifikasi.some((r) => r.test(text));
    if (!matched) {
       const actualDetected = detectTemplate(text);
       const ringkas = actualDetected 
         ? `Dokumen terdeteksi sebagai ${actualDetected.templateName}, bukan ${template.templateName}. Pastikan Anda mengunggah file yang benar.`
         : `Teks tidak mengandung kata kunci untuk ${template.templateName}. Pastikan file benar.`;
       
       return {
           status: "gagal_baca",
           ringkas,
           diperiksaPada: new Date().toISOString(),
           template: actualDetected ? actualDetected.templateName : "Tidak Dikenali",
           temuan: [],
       };
    }
  } else {
    const detected = detectTemplate(text);
    if (!detected) {
      return {
        status: "gagal_baca",
        ringkas: "Tidak dapat mengidentifikasi jenis dokumen. Pastikan file benar.",
        diperiksaPada: new Date().toISOString(),
        template: "Tidak dikenali",
        temuan: [],
      };
    }
    template = detected;
  }

  const temuan: OcrFieldCheck[] = template.fields.map((rule) => {
    const match = rule.regex.test(text);
    const terbaca = match
      ? (() => {
          const m = text.match(rule.regex);
          return m ? m[0].slice(0, 80).trim() : "✓ Terdeteksi"
        })()
      : "Tidak ditemukan";
    return {
      field: rule.label,
      terbaca,
      diharapkan: rule.diharapkan,
      sesuai: match,
      catatan: !match && rule.wajib ? "Field wajib tidak ditemukan dalam dokumen." : undefined,
    };
  });

  const wajibMissing = temuan.filter(
    (t) => !t.sesuai && template.fields.find((f) => f.label === t.field)?.wajib
  );
  const allOk = wajibMissing.length === 0;

  let status: OcrStatus = allOk ? "cocok" : "perlu_perbaikan";
  if (text.length < 50) status = "gagal_baca";

  const ringkas =
    status === "cocok"
      ? `Semua field penting terdeteksi. Dokumen tampak sesuai template ${template.templateName}.`
      : status === "gagal_baca"
      ? "Tidak ada teks yang berhasil dibaca dari dokumen. Pastikan dokumen tidak berupa scan buram."
      : `Ditemukan ${wajibMissing.length} field wajib yang tidak terdeteksi: ${wajibMissing.map((t) => t.field).join(", ")}.`;

  return {
    status,
    ringkas,
    diperiksaPada: new Date().toISOString(),
    template: template.templateName,
    temuan,
  };
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Jalankan OCR + validasi pada sebuah file yang baru saja diunggah.
 * Mengembalikan `DocumentOcrResult` yang siap disimpan ke store.
 */
export async function runOcr(
  docId: string,
  file: File,
  dataUrl: string
): Promise<DocumentOcrResult> {
  try {
    const text = await extractText(file, dataUrl);
    return validateText(docId, text);
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
