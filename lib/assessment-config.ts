import type { BusinessProfile, Pillar, Question } from "./types";
import { getCategory } from "./business-categories";

/* ------------------------------------------------------------------ *
 * 8 Pilar Kesiapan Ekspor (blueprint §7)
 * ------------------------------------------------------------------ */

export const PILLARS: Pillar[] = [
  {
    id: 2,
    slug: "produk",
    nama: "Kesiapan Produk",
    ringkas:
      "Kapasitas produksi, standar mutu, kemasan, dan sertifikasi produk Anda.",
    bobot: 0.1875,
    icon: "Package",
  },
  {
    id: 3,
    slug: "klasifikasi",
    nama: "Klasifikasi & Regulasi",
    ringkas:
      "HS Code, status Lartas, dan persyaratan regulasi negara tujuan.",
    bobot: 0.1875,
    icon: "FileSearch",
  },
  {
    id: 4,
    slug: "kepabeanan",
    nama: "Pengetahuan Kepabeanan",
    ringkas:
      "Pemahaman PEB, CEISA, dokumen ekspor, dan fasilitas kepabeanan UMKM.",
    bobot: 0.1875,
    icon: "Landmark",
  },
  {
    id: 5,
    slug: "pasar",
    nama: "Pasar & Pembeli",
    ringkas: "Calon pembeli, negara tujuan, dan cara Anda menjangkau buyer.",
    bobot: 0.125,
    icon: "Globe2",
  },
  {
    id: 6,
    slug: "logistik",
    nama: "Logistik & Pengiriman",
    ringkas: "Incoterms, moda pengiriman, dan mitra freight forwarder.",
    bobot: 0.125,
    icon: "Ship",
  },
  {
    id: 7,
    slug: "keuangan",
    nama: "Keuangan & Pembayaran",
    ringkas: "Rekening valas, metode pembayaran, DHE, dan modal kerja.",
    bobot: 0.125,
    icon: "Wallet",
  },
  {
    id: 8,
    slug: "sdm",
    nama: "SDM & Kapasitas Operasional",
    ringkas: "Tim, kemampuan bahasa asing, dan SOP produksi.",
    bobot: 0.0625,
    icon: "Users",
  },
];

export function getPillar(id: number) {
  return PILLARS.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ *
 * Bank Pertanyaan
 * Poin per opsi = nilai mentah; skor dinormalisasi di lib/scoring.ts
 * ------------------------------------------------------------------ */

export const QUESTIONS: Question[] = [
  /* ---------------- Pilar 2 — Kesiapan Produk (15%) ---------------- */
  {
    id: "p2_1",
    pillarId: 2,
    teks: "Berapa kapasitas produksi rata-rata usaha Anda per bulan?",
    type: "single",
    bantuan:
      "Pembeli luar negeri biasanya memesan dalam jumlah besar dan berulang. Kapasitas yang stabil lebih penting daripada kapasitas besar sesaat.",
    options: [
      { id: "a", label: "Kurang dari 100 unit / 100 kg", poin: 1 },
      { id: "b", label: "100 – 500 unit", poin: 2 },
      { id: "c", label: "500 – 2.000 unit", poin: 3 },
      { id: "d", label: "Lebih dari 2.000 unit", poin: 4 },
    ],
  },
  {
    id: "p2_2",
    pillarId: 2,
    teks: "Apakah produk Anda sudah memiliki standar kualitas yang terukur?",
    istilah: ["SNI"],
    type: "single",
    options: [
      { id: "a", label: "Ya, punya SNI atau sertifikat internasional (ISO, HACCP, dll)", poin: 4 },
      { id: "b", label: "Ya, punya standar internal yang terdokumentasi", poin: 3 },
      { id: "c", label: "Belum ada dokumen, tapi kualitas sudah konsisten", poin: 1 },
      { id: "d", label: "Belum sama sekali", poin: 0 },
    ],
  },
  {
    id: "p2_3",
    pillarId: 2,
    teks: "Apakah kemasan produk Anda sudah siap untuk pengiriman internasional?",
    type: "single",
    bantuan:
      "Kemasan ekspor perlu label berbahasa Inggris, informasi negara asal, dan daya tahan terhadap perjalanan jauh serta perubahan suhu.",
    options: [
      { id: "a", label: "Sudah — label bahasa Inggris dan tahan pengiriman jauh", poin: 3 },
      { id: "b", label: "Sebagian sudah, masih perlu penyesuaian", poin: 2 },
      { id: "c", label: "Belum, masih kemasan untuk pasar lokal", poin: 0 },
    ],
  },
  {
    id: "p2_4",
    pillarId: 2,
    teks: "Sertifikat apa saja yang sudah dimiliki produk Anda?",
    istilah: ["BPJPH", "BPOM", "PIRT"],
    type: "multi",
    opsiNolId: "z",
    hanyaUntukTrait: ["pangan", "kosmetik", "herbal"],
    bantuan:
      "Pertanyaan ini muncul karena kategori usaha Anda termasuk produk konsumsi atau perawatan tubuh. Negara tujuan hampir selalu meminta bukti izin edar dari negara asal.",
    options: [
      { id: "a", label: "Sertifikat Halal MUI / BPJPH", poin: 2 },
      { id: "b", label: "Izin edar BPOM atau PIRT", poin: 2 },
      { id: "c", label: "Sertifikat kesehatan / higienitas (Health Certificate)", poin: 2 },
      { id: "z", label: "Belum ada satu pun", poin: 0 },
    ],
  },
  {
    id: "p2_5",
    pillarId: 2,
    teks: "Apakah produk Anda sudah memiliki sertifikat karantina?",
    type: "single",
    hanyaUntukTrait: ["hayati"],
    bantuan:
      "Pertanyaan ini muncul karena produk Anda berasal dari sumber daya hayati. Produk pertanian dan perikanan wajib melewati pemeriksaan Badan Karantina sebelum diekspor.",
    options: [
      { id: "a", label: "Ya, sudah pernah mengurus", poin: 3 },
      { id: "b", label: "Belum, tapi saya tahu prosesnya", poin: 1 },
      { id: "c", label: "Belum tahu sama sekali", poin: 0 },
    ],
  },
  {
    id: "p2_6",
    pillarId: 2,
    teks: "Apakah bahan baku kayu/rotan Anda sudah tercakup sertifikasi SVLK?",
    istilah: ["SVLK"],
    type: "single",
    hanyaUntukTrait: ["kayu"],
    bantuan:
      "Pertanyaan ini muncul karena kategori usaha Anda memakai bahan kayu atau rotan. Tanpa SVLK, ekspor ke Uni Eropa dan beberapa negara lain akan ditolak.",
    options: [
      { id: "a", label: "Sudah bersertifikat SVLK", poin: 3 },
      { id: "b", label: "Belum, tapi pemasok saya sudah bersertifikat", poin: 2 },
      { id: "c", label: "Belum dan belum tahu prosesnya", poin: 0 },
    ],
  },

  /* ------------- Pilar 3 — Klasifikasi & Regulasi (15%) ------------- */
  {
    id: "p3_1",
    pillarId: 3,
    teks: "Sejauh mana Anda mengetahui HS Code produk Anda?",
    istilah: ["HS Code"],
    type: "single",
    bobot: 1.5,
    bantuan:
      "HS Code menentukan tarif, izin, dan dokumen yang diminta. Anda bisa mengonsultasikannya gratis ke Klinik Ekspor Bea Cukai sebelum transaksi pertama.",
    options: [
      { id: "a", label: "Tahu, dan HS Code produk saya sudah dipastikan", poin: 4 },
      { id: "b", label: "Tahu istilahnya, tapi belum tahu kode produk saya", poin: 2 },
      { id: "c", label: "Pernah dengar, belum paham", poin: 1 },
      { id: "d", label: "Belum pernah dengar", poin: 0 },
    ],
  },
  {
    id: "p3_2",
    pillarId: 3,
    teks: "Apakah Anda sudah mengecek apakah produk Anda termasuk Lartas?",
    istilah: ["Lartas"],
    type: "single",
    bantuan:
      "Lartas dicek berdasarkan HS Code. Beberapa komoditas seperti hasil laut, kayu, dan produk pangan tertentu butuh izin tambahan dari kementerian teknis.",
    options: [
      { id: "a", label: "Sudah cek, produk saya tidak termasuk Lartas", poin: 4 },
      { id: "b", label: "Sudah cek, termasuk Lartas dan saya tahu izinnya", poin: 4 },
      { id: "c", label: "Sudah cek, termasuk Lartas tapi bingung mengurus izinnya", poin: 2 },
      { id: "d", label: "Belum pernah cek", poin: 0 },
      { id: "e", label: "Belum tahu apa itu Lartas", poin: 0 },
    ],
  },
  {
    id: "p3_3",
    pillarId: 3,
    teks: "Apakah Anda tahu persyaratan regulasi negara tujuan untuk produk Anda?",
    type: "single",
    bantuan:
      "Setiap negara punya aturan label, batas kandungan, dan sertifikat sendiri. Contoh: Uni Eropa ketat pada residu pestisida, Jepang pada standar kemasan pangan.",
    options: [
      { id: "a", label: "Tahu detailnya (label, standar, sertifikat yang diminta)", poin: 3 },
      { id: "b", label: "Tahu garis besarnya saja", poin: 2 },
      { id: "c", label: "Belum pernah riset", poin: 0 },
    ],
  },
  {
    id: "p3_4",
    pillarId: 3,
    teks: "Apakah Anda tahu tentang SKA / Certificate of Origin dan manfaat tarif preferensinya?",
    istilah: ["SKA"],
    type: "single",
    bantuan:
      "Dengan SKA preferensi, pembeli Anda membayar bea masuk lebih rendah. Ini sering menjadi alasan buyer memilih pemasok Indonesia dibanding negara lain.",
    options: [
      { id: "a", label: "Tahu, dan sudah pernah mengurus atau siap mengurus", poin: 3 },
      { id: "b", label: "Pernah dengar, belum paham manfaatnya", poin: 1 },
      { id: "c", label: "Belum tahu", poin: 0 },
    ],
  },

  /* ----------- Pilar 4 — Pengetahuan Kepabeanan (15%) ----------- */
  {
    id: "p4_1",
    pillarId: 4,
    teks: "Sejauh mana Anda memahami PEB (Pemberitahuan Ekspor Barang)?",
    istilah: ["PEB", "PPJK"],
    type: "single",
    bobot: 1.5,
    options: [
      { id: "a", label: "Paham, dan pernah mengurus sendiri atau lewat PPJK", poin: 4 },
      { id: "b", label: "Tahu fungsinya, belum pernah mengurus", poin: 2 },
      { id: "c", label: "Pernah dengar istilahnya saja", poin: 1 },
      { id: "d", label: "Belum tahu", poin: 0 },
    ],
  },
  {
    id: "p4_2",
    pillarId: 4,
    teks: "Apakah Anda pernah mengakses portal CEISA Bea Cukai?",
    istilah: ["CEISA"],
    type: "single",
    options: [
      { id: "a", label: "Sudah pernah dan punya akun aktif", poin: 3 },
      { id: "b", label: "Belum, tapi tahu portal itu untuk apa", poin: 1 },
      { id: "c", label: "Belum tahu", poin: 0 },
    ],
  },
  {
    id: "p4_3",
    pillarId: 4,
    teks: "Dokumen ekspor mana saja yang sudah Anda pahami fungsinya?",
    istilah: ["B/L", "AWB", "Packing List", "SKA"],
    type: "multi",
    opsiNolId: "z",
    bantuan:
      "Satu pengiriman ekspor biasanya melibatkan minimal lima dokumen yang harus konsisten satu sama lain. Ketidakcocokan angka antar dokumen adalah penyebab tertahannya barang.",
    options: [
      { id: "a", label: "Invoice", poin: 1 },
      { id: "b", label: "Packing List", poin: 1 },
      { id: "c", label: "Bill of Lading (B/L) atau Airway Bill (AWB)", poin: 1 },
      { id: "d", label: "Certificate of Origin / SKA", poin: 1 },
      { id: "e", label: "Shipping Instruction", poin: 1 },
      { id: "z", label: "Belum familiar dengan semuanya", poin: 0 },
    ],
  },
  {
    id: "p4_4",
    pillarId: 4,
    teks: "Apakah Anda tahu fasilitas kepabeanan untuk UMKM seperti KITE IKM?",
    istilah: ["KITE IKM"],
    type: "single",
    options: [
      { id: "a", label: "Tahu dan sudah memanfaatkan", poin: 3 },
      { id: "b", label: "Tahu, tapi belum memanfaatkan", poin: 2 },
      { id: "c", label: "Belum tahu", poin: 0 },
    ],
  },
  {
    id: "p4_5",
    pillarId: 4,
    teks: "Apakah Anda tahu apa yang terjadi setelah PEB disetujui, sampai barang boleh dimuat?",
    istilah: ["NPE"],
    type: "single",
    bantuan:
      "Setelah PEB diterima, Bea Cukai menerbitkan NPE sebagai izin barang masuk kawasan pabean. Memahami alurnya membuat Anda tidak bergantung penuh pada pihak ketiga.",
    options: [
      { id: "a", label: "Paham alurnya sampai barang dimuat", poin: 3 },
      { id: "b", label: "Paham sebagian", poin: 1 },
      { id: "c", label: "Belum paham", poin: 0 },
    ],
  },

  /* --------------- Pilar 5 — Pasar & Pembeli (10%) --------------- */
  {
    id: "p5_1",
    pillarId: 5,
    teks: "Apakah Anda sudah punya calon pembeli di luar negeri?",
    type: "single",
    bobot: 1.5,
    options: [
      { id: "a", label: "Sudah ada buyer dengan kontrak atau pesanan pasti", poin: 4 },
      { id: "b", label: "Sudah berkomunikasi dengan calon buyer", poin: 3 },
      { id: "c", label: "Baru tahap mencari", poin: 1 },
      { id: "d", label: "Belum sama sekali", poin: 0 },
    ],
  },
  {
    id: "p5_2",
    pillarId: 5,
    teks: "Apakah Anda sudah menentukan negara tujuan ekspor?",
    type: "single",
    bantuan:
      "Menentukan satu negara lebih dulu membuat riset regulasi, sertifikasi, dan biaya logistik jauh lebih fokus dan murah.",
    options: [
      { id: "a", label: "Sudah, satu negara spesifik", poin: 3 },
      { id: "b", label: "Punya 2–3 kandidat negara", poin: 2 },
      { id: "c", label: "Belum menentukan", poin: 0 },
    ],
  },
  {
    id: "p5_3",
    pillarId: 5,
    teks: "Lewat jalur apa saja Anda mencari pembeli luar negeri?",
    type: "multi",
    opsiNolId: "z",
    options: [
      { id: "a", label: "Marketplace B2B (Alibaba, Amazon, dll)", poin: 1 },
      { id: "b", label: "Pameran atau trade show", poin: 1 },
      { id: "c", label: "Kontak dari asosiasi atau instansi pemerintah", poin: 1 },
      { id: "d", label: "Media sosial dan website sendiri", poin: 1 },
      { id: "z", label: "Belum tahu caranya", poin: 0 },
    ],
  },
  {
    id: "p5_4",
    pillarId: 5,
    teks: "Apakah Anda punya materi pemasaran berbahasa Inggris (katalog, company profile, price list)?",
    type: "single",
    bantuan:
      "Buyer luar negeri hampir selalu meminta katalog dan price list FOB sebelum melanjutkan pembicaraan. Materi yang rapi mempercepat kepercayaan.",
    options: [
      { id: "a", label: "Ya, lengkap dan siap dikirim", poin: 3 },
      { id: "b", label: "Ada seadanya, belum rapi", poin: 1 },
      { id: "c", label: "Belum ada", poin: 0 },
    ],
  },

  /* ------------ Pilar 6 — Logistik & Pengiriman (10%) ------------ */
  {
    id: "p6_1",
    pillarId: 6,
    teks: "Apakah Anda memahami Incoterms (FOB, CIF, EXW, dan sejenisnya)?",
    istilah: ["Incoterms", "FOB", "CIF", "EXW"],
    type: "single",
    bobot: 1.5,
    options: [
      { id: "a", label: "Paham, dan sudah menentukan akan memakai yang mana", poin: 4 },
      { id: "b", label: "Tahu istilahnya, belum paham detail tanggung jawabnya", poin: 2 },
      { id: "c", label: "Belum tahu", poin: 0 },
    ],
  },
  {
    id: "p6_2",
    pillarId: 6,
    teks: "Moda pengiriman apa yang Anda rencanakan?",
    type: "single",
    bantuan:
      "Untuk volume kecil, pengiriman lewat pos atau kurir internasional tetap terhitung ekspor dan bisa didaftarkan agar tercatat sebagai kinerja ekspor Anda.",
    options: [
      { id: "a", label: "Laut (kontainer / LCL)", poin: 3 },
      { id: "b", label: "Udara (kargo)", poin: 3 },
      { id: "c", label: "Pos atau kurir internasional untuk volume kecil", poin: 2 },
      { id: "d", label: "Belum menentukan", poin: 0 },
    ],
  },
  {
    id: "p6_3",
    pillarId: 6,
    teks: "Apakah Anda sudah punya kontak freight forwarder atau PPJK?",
    istilah: ["Freight Forwarder", "PPJK"],
    type: "single",
    options: [
      { id: "a", label: "Sudah, dan pernah bekerja sama", poin: 3 },
      { id: "b", label: "Sudah kontak, belum pernah memakai jasanya", poin: 2 },
      { id: "c", label: "Belum punya", poin: 0 },
    ],
  },
  {
    id: "p6_4",
    pillarId: 6,
    teks: "Apakah Anda sudah menghitung estimasi biaya logistik ke negara tujuan?",
    type: "single",
    bantuan:
      "Biaya logistik bisa mencapai belasan persen dari nilai barang. Tanpa perhitungan ini, harga penawaran Anda berisiko merugi.",
    options: [
      { id: "a", label: "Sudah, sudah masuk ke struktur harga jual", poin: 3 },
      { id: "b", label: "Baru perkiraan kasar", poin: 1 },
      { id: "c", label: "Belum pernah menghitung", poin: 0 },
    ],
  },

  /* ----------- Pilar 7 — Keuangan & Pembayaran (10%) ----------- */
  {
    id: "p7_1",
    pillarId: 7,
    teks: "Apakah usaha Anda punya rekening bank untuk transaksi ekspor?",
    type: "single",
    options: [
      { id: "a", label: "Ya, punya rekening valas (USD/EUR/lainnya)", poin: 3 },
      { id: "b", label: "Punya rekening bank rupiah atas nama usaha", poin: 2 },
      { id: "c", label: "Belum, masih rekening pribadi biasa", poin: 0 },
    ],
  },
  {
    id: "p7_2",
    pillarId: 7,
    teks: "Metode pembayaran apa yang Anda rencanakan dengan buyer?",
    istilah: ["L/C", "T/T"],
    type: "single",
    options: [
      { id: "a", label: "L/C (Letter of Credit)", poin: 3 },
      { id: "b", label: "T/T (Telegraphic Transfer) dengan uang muka", poin: 3 },
      { id: "c", label: "Pembayaran lewat marketplace", poin: 2 },
      { id: "d", label: "Belum tahu", poin: 0 },
    ],
  },
  {
    id: "p7_3",
    pillarId: 7,
    teks: "Apakah Anda tahu kewajiban DHE (Devisa Hasil Ekspor)?",
    istilah: ["DHE"],
    type: "single",
    options: [
      { id: "a", label: "Tahu dan paham ketentuan Bank Indonesia", poin: 3 },
      { id: "b", label: "Pernah dengar, belum paham kewajibannya", poin: 1 },
      { id: "c", label: "Belum tahu", poin: 0 },
    ],
  },
  {
    id: "p7_4",
    pillarId: 7,
    teks: "Apakah Anda punya modal kerja untuk memproduksi pesanan ekspor sebelum dibayar penuh?",
    type: "single",
    bantuan:
      "Pesanan ekspor biasanya dibayar sebagian di muka dan sisanya setelah barang dikirim. Anda perlu dana talangan untuk masa produksi.",
    options: [
      { id: "a", label: "Ya, modal sendiri mencukupi", poin: 3 },
      { id: "b", label: "Sebagian, sisanya perlu pembiayaan", poin: 2 },
      { id: "c", label: "Belum ada", poin: 0 },
    ],
  },

  /* --------- Pilar 8 — SDM & Kapasitas Operasional (5%) --------- */
  {
    id: "p8_1",
    pillarId: 8,
    teks: "Berapa jumlah karyawan usaha Anda saat ini?",
    type: "single",
    options: [
      { id: "a", label: "1 – 5 orang", poin: 1 },
      { id: "b", label: "6 – 19 orang", poin: 2 },
      { id: "c", label: "20 – 99 orang", poin: 3 },
      { id: "d", label: "100 orang atau lebih", poin: 3 },
    ],
  },
  {
    id: "p8_2",
    pillarId: 8,
    teks: "Apakah ada anggota tim yang bisa berkomunikasi dalam bahasa Inggris?",
    type: "single",
    options: [
      { id: "a", label: "Ya, ada yang fasih", poin: 3 },
      { id: "b", label: "Ada yang bisa dasar-dasarnya", poin: 2 },
      { id: "c", label: "Belum ada", poin: 0 },
    ],
  },
  {
    id: "p8_3",
    pillarId: 8,
    teks: "Apakah usaha Anda sudah punya SOP tertulis untuk produksi dan kontrol mutu?",
    type: "single",
    bantuan:
      "Buyer luar negeri sering meminta audit sederhana. SOP tertulis membuat mutu tetap sama meski produksi naik berkali lipat.",
    options: [
      { id: "a", label: "Ya, lengkap dan dijalankan", poin: 3 },
      { id: "b", label: "Sebagian sudah ada", poin: 2 },
      { id: "c", label: "Belum ada", poin: 0 },
    ],
  },
  {
    id: "p8_4",
    pillarId: 8,
    teks: "Apakah Anda atau tim pernah mengikuti pelatihan atau pendampingan ekspor?",
    type: "single",
    bantuan:
      "Klinik Ekspor di Kantor Bea dan Cukai memberikan pendampingan gratis untuk UMKM, termasuk konsultasi HS Code dan simulasi dokumen.",
    options: [
      { id: "a", label: "Ya, pernah dan menerapkannya", poin: 3 },
      { id: "b", label: "Pernah ikut sekali, belum diterapkan", poin: 2 },
      { id: "c", label: "Belum pernah", poin: 0 },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Penyaringan pertanyaan berdasarkan profil bisnis
 * ------------------------------------------------------------------ */

export function questionsForProfile(
  profile: BusinessProfile | null,
): Question[] {
  const traits = getCategory(profile?.kategoriId)?.traits ?? [];
  return QUESTIONS.filter((q) => {
    if (!q.hanyaUntukTrait) return true;
    return q.hanyaUntukTrait.some((t) => traits.includes(t));
  });
}

export function questionsForPillar(
  pillarId: number,
  profile: BusinessProfile | null,
): Question[] {
  return questionsForProfile(profile).filter((q) => q.pillarId === pillarId);
}

/** Jumlah pertanyaan tambahan yang muncul khusus untuk kategori ini. */
export function conditionalQuestionCount(profile: BusinessProfile | null) {
  return questionsForProfile(profile).filter((q) => q.hanyaUntukTrait).length;
}

export const TOTAL_PILAR = PILLARS.length;
