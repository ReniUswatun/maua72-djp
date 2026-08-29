import type {
  AnswerMap,
  AssessmentResult,
  BusinessProfile,
  DocumentItem,
  OfficerReview,
  TimelineEvent,
  User,
} from "./types";

/* ------------------------------------------------------------------ *
 * MOCK DATA — blueprint §11.
 * Semua yang ada di file ini nantinya diganti sumber datanya oleh tim
 * backend/officer. Bentuk datanya sudah mengikuti kontrak di types.ts.
 * ------------------------------------------------------------------ */

export const KANTOR = {
  nama: "Kantor Bea dan Cukai Surakarta",
  alamat: "Jl. LU Adisucipto No. 36, Surakarta, Jawa Tengah",
  telepon: "(0271) 718621",
  email: "kliniekspor.surakarta@customs.go.id",
};

export const PETUGAS = [
  { id: "ptg-1", nama: "Ahmad Fauzi", jabatan: "Petugas Klinik Ekspor" },
  { id: "ptg-2", nama: "Retno Wulandari", jabatan: "Pemeriksa Dokumen" },
];

/**
 * Hasil review petugas yang disimulasikan.
 * Dipakai oleh aksi "Kirim ke Petugas" di store untuk menunjukkan
 * officer-in-the-loop tanpa backend.
 */
export const MOCK_OFFICER_REVIEWS: Record<string, OfficerReview> = {
  "urus-nib": {
    status: "approved",
    namaPetugas: "Ahmad Fauzi",
    tanggal: "2026-08-27",
    catatan:
      "Rekomendasi sudah tepat. Silakan datang ke Klinik Ekspor bila menemui kendala saat pemilihan KBLI — kami bantu dampingi langsung.",
  },
  "tentukan-hs-code": {
    status: "edited",
    namaPetugas: "Ahmad Fauzi",
    tanggal: "2026-08-27",
    catatan:
      "Saya tambahkan catatan soal dokumen pendukung yang perlu dibawa, karena untuk produk kopi olahan penentuan kodenya bergantung pada tingkat prosesnya.",
    versiAsliAI:
      "Konsultasikan HS Code produk Anda ke Klinik Ekspor Bea Cukai dengan membawa deskripsi produk.",
    versiPetugas:
      "Konsultasikan HS Code produk Anda ke Klinik Ekspor Bea Cukai Surakarta. Untuk produk kopi, bawa juga informasi apakah biji sudah disangrai atau masih hijau, serta apakah sudah dihaluskan atau dikemas dalam bentuk sachet — perbedaan ini mengubah pos tarifnya, dan berdampak pada tarif bea masuk di negara tujuan.",
  },
  "cek-lartas": {
    status: "needs_more_info",
    namaPetugas: "Retno Wulandari",
    tanggal: "2026-08-28",
    catatan:
      "Mohon lampirkan foto produk dan komposisi lengkap agar kami bisa memastikan status Lartas-nya. Beberapa produk turunan kopi dengan campuran bahan tertentu memiliki persyaratan tambahan.",
  },
  "pelajari-peb": {
    status: "approved",
    namaPetugas: "Retno Wulandari",
    tanggal: "2026-08-28",
    catatan:
      "Setuju. Kami menyelenggarakan kelas PEB untuk UMKM setiap bulan — silakan bergabung sebelum pengiriman pertama Anda.",
  },
  "sertifikasi-produk": {
    status: "approved",
    namaPetugas: "Ahmad Fauzi",
    tanggal: "2026-08-27",
    catatan:
      "Prioritaskan izin edar lebih dulu, baru sertifikat halal, karena banyak lembaga meminta izin edar sebagai prasyarat.",
  },
};

/* ---------- Dokumen ekspor ---------- */

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-nib",
    nama: "Nomor Induk Berusaha (NIB)",
    keterangan: "Diterbitkan lewat OSS. Wajib untuk semua kegiatan ekspor.",
    wajib: true,
    status: "diverifikasi",
    namaFile: "NIB-Kopi-Merapi-2026.pdf",
    tanggal: "2026-08-20",
    catatanPetugas: "NIB aktif dan KBLI sudah sesuai produk kopi olahan.",
  },
  {
    id: "doc-npwp",
    nama: "NPWP Badan Usaha",
    keterangan: "Nomor pokok wajib pajak atas nama usaha.",
    wajib: true,
    status: "diverifikasi",
    namaFile: "NPWP-Badan.pdf",
    tanggal: "2026-08-20",
  },
  {
    id: "doc-izin",
    nama: "Izin Edar / PIRT / BPOM",
    keterangan: "Bukti produk legal beredar di negara asal.",
    wajib: true,
    status: "revisi",
    namaFile: "PIRT-2024.jpg",
    tanggal: "2026-08-22",
    catatanPetugas:
      "Dokumen yang diunggah adalah PIRT yang masa berlakunya hampir habis. Mohon perbarui, dan untuk tujuan ekspor sebaiknya naik ke izin edar BPOM.",
  },
  {
    id: "doc-halal",
    nama: "Sertifikat Halal",
    keterangan: "Diterbitkan BPJPH. Penting untuk pasar Malaysia dan Timur Tengah.",
    wajib: false,
    status: "diunggah",
    namaFile: "Sertifikat-Halal-proses.pdf",
    tanggal: "2026-08-25",
  },
  {
    id: "doc-invoice",
    nama: "Commercial Invoice",
    keterangan: "Faktur penjualan berisi nilai dan syarat transaksi.",
    wajib: true,
    status: "belum",
  },
  {
    id: "doc-packing",
    nama: "Packing List",
    keterangan: "Rincian isi setiap kemasan: jumlah, berat, dan dimensi.",
    wajib: true,
    status: "belum",
  },
  {
    id: "doc-ska",
    nama: "Surat Keterangan Asal (SKA / COO)",
    keterangan: "Memberi pembeli Anda potongan bea masuk lewat tarif preferensi.",
    wajib: false,
    status: "belum",
  },
  {
    id: "doc-peb",
    nama: "Pemberitahuan Ekspor Barang (PEB)",
    keterangan: "Diajukan lewat CEISA sebelum barang dimuat.",
    wajib: true,
    status: "belum",
  },
];

/* ---------- Timeline riwayat ---------- */

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: "tl-1",
    kind: "asesmen",
    judul: "Pengajuan ekspor pertama diselesaikan",
    detail: "Skor 41 dari 100 — Level 2, Tahap Awal.",
    tanggal: "2026-07-14",
    aktor: "Anda",
  },
  {
    id: "tl-2",
    kind: "officer",
    judul: "Rekomendasi divalidasi petugas",
    detail:
      "Petugas Ahmad Fauzi menyetujui 4 dari 6 rekomendasi dan meminta perbaikan pada 1 rekomendasi.",
    tanggal: "2026-07-16",
    aktor: "Ahmad Fauzi",
  },
  {
    id: "tl-3",
    kind: "rekomendasi",
    judul: 'Rekomendasi "Urus NIB lewat OSS" ditandai selesai',
    detail: "NIB terbit dengan status aktif pada 3 Agustus 2026.",
    tanggal: "2026-08-03",
    aktor: "Anda",
  },
  {
    id: "tl-4",
    kind: "dokumen",
    judul: "Dokumen NIB dan NPWP diverifikasi",
    detail: "Kedua dokumen dinyatakan sesuai oleh petugas.",
    tanggal: "2026-08-20",
    aktor: "Retno Wulandari",
  },
  {
    id: "tl-5",
    kind: "pesan",
    judul: "Undangan kelas PEB untuk UMKM",
    detail:
      "Kelas dokumen ekspor angkatan Agustus dibuka. Usaha Anda direkomendasikan ikut sebelum pengiriman pertama.",
    tanggal: "2026-08-24",
    aktor: "Klinik Ekspor Surakarta",
  },
];

/* ---------- Akun demo (untuk tombol "Lihat Demo" di landing) ---------- */

export const DEMO_USER: User = {
  nama: "Sari Utami",
  email: "sari@kopimerapi.id",
  hp: "0812-3456-7890",
};

export const DEMO_PROFILE: BusinessProfile = {
  namaUsaha: "Kopi Merapi Nusantara",
  kota: "Boyolali",
  provinsi: "Jawa Tengah",
  tahunBerdiri: "2019",
  kategoriId: "kopi",
  nomorNib: "0812250034567",
  nomorNpwp: "987654321098765",
};

/** Jawaban demo — dirancang menghasilkan Level 3 (Sedang Berkembang). */
export const DEMO_ANSWERS: AnswerMap = {
  p1_1: "a",
  p1_2: "b",
  p1_3: "a",
  p1_4: "b",
  p1_5: "b",
  p2_1: "b",
  p2_2: "b",
  p2_3: "b",
  p2_4: ["a", "b"],
  p2_5: "b",
  p3_1: "b",
  p3_2: "d",
  p3_3: "b",
  p3_4: "b",
  p4_1: "b",
  p4_2: "b",
  p4_3: ["a", "b"],
  p4_4: "c",
  p4_5: "b",
  p5_1: "b",
  p5_2: "b",
  p5_3: ["a", "d"],
  p5_4: "b",
  p6_1: "b",
  p6_2: "a",
  p6_3: "b",
  p6_4: "b",
  p7_1: "b",
  p7_2: "b",
  p7_3: "b",
  p7_4: "b",
  p8_1: "b",
  p8_2: "b",
  p8_3: "b",
  p8_4: "c",
};

/** Pengajuan lama — dipakai untuk grafik perkembangan di dashboard. */
export const DEMO_RIWAYAT_ASESMEN: AssessmentResult[] = [
  {
    id: "asesmen-2026-07-14-demo1",
    tanggal: "2026-07-14T09:00:00.000Z",
    skorTotal: 41,
    level: 2,
    levelSebelumOverride: 2,
    overrides: [],
    pilar: [
      { pillarId: 1, skor: 42, terjawab: 5, total: 5 },
      { pillarId: 2, skor: 45, terjawab: 5, total: 5 },
      { pillarId: 3, skor: 25, terjawab: 4, total: 4 },
      { pillarId: 4, skor: 20, terjawab: 5, total: 5 },
      { pillarId: 5, skor: 50, terjawab: 4, total: 4 },
      { pillarId: 6, skor: 48, terjawab: 4, total: 4 },
      { pillarId: 7, skor: 58, terjawab: 4, total: 4 },
      { pillarId: 8, skor: 50, terjawab: 4, total: 4 },
    ],
    flagPetugas: [],
  },
];

export const STATISTIK_LANDING = [
  {
    angka: "61%",
    label: "kontribusi UMKM terhadap PDB Indonesia",
    sumber: "Angka ilustrasi berdasarkan rujukan publik",
  },
  {
    angka: "< 5%",
    label: "UMKM Indonesia yang sudah menembus pasar ekspor",
    sumber: "Angka ilustrasi berdasarkan rujukan publik",
  },
  {
    angka: "30×",
    label: "perkiraan luas pasar global dibanding pasar domestik",
    sumber: "Angka ilustrasi untuk keperluan prototipe",
  },
];

export const TESTIMONI = [
  {
    nama: "Ilustrasi — Pemilik usaha keripik buah",
    kota: "Karanganyar",
    kutipan:
      "Sebelumnya saya kira ekspor itu harus punya pabrik besar. Setelah asesmen, ternyata yang kurang cuma izin edar dan HS Code. Sekarang jelas urutannya.",
  },
  {
    nama: "Ilustrasi — Perajin mebel rotan",
    kota: "Sukoharjo",
    kutipan:
      "Bagian paling membantu itu waktu petugas mengoreksi rekomendasi soal SVLK. Jadi tahu mana yang benar-benar berlaku untuk produk saya.",
  },
  {
    nama: "Ilustrasi — Produsen kopi bubuk",
    kota: "Boyolali",
    kutipan:
      "Daftar dokumennya membuat saya berhenti menebak-nebak. Tinggal ikuti satu per satu sampai siap kirim pertama.",
  },
];
