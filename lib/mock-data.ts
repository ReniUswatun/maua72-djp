import type {
  BusinessProfile,
  DocumentItem,
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
