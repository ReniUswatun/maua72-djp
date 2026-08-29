/* ------------------------------------------------------------------ *
 * AI Insights — Explainability (C1) & Confidence (C2)
 *
 * Semua alasan di sini diturunkan HANYA dari data internal asesmen
 * (jawaban mentah + skor pilar). Tidak ada konten regulasi yang dikarang.
 * Tujuannya: officer bisa melihat *kenapa* AI menyimpulkan sesuatu
 * sebelum menyetujuinya, dan tahu kapan AI sedang tidak yakin.
 * ------------------------------------------------------------------ */

import { getPillar } from "./assessment-config";
import type {
  AiConfidence,
  AnswerMap,
  BusinessProfile,
  PillarScore,
} from "./types";

export interface DimensionInsight {
  reason: string;
  confidence: AiConfidence;
  confidenceReason: string;
}

function pillarName(pillarId: number) {
  return getPillar(pillarId)?.nama ?? `Pilar ${pillarId}`;
}

/** Petunjuk spesifik per pilar berdasarkan jawaban tertentu. */
function specificSignals(pillarId: number, answers: AnswerMap, profile: BusinessProfile | null): string[] {
  const signals: string[] = [];

  if (pillarId === 2) {
    const sert = answers["p2_4"];
    if (Array.isArray(sert) && sert.includes("z")) {
      signals.push("jawaban menandai produk belum punya sertifikat halal maupun izin edar");
    }
    if (answers["p2_2"] === "d") signals.push("belum ada standar mutu terdokumentasi");
    if (answers["p2_3"] === "c") signals.push("kemasan masih untuk pasar lokal");
    if (answers["p2_6"] === "c") signals.push("bahan baku kayu/rotan belum tercakup SVLK");
  }

  if (pillarId === 3) {
    const lartas = answers["p3_2"];
    if (lartas === "d" || lartas === "e") signals.push("status Lartas produk belum pernah dicek");
    if (answers["p3_1"] === "c") signals.push("HS Code produk belum diketahui");
  }

  if (pillarId === 4) {
    if (answers["p4_1"] === "c") signals.push("belum memahami alur PEB dan CEISA");
    if (answers["p4_4"] === "c") signals.push("belum pernah berkonsultasi ke Klinik Ekspor");
  }

  if (pillarId === 5 && answers["p5_1"] === "c") {
    signals.push("belum ada calon pembeli atau negara tujuan yang dibidik");
  }

  if (pillarId === 7 && answers["p7_1"] === "a") {
    signals.push("belum memiliki rekening valas");
  }

  if (pillarId === 8 && answers["p8_4"] === "c") {
    signals.push("SOP produksi belum terdokumentasi");
  }

  if ((!profile?.nomorNib || profile.nomorNib.trim() === "") && (pillarId === 3 || pillarId === 4)) {
    signals.push("usaha belum memiliki NIB sehingga dokumen ekspor belum bisa diajukan");
  }

  return signals;
}

export function deriveDimensionInsight(
  pillar: PillarScore,
  answers: AnswerMap,
  profile: BusinessProfile | null,
): DimensionInsight {
  const nama = pillarName(pillar.pillarId);
  const signals = specificSignals(pillar.pillarId, answers, profile);
  const signalText =
    signals.length > 0
      ? ` Indikatornya: ${signals.slice(0, 3).join("; ")}.`
      : "";

  let reason: string;
  if (pillar.skor >= 70) {
    reason = `Dimensi ${nama} dinilai kuat (skor ${pillar.skor}/100) — mayoritas jawaban asesmen pada pilar ini berada di level lanjut.${signalText}`;
  } else if (pillar.skor >= 45) {
    reason = `Dimensi ${nama} perlu penguatan (skor ${pillar.skor}/100) — sebagian area sudah berjalan namun belum konsisten menurut jawaban asesmen.${signalText}`;
  } else {
    reason = `Dimensi ${nama} dinilai belum siap (skor ${pillar.skor}/100) — jawaban asesmen pada pilar ini mayoritas masih di tahap awal.${signalText}`;
  }

  // Confidence: turun bila data asesmen pada pilar ini kurang lengkap,
  // atau bila skor berada di ambang antar-kategori (mudah salah baca).
  const kelengkapan = pillar.total > 0 ? pillar.terjawab / pillar.total : 0;
  const dekatAmbang =
    Math.abs(pillar.skor - 45) <= 5 || Math.abs(pillar.skor - 70) <= 5;

  let confidence: AiConfidence = "tinggi";
  let confidenceReason = `Semua ${pillar.total} pertanyaan pada pilar ini terjawab dan skornya jauh dari ambang antar-kategori.`;

  if (kelengkapan < 0.6) {
    confidence = "rendah";
    confidenceReason = `Hanya ${pillar.terjawab} dari ${pillar.total} pertanyaan pilar ini terjawab — perlu dicek manual sebelum dipakai.`;
  } else if (kelengkapan < 1 || dekatAmbang) {
    confidence = "sedang";
    confidenceReason = dekatAmbang
      ? `Skor ${pillar.skor} berada dekat ambang perubahan kategori — sedikit perbedaan jawaban bisa mengubah kesimpulan.`
      : `${pillar.terjawab} dari ${pillar.total} pertanyaan terjawab — sebagian kecil data belum lengkap.`;
  }

  return { reason, confidence, confidenceReason };
}

export function confidenceTone(confidence: AiConfidence): "success" | "warning" | "danger" {
  if (confidence === "tinggi") return "success";
  if (confidence === "sedang") return "warning";
  return "danger";
}

export function confidenceLabel(confidence: AiConfidence): string {
  return {
    tinggi: "Confidence tinggi",
    sedang: "Confidence sedang",
    rendah: "Confidence rendah — cek manual",
  }[confidence];
}
