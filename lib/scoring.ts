import {
  PILLARS,
  getPillar,
  questionsForPillar,
  questionsForProfile,
} from "./assessment-config";
import type {
  Answer,
  AnswerMap,
  AssessmentResult,
  BusinessProfile,
  LevelId,
  PillarScore,
  Question,
  ReadinessLevel,
} from "./types";

/* ------------------------------------------------------------------ *
 * Level kesiapan (blueprint §5.5 & §8)
 * ------------------------------------------------------------------ */

export const LEVELS: Record<LevelId, ReadinessLevel> = {
  1: {
    id: 1,
    nama: "Belum Siap",
    rentang: "0 – 29",
    deskripsi:
      "Fondasi legalitas usaha perlu dibereskan lebih dulu sebelum bicara ekspor.",
    warna: "text-danger",
    bg: "bg-red-50",
    border: "border-red-200",
    ring: "#DC2626",
  },
  2: {
    id: 2,
    nama: "Tahap Awal",
    rentang: "30 – 49",
    deskripsi:
      "Legalitas mulai berjalan. Fokus berikutnya adalah penguatan produk dan pemahaman dasar ekspor.",
    warna: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    ring: "#EA580C",
  },
  3: {
    id: 3,
    nama: "Sedang Berkembang",
    rentang: "50 – 69",
    deskripsi:
      "Dasar usaha sudah kuat. Saatnya mendalami dokumen kepabeanan dan riset pasar tujuan.",
    warna: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    ring: "#D97706",
  },
  4: {
    id: 4,
    nama: "Hampir Siap",
    rentang: "70 – 84",
    deskripsi:
      "Sebagian besar syarat sudah terpenuhi. Tinggal merapikan dokumen dan menyiapkan pengiriman perdana.",
    warna: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    ring: "#0D9488",
  },
  5: {
    id: 5,
    nama: "Siap Ekspor",
    rentang: "85 – 100",
    deskripsi:
      "Usaha Anda siap mengajukan PEB. Fokus pada konsistensi mutu dan perluasan pasar.",
    warna: "text-success",
    bg: "bg-green-50",
    border: "border-green-200",
    ring: "#16A34A",
  },
};

export function levelFromScore(skor: number): LevelId {
  if (skor < 30) return 1;
  if (skor < 50) return 2;
  if (skor < 70) return 3;
  if (skor < 85) return 4;
  return 5;
}

/* ------------------------------------------------------------------ *
 * Perhitungan skor
 * ------------------------------------------------------------------ */

/** Poin maksimal sebuah pertanyaan. Multi-select = jumlah semua opsi positif. */
export function maxPoin(q: Question): number {
  if (q.type === "multi") {
    return q.options.reduce((s, o) => s + Math.max(o.poin, 0), 0);
  }
  return Math.max(...q.options.map((o) => o.poin));
}

/** Poin yang diperoleh dari sebuah jawaban. */
export function poinJawaban(q: Question, jawaban: Answer | undefined): number {
  if (jawaban === undefined) return 0;
  if (q.type === "multi") {
    const ids = Array.isArray(jawaban) ? jawaban : [jawaban];
    return q.options
      .filter((o) => ids.includes(o.id))
      .reduce((s, o) => s + o.poin, 0);
  }
  const opt = q.options.find((o) => o.id === jawaban);
  return opt?.poin ?? 0;
}

export function isTerjawab(q: Question, jawaban: Answer | undefined): boolean {
  if (jawaban === undefined) return false;
  if (q.type === "multi") return Array.isArray(jawaban) && jawaban.length > 0;
  return typeof jawaban === "string" && jawaban.length > 0;
}

/**
 * Skor satu pilar = rata-rata tertimbang persentase poin tiap pertanyaan.
 * Pertanyaan yang belum dijawab dihitung 0 (mendorong asesmen diselesaikan).
 */
export function hitungSkorPilar(
  pillarId: number,
  answers: AnswerMap,
  profile: BusinessProfile | null,
): PillarScore {
  const qs = questionsForPillar(pillarId, profile);
  let totalBobot = 0;
  let akumulasi = 0;
  let terjawab = 0;

  for (const q of qs) {
    const bobot = q.bobot ?? 1;
    const maks = maxPoin(q);
    totalBobot += bobot;
    if (maks > 0) {
      akumulasi += (poinJawaban(q, answers[q.id]) / maks) * bobot;
    }
    if (isTerjawab(q, answers[q.id])) terjawab += 1;
  }

  return {
    pillarId,
    skor: totalBobot === 0 ? 0 : Math.round((akumulasi / totalBobot) * 100),
    terjawab,
    total: qs.length,
  };
}

export function hitungSemuaPilar(
  answers: AnswerMap,
  profile: BusinessProfile | null,
): PillarScore[] {
  return PILLARS.map((p) => hitungSkorPilar(p.id, answers, profile));
}

export function hitungSkorTotal(pilar: PillarScore[]): number {
  const total = pilar.reduce((s, ps) => {
    const bobot = getPillar(ps.pillarId)?.bobot ?? 0;
    return s + ps.skor * bobot;
  }, 0);
  return Math.round(total);
}

/* ------------------------------------------------------------------ *
 * Aturan override & flag untuk petugas (blueprint §8)
 * ------------------------------------------------------------------ */

/** Kategori yang produknya sering masuk daftar Lartas atau butuh izin teknis. */
const KATEGORI_BERISIKO = [
  "perikanan",
  "pertanian",
  "kopi",
  "kayu",
  "furniture",
  "handicraft",
  "herbal",
  "fnb",
  "kosmetik",
];

interface OverrideHasil {
  level: LevelId;
  catatan: string[];
  flag: string[];
}

function terapkanOverride(
  levelAwal: LevelId,
  answers: AnswerMap,
  profile: BusinessProfile | null,
): OverrideHasil {
  const catatan: string[] = [];
  const flag: string[] = [];
  let level = levelAwal;

  // Gate legalitas: tanpa NIB, level dibatasi maksimal 2.
  const nib = profile?.nomorNib;
  if (!nib || nib.trim() === "") {
    if (level > 2) {
      catatan.push(
        "Level dibatasi maksimal 2 karena usaha belum memiliki NIB. NIB adalah syarat mutlak sebelum dokumen ekspor bisa diajukan.",
      );
      level = 2;
    }
    flag.push("Belum memiliki NIB — perlu pendampingan pengurusan di OSS.");
  }

  // Lartas belum dicek pada kategori berisiko.
  const lartas = answers["p3_2"];
  const berisiko = KATEGORI_BERISIKO.includes(profile?.kategoriId ?? "");
  if ((lartas === "d" || lartas === "e") && berisiko) {
    flag.push(
      "Kategori usaha berisiko Lartas namun status Lartas belum pernah dicek — perlu verifikasi HS Code oleh petugas.",
    );
  }

  // Produk konsumsi tanpa sertifikat apa pun.
  const sert = answers["p2_4"];
  if (Array.isArray(sert) && sert.includes("z")) {
    flag.push(
      "Produk konsumsi/perawatan tubuh belum memiliki sertifikat halal maupun izin edar.",
    );
  }

  // Bahan kayu tanpa SVLK.
  if (answers["p2_6"] === "c") {
    flag.push("Bahan baku kayu/rotan belum tercakup SVLK — hambatan ekspor ke Uni Eropa.");
  }

  return { level, catatan, flag };
}

/* ------------------------------------------------------------------ *
 * Hasil akhir
 * ------------------------------------------------------------------ */

export function hitungHasil(
  answers: AnswerMap,
  profile: BusinessProfile | null,
  tanggal: string = new Date().toISOString(),
): AssessmentResult {
  const pilar = hitungSemuaPilar(answers, profile);
  const skorTotal = hitungSkorTotal(pilar);
  const levelSebelumOverride = levelFromScore(skorTotal);
  const { level, catatan, flag } = terapkanOverride(
    levelSebelumOverride,
    answers,
    profile,
  );

  return {
    id: `asesmen-${tanggal.slice(0, 10)}-${Math.random().toString(36).slice(2, 7)}`,
    tanggal,
    skorTotal,
    level,
    levelSebelumOverride,
    overrides: catatan,
    pilar,
    flagPetugas: flag,
  };
}

/* ------------------------------------------------------------------ *
 * Progres pengisian
 * ------------------------------------------------------------------ */

export function progresAsesmen(
  answers: AnswerMap,
  profile: BusinessProfile | null,
) {
  const qs = questionsForProfile(profile);
  const terjawab = qs.filter((q) => isTerjawab(q, answers[q.id])).length;
  return {
    terjawab,
    total: qs.length,
    persen: qs.length === 0 ? 0 : Math.round((terjawab / qs.length) * 100),
    selesai: terjawab === qs.length && qs.length > 0,
  };
}

/* ------------------------------------------------------------------ *
 * Ringkasan naratif (blueprint §5.5 poin 2)
 * ------------------------------------------------------------------ */

export function ringkasanNaratif(
  hasil: AssessmentResult,
  namaUsaha?: string,
): string {
  const level = LEVELS[hasil.level];
  const urut = [...hasil.pilar].sort((a, b) => b.skor - a.skor);
  const kuat = urut.slice(0, 2).map((p) => getPillar(p.pillarId)?.nama);
  const lemah = urut
    .slice(-2)
    .reverse()
    .map((p) => getPillar(p.pillarId)?.nama);

  const subjek = namaUsaha ? `${namaUsaha}` : "Usaha Anda";

  let teks =
    `${subjek} berada di Level ${hasil.level} — ${level.nama} dengan skor ${hasil.skorTotal} dari 100. ` +
    `Kekuatan Anda saat ini ada di ${kuat.join(" dan ")}, ` +
    `sementara jarak terbesar menuju kesiapan ekspor ada pada ${lemah.join(" dan ")}. `;

  if (hasil.overrides.length > 0) {
    teks += hasil.overrides.join(" ") + " ";
  }

  teks +=
    "Rekomendasi di bawah disusun berurutan dari yang paling menentukan, dan akan divalidasi oleh petugas Bea dan Cukai sebelum Anda tindak lanjuti.";

  return teks;
}
