import type { PengajuanStatus } from "./types";

export const PENGAJUAN_STATUS_LABEL: Record<PengajuanStatus, string> = {
  draft: "Draft",
  review: "Sedang direview petugas",
  revisi: "Perlu revisi dokumen",
  ditolak: "Ditolak — perbaiki & kirim ulang",
  selesai: "Selesai / disetujui",
};

/** Kelas warna badge untuk setiap status pengajuan. */
export function pengajuanStatusClass(status: PengajuanStatus): string {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "review":
      return "bg-blue-100 text-blue-800";
    case "revisi":
      return "bg-amber-100 text-amber-800";
    case "ditolak":
      return "bg-red-100 text-red-800";
    case "selesai":
      return "bg-green-100 text-green-800";
  }
}

/** Status yang masih boleh diedit UMKM (unggah ulang dokumen & kirim ulang). */
export function bisaDiperbaiki(status: PengajuanStatus): boolean {
  return status === "draft" || status === "revisi" || status === "ditolak";
}
