/* ------------------------------------------------------------------ *
 * AI Accuracy Tracker (fitur C6)
 *
 * Mengukur seberapa sering draf AI diterima apa adanya oleh officer vs
 * diedit. Ini metrik yang secara desain membuat sistem mengaudit dirinya
 * sendiri — berguna untuk narasi akuntabilitas ke instansi.
 * ------------------------------------------------------------------ */

import { getPillar } from "./assessment-config";
import type { ApplicationCase, ReviewDimension } from "./types";

export type DimensionOutcome = "diterima" | "skor-disesuaikan" | "teks-disunting" | "belum-direview";

export function dimensionOutcome(dimension: ReviewDimension): DimensionOutcome {
  const textEdited = dimension.officerDraft.trim() !== dimension.aiDraft.trim();
  const scoreEdited = dimension.officerScore !== dimension.aiScore;
  const touched =
    dimension.status !== "baru" ||
    Boolean(dimension.officerNote) ||
    Boolean(dimension.decisionReason) ||
    textEdited ||
    scoreEdited;

  if (!touched) return "belum-direview";
  if (textEdited) return "teks-disunting";
  if (scoreEdited) return "skor-disesuaikan";
  return "diterima";
}

export interface AccuracyBucket {
  total: number;
  diterima: number;
  skorDisesuaikan: number;
  teksDisunting: number;
  belumDireview: number;
  /** % draf yang diterima apa adanya, dari yang sudah direview. */
  akurasi: number;
}

function emptyBucket(): AccuracyBucket {
  return {
    total: 0,
    diterima: 0,
    skorDisesuaikan: 0,
    teksDisunting: 0,
    belumDireview: 0,
    akurasi: 0,
  };
}

function tally(bucket: AccuracyBucket, outcome: DimensionOutcome) {
  bucket.total += 1;
  if (outcome === "diterima") bucket.diterima += 1;
  else if (outcome === "skor-disesuaikan") bucket.skorDisesuaikan += 1;
  else if (outcome === "teks-disunting") bucket.teksDisunting += 1;
  else bucket.belumDireview += 1;
}

function finalize(bucket: AccuracyBucket): AccuracyBucket {
  const reviewed = bucket.total - bucket.belumDireview;
  bucket.akurasi = reviewed === 0 ? 0 : Math.round((bucket.diterima / reviewed) * 100);
  return bucket;
}

export interface AccuracyReport {
  overall: AccuracyBucket;
  perPillar: { pillarId: number; label: string; bucket: AccuracyBucket }[];
}

export function computeAccuracy(cases: ApplicationCase[]): AccuracyReport {
  const overall = emptyBucket();
  const perPillarMap = new Map<number, AccuracyBucket>();

  for (const item of cases) {
    for (const dimension of item.dimensions) {
      const outcome = dimensionOutcome(dimension);
      tally(overall, outcome);

      const bucket = perPillarMap.get(dimension.pillarId) ?? emptyBucket();
      tally(bucket, outcome);
      perPillarMap.set(dimension.pillarId, bucket);
    }
  }

  return {
    overall: finalize(overall),
    perPillar: [...perPillarMap.entries()]
      .map(([pillarId, bucket]) => ({
        pillarId,
        label: getPillar(pillarId)?.nama ?? `Pilar ${pillarId}`,
        bucket: finalize(bucket),
      }))
      .sort((a, b) => a.pillarId - b.pillarId),
  };
}
