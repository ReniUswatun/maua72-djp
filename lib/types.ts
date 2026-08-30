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

/** Status persetujuan data usaha oleh officer (fitur baru). */
export type BusinessApprovalStatus = "menunggu" | "disetujui" | "ditolak";

export type PengajuanStatus = "draft" | "review" | "revisi" | "ditolak" | "selesai";

export interface PengajuanEkspor {
  id: string;
  tanggal: string;
  namaProduk: string;
  hsCode: string;
  nilaiEkspor: string;
  pembeli: string;
  negaraTujuan: string;
  tanggalKirim: string;
  status: PengajuanStatus;
  dokumen: DocumentItem[];
  /** Catatan petugas saat pengajuan diminta revisi atau ditolak. */
  catatanReview?: string;
}

/* ---------- Konsultasi (ticketing) ---------- */

export type TicketStatus = "menunggu" | "dijawab" | "selesai";

export interface TicketMessage {
  id: string;
  dari: "umkm" | "petugas";
  aktor: string;
  pesan: string;
  tanggal: string;
}

export interface ConsultationTicket {
  id: string;
  judul: string;
  kategori: string;
  status: TicketStatus;
  dibuat: string;
  diperbarui: string;
  pesan: TicketMessage[];
}

export interface User {
  nama: string;
  email: string;
  hp: string;
}

/* ---------- Admin ---------- */

export type AppRole = "user" | "admin" | "super_admin";

/** Peran admin — dipakai untuk login, RBAC, dan CRUD akun. */
export type AdminRole = Exclude<AppRole, "user">;

export type ReviewStage =
  | "baru"
  | "direview"
  | "disetujui"
  | "membutuhkan_info"
  | "ditolak";

export interface AdminAccount {
  id: string;
  nama: string;
  email: string;
  role: AdminRole;
  aktif: boolean;
  passwordResetAt?: string;
  lastLoginAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  /** Nama admin yang melakukan aksi. */
  admin: string;
  action: string;
  field?: string;
  before?: string;
  after?: string;
  note?: string;
}

/**
 * Satu pengajuan ekspor UMKM yang masuk ke meja officer.
 * Modelnya berpusat pada dokumen yang diunggah UMKM, bukan skor asesmen.
 */
export interface ApplicationCase {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  kategori: string;
  status: ReviewStage;
  submittedAt: string;
  lastUpdatedAt: string;
  profile: BusinessProfile;
  /** Status persetujuan data usaha (NIB, NPWP, profil) oleh officer. */
  dataUsaha: BusinessApprovalStatus;
  dataUsahaCatatan?: string;
  namaProduk: string;
  negaraTujuan: string;
  hsCode: string;
  nilaiEkspor: string;
  documents: DocumentItem[];
  timeline: TimelineEvent[];
  auditTrail: AuditLogEntry[];
  internalNotes?: string[];
  /** Draf pesan WhatsApp untuk UMKM. Diisi/disunting officer. */
  waDraft?: string;
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
  /** URL/data-URI berkas PDF yang diunggah UMKM — dipakai admin untuk melihat isi. */
  fileUrl?: string;
  tanggal?: string;
  catatanPetugas?: string;
  /** Hasil pembacaan OCR + pencocokan terhadap template contoh. */
  ocr?: DocumentOcrResult;
}

/* ---------- OCR / pencocokan dokumen ---------- */

export type OcrStatus = "cocok" | "perlu_perbaikan" | "gagal_baca" | "belum_dibaca";

export interface OcrFieldCheck {
  field: string;
  /** Nilai yang terbaca dari PDF yang diunggah. */
  terbaca: string;
  /** Nilai yang diharapkan menurut template contoh / data usaha. */
  diharapkan: string;
  sesuai: boolean;
  catatan?: string;
}

export interface DocumentOcrResult {
  status: OcrStatus;
  /** Ringkasan satu kalimat untuk admin. */
  ringkas: string;
  diperiksaPada: string;
  /** Nama template contoh yang dijadikan acuan. */
  template: string;
  temuan: OcrFieldCheck[];
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

/* ---------- Panduan CMS ---------- *
 * Konten panduan yang dikelola admin lewat CMS sederhana.
 * Satu daftar rata; `tipe` membedakan tahap alur dan panduan dokumen.
 */

export type PanduanTipe = "tahap" | "dokumen";
export type PanduanStatus = "terbit" | "draf";

export interface PanduanLangkah {
  judul: string;
  detail: string;
}

export interface PanduanTautan {
  teks: string;
  url: string;
}

export interface PanduanEntry {
  id: string;
  tipe: PanduanTipe;
  judul: string;
  /** Subjudul / inti singkat. */
  ringkas: string;
  /** Paragraf penjelasan (terutama untuk dokumen). */
  deskripsi: string;
  /** Poin ringkas berupa daftar (dipakai tahap alur). */
  poin: string[];
  /** Langkah bernomor (dipakai panduan dokumen). */
  langkah: PanduanLangkah[];
  tautan: PanduanTautan[];
  /** Untuk dokumen: dibuat sendiri oleh eksportir vs diurus ke instansi. */
  dibuatSendiri: boolean;
  /** Urutan tampil (kecil = atas). */
  urutan: number;
  status: PanduanStatus;
  /** Entri inti bawaan — boleh disunting, tidak boleh dihapus. */
  terkunci: boolean;
}
