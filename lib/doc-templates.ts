/**
 * Template validasi dokumen ekspor.
 *
 * Tiap template mendefinisikan:
 *  - `identifikasi` — kata kunci untuk memastikan file yang diunggah memang
 *    dokumen jenis ini.
 *  - `fields` — daftar field yang diperiksa. Untuk tiap field:
 *      • `cari`  : mendeteksi apakah field itu ada di teks.
 *      • `ambil` : menarik NILAI aktual field dari teks (group 1).
 *      • `konteks` + `banding` : bila diisi, nilai yang terbaca dibandingkan
 *        dengan data pengajuan/usaha (mis. HS Code invoice vs HS Code pengajuan).
 */

import type { OcrContext } from "@/lib/types";

export type BandingCara = "angka" | "uang" | "teks";

export interface FieldRule {
  /** Label yang ditampilkan ke admin / UMKM. */
  label: string;
  /** Regex untuk mendeteksi apakah field ini ADA dalam teks. */
  cari: RegExp;
  /** Regex untuk menarik nilai aktual (harus punya capture group 1). */
  ambil?: RegExp;
  /** Deskripsi singkat nilai yang diharapkan. */
  diharapkan: string;
  /** Apakah field ini wajib ada? */
  wajib: boolean;
  /** Kunci pada OcrContext yang jadi pembanding nilai terbaca. */
  konteks?: keyof OcrContext;
  /** Cara membandingkan nilai terbaca dengan nilai konteks. */
  banding?: BandingCara;
}

export interface DocTemplate {
  templateName: string;
  /** Kata kunci yang harus ada agar teks diidentifikasi sebagai dokumen ini. */
  identifikasi: RegExp[];
  fields: FieldRule[];
}

/* ── Potongan regex yang dipakai berulang ──────────────────────────── */

// Tanggal: "30 Aug 2026", "30/08/2026", "30-08-2026", "2026-08-30"
const TANGGAL = String.raw`(\d{1,2}[\s\/\-][A-Za-z0-9]{2,9}[\s\/\-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2})`;
// Nilai uang: "USD 15,000", "15.000 USD", "$15,000", "Rp 200.000.000"
const UANG = String.raw`((?:USD|EUR|SGD|JPY|CNY|AUD|GBP|Rp|IDR|\$)?\s*[\d][\d.,]*\s*(?:USD|EUR|SGD|JPY|CNY|AUD|GBP|IDR)?)`;
const HS = String.raw`(\d{4}(?:[.\s]?\d{2}){0,3})`;
// Nama badan usaha / pihak — satu baris, berhenti di akhir baris atau kata kunci field lain.
const NAMA = String.raw`([A-Za-z0-9][^\n]{1,70}?)`;
const STOP_UMUM = String.raw`(?=\s*(?:\n|$|consignee|buyer|shipper|exporter|importer|importir|penerima|notify|description|deskripsi|hs\s*code|invoice|date|tanggal|alamat|address|npwp|kbli|status|country|negara|total|gross|net|nilai|origin|reference|kriteria|criterion))`;
// ID dokumen: minimal satu digit supaya tidak menangkap kata biasa.
const KODE_DOK = String.raw`([A-Za-z0-9][\w\-\/.]*\d[\w\-\/.]*)`;

/* ── Commercial Invoice ────────────────────────────────────────────── */
const INVOICE_TEMPLATE: DocTemplate = {
  templateName: "Template Commercial Invoice Standar",
  identifikasi: [/commercial\s+invoice/i, /\binvoice\b/i],
  fields: [
    {
      label: "Nomor Invoice",
      cari: /invoice\s*(no|number|#)/i,
      ambil: new RegExp(String.raw`invoice\s*(?:no|number|#)\.?\s*[:#\-]?\s*` + KODE_DOK, "i"),
      diharapkan: "Nomor invoice, mis. INV-2026-001",
      wajib: true,
    },
    {
      label: "Tanggal Invoice",
      cari: /\bdate\b|tanggal/i,
      ambil: new RegExp(String.raw`(?:date|tanggal)\s*[:#\-]?\s*` + TANGGAL, "i"),
      diharapkan: "Tanggal penerbitan, mis. 30 Aug 2026",
      wajib: true,
    },
    {
      label: "Nama Penjual / Exporter",
      cari: /shipper|exporter|seller|penjual/i,
      ambil: new RegExp(String.raw`(?:shipper|exporter|seller|penjual)(?:\s*\/\s*\w+)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama usaha Anda (sesuai NIB)",
      wajib: true,
      konteks: "namaUsaha",
      banding: "teks",
    },
    {
      label: "Nama Pembeli / Buyer",
      cari: /consignee|buyer|pembeli/i,
      ambil: new RegExp(String.raw`(?:consignee|buyer|pembeli)(?:\s*\/\s*\w+)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama pembeli (consignee) sesuai pengajuan",
      wajib: true,
      konteks: "pembeli",
      banding: "teks",
    },
    {
      label: "Deskripsi Barang",
      cari: /description|deskripsi\s+barang|goods/i,
      ambil: new RegExp(String.raw`(?:description(?:\s+of\s+goods)?|deskripsi\s+barang)\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Deskripsi barang yang diekspor",
      wajib: true,
    },
    {
      label: "HS Code",
      cari: /hs[\s\-]?code|harmonized|pos\s*tarif/i,
      ambil: new RegExp(String.raw`(?:hs[\s\-]?code|harmonized[\w\s]*|pos\s*tarif)\s*[:#\-]?\s*` + HS, "i"),
      diharapkan: "HS Code sesuai pengajuan",
      wajib: false,
      konteks: "hsCode",
      banding: "angka",
    },
    {
      label: "Total Nilai (Currency)",
      cari: /total|amount|grand\s+total|nilai/i,
      ambil: new RegExp(String.raw`(?:total(?:\s+value|\s+amount)?|grand\s+total|amount|nilai(?:\s+total)?)\s*[:#\-]?\s*` + UANG, "i"),
      diharapkan: "Total nilai = nilai pengajuan (USD)",
      wajib: true,
      konteks: "nilaiEkspor",
      banding: "uang",
    },
    {
      label: "Incoterms",
      cari: /\b(FOB|CIF|EXW|DDP|CFR|FCA|CIP|CPT|DAP|DPU)\b/i,
      ambil: /\b((?:FOB|CIF|EXW|DDP|CFR|FCA|CIP|CPT|DAP|DPU)(?:[ \t][A-Za-z][A-Za-z.]{1,19}){0,3})/i,
      diharapkan: "Incoterms + lokasi, mis. FOB Jakarta",
      wajib: false,
    },
    {
      label: "Tanda Tangan / Cap",
      cari: /signature|signed|authorized|materai|\bcap\b|ttd|tanda\s*tangan|stamp/i,
      diharapkan: "Tanda tangan & cap perusahaan",
      wajib: false,
    },
  ],
};

/* ── Packing List ──────────────────────────────────────────────────── */
const PACKING_TEMPLATE: DocTemplate = {
  templateName: "Template Packing List Standar",
  identifikasi: [/packing\s+list/i],
  fields: [
    {
      label: "Nomor Packing List",
      cari: /(packing\s*list|p\/l|invoice)\s*(no|number|#)/i,
      ambil: new RegExp(String.raw`(?:packing\s*list|p\/l|invoice)\s*(?:no|number|#)\.?\s*[:#\-]?\s*` + KODE_DOK, "i"),
      diharapkan: "Nomor packing list / referensi invoice",
      wajib: true,
    },
    {
      label: "Tanggal",
      cari: /\bdate\b|tanggal/i,
      ambil: new RegExp(String.raw`(?:date|tanggal)\s*[:#\-]?\s*` + TANGGAL, "i"),
      diharapkan: "Tanggal penerbitan",
      wajib: true,
    },
    {
      label: "Nama Penjual / Shipper",
      cari: /shipper|exporter|seller|penjual/i,
      ambil: new RegExp(String.raw`(?:shipper|exporter|seller|penjual)(?:\s*\/\s*\w+)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama usaha Anda (sesuai NIB)",
      wajib: true,
      konteks: "namaUsaha",
      banding: "teks",
    },
    {
      label: "Nama Pembeli / Consignee",
      cari: /consignee|buyer|pembeli/i,
      ambil: new RegExp(String.raw`(?:consignee|buyer|pembeli)(?:\s*\/\s*\w+)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama pembeli sesuai pengajuan",
      wajib: true,
      konteks: "pembeli",
      banding: "teks",
    },
    {
      label: "Jumlah Kemasan (Qty / Carton)",
      cari: /qty|quantity|jumlah|carton|colli|package|pcs|pieces/i,
      ambil: /(?:total\s+)?(?:quantity|qty|jumlah(?:\s+kemasan)?)\s*[:#\-]?\s*([\d][\d.,]*\s*(?:cartons?|ctns?|colli|pcs|pieces|packages?|boxes?|pallets?|drums?)?)/i,
      diharapkan: "Jumlah kemasan / unit, mis. 150 Cartons",
      wajib: true,
    },
    {
      label: "Berat Kotor (Gross Weight)",
      cari: /gross\s*weight|berat\s*kotor|g\.?\s?w\.?/i,
      ambil: /(?:gross\s*weight|berat\s*kotor|g\.?\s?w\.?)\s*[:#\-]?\s*([\d][\d.,]*\s*(?:kgs?|kilograms?|grams?|gr|ton|mt|lbs)?)/i,
      diharapkan: "Berat kotor, mis. 2500 KG",
      wajib: true,
    },
    {
      label: "Berat Bersih (Net Weight)",
      cari: /net\s*weight|berat\s*bersih|n\.?\s?w\.?/i,
      ambil: /(?:net\s*weight|berat\s*bersih|n\.?\s?w\.?)\s*[:#\-]?\s*([\d][\d.,]*\s*(?:kgs?|kilograms?|grams?|gr|ton|mt|lbs)?)/i,
      diharapkan: "Berat bersih, mis. 2300 KG",
      wajib: false,
    },
    {
      label: "Dimensi / Volume",
      cari: /dimension|volume|measurement|cbm|m3|meas\b/i,
      ambil: /(?:volume|measurement|dimension|meas)\s*[:#\-]?\s*([\d][\d.,]*\s*(?:cbm|m3|m³|cm|m)?)/i,
      diharapkan: "Dimensi atau volume kemasan",
      wajib: false,
    },
  ],
};

/* ── PEB / NPE ─────────────────────────────────────────────────────── */
const PEB_TEMPLATE: DocTemplate = {
  templateName: "Template PEB / NPE Bea Cukai",
  identifikasi: [/pemberitahuan\s+ekspor\s+barang|\bPEB\b|nota\s+pelayanan\s+ekspor|\bNPE\b/i],
  fields: [
    {
      label: "Nomor PEB / NPE",
      cari: /(nomor|no|#)\s*(peb|npe|aju|pendaftaran)|pemberitahuan\s+ekspor/i,
      ambil: new RegExp(String.raw`(?:nomor|no|#)\s*(?:peb|npe|aju|pendaftaran)?\s*[:#\-]?\s*` + KODE_DOK, "i"),
      diharapkan: "Nomor PEB / NPE dari Bea Cukai",
      wajib: true,
    },
    {
      label: "Tanggal",
      cari: /tanggal|\bdate\b/i,
      ambil: new RegExp(String.raw`(?:tanggal|date)\s*[:#\-]?\s*` + TANGGAL, "i"),
      diharapkan: "Tanggal pengajuan / persetujuan",
      wajib: true,
    },
    {
      label: "Nama Eksportir",
      cari: /eksportir|exporter|nama\s+perusahaan/i,
      ambil: new RegExp(String.raw`(?:eksportir|exporter)\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama eksportir = nama usaha Anda",
      wajib: true,
      konteks: "namaUsaha",
      banding: "teks",
    },
    {
      label: "NPWP Eksportir",
      cari: /npwp/i,
      ambil: /npwp\s*[:#\-]?\s*(\d{2}[.\-]\d{3}[.\-]\d{3}[.\-]\d[.\-]\d{3}[.\-]\d{3}|\d{15,16})/i,
      diharapkan: "NPWP = NPWP usaha Anda",
      wajib: true,
      konteks: "nomorNpwp",
      banding: "angka",
    },
    {
      label: "HS Code",
      cari: /hs[\s\-]?code|pos\s*tarif/i,
      ambil: new RegExp(String.raw`(?:hs[\s\-]?code|pos\s*tarif)\s*[:#\-]?\s*` + HS, "i"),
      diharapkan: "HS Code = HS Code pengajuan",
      wajib: true,
      konteks: "hsCode",
      banding: "angka",
    },
    {
      label: "Nilai FOB",
      cari: /nilai\s*fob|fob\s*value|nilai\s*ekspor|\bfob\b/i,
      ambil: new RegExp(String.raw`(?:nilai\s*fob|fob\s*value|nilai\s*ekspor|fob)\s*[:#\-]?\s*` + UANG, "i"),
      diharapkan: "Nilai FOB = nilai pengajuan (USD)",
      wajib: true,
      konteks: "nilaiEkspor",
      banding: "uang",
    },
    {
      label: "Nomor Container / Muat",
      cari: /container|kontainer|nomor\s*muat|vessel|kapal/i,
      ambil: /(?:container|kontainer|no\.?\s*cont)\s*[:#\-]?\s*([A-Za-z]{4}\s?\d{6,7}|[A-Za-z0-9\-]{6,20})/i,
      diharapkan: "Nomor container / kapal pengangkut",
      wajib: false,
    },
  ],
};

/* ── SKA / Certificate of Origin ───────────────────────────────────── */
const SKA_TEMPLATE: DocTemplate = {
  templateName: "Template SKA / Certificate of Origin",
  identifikasi: [/certificate\s+of\s+origin|surat\s+keterangan\s+asal|sertifikat\s+keterangan\s+asal|\bSKA\b|\bCOO\b/i],
  fields: [
    {
      label: "Nomor Referensi SKA",
      cari: /reference\s*(no|number|#)|nomor\s*referensi|no\.?\s*ska/i,
      ambil: new RegExp(String.raw`(?:reference|ref|nomor\s*referensi|no\.?\s*ska)\s*(?:no|number|#)?\.?\s*[:#\-]?\s*` + KODE_DOK, "i"),
      diharapkan: "Nomor referensi SKA",
      wajib: true,
    },
    {
      label: "Nama Eksportir / Produsen",
      cari: /exporter|produsen|manufacturer|eksportir/i,
      ambil: new RegExp(String.raw`(?:exporter|produsen|manufacturer|eksportir)(?:\s*\/\s*\w+)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama eksportir = nama usaha Anda",
      wajib: true,
      konteks: "namaUsaha",
      banding: "teks",
    },
    {
      label: "Nama Importir / Consignee",
      cari: /consignee|importer|importir/i,
      ambil: new RegExp(String.raw`(?:consignee|importer|importir)(?:\s*\/\s*\w+)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama importir sesuai pengajuan",
      wajib: true,
      konteks: "pembeli",
      banding: "teks",
    },
    {
      label: "Negara Tujuan",
      cari: /country\s+of\s+destination|negara\s+tujuan|destination/i,
      ambil: /(?:country\s+of\s+destination|negara\s+tujuan|destination)\s*[:#\-]?\s*([A-Za-z][A-Za-z .'\-]{2,40}?)(?=\s{2,}|\s*(?:description|deskripsi|hs\s*code|origin|exporter|$))/i,
      diharapkan: "Negara tujuan = negara tujuan pengajuan",
      wajib: true,
      konteks: "negaraTujuan",
      banding: "teks",
    },
    {
      label: "Deskripsi Barang",
      cari: /description\s+of\s+goods|deskripsi\s+barang|goods/i,
      ambil: new RegExp(String.raw`(?:description(?:\s+of\s+goods)?|deskripsi\s+barang)\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Deskripsi barang",
      wajib: true,
    },
    {
      label: "HS Code",
      cari: /hs[\s\-]?code|harmonized/i,
      ambil: new RegExp(String.raw`(?:hs[\s\-]?code|harmonized[\w\s]*)\s*[:#\-]?\s*` + HS, "i"),
      diharapkan: "HS Code = HS Code pengajuan",
      wajib: true,
      konteks: "hsCode",
      banding: "angka",
    },
    {
      label: "Kriteria Asal Barang",
      cari: /criterion|criteria|kriteria|wholly\s+obtained|origin\s+criteri|\bWO\b|\bPE\b/i,
      ambil: /(?:origin\s+criterion|criteria|kriteria(?:\s+asal)?)\s*[:#\-]?\s*([A-Za-z][A-Za-z ()\-]{1,40}?)(?=\s{2,}|\s*(?:\n|$|authorized|signature|instansi|penerbit|exporter|consignee))/i,
      diharapkan: "Kriteria asal, mis. Wholly Obtained (WO)",
      wajib: false,
    },
    {
      label: "Instansi Penerbit / Tanda Tangan",
      cari: /signature|authorized|signed|instansi\s+penerbit|penerbit|IPSKA|kementerian\s+perdagangan/i,
      diharapkan: "Tanda tangan Instansi Penerbit SKA (IPSKA)",
      wajib: true,
    },
  ],
};

/* ── NIB ───────────────────────────────────────────────────────────── */
const NIB_TEMPLATE: DocTemplate = {
  templateName: "Template NIB (Nomor Induk Berusaha)",
  identifikasi: [/nomor\s+induk\s+berusaha|\bNIB\b|\bOSS\b/i],
  fields: [
    {
      label: "Nomor NIB",
      cari: /\b\d{13}\b|nib/i,
      ambil: /(?:nib\s*[:#\-]?\s*)?\b(\d{13})\b/i,
      diharapkan: "NIB 13 digit = nomor NIB di profil",
      wajib: true,
      konteks: "nomorNib",
      banding: "angka",
    },
    {
      label: "Nama Pelaku Usaha",
      cari: /nama\s+(pelaku\s+usaha|perusahaan|usaha)/i,
      ambil: new RegExp(String.raw`nama\s+(?:pelaku\s+usaha|perusahaan|usaha)\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama pelaku usaha = nama usaha di profil",
      wajib: true,
      konteks: "namaUsaha",
      banding: "teks",
    },
    {
      label: "KBLI",
      cari: /kbli|kode\s+bisnis/i,
      ambil: /kbli\s*[:#\-]?\s*(\d{3,5})/i,
      diharapkan: "Kode KBLI usaha",
      wajib: false,
    },
    {
      label: "Status Perizinan",
      cari: /status\s+perizinan|berizin|berlaku|aktif|valid|efektif/i,
      ambil: /status(?:\s+perizinan)?\s*[:#\-]?\s*([A-Za-z][A-Za-z \/]{2,40})/i,
      diharapkan: "Status perizinan aktif / berlaku",
      wajib: true,
    },
  ],
};

/* ── NPWP ──────────────────────────────────────────────────────────── */
const NPWP_TEMPLATE: DocTemplate = {
  templateName: "Template Kartu NPWP",
  identifikasi: [/nomor\s+pokok\s+wajib\s+pajak|\bNPWP\b/i],
  fields: [
    {
      label: "Nomor NPWP",
      cari: /npwp|\d{2}[.\-]\d{3}[.\-]\d{3}[.\-]\d/i,
      ambil: /(\d{2}[.\-]\d{3}[.\-]\d{3}[.\-]\d[.\-]\d{3}[.\-]\d{3}|\b\d{15,16}\b)/,
      diharapkan: "Format NPWP XX.XXX.XXX.X-XXX.XXX = nomor NPWP di profil",
      wajib: true,
      konteks: "nomorNpwp",
      banding: "angka",
    },
    {
      label: "Nama Wajib Pajak",
      cari: /nama/i,
      ambil: new RegExp(String.raw`nama\s*(?:wajib\s*pajak)?\s*[:#\-]?\s*` + NAMA + STOP_UMUM, "i"),
      diharapkan: "Nama wajib pajak = nama usaha di profil",
      wajib: true,
      konteks: "namaUsaha",
      banding: "teks",
    },
    {
      label: "Alamat",
      cari: /alamat|address/i,
      ambil: /(?:alamat|address)\s*[:#\-]?\s*([A-Za-z0-9][^\n]{3,70}?)(?=\s{2,}|\s*(?:\n|$|terdaftar|kpp|kantor|npwp|nama|status|nomor))/i,
      diharapkan: "Alamat terdaftar",
      wajib: true,
    },
    {
      label: "KPP Pratama",
      cari: /kpp|kantor\s+pelayanan\s+pajak|terdaftar/i,
      ambil: /(?:kpp(?:\s+pratama)?|terdaftar\s+di)\s*[:#\-]?\s*([A-Za-z][A-Za-z .\-]{3,40})/i,
      diharapkan: "Kantor Pelayanan Pajak penerbit",
      wajib: false,
    },
  ],
};

/* ── Registry ──────────────────────────────────────────────────────── */
export const DOC_TEMPLATES: Record<string, DocTemplate> = {
  "doc-invoice": INVOICE_TEMPLATE,
  "doc-packing": PACKING_TEMPLATE,
  "doc-peb": PEB_TEMPLATE,
  "doc-ska": SKA_TEMPLATE,
  "doc-nib": NIB_TEMPLATE,
  "doc-npwp": NPWP_TEMPLATE,
};

/** Cari template paling cocok berdasarkan isi teks (fallback bila docId tak dikenal). */
export function detectTemplate(text: string): DocTemplate | null {
  for (const tmpl of Object.values(DOC_TEMPLATES)) {
    if (tmpl.identifikasi.every((r) => r.test(text))) return tmpl;
  }
  for (const tmpl of Object.values(DOC_TEMPLATES)) {
    if (tmpl.identifikasi.some((r) => r.test(text))) return tmpl;
  }
  return null;
}
