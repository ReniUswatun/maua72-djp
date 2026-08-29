/* ------------------------------------------------------------------ *
 * Akurasi OCR — mengukur seberapa sering pembacaan OCR terhadap
 * dokumen yang diunggah UMKM cocok dengan template contoh.
 *
 * Ini metrik yang membuat sistem mengaudit dirinya sendiri: berapa
 * banyak dokumen lolos tanpa catatan vs perlu perbaikan.
 * ------------------------------------------------------------------ */

import type { ApplicationCase, DocumentItem } from "./types";

export interface OcrAccuracyReport {
  /** Dokumen yang sudah punya hasil OCR. */
  diperiksa: number;
  cocok: number;
  perluPerbaikan: number;
  gagalBaca: number;
  /** Total kolom yang dicek OCR di seluruh dokumen. */
  totalField: number;
  fieldSesuai: number;
  /** % dokumen yang lolos OCR tanpa catatan. */
  akurasiDokumen: number;
  /** % kolom yang terbaca sesuai template. */
  akurasiField: number;
  perTemplate: {
    template: string;
    diperiksa: number;
    cocok: number;
    akurasi: number;
  }[];
}

function documentsOf(cases: ApplicationCase[]): DocumentItem[] {
  return cases.flatMap((item) => item.documents).filter((doc) => Boolean(doc.ocr));
}

export function computeOcrAccuracy(cases: ApplicationCase[]): OcrAccuracyReport {
  const docs = documentsOf(cases);
  const diperiksa = docs.length;
  let cocok = 0;
  let perluPerbaikan = 0;
  let gagalBaca = 0;
  let totalField = 0;
  let fieldSesuai = 0;

  const templateMap = new Map<string, { diperiksa: number; cocok: number }>();

  for (const doc of docs) {
    const result = doc.ocr!;
    if (result.status === "cocok") cocok += 1;
    else if (result.status === "perlu_perbaikan") perluPerbaikan += 1;
    else if (result.status === "gagal_baca") gagalBaca += 1;

    for (const temuan of result.temuan) {
      totalField += 1;
      if (temuan.sesuai) fieldSesuai += 1;
    }

    const bucket = templateMap.get(result.template) ?? { diperiksa: 0, cocok: 0 };
    bucket.diperiksa += 1;
    if (result.status === "cocok") bucket.cocok += 1;
    templateMap.set(result.template, bucket);
  }

  return {
    diperiksa,
    cocok,
    perluPerbaikan,
    gagalBaca,
    totalField,
    fieldSesuai,
    akurasiDokumen: diperiksa === 0 ? 0 : Math.round((cocok / diperiksa) * 100),
    akurasiField: totalField === 0 ? 0 : Math.round((fieldSesuai / totalField) * 100),
    perTemplate: [...templateMap.entries()]
      .map(([template, bucket]) => ({
        template,
        diperiksa: bucket.diperiksa,
        cocok: bucket.cocok,
        akurasi: bucket.diperiksa === 0 ? 0 : Math.round((bucket.cocok / bucket.diperiksa) * 100),
      }))
      .sort((a, b) => a.template.localeCompare(b.template)),
  };
}
