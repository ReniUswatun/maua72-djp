/* ------------------------------------------------------------------ *
 * Draf pesan WhatsApp ke UMKM.
 *
 * Setelah admin mengambil keputusan, sistem menyusun draf pesan
 * bahasa awam yang tinggal ditinjau, disunting, lalu dikirim admin.
 * ------------------------------------------------------------------ */

import { STATUS_LABEL } from "./admin-data";
import type { ApplicationCase } from "./types";

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function generateWaDraft(caseItem: ApplicationCase): string {
  const sapaan = `Halo Kak ${firstName(
    caseItem.ownerName,
  )}, saya petugas Klinik Ekspor Bea Cukai Surakarta.`;

  const pembuka =
    caseItem.status === "disetujui"
      ? `Pengajuan ekspor ${caseItem.businessName} untuk produk ${caseItem.namaProduk} tujuan ${caseItem.negaraTujuan} sudah kami setujui. Silakan lanjut ke proses pengajuan PEB.`
      : caseItem.status === "membutuhkan_info"
        ? `Terima kasih sudah mengirim pengajuan ekspor untuk ${caseItem.businessName}. Ada beberapa hal yang perlu dilengkapi dulu sebelum kami proses lebih lanjut.`
        : caseItem.status === "ditolak"
          ? `Terima kasih sudah mengirim pengajuan untuk ${caseItem.businessName}. Setelah kami tinjau, ada syarat dasar yang belum terpenuhi sehingga pengajuan belum bisa dilanjutkan.`
          : `Pengajuan ekspor ${caseItem.businessName} sedang kami tinjau (status: ${STATUS_LABEL[caseItem.status]}).`;

  const catatanDokumen = caseItem.documents
    .filter((doc) => doc.ocr && doc.ocr.status !== "cocok")
    .flatMap((doc) =>
      doc.ocr!.temuan
        .filter((temuan) => !temuan.sesuai)
        .map((temuan) => `- ${doc.nama} — ${temuan.field}: ${temuan.catatan ?? "perlu diperbaiki"}`),
    );

  const daftar =
    catatanDokumen.length > 0
      ? `\n\nCatatan dari pemeriksaan dokumen:\n${catatanDokumen.join("\n")}`
      : `\n\nDokumen yang Kakak unggah sudah sesuai. Terima kasih.`;

  const penutup =
    "\n\nKalau ada yang ingin ditanyakan, balas pesan ini saja ya.\n\nSalam,\nKlinik Ekspor Bea Cukai Surakarta";

  return `${sapaan}\n\n${pembuka}${daftar}${penutup}`;
}

export function waLink(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
