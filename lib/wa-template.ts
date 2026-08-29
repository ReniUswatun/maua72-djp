/* ------------------------------------------------------------------ *
 * Draf pesan WhatsApp ke UMKM (fitur C4)
 *
 * WhatsApp adalah kanal komunikasi utama ke UMKM. Setelah officer
 * mengambil keputusan, sistem menyusun draf pesan bahasa awam yang
 * tinggal ditinjau, disunting, lalu dikirim officer.
 * ------------------------------------------------------------------ */

import { getPillar } from "./assessment-config";
import { levelLabel } from "./admin-data";
import type { ApplicationCase } from "./types";

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function generateWaDraft(caseItem: ApplicationCase): string {
  const sapaan = `Halo Kak ${firstName(caseItem.ownerName)}, saya petugas Klinik Ekspor Bea Cukai Surakarta.`;

  const pembuka =
    caseItem.status === "disetujui"
      ? `Hasil asesmen kesiapan ekspor ${caseItem.businessName} sudah kami tinjau. Usaha Kakak berada di ${levelLabel(
          caseItem.readinessLevel,
        )} (skor ${caseItem.readinessScore}/100).`
      : caseItem.status === "membutuhkan_info"
        ? `Terima kasih sudah mengisi asesmen kesiapan ekspor untuk ${caseItem.businessName}. Ada beberapa hal yang perlu kami lengkapi dulu sebelum rekomendasi final bisa kami kirim.`
        : caseItem.status === "ditolak"
          ? `Terima kasih sudah mengisi asesmen untuk ${caseItem.businessName}. Setelah kami tinjau, ada beberapa syarat dasar yang perlu dipenuhi sebelum proses ekspor bisa dilanjutkan.`
          : `Hasil asesmen kesiapan ekspor ${caseItem.businessName} sedang kami tinjau.`;

  const langkah = caseItem.dimensions
    .filter((d) => d.status === "membutuhkan_info" || d.officerScore < 60)
    .slice(0, 4)
    .map((d, i) => {
      const nama = getPillar(d.pillarId)?.nama ?? d.label;
      return `${i + 1}. ${nama}: ${d.officerDraft}`;
    });

  const daftar =
    langkah.length > 0
      ? `\n\nLangkah yang kami sarankan:\n${langkah.join("\n")}`
      : `\n\nSecara umum berkas Kakak sudah cukup lengkap. Silakan lanjut menyiapkan dokumen pengiriman.`;

  const penutup =
    "\n\nKalau ada yang ingin ditanyakan, balas pesan ini saja ya. Kami juga mengadakan kelas PEB untuk UMKM setiap bulan bila Kakak ingin ikut.\n\nSalam,\nKlinik Ekspor Bea Cukai Surakarta";

  return `${sapaan}\n\n${pembuka}${daftar}${penutup}`;
}

export function waLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
