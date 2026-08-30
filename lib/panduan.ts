/* ------------------------------------------------------------------ *
 * Panduan ekspor — satu alur runtut dari nol sampai barang berangkat.
 *
 * Sengaja dibuat sebagai satu sumber linear (bukan banyak artikel
 * terpisah) supaya UMKM tidak kewalahan: baca dari atas ke bawah,
 * lalu buka bagian dokumen yang sedang dibutuhkan.
 * ------------------------------------------------------------------ */

import type { PanduanBlok, PanduanEntry } from "./types";

/** Ubah judul jadi slug URL. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export interface AlurTahap {
  nomor: number;
  judul: string;
  ringkas: string;
  rincian: string[];
  dokumen?: string[];
}

/** Tahapan ekspor berurutan. */
export const ALUR_EKSPOR: AlurTahap[] = [
  {
    nomor: 1,
    judul: "Siapkan legalitas usaha",
    ringkas: "Tanpa identitas usaha yang sah, semua langkah berikutnya tertahan.",
    rincian: [
      "Urus NIB (Nomor Induk Berusaha) lewat OSS — gratis dan online. NIB sekaligus berlaku sebagai identitas kepabeanan untuk ekspor.",
      "Pastikan NPWP (badan usaha lebih baik daripada pribadi) sudah aktif dan datanya cocok dengan NIB.",
      "Simpan salinan PDF NIB dan NPWP — keduanya diminta berulang kali di langkah selanjutnya.",
    ],
    dokumen: ["doc-nib", "doc-npwp"],
  },
  {
    nomor: 2,
    judul: "Kunci satu produk & kenali HS Code-nya",
    ringkas: "Ekspor pertama sebaiknya fokus pada satu produk unggulan.",
    rincian: [
      "Tentukan satu produk yang paling siap: kualitas stabil, kapasitas cukup, dan kemasan layak kirim.",
      "Cari HS Code produk itu. HS Code menentukan bea, pajak, dan apakah produk termasuk barang yang dibatasi (Lartas).",
      "Cek status Lartas produk di portal INSW. Bila termasuk Lartas, urus izin terkait sebelum lanjut.",
    ],
  },
  {
    nomor: 3,
    judul: "Dapatkan pembeli & sepakati syarat dagang",
    ringkas: "Kesepakatan tertulis jadi dasar semua dokumen transaksi.",
    rincian: [
      "Sepakati harga, jumlah, Incoterms (misal FOB atau CIF), dan cara pembayaran (T/T, L/C).",
      "Minta Purchase Order (PO) tertulis dari pembeli — ini rujukan saat membuat invoice dan packing list.",
    ],
  },
  {
    nomor: 4,
    judul: "Susun dokumen transaksi",
    ringkas: "Commercial Invoice dan Packing List dibuat sendiri oleh eksportir.",
    rincian: [
      "Buat Commercial Invoice: identitas penjual & pembeli, rincian barang, HS Code, nilai, Incoterms, dan cara bayar.",
      "Buat Packing List yang konsisten dengan invoice: jumlah kemasan, berat bersih, berat kotor, dan dimensi.",
      "Bila pembeli minta tarif preferensi, siapkan pengajuan SKA (Surat Keterangan Asal) lewat e-SKA.",
    ],
    dokumen: ["doc-invoice", "doc-packing", "doc-ska"],
  },
  {
    nomor: 5,
    judul: "Ajukan PEB ke Bea Cukai",
    ringkas: "PEB adalah pemberitahuan resmi bahwa Anda akan mengekspor barang.",
    rincian: [
      "Ajukan PEB lewat CEISA 4.0 / portal INSW sebelum barang dimuat.",
      "Isi data ekspor berdasarkan Invoice dan Packing List, lalu kirim secara elektronik.",
      "Bila tidak kena pemeriksaan fisik, sistem menerbitkan NPE (Nota Pelayanan Ekspor) sebagai izin muat.",
    ],
    dokumen: ["doc-peb"],
  },
  {
    nomor: 6,
    judul: "Kirim barang & selesaikan administrasi",
    ringkas: "Bawa NPE ke pelabuhan, barang dimuat, dokumen dirapikan.",
    rincian: [
      "Serahkan NPE ke pihak pelabuhan/forwarder untuk proses muat.",
      "Setelah kapal berangkat, lengkapi Bill of Lading / Airway Bill dari pengangkut.",
      "Simpan seluruh dokumen minimal 10 tahun untuk keperluan audit dan klaim.",
    ],
  },
];

export interface DokumenPanduan {
  id: string;
  nama: string;
  singkat: string;
  deskripsi: string;
  caraDapat: { judul: string; detail: string }[];
  tautan?: { teks: string; url: string }[];
  dibuatSendiri: boolean;
}

/** Semua dokumen yang mungkin dibutuhkan + cara mendapatkannya. */
export const DOKUMEN_PANDUAN: DokumenPanduan[] = [
  {
    id: "doc-nib",
    nama: "NIB — Nomor Induk Berusaha",
    singkat: "Identitas usaha sekaligus identitas kepabeanan untuk ekspor.",
    deskripsi:
      "NIB diterbitkan lewat sistem OSS (Online Single Submission). Untuk kegiatan ekspor, NIB otomatis berfungsi sebagai akses kepabeanan sehingga Anda tidak perlu mengurus NIK terpisah.",
    dibuatSendiri: false,
    caraDapat: [
      { judul: "Buat akun OSS", detail: "Daftar di oss.go.id memakai NIK penanggung jawab usaha dan email aktif." },
      { judul: "Isi data usaha", detail: "Masukkan data badan usaha / perseorangan, KBLI yang sesuai produk, dan lokasi usaha." },
      { judul: "Terbitkan NIB", detail: "Setelah data lengkap, NIB terbit dalam bentuk PDF dan bisa diunduh langsung." },
      { judul: "Aktifkan akses kepabeanan", detail: "Pada menu OSS, pastikan hak akses kepabeanan (ekspor-impor) berstatus aktif." },
    ],
    tautan: [{ teks: "Portal OSS", url: "https://oss.go.id/" }],
  },
  {
    id: "doc-npwp",
    nama: "NPWP Badan Usaha",
    singkat: "Nomor pokok wajib pajak atas nama usaha.",
    deskripsi:
      "NPWP badan usaha dipakai untuk pelaporan pajak transaksi ekspor dan sering diminta saat pengajuan fasilitas kepabeanan. Datanya harus konsisten dengan NIB.",
    dibuatSendiri: false,
    caraDapat: [
      { judul: "Ajukan lewat Coretax / KPP", detail: "Daftar online di laman pajak atau datang ke Kantor Pelayanan Pajak wilayah usaha." },
      { judul: "Lampirkan dokumen usaha", detail: "Akta pendirian (untuk badan), NIB, dan identitas pengurus." },
      { judul: "Simpan kartu NPWP", detail: "Setelah terbit, unduh/scan kartu NPWP dalam format PDF." },
    ],
    tautan: [{ teks: "DJP Online", url: "https://djponline.pajak.go.id/" }],
  },
  {
    id: "doc-invoice",
    nama: "Commercial Invoice",
    singkat: "Faktur komersial berisi nilai dan syarat transaksi.",
    deskripsi:
      "Commercial Invoice adalah dokumen utama transaksi ekspor: berisi rincian barang, nilai barang, dan pihak yang terlibat. Menjadi dasar perhitungan pajak dan bea di negara tujuan. Dibuat sendiri oleh eksportir.",
    dibuatSendiri: true,
    caraDapat: [
      { judul: "Pakai kop surat resmi", detail: "Cantumkan nama, alamat, telepon, dan email perusahaan dengan jelas." },
      { judul: "Isi data penjual & pembeli", detail: "Shipper/Exporter (Anda) dan Consignee/Buyer (pembeli luar negeri)." },
      { judul: "Rincian barang", detail: "Deskripsi, HS Code, jumlah, harga satuan, dan total dalam valuta yang disepakati (mis. USD)." },
      { judul: "Incoterms & pembayaran", detail: "Sebutkan Incoterms (mis. FOB Tanjung Priok) dan cara bayar (T/T, L/C)." },
      { judul: "Pengesahan", detail: "Ditandatangani pimpinan perusahaan dan dibubuhi cap." },
    ],
    tautan: [
      { teks: "Template dokumen ekspor (Kemendag)", url: "https://djpen.kemendag.go.id/app_frontend/links/57-template-dokumen-ekspor" },
    ],
  },
  {
    id: "doc-packing",
    nama: "Packing List",
    singkat: "Rincian fisik barang: jumlah kemasan, berat, dimensi.",
    deskripsi:
      "Packing List memuat rincian fisik barang yang diekspor. Nomor dan tanggalnya biasanya mengikuti Commercial Invoice, dan datanya harus konsisten. Dibuat sendiri oleh eksportir.",
    dibuatSendiri: true,
    caraDapat: [
      { judul: "Sesuaikan dengan invoice", detail: "Nomor, tanggal, data penjual & pembeli identik dengan Commercial Invoice." },
      { judul: "Rincikan kemasan", detail: "Jenis kemasan (carton, pallet, wooden box) dan jumlahnya." },
      { judul: "Berat & volume", detail: "Net Weight, Gross Weight, dan dimensi tiap kemasan." },
      { judul: "Pengesahan", detail: "Ditandatangani pimpinan perusahaan dan dibubuhi cap." },
    ],
  },
  {
    id: "doc-ska",
    nama: "SKA / Certificate of Origin",
    singkat: "Bukti barang berasal dari Indonesia untuk tarif preferensi.",
    deskripsi:
      "SKA (Surat Keterangan Asal) membuktikan barang berasal dari Indonesia, sehingga pembeli bisa memperoleh tarif bea masuk preferensi di negara tujuan. Diterbitkan instansi penerbit SKA (IPSKA), bukan dibuat sendiri.",
    dibuatSendiri: false,
    caraDapat: [
      { judul: "Daftar hak akses e-SKA", detail: "Registrasi di portal e-SKA Kemendag memakai NIB." },
      { judul: "Siapkan dokumen pendukung", detail: "Commercial Invoice, Packing List, dan PEB yang sudah ber-NPE." },
      { judul: "Pilih form SKA", detail: "Sesuaikan dengan negara tujuan (mis. Form D untuk ASEAN, Form E untuk Tiongkok)." },
      { judul: "Isi & submit online", detail: "Lengkapi data barang, HS Code, dan kriteria asal barang, lalu tunggu persetujuan IPSKA." },
      { judul: "Cetak", detail: "Setelah disetujui, SKA dicetak mandiri atau diambil di kantor IPSKA." },
    ],
    tautan: [{ teks: "Portal e-SKA Kemendag", url: "https://eska.kemendag.go.id/" }],
  },
  {
    id: "doc-peb",
    nama: "PEB — Pemberitahuan Ekspor Barang",
    singkat: "Dokumen pabean wajib untuk setiap pengiriman ekspor.",
    deskripsi:
      "PEB diajukan ke Bea Cukai untuk memberitahukan pelaksanaan ekspor. Bila lolos tanpa pemeriksaan fisik, sistem menerbitkan NPE (Nota Pelayanan Ekspor) sebagai izin muat barang.",
    dibuatSendiri: true,
    caraDapat: [
      { judul: "Siapkan akses", detail: "Gunakan modul PEB atau portal CEISA 4.0. Perlu NIB dan rekening untuk bea keluar bila ada." },
      { judul: "Input data ekspor", detail: "Pengirim, penerima, rincian barang, HS Code, dan nilai FOB dari Invoice & Packing List." },
      { judul: "Submit elektronik", detail: "Kirim data PEB ke sistem Bea Cukai; sistem memvalidasi." },
      { judul: "Tindak lanjut", detail: "Bila tidak kena Lartas/bea keluar dan profil baik, NPE langsung terbit. Bila kena random check, ada pemeriksaan fisik dulu." },
      { judul: "Terima NPE", detail: "NPE adalah bukti barang boleh dimuat. Bawa ke pelabuhan." },
    ],
    tautan: [
      { teks: "Portal INSW", url: "https://insw.go.id/" },
      { teks: "CEISA 4.0 Bea Cukai", url: "https://portal.beacukai.go.id/" },
    ],
  },
];

export function getDokumenPanduan(id: string) {
  return DOKUMEN_PANDUAN.find((d) => d.id === id);
}

/* ------------------------------------------------------------------ *
 * Seed CMS — daftar rata PanduanEntry yang dipakai admin sebagai
 * kondisi awal, dan sebagai fallback bila store belum terisi.
 * ------------------------------------------------------------------ */

/**
 * Kondisi awal CMS: satu daftar langkah berurutan. Tiap langkah adalah
 * artikel dengan blok konten dan halaman detail sendiri.
 * Disusun dari `ALUR_EKSPOR` (alur) + `DOKUMEN_PANDUAN` (tiap dokumen).
 */
export const SEED_PANDUAN: PanduanEntry[] = [
  ...ALUR_EKSPOR.map((tahap, index): PanduanEntry => {
    const blok: PanduanBlok[] = [
      { tipe: "paragraf", teks: tahap.ringkas },
      { tipe: "poin", items: tahap.rincian },
    ];
    return {
      id: `tahap-${tahap.nomor}`,
      slug: slugify(tahap.judul),
      judul: tahap.judul,
      ringkas: tahap.ringkas,
      blok,
      urutan: (index + 1) * 10,
      status: "terbit",
      terkunci: true,
    };
  }),
  ...DOKUMEN_PANDUAN.map((dok, index): PanduanEntry => {
    const blok: PanduanBlok[] = [
      { tipe: "paragraf", teks: dok.deskripsi },
      {
        tipe: "catatan",
        teks: dok.dibuatSendiri
          ? "Dokumen ini Anda buat sendiri sebagai eksportir."
          : "Dokumen ini diurus/diterbitkan oleh instansi terkait.",
      },
      { tipe: "langkah", items: dok.caraDapat },
      ...(dok.tautan && dok.tautan.length
        ? [{ tipe: "tautan" as const, items: dok.tautan }]
        : []),
    ];
    return {
      id: dok.id,
      slug: slugify(dok.nama),
      judul: dok.nama,
      ringkas: dok.singkat,
      blok,
      urutan: 100 + index * 10,
      status: "terbit",
      terkunci: true,
    };
  }),
];

export const KATEGORI_KONSULTASI = [
  "Legalitas & NIB",
  "HS Code & Lartas",
  "Dokumen (Invoice, Packing, PEB)",
  "SKA / Certificate of Origin",
  "Logistik & pengiriman",
  "Pembayaran ekspor",
  "Lainnya",
];
