/* eslint-disable no-console */
import { SEED_PANDUAN } from "../lib/panduan";
import { jawabPencarian } from "../lib/panduan-search";

const published = SEED_PANDUAN.filter((e) => e.status === "terbit");

for (const q of [
  "cara membuat SKA",
  "HS Code",
  "ajukan PEB ke bea cukai",
  "pembayaran ekspor L/C",
  "NIB OSS",
  "asuransi pengiriman kapal",
  "xyz tidak ada",
]) {
  const j = jawabPencarian(published, q);
  console.log("\n\n=== QUERY:", q, "===");
  if (!j.ada) {
    console.log("(tidak ada hasil)");
    continue;
  }
  console.log("JAWABAN:", j.jawaban);
  console.log("POIN:");
  for (const p of j.poin) console.log("  •", p.teks, "   [" + p.sumberJudul + "]");
  console.log("SUMBER:", j.sumber.map((s) => s.judul).join(" | "));
  console.log("HASIL:", j.hasil.map((r) => `${r.entry.judul} (${r.skor.toFixed(1)})`).join(" | "));
}
