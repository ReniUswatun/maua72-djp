/* ------------------------------------------------------------------ *
 * Aturan unggah berkas untuk sisi UMKM (profil & dokumen pengajuan).
 * ------------------------------------------------------------------ */

/** Batas maksimum ukuran berkas yang boleh diunggah UMKM. */
export const MAKS_UNGGAH_BYTES = 5 * 1024 * 1024; // 5 MB

export function formatUkuran(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Periksa kelayakan berkas sebelum diunggah.
 * Mengembalikan pesan error (untuk ditampilkan ke UMKM) bila tidak layak,
 * atau `null` bila berkas boleh diunggah.
 */
export function periksaBerkasUnggah(file: File): string | null {
  if (file.size > MAKS_UNGGAH_BYTES) {
    return `Ukuran berkas ${formatUkuran(file.size)} melebihi batas 5 MB. Kompres dulu berkasnya (mis. cari "compress PDF" di internet), lalu unggah lagi.`;
  }
  return null;
}
