/* ------------------------------------------------------------------ *
 * Tipe domain — Platform Kesiapan Ekspor UMKM
 * Kontrak data di sini yang nantinya diisi oleh backend tim officer.
 * ------------------------------------------------------------------ */

/* ---------- Profil & Auth ---------- */

export type BadanUsaha =
  | "pt"
  | "cv"
  | "firma"
  | "ud"
  | "koperasi"
  | "belum";

export interface BusinessCategory {
  id: string;
  label: string;
  /** Tag yang dipakai untuk memunculkan pertanyaan bercabang di asesmen. */
  traits: CategoryTrait[];
}

export type CategoryTrait =
  | "pangan"
  | "kosmetik"
  | "herbal"
  | "hayati"
  | "kayu"
  | "tekstil"
  | "digital";

export interface BusinessProfile {
  namaUsaha: string;
  kota: string;
  provinsi: string;
  tahunBerdiri: string;
  kategoriId: string;
  kategoriLainnya?: string;
  punyaNib?: "aktif" | "proses" | "belum";
  nomorNib?: string;
  fileNib?: string | null;
  statusNpwp?: "badan" | "pribadi" | "belum";
  nomorNpwp?: string;
  fileNpwp?: string | null;
}

export interface PengajuanEkspor {
  id: string;
  tanggal: string;
  namaProduk: string;
  hsCode: string;
  nilaiEkspor: string;
  pembeli: string;
  negaraTujuan: string;
  tanggalKirim: string;
  status: "draft" | "review" | "revisi" | "selesai";
  dokumen: DocumentItem[];
}

export interface User {
  nama: string;
  email: string;
  hp: string;
}



/* ---------- Dokumen ---------- */

export type DocStatus = "belum" | "diunggah" | "diverifikasi" | "revisi";

export interface DocumentItem {
  id: string;
  nama: string;
  keterangan: string;
  wajib: boolean;
  status: DocStatus;
  namaFile?: string;
  tanggal?: string;
  catatanPetugas?: string;
}

/* ---------- Riwayat / Timeline ---------- */

export type TimelineKind =
  | "asesmen"
  | "officer"
  | "dokumen"
  | "rekomendasi"
  | "pesan";

export interface TimelineEvent {
  id: string;
  kind: TimelineKind;
  judul: string;
  detail: string;
  tanggal: string;
  aktor: string;
}

/* ---------- Panduan ---------- */

export interface Article {
  slug: string;
  judul: string;
  kategori: string;
  ringkas: string;
  bacaMenit: number;
  isi: { heading: string; paragraf: string[]; list?: string[] }[];
  istilahTerkait: string[];
}

/* ---------- Glosarium ---------- */

export interface GlossaryEntry {
  istilah: string;
  kepanjangan?: string;
  penjelasan: string;
}
