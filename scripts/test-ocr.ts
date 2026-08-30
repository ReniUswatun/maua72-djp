/* eslint-disable no-console */
/**
 * Test harness OCR — memverifikasi template (`validateText`) terhadap PDF
 * contoh di `file-testing-pdf/`.
 *
 * Catatan: pdfjs-dist v6 tidak bisa dijalankan di Node pada mesin ini
 * (SIGILL), sedangkan di browser aman. Karena PDF contoh dibuat tanpa
 * kompresi dengan satu operator `(teks) Tj` per baris, teks diekstrak di
 * sini lewat regex — hasilnya identik dengan ekstraksi line-aware pdfjs
 * (`hasEOL` → satu baris per item).
 *
 * Jalankan di dalam kontainer: `tsx scripts/test-ocr.ts`
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { validateText } from "../lib/ocr-engine";
import type { OcrContext } from "../lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "file-testing-pdf");

/** Ekstrak teks dari PDF contoh sederhana (operator `(...) Tj` per baris). */
function extractSimplePdfText(buf: Buffer): string {
  const raw = buf.toString("latin1");
  const lines: string[] = [];
  const re = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    lines.push(m[1].replace(/\\([()\\])/g, "$1"));
  }
  return lines
    .join("\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, "  ")
    .trim();
}

// Konteks yang COCOK dengan isi PDF contoh (PT TESTING SUKSES MAKMUR).
const CTX_COCOK: OcrContext = {
  namaUsaha: "PT TESTING SUKSES MAKMUR",
  nomorNib: "1234567890123",
  nomorNpwp: "99.888.777.6-555.444",
  hsCode: "4602.19.00",
  nilaiEkspor: "15000",
  negaraTujuan: "United States",
  namaProduk: "Rattan Furniture",
  pembeli: "GLOBAL IMPORTS LLC",
};

// Konteks yang SALAH — untuk memastikan mismatch benar-benar terdeteksi.
const CTX_SALAH: OcrContext = {
  namaUsaha: "CV BATIK NUSANTARA",
  nomorNib: "9999999999999",
  nomorNpwp: "01.234.567.8-999.000",
  hsCode: "0901.21.00",
  nilaiEkspor: "42000",
  negaraTujuan: "Japan",
  namaProduk: "Kopi Arabika",
  pembeli: "TOKYO TRADING CO",
};

// `expectSalah`: status yang diharapkan saat konteks sengaja dibuat salah.
// Packing List tidak punya cross-check angka (hanya nama = catatan lunak),
// jadi dengan konteks salah pun statusnya tetap "cocok" — itu memang desain.
const CASES: { file: string; docId: string; expectSalah: string }[] = [
  { file: "dummy-nib.pdf", docId: "doc-nib", expectSalah: "perlu_perbaikan" },
  { file: "dummy-npwp.pdf", docId: "doc-npwp", expectSalah: "perlu_perbaikan" },
  { file: "dummy-invoice.pdf", docId: "doc-invoice", expectSalah: "perlu_perbaikan" },
  { file: "dummy-packing-list.pdf", docId: "doc-packing", expectSalah: "cocok" },
  { file: "dummy-peb.pdf", docId: "doc-peb", expectSalah: "perlu_perbaikan" },
  { file: "dummy-ska.pdf", docId: "doc-ska", expectSalah: "perlu_perbaikan" },
];

function jalankan(label: string, ctx: OcrContext, harusCocok: boolean, gabung = false) {
  console.log("\n\n########## " + label + " ##########");
  for (const c of CASES) {
    let text = extractSimplePdfText(fs.readFileSync(path.join(dir, c.file)));
    if (gabung) text = text.replace(/\n+/g, "  ").trim();
    const res = validateText(c.docId, text, ctx);
    const target = harusCocok ? "cocok" : c.expectSalah;
    const flag = res.status === target ? "PASS" : "FAIL";
    console.log("\n" + "=".repeat(72));
    console.log(`[${flag}] ${c.file}  →  ${res.status}   (${res.template})`);
    if (label.includes("COCOK")) {
      console.log("RAW:\n" + text.split("\n").map((l) => "   | " + l).join("\n"));
    }
    for (const t of res.temuan) {
      const mark = t.sesuai ? "  ok " : " !!  ";
      console.log(`${mark} ${t.field.padEnd(30)} = ${JSON.stringify(t.terbaca)}`);
      if (t.catatan) console.log(`        ↳ ${t.catatan}`);
    }
    console.log("RINGKAS: " + res.ringkas);
  }
}

jalankan("KONTEKS COCOK — teks line-aware (harus semua status=cocok)", CTX_COCOK, true);
jalankan("KONTEKS COCOK — teks tergabung 1 baris (harus semua status=cocok)", CTX_COCOK, true, true);
jalankan("KONTEKS SALAH (nilai angka harus perlu_perbaikan)", CTX_SALAH, false);
