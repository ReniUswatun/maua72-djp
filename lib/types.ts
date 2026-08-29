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
  statusNpwp?: "badan" | "pribadi" | "belum";
  nomorNpwp?: string;
}

export interface User {
  nama: string;
  email: string;
  hp: string;
}

/* ---------- Admin ---------- */

export type AppRole = "user" | "officer" | "super_admin";

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
  role: Exclude<AppRole, "user">;
  jabatan: string;
  aktif: boolean;
  passwordResetAt?: string;
  lastLoginAt?: string;
}

export interface ReviewDimension {
  id: string;
  label: string;
  pillarId: number;
  aiScore: number;
  aiDraft: string;
  officerScore: number;
  officerDraft: string;
  status: ReviewStage;
  officerNote?: string;
  decisionReason?: string;
  editedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officer: string;
  action: string;
  field?: string;
  before?: string;
  after?: string;
  note?: string;
}

export interface DocumentPrecheckFinding {
  documentId: string;
  documentName: string;
  field: string;
  issue: string;
  severity: "info" | "warning" | "critical";
}

export interface ApplicationCase {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  status: ReviewStage;
  readinessLevel: LevelId;
  readinessScore: number;
  submittedAt: string;
  lastUpdatedAt: string;
  aiSummary: string;
  aiDraft: string;
  rawAnswers: AnswerMap;
  assessment: AssessmentResult;
  profile: BusinessProfile;
  documents: DocumentItem[];
  dimensions: ReviewDimension[];
  timeline: TimelineEvent[];
  auditTrail: AuditLogEntry[];
  precheckFindings?: DocumentPrecheckFinding[];
  internalNotes?: string[];
}

/* ---------- Asesmen ---------- */

export interface Pillar {
  id: number;
  slug: string;
  nama: string;
  ringkas: string;
  /** Bobot terhadap skor akhir, total = 1. */
  bobot: number;
  icon: string;
}

export type QuestionType = "single" | "multi";

export interface QuestionOption {
  id: string;
  label: string;
  /** Poin mentah untuk opsi ini. */
  poin: number;
}

export interface Question {
  id: string;
  pillarId: number;
  teks: string;
  type: QuestionType;
  /** Pengali bobot pertanyaan di dalam pilarnya (default 1). */
  bobot?: number;
  options: QuestionOption[];
  /** Teks bantuan bahasa awam, tampil sebagai callout di bawah opsi. */
  bantuan?: string;
  /** Istilah glosarium yang di-highlight + tooltip pada teks pertanyaan. */
  istilah?: string[];
  /** Kalau diisi, pertanyaan hanya muncul untuk kategori dengan trait ini. */
  hanyaUntukTrait?: CategoryTrait[];
  /** Opsi "tidak ada / belum" pada multi-select — mematikan pilihan lain. */
  opsiNolId?: string;
}

/** Jawaban: single = 1 id opsi, multi = array id opsi. */
export type Answer = string | string[];
export type AnswerMap = Record<string, Answer>;

/* ---------- Hasil ---------- */

export interface PillarScore {
  pillarId: number;
  skor: number; // 0-100
  terjawab: number;
  total: number;
}

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface ReadinessLevel {
  id: LevelId;
  nama: string;
  rentang: string;
  deskripsi: string;
  warna: string; // class tailwind teks
  bg: string; // class tailwind background
  border: string;
  ring: string; // warna stroke untuk gauge
}

export interface AssessmentResult {
  id: string;
  tanggal: string; // ISO
  skorTotal: number;
  level: LevelId;
  /** Level sebelum aturan override diterapkan (untuk transparansi). */
  levelSebelumOverride: LevelId;
  overrides: string[];
  pilar: PillarScore[];
  flagPetugas: string[];
}

/* ---------- Rekomendasi ---------- */

export type OfficerStatus =
  | "pending_review"
  | "approved"
  | "edited"
  | "needs_more_info";

export interface OfficerReview {
  status: OfficerStatus;
  namaPetugas?: string;
  tanggal?: string;
  catatan?: string;
  /** Versi asli AI, diisi hanya bila status = "edited". */
  versiAsliAI?: string;
  versiPetugas?: string;
}

export interface Recommendation {
  id: string;
  judul: string;
  pillarId: number;
  ringkas: string;
  mengapa: string;
  langkah: string[];
  effort: 1 | 2 | 3;
  estimasi: string;
  prioritas: number;
  referensi: { label: string; url: string }[];
  review: OfficerReview;
  selesai?: boolean;
  /** Muncul sebagai rekomendasi bila jawaban pertanyaan ini bernilai rendah. */
  pemicu?: { questionId: string; opsiId: string[] };
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
