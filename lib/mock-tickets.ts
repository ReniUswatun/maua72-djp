import { DEMO_USER } from "./mock-data";
import type { ConsultationTicket } from "./types";

/* ------------------------------------------------------------------ *
 * Tiket konsultasi contoh — dipakai sebagai isi awal inbox pertanyaan
 * (sisi UMKM di /dashboard/riwayat dan sisi admin di /admin/pertanyaan).
 * Nantinya diganti sumber datanya oleh backend.
 * ------------------------------------------------------------------ */

export const DEMO_TICKETS: ConsultationTicket[] = [
  {
    id: "TK-DEMO-1",
    judul: "Apakah produk kopi saya termasuk Lartas?",
    kategori: "HS Code & Lartas",
    status: "dijawab",
    dibuat: "2026-08-20T02:00:00.000Z",
    diperbarui: "2026-08-21T04:30:00.000Z",
    pesan: [
      {
        id: "m-1",
        dari: "umkm",
        aktor: DEMO_USER.nama,
        pesan:
          "Halo, saya mau ekspor kopi arabika roasted ke Belanda. Apakah perlu izin khusus atau termasuk barang Lartas?",
        tanggal: "2026-08-20T02:00:00.000Z",
      },
      {
        id: "m-2",
        dari: "petugas",
        aktor: "Retno Wulandari — Klinik Ekspor",
        pesan:
          "Kopi biji sangrai (HS 0901.21) tidak termasuk Lartas ekspor. Yang perlu disiapkan: PEB, Invoice, Packing List, dan bila pembeli minta tarif preferensi, SKA Form yang sesuai. Pastikan juga kemasan mencantumkan negara asal.",
        tanggal: "2026-08-21T04:30:00.000Z",
      },
    ],
  },
  {
    id: "TK-DEMO-2",
    judul: "Cara mengisi nilai FOB di PEB",
    kategori: "Dokumen (Invoice, Packing, PEB)",
    status: "menunggu",
    dibuat: "2026-08-28T07:15:00.000Z",
    diperbarui: "2026-08-28T07:15:00.000Z",
    pesan: [
      {
        id: "m-3",
        dari: "umkm",
        aktor: DEMO_USER.nama,
        pesan:
          "Di formulir PEB ada kolom nilai FOB. Apakah ini nilai barang saja atau sudah termasuk ongkos kirim ke pelabuhan?",
        tanggal: "2026-08-28T07:15:00.000Z",
      },
    ],
  },
];
