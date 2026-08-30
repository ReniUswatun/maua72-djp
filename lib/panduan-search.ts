/* ------------------------------------------------------------------ *
 * Pencarian panduan + jawaban ringkas ala "AI overview".
 *
 * Semua di sisi klien (tanpa LLM): mencari entri panduan yang relevan
 * dengan kata kunci, lalu menyusun jawaban singkat dari kalimat-kalimat
 * paling relevan di entri tersebut — lengkap dengan sumbernya.
 *
 * Skoring memakai bobot ala IDF: kata yang muncul di hampir semua entri
 * (mis. "ekspor") nyaris tak berbobot, kata spesifik ("ska", "lartas")
 * berbobot tinggi — supaya query awam tidak "kabur" ke entri yang salah.
 * ------------------------------------------------------------------ */

import type { PanduanBlok, PanduanEntry } from "./types";

/* ── Tokenisasi ────────────────────────────────────────────────────── */

const STOPWORDS = new Set([
  // Indonesia
  "yang", "untuk", "dari", "dan", "atau", "dengan", "pada", "ke", "di", "dalam",
  "itu", "ini", "ada", "adalah", "akan", "juga", "agar", "bisa", "dapat", "tidak",
  "sudah", "saat", "oleh", "sebagai", "apa", "bagaimana", "cara", "kah", "kalau",
  "bila", "harus", "saya", "kami", "anda", "mereka", "nya", "para", "buat",
  "membuat", "mengurus", "urus", "punya", "lebih", "sangat", "tentang",
  // English
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "is", "are",
  "how", "what", "do", "does", "my", "your", "with", "about",
]);

/** Sinonim / bentuk lain supaya query awam tetap ketemu. */
const SINONIM: Record<string, string[]> = {
  npwp: ["pajak"],
  nib: ["oss"],
  ska: ["asal", "origin", "preferensi", "coo"],
  peb: ["pabean", "npe", "ceisa"],
  invoice: ["faktur"],
  packing: ["kemasan"],
  hs: ["tarif", "klasifikasi", "lartas"],
  kode: ["hs"],
  buyer: ["pembeli", "importir"],
  pembeli: ["buyer"],
  bayar: ["pembayaran"],
  pembayaran: ["bayar"],
  kirim: ["pengiriman", "muat"],
  pengiriman: ["kirim", "logistik"],
  kapal: ["vessel", "muat"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function queryTokens(query: string): string[] {
  const base = tokenize(query);
  const extra = base.flatMap((t) => SINONIM[t] ?? []);
  return Array.from(new Set([...base, ...extra]));
}

/* ── Ekstraksi kalimat dari entri ──────────────────────────────────── */

interface Kalimat {
  teks: string;
  entry: PanduanEntry;
}

function pisahKalimat(teks: string): string[] {
  return teks
    .replace(/\s+/g, " ")
    // Pisah di akhir kalimat, tapi jangan di singkatan umum ("mis.", "dsb.").
    .split(/(?<!\bmis\.)(?<!\bmisal\.)(?<!\bdsb\.)(?<!\bdst\.)(?<!\bhal\.)(?<!\bno\.)(?<!\bl\.)(?<=[.!?])\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function blokKeTeks(blok: PanduanBlok): string[] {
  switch (blok.tipe) {
    case "paragraf":
    case "catatan":
      return pisahKalimat(blok.teks);
    case "poin":
      return blok.items.flatMap(pisahKalimat);
    case "langkah":
      return blok.items.flatMap((i) =>
        pisahKalimat(i.judul ? `${i.judul}: ${i.detail}` : i.detail),
      );
    default:
      return [];
  }
}

function isiEntry(entry: PanduanEntry): string {
  return entry.blok.flatMap(blokKeTeks).join(" ");
}

function semuaKalimat(entry: PanduanEntry): Kalimat[] {
  const dari = [...pisahKalimat(entry.ringkas), ...entry.blok.flatMap(blokKeTeks)];
  return dari.map((teks) => ({ teks, entry }));
}

/* ── Bobot IDF ─────────────────────────────────────────────────────── */

/** Jumlah kemunculan token sebagai awal kata (mis. "oss" TIDAK cocok "gross"). */
function cocokKata(low: string, token: string): number {
  let n = 0;
  let i = low.indexOf(token);
  while (i !== -1) {
    const sebelum = i === 0 ? " " : low[i - 1];
    if (!/[a-z0-9]/.test(sebelum)) n++;
    i = low.indexOf(token, i + 1);
  }
  return n;
}

function hitungBobot(entries: PanduanEntry[], tokens: string[]): Map<string, number> {
  const N = entries.length || 1;
  const teksEntry = entries.map((e) => `${e.judul} ${e.ringkas} ${isiEntry(e)}`.toLowerCase());
  const bobot = new Map<string, number>();
  for (const t of tokens) {
    const df = teksEntry.filter((teks) => cocokKata(teks, t) > 0).length;
    // df 0  → 0 (tak ada di korpus)
    // df 1  → tinggi; df ≈ N → mendekati 0
    bobot.set(t, df === 0 ? 0 : Math.max(0.15, Math.log((N + 1) / df)));
  }
  return bobot;
}

function skorTeks(haystack: string, tokens: string[], bobot: Map<string, number>): number {
  const low = haystack.toLowerCase();
  let skor = 0;
  for (const t of tokens) {
    const w = bobot.get(t) ?? 0;
    if (w === 0) continue;
    const n = cocokKata(low, t);
    if (n > 0) skor += w * (1 + Math.min(n, 3) * 0.4);
  }
  return skor;
}

/* ── Tipe hasil ────────────────────────────────────────────────────── */

export interface HasilPencarian {
  entry: PanduanEntry;
  skor: number;
  /** Cuplikan paling relevan dari entri ini. */
  cuplikan: string;
}

export interface PoinJawaban {
  teks: string;
  sumberJudul: string;
  sumberSlug: string;
}

export interface JawabanPencarian {
  query: string;
  ada: boolean;
  jawaban: string;
  poin: PoinJawaban[];
  sumber: PanduanEntry[];
  hasil: HasilPencarian[];
}

/* ── Pencarian ─────────────────────────────────────────────────────── */

function analisis(entries: PanduanEntry[], query: string) {
  const tokens = queryTokens(query);
  const bobot = hitungBobot(entries, tokens);
  const bobotTotal = tokens.reduce((s, t) => s + (bobot.get(t) ?? 0), 0);

  const dinilai = entries
    .map((entry) => {
      const skor =
        skorTeks(entry.judul, tokens, bobot) * 3 +
        skorTeks(entry.ringkas, tokens, bobot) * 2 +
        skorTeks(isiEntry(entry), tokens, bobot);

      const kalimatTerbaik = semuaKalimat(entry)
        .map((k) => ({ k, s: skorTeks(k.teks, tokens, bobot) }))
        .sort((a, b) => b.s - a.s)[0];

      return {
        entry,
        skor,
        cuplikan:
          kalimatTerbaik && kalimatTerbaik.s > 0 ? kalimatTerbaik.k.teks : entry.ringkas,
      };
    })
    .filter((r) => r.skor > 0)
    .sort((a, b) => b.skor - a.skor);

  // Ambang relevansi: butuh minimal satu kata cukup spesifik dan skor
  // tidak jauh di bawah hasil terbaik.
  const adaKataSpesifik = tokens.some((t) => (bobot.get(t) ?? 0) >= 0.6);
  const layak =
    dinilai.length > 0 && adaKataSpesifik && bobotTotal > 0 && dinilai[0].skor >= 1.2;

  const hasil = layak
    ? dinilai.filter((r) => r.skor >= Math.max(0.8, dinilai[0].skor * 0.12))
    : [];

  return { tokens, bobot, hasil };
}

/** Cari entri panduan yang relevan dengan query, terurut. */
export function cariPanduan(entries: PanduanEntry[], query: string): HasilPencarian[] {
  return analisis(entries, query).hasil;
}

/** Susun jawaban ringkas ala "AI overview" dari hasil pencarian. */
export function jawabPencarian(entries: PanduanEntry[], query: string): JawabanPencarian {
  const { tokens, bobot, hasil } = analisis(entries, query);

  if (hasil.length === 0) {
    return { query, ada: false, jawaban: "", poin: [], sumber: [], hasil: [] };
  }

  const topEntries = hasil.slice(0, 3).map((r) => r.entry);

  const kandidat = topEntries
    .flatMap(semuaKalimat)
    .map((k) => ({ ...k, s: skorTeks(k.teks, tokens, bobot) }))
    .filter((k) => k.s > 0)
    .sort((a, b) => b.s - a.s);

  // Hanya kalimat yang cukup relevan dibanding kalimat terbaik.
  const ambangKalimat = kandidat.length ? kandidat[0].s * 0.25 : 0;

  const dipakai: typeof kandidat = [];
  for (const k of kandidat) {
    if (k.s < ambangKalimat) break;
    const norm = k.teks.toLowerCase().slice(0, 60);
    if (dipakai.some((d) => d.teks.toLowerCase().slice(0, 60) === norm)) continue;
    dipakai.push(k);
    if (dipakai.length >= 5) break;
  }

  const jawaban =
    dipakai.length > 0
      ? dipakai.slice(0, 2).map((d) => rapikan(d.teks)).join(" ")
      : rapikan(hasil[0].cuplikan);

  const poin: PoinJawaban[] = dipakai.slice(2, 5).map((d) => ({
    teks: rapikan(d.teks),
    sumberJudul: d.entry.judul,
    sumberSlug: d.entry.slug,
  }));

  const slugDipakai = new Set([...dipakai.map((d) => d.entry.slug), hasil[0].entry.slug]);
  const sumber = topEntries.filter((e) => slugDipakai.has(e.slug));

  return { query, ada: true, jawaban, poin, sumber, hasil };
}

function rapikan(teks: string): string {
  let s = teks.replace(/\s+/g, " ").trim();
  if (s && !/[.!?]$/.test(s)) s += ".";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
