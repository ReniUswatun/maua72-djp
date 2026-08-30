/* ------------------------------------------------------------------ *
 * Jembatan data UMKM (assessment-store) <-> Admin (admin-store).
 *
 * Prototipe tanpa backend: kedua sisi menyimpan state di localStorage
 * yang terpisah. Helper murni di sini memetakan satu `PengajuanEkspor`
 * UMKM menjadi `ApplicationCase` yang dibaca admin, dan sebaliknya
 * memetakan status keputusan admin kembali ke status pengajuan UMKM.
 * Sinkronisasi dilakukan di lapisan komponen (lihat
 * `components/shared/PengajuanBridge.tsx` dan `AdminReviewWorkspace`).
 * ------------------------------------------------------------------ */

import type {
  ApplicationCase,
  BusinessProfile,
  PengajuanEkspor,
  PengajuanStatus,
  ReviewStage,
  User,
} from "./types";

export function pengajuanStatusToStage(status: PengajuanStatus): ReviewStage {
  switch (status) {
    case "review":
      return "direview";
    case "revisi":
      return "membutuhkan_info";
    case "ditolak":
      return "ditolak";
    case "selesai":
      return "disetujui";
    default:
      return "baru";
  }
}

export function stageToPengajuanStatus(stage: ReviewStage): PengajuanStatus {
  switch (stage) {
    case "direview":
      return "review";
    case "membutuhkan_info":
      return "revisi";
    case "ditolak":
      return "ditolak";
    case "disetujui":
      return "selesai";
    default:
      return "review";
  }
}

/**
 * Bangun / perbarui `ApplicationCase` dari pengajuan UMKM.
 * Bila `existing` diberikan, metadata khusus admin (dataUsaha, audit trail,
 * catatan internal, draf WA) dipertahankan.
 */
export function pengajuanToCase(
  pengajuan: PengajuanEkspor,
  profile: BusinessProfile | null,
  user: User | null,
  existing?: ApplicationCase,
): ApplicationCase {
  const nowIso = new Date().toISOString();
  return {
    id: pengajuan.id,
    businessName: profile?.namaUsaha || existing?.businessName || "UMKM",
    ownerName: user?.nama || existing?.ownerName || "—",
    email: user?.email || existing?.email || "—",
    phone: user?.hp || existing?.phone || "—",
    city: profile?.kota || existing?.city || "—",
    province: profile?.provinsi || existing?.province || "—",
    kategori: profile?.kategoriId || existing?.kategori || "umum",
    status: pengajuanStatusToStage(pengajuan.status),
    submittedAt: existing?.submittedAt || pengajuan.tanggal || nowIso,
    lastUpdatedAt: nowIso,
    profile:
      profile ??
      existing?.profile ?? {
        namaUsaha: "UMKM",
        kota: "—",
        provinsi: "—",
        tahunBerdiri: "—",
        kategoriId: "umum",
      },
    dataUsaha: existing?.dataUsaha ?? "menunggu",
    dataUsahaCatatan: existing?.dataUsahaCatatan,
    namaProduk: pengajuan.namaProduk,
    negaraTujuan: pengajuan.negaraTujuan,
    hsCode: pengajuan.hsCode,
    nilaiEkspor: pengajuan.nilaiEkspor,
    documents: pengajuan.dokumen.map((d) => ({ ...d })),
    timeline: existing?.timeline ?? [
      {
        id: `tl-${pengajuan.id}`,
        kind: "asesmen" as const,
        judul: "Pengajuan ekspor dikirim",
        detail: `Pengajuan untuk ${pengajuan.namaProduk} tujuan ${pengajuan.negaraTujuan}.`,
        tanggal: pengajuan.tanggal || nowIso,
        aktor: user?.nama || "UMKM",
      },
    ],
    auditTrail: existing?.auditTrail ?? [
      {
        id: `audit-${pengajuan.id}`,
        timestamp: pengajuan.tanggal || nowIso,
        admin: "Sistem",
        action: "Pengajuan masuk ke meja admin",
      },
    ],
    internalNotes: existing?.internalNotes,
    waDraft: existing?.waDraft,
  };
}
