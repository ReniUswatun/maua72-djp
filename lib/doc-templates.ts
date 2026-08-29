/**
 * Template validasi dokumen ekspor.
 * Setiap template mendefinisikan field-field yang harus ada di dokumen
 * dan aturan validasi sederhananya (pola regex / panjang minimum, dsb.).
 */

export interface FieldRule {
  /** Label yang ditampilkan ke admin / UMKM */
  label: string;
  /**
   * Regex untuk mendeteksi apakah field ini *ada* dalam teks yang diekstrak.
   * Gunakan flag 'i' untuk case-insensitive.
   */
  regex: RegExp;
  /** Deskripsi singkat yang diharapkan (untuk kolom "diharapkan") */
  diharapkan: string;
  /** Apakah field ini wajib ada? */
  wajib: boolean;
}

export interface DocTemplate {
  templateName: string;
  /** Kata kunci yang harus ada agar teks diidentifikasi sebagai dokumen ini */
  identifikasi: RegExp[];
  fields: FieldRule[];
}

// ─── Commercial Invoice ──────────────────────────────────────────────
const INVOICE_TEMPLATE: DocTemplate = {
  templateName: "Template Commercial Invoice Standar",
  identifikasi: [/commercial\s+invoice/i, /invoice/i],
  fields: [
    {
      label: "Nomor Invoice",
      regex: /invoice\s*(no|number|#|:)[\s]*[\w\-\/]+/i,
      diharapkan: "Nomor invoice (mis. INV-001)",
      wajib: true,
    },
    {
      label: "Tanggal Invoice",
      regex: /date[\s:]+\d{1,2}[\s\/\-]\w+[\s\/\-]\d{2,4}/i,
      diharapkan: "Tanggal penerbitan (mis. 01 Jan 2025)",
      wajib: true,
    },
    {
      label: "Nama Penjual / Exporter",
      regex: /shipper|exporter|seller|penjual/i,
      diharapkan: "Nama perusahaan penjual",
      wajib: true,
    },
    {
      label: "Nama Pembeli / Buyer",
      regex: /consignee|buyer|pembeli/i,
      diharapkan: "Nama perusahaan pembeli",
      wajib: true,
    },
    {
      label: "Deskripsi Barang",
      regex: /description\s+of\s+goods|description|deskripsi\s+barang/i,
      diharapkan: "Kolom deskripsi barang",
      wajib: true,
    },
    {
      label: "HS Code",
      regex: /hs[\s\-]?code|harmonized/i,
      diharapkan: "HS Code barang ekspor",
      wajib: false,
    },
    {
      label: "Total Nilai (Currency)",
      regex: /total[\s\S]{0,20}(USD|EUR|SGD|JPY|CNY|\$)/i,
      diharapkan: "Total nilai dalam mata uang asing (USD, EUR, dsb.)",
      wajib: true,
    },
    {
      label: "Incoterms",
      regex: /\b(FOB|CIF|EXW|DDP|CFR|FCA)\b/i,
      diharapkan: "Incoterms (FOB, CIF, EXW, dsb.)",
      wajib: false,
    },
    {
      label: "Tanda Tangan / Cap",
      regex: /signature|signed|authorized|cap|ttd|tandatangan/i,
      diharapkan: "Tanda tangan dan cap perusahaan",
      wajib: false,
    },
  ],
};

// ─── Packing List ─────────────────────────────────────────────────────
const PACKING_TEMPLATE: DocTemplate = {
  templateName: "Template Packing List Standar",
  identifikasi: [/packing\s+list/i],
  fields: [
    {
      label: "Nomor Packing List / Invoice",
      regex: /(packing\s+list|invoice)\s*(no|number|#|:)[\s]*[\w\-\/]+/i,
      diharapkan: "Nomor packing list atau referensi invoice",
      wajib: true,
    },
    {
      label: "Tanggal",
      regex: /date[\s:]+\d{1,2}[\s\/\-]\w+[\s\/\-]\d{2,4}/i,
      diharapkan: "Tanggal penerbitan",
      wajib: true,
    },
    {
      label: "Nama Penjual / Shipper",
      regex: /shipper|exporter|seller|penjual/i,
      diharapkan: "Nama perusahaan pengirim",
      wajib: true,
    },
    {
      label: "Nama Pembeli / Consignee",
      regex: /consignee|buyer|pembeli/i,
      diharapkan: "Nama perusahaan pembeli",
      wajib: true,
    },
    {
      label: "Jumlah Kemasan (Qty / Carton)",
      regex: /(qty|quantity|jumlah|carton|pcs|pieces|package)/i,
      diharapkan: "Jumlah kemasan atau unit",
      wajib: true,
    },
    {
      label: "Berat Kotor (Gross Weight)",
      regex: /gross\s*weight|berat\s*kotor/i,
      diharapkan: "Berat kotor dalam kg",
      wajib: true,
    },
    {
      label: "Berat Bersih (Net Weight)",
      regex: /net\s*weight|berat\s*bersih/i,
      diharapkan: "Berat bersih dalam kg",
      wajib: false,
    },
    {
      label: "Dimensi / Volume",
      regex: /(dimension|volume|measurement|cm|m3|cbm)/i,
      diharapkan: "Dimensi atau volume kemasan",
      wajib: false,
    },
  ],
};

// ─── PEB ──────────────────────────────────────────────────────────────
const PEB_TEMPLATE: DocTemplate = {
  templateName: "Template PEB / NPE Bea Cukai",
  identifikasi: [/pemberitahuan\s+ekspor\s+barang|PEB|nota\s+pelayanan\s+ekspor|NPE/i],
  fields: [
    {
      label: "Nomor PEB / NPE",
      regex: /(nomor|no|#)\s*(peb|npe)[\s:]*[\w\-\/]+/i,
      diharapkan: "Nomor PEB atau NPE dari Bea Cukai",
      wajib: true,
    },
    {
      label: "Tanggal",
      regex: /tanggal[\s:]+\d{1,2}[\s\/\-]\w+[\s\/\-]\d{2,4}|date[\s:]+\d{1,2}/i,
      diharapkan: "Tanggal pengajuan atau persetujuan",
      wajib: true,
    },
    {
      label: "Nama Eksportir",
      regex: /eksportir|exporter|nama\s+perusahaan/i,
      diharapkan: "Nama eksportir sesuai NIB",
      wajib: true,
    },
    {
      label: "NPWP Eksportir",
      regex: /npwp[\s:]*[\d\.\-]+/i,
      diharapkan: "Nomor NPWP eksportir",
      wajib: true,
    },
    {
      label: "HS Code",
      regex: /hs[\s\-]?code|pos\s*tarif[\s:]*\d{4,}/i,
      diharapkan: "HS Code barang",
      wajib: true,
    },
    {
      label: "Nilai FOB",
      regex: /nilai\s*fob|fob\s*value|nilai\s*ekspor/i,
      diharapkan: "Nilai ekspor FOB dalam USD",
      wajib: true,
    },
    {
      label: "Nomor Container / Muat",
      regex: /(container|nomor\s*muat|vessel|kapal)/i,
      diharapkan: "Nomor container atau kapal pengangkut",
      wajib: false,
    },
  ],
};

// ─── SKA / COO ────────────────────────────────────────────────────────
const SKA_TEMPLATE: DocTemplate = {
  templateName: "Template SKA / Certificate of Origin",
  identifikasi: [/certificate\s+of\s+origin|surat\s+keterangan\s+asal|SKA|COO/i],
  fields: [
    {
      label: "Nomor SKA",
      regex: /(reference|no|nomor|#)[\s:]*[\w\-\/]+/i,
      diharapkan: "Nomor referensi SKA",
      wajib: true,
    },
    {
      label: "Nama Eksportir / Produsen",
      regex: /exporter|produsen|manufacturer|eksportir/i,
      diharapkan: "Nama eksportir atau produsen",
      wajib: true,
    },
    {
      label: "Nama Importir / Consignee",
      regex: /consignee|importer|importir/i,
      diharapkan: "Nama importir atau penerima",
      wajib: true,
    },
    {
      label: "Negara Tujuan",
      regex: /country\s+of\s+destination|negara\s+tujuan/i,
      diharapkan: "Negara tujuan ekspor",
      wajib: true,
    },
    {
      label: "Deskripsi Barang",
      regex: /description\s+of\s+goods|deskripsi\s+barang/i,
      diharapkan: "Deskripsi barang",
      wajib: true,
    },
    {
      label: "HS Code",
      regex: /hs[\s\-]?code|harmonized/i,
      diharapkan: "HS Code barang",
      wajib: true,
    },
    {
      label: "Kriteria Asal Barang",
      regex: /criterion|kriteria|wholly\s+obtained|origin\s+criteria/i,
      diharapkan: "Kriteria asal (mis. WO, PE)",
      wajib: false,
    },
    {
      label: "Tanda Tangan Instansi Penerbit",
      regex: /signature|authorized|signed|instansi|penerbit/i,
      diharapkan: "Tanda tangan Instansi Penerbit SKA (IPSKA)",
      wajib: true,
    },
  ],
};

// ─── NIB ──────────────────────────────────────────────────────────────
const NIB_TEMPLATE: DocTemplate = {
  templateName: "Template NIB (Nomor Induk Berusaha)",
  identifikasi: [/nomor\s+induk\s+berusaha|NIB|OSS/i],
  fields: [
    {
      label: "Nomor NIB (13 digit)",
      regex: /\b\d{13}\b|NIB[\s:]+[\d]{10,}/i,
      diharapkan: "NIB 13 digit dari sistem OSS",
      wajib: true,
    },
    {
      label: "Nama Pelaku Usaha",
      regex: /nama\s+(pelaku\s+usaha|perusahaan|usaha)/i,
      diharapkan: "Nama pelaku usaha / perusahaan",
      wajib: true,
    },
    {
      label: "KBLI",
      regex: /KBLI|kode\s+bisnis/i,
      diharapkan: "Kode KBLI usaha",
      wajib: false,
    },
    {
      label: "Status Perizinan",
      regex: /status\s+perizinan|berlaku|aktif|valid/i,
      diharapkan: "Status perizinan aktif / berlaku",
      wajib: true,
    },
  ],
};

// ─── NPWP ─────────────────────────────────────────────────────────────
const NPWP_TEMPLATE: DocTemplate = {
  templateName: "Template Kartu NPWP",
  identifikasi: [/nomor\s+pokok\s+wajib\s+pajak|NPWP/i],
  fields: [
    {
      label: "Nomor NPWP (15-16 digit)",
      regex: /\d{2}[\.\-]\d{3}[\.\-]\d{3}[\.\-]\d{1}[\.\-]\d{3}[\.\-]\d{3}|\b\d{15,16}\b/,
      diharapkan: "Format NPWP: XX.XXX.XXX.X-XXX.XXX",
      wajib: true,
    },
    {
      label: "Nama Wajib Pajak",
      regex: /nama[\s:]+[A-Z\s]{5,}/i,
      diharapkan: "Nama wajib pajak",
      wajib: true,
    },
    {
      label: "Alamat",
      regex: /alamat|address/i,
      diharapkan: "Alamat terdaftar",
      wajib: true,
    },
    {
      label: "KPP Pratama",
      regex: /KPP|kantor\s+pelayanan\s+pajak/i,
      diharapkan: "Kantor Pelayanan Pajak penerbit",
      wajib: false,
    },
  ],
};

// ─── Registry ──────────────────────────────────────────────────────────
export const DOC_TEMPLATES: Record<string, DocTemplate> = {
  "doc-invoice": INVOICE_TEMPLATE,
  "doc-packing": PACKING_TEMPLATE,
  "doc-peb":     PEB_TEMPLATE,
  "doc-ska":     SKA_TEMPLATE,
  "doc-nib":     NIB_TEMPLATE,
  "doc-npwp":    NPWP_TEMPLATE,
};

/** Cari template paling cocok berdasarkan isi teks (fallback jika docId tidak dikenal) */
export function detectTemplate(text: string): DocTemplate | null {
  for (const tmpl of Object.values(DOC_TEMPLATES)) {
    const matched = tmpl.identifikasi.every((r) => r.test(text));
    if (matched) return tmpl;
  }
  // Try partial match (at least one identifier)
  for (const tmpl of Object.values(DOC_TEMPLATES)) {
    if (tmpl.identifikasi.some((r) => r.test(text))) return tmpl;
  }
  return null;
}
