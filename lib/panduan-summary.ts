/* ------------------------------------------------------------------ *
 * Rangkuman panduan — menyusun ikhtisar dari seluruh entri panduan
 * yang diterbitkan admin, supaya UMKM tidak perlu membuka tiap
 * halaman satu per satu.
 *
 * Murni di sisi klien (tanpa LLM): mengolah struktur `PanduanEntry`
 * (judul, ringkas, blok) jadi narasi + daftar poin + daftar dokumen.
 * ------------------------------------------------------------------ */

import type { PanduanBlok, PanduanEntry } from "./types";

const DOKUMEN_KATA_KUNCI =
  /(invoice|packing\s*list|\bpeb\b|\bnpe\b|\bska\b|certificate\s+of\s+origin|keterangan\s+asal|\bnib\b|\bnpwp\b|bill\s+of\s+lading|\bb\/l\b|\bawb\b|\bcoo\b)/i;

export interface RangkumanItem {
  entry: PanduanEntry;
  /** Satu kalimat inti dari langkah tersebut. */
  inti: string;
}

export interface RangkumanDokumen {
  entry: PanduanEntry;
  /** Siapa yang membuat/menerbitkan dokumen ini. */
  penerbit: string;
}

export interface Rangkuman {
  jumlah: number;
  pembuka: string;
  langkah: RangkumanItem[];
  dokumen: RangkumanDokumen[];
}

function potong(teks: string, maks = 180): string {
  const bersih = teks.replace(/\s+/g, " ").trim();
  if (bersih.length <= maks) return bersih;
  return bersih.slice(0, maks - 1).replace(/[\s,;:.-]+\S*$/, "") + "…";
}

/** Kalimat inti sebuah entri: poin pertama → langkah pertama → paragraf → ringkas. */
function intiDari(entry: PanduanEntry): string {
  for (const blok of entry.blok) {
    if (blok.tipe === "poin" && blok.items.length) return potong(blok.items[0]);
  }
  for (const blok of entry.blok) {
    if (blok.tipe === "langkah" && blok.items.length) {
      const l = blok.items[0];
      return potong(l.judul ? `${l.judul} — ${l.detail}` : l.detail);
    }
  }
  for (const blok of entry.blok) {
    if (blok.tipe === "paragraf" && blok.teks.trim()) return potong(blok.teks);
  }
  return potong(entry.ringkas || entry.judul);
}

function penerbitDari(entry: PanduanEntry): string {
  const catatan = entry.blok
    .filter((b): b is Extract<PanduanBlok, { tipe: "catatan" }> => b.tipe === "catatan")
    .map((b) => b.teks.toLowerCase())
    .join(" ");

  if (/buat\s+sendiri|dibuat\s+sendiri|eksportir/.test(catatan)) {
    return "Dibuat sendiri oleh eksportir";
  }
  if (/diurus|diterbitkan|instansi|lembaga/.test(catatan)) {
    return "Diurus / diterbitkan instansi terkait";
  }
  // Fallback berdasarkan jenis dokumen yang umum dibuat sendiri.
  if (/(invoice|packing\s*list|\bpeb\b)/i.test(entry.judul)) {
    return "Dibuat sendiri oleh eksportir";
  }
  return "Diurus / diterbitkan instansi terkait";
}

function isDokumen(entry: PanduanEntry): boolean {
  if (DOKUMEN_KATA_KUNCI.test(entry.judul)) return true;
  // Entri dengan blok "langkah" berjudul "cara" + kata "dokumen" di ringkas.
  return /dokumen|berkas|sertifikat/i.test(entry.ringkas) && entry.blok.some((b) => b.tipe === "langkah");
}

export function buatRangkuman(entries: PanduanEntry[]): Rangkuman {
  const urut = [...entries].sort((a, b) => a.urutan - b.urutan);
  const langkahEntries = urut.filter((e) => !isDokumen(e));
  const dokumenEntries = urut.filter((e) => isDokumen(e));

  const daftarLangkah = (langkahEntries.length ? langkahEntries : urut).map((e) => e.judul);
  const pembuka =
    daftarLangkah.length > 0
      ? `Panduan ekspor ini disusun petugas dalam ${urut.length} bagian. Alur singkatnya: ` +
        daftarLangkah.map((j, i) => `${i + 1}) ${j.toLowerCase()}`).join(", ") +
        `. Rangkuman tiap bagian ada di bawah — klik judulnya untuk penjelasan lengkap.`
      : "Belum ada panduan yang diterbitkan.";

  return {
    jumlah: urut.length,
    pembuka,
    langkah: (langkahEntries.length ? langkahEntries : urut).map((entry) => ({
      entry,
      inti: intiDari(entry),
    })),
    dokumen: dokumenEntries.map((entry) => ({
      entry,
      penerbit: penerbitDari(entry),
    })),
  };
}
