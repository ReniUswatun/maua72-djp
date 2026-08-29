import { questionsForProfile } from "./assessment-config";
import type {
  AnswerMap,
  AssessmentResult,
  BusinessProfile,
  OfficerReview,
  Recommendation,
} from "./types";

/* ------------------------------------------------------------------ *
 * Katalog rekomendasi.
 * `pemicu` menentukan rekomendasi muncul bila jawaban user termasuk
 * opsi bermasalah. Urutan prioritas = angka lebih kecil lebih dulu.
 * ------------------------------------------------------------------ */

type KatalogItem = Omit<Recommendation, "review"> & {
  reviewDefault: OfficerReview;
};

const REVIEW_PENDING: OfficerReview = { status: "pending_review" };

export const RECOMMENDATION_CATALOG: KatalogItem[] = [
  {
    id: "urus-nib",
    judul: "Urus Nomor Induk Berusaha (NIB) lewat OSS",
    pillarId: 1,
    prioritas: 1,
    effort: 2,
    estimasi: "1 – 3 hari kerja",
    ringkas:
      "NIB adalah syarat mutlak. Tanpa ini, dokumen ekspor Anda tidak bisa diproses sama sekali.",
    mengapa:
      "NIB berfungsi sekaligus sebagai identitas usaha dan hak akses kepabeanan. Bea Cukai memakai NIB untuk mengidentifikasi eksportir pada dokumen PEB. Selama NIB belum ada, level kesiapan usaha Anda dibatasi maksimal Level 2 berapa pun skor pilar lainnya.",
    langkah: [
      "Siapkan NIK KTP penanggung jawab, NPWP, dan alamat usaha sesuai dokumen.",
      "Daftar akun di oss.go.id, pilih skala usaha Mikro atau Kecil.",
      "Isi data kegiatan usaha dan pilih kode KBLI yang sesuai produk ekspor Anda.",
      "Terbitkan NIB — gratis dan biasanya keluar dalam hitungan jam sampai beberapa hari.",
      "Aktifkan hak akses kepabeanan pada menu yang tersedia agar bisa masuk sistem Bea Cukai.",
    ],
    referensi: [
      { label: "Portal OSS — oss.go.id", url: "https://oss.go.id" },
      { label: "Panduan Bea Cukai untuk eksportir pemula", url: "https://www.beacukai.go.id" },
    ],
    pemicu: { questionId: "p1_1", opsiId: ["b", "c", "d", "e"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "aktivasi-kepabeanan",
    judul: "Aktifkan akses kepabeanan dan akun CEISA",
    pillarId: 1,
    prioritas: 3,
    effort: 2,
    estimasi: "3 – 5 hari kerja",
    ringkas:
      "Pintu masuk agar usaha Anda bisa mengajukan PEB secara mandiri lewat sistem Bea Cukai.",
    mengapa:
      "Tanpa akses kepabeanan yang aktif, seluruh pengurusan dokumen harus lewat pihak ketiga dan Anda kehilangan kendali atas data yang dilaporkan atas nama usaha Anda.",
    langkah: [
      "Pastikan NIB sudah aktif dan data usaha sudah benar.",
      "Ajukan aktivasi hak akses kepabeanan melalui portal Bea Cukai.",
      "Lengkapi dokumen pendukung: NPWP, dokumen badan usaha, dan bukti kepemilikan tempat usaha.",
      "Setelah aktif, buat akun di portal CEISA dan coba masuk untuk memastikan akses berfungsi.",
    ],
    referensi: [
      { label: "Portal CEISA Bea Cukai", url: "https://ceisa.beacukai.go.id" },
    ],
    pemicu: { questionId: "p1_4", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "tentukan-hs-code",
    judul: "Pastikan HS Code produk Anda ke Klinik Ekspor",
    pillarId: 3,
    prioritas: 2,
    effort: 1,
    estimasi: "1 – 2 jam konsultasi",
    ringkas:
      "HS Code menentukan tarif, izin, dan dokumen. Satu kode salah membuat seluruh perhitungan Anda meleset.",
    mengapa:
      "HS Code adalah titik awal semua keputusan ekspor: apakah produk Anda kena Lartas, dokumen apa yang diminta negara tujuan, dan apakah pembeli Anda bisa memakai tarif preferensi. Konsultasi ke Klinik Ekspor Bea Cukai tidak dipungut biaya.",
    langkah: [
      "Siapkan deskripsi produk selengkap mungkin: bahan, proses, ukuran, kemasan, dan fotonya.",
      "Cek kandidat kode pada Buku Tarif Kepabeanan Indonesia (BTKI).",
      "Bawa hasilnya ke Klinik Ekspor Bea Cukai Surakarta untuk dikonfirmasi petugas.",
      "Catat kode final dan simpan sebagai acuan di semua dokumen ekspor Anda.",
    ],
    referensi: [
      { label: "Klinik Ekspor Bea Cukai", url: "https://www.beacukai.go.id/klinik-ekspor" },
    ],
    pemicu: { questionId: "p3_1", opsiId: ["b", "c", "d"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "cek-lartas",
    judul: "Cek status Larangan dan Pembatasan (Lartas) produk",
    pillarId: 3,
    prioritas: 4,
    effort: 1,
    estimasi: "1 hari",
    ringkas:
      "Pastikan produk Anda tidak butuh izin tambahan sebelum menerima pesanan dari buyer.",
    mengapa:
      "Menerima pesanan lalu baru mengetahui produk Anda termasuk Lartas adalah kesalahan yang mahal: barang tertahan, buyer kecewa, dan reputasi rusak sejak transaksi pertama.",
    langkah: [
      "Gunakan HS Code final untuk mencari status Lartas produk Anda.",
      "Bila termasuk Lartas, identifikasi kementerian atau lembaga penerbit izinnya.",
      "Susun daftar dokumen izin yang dibutuhkan beserta estimasi waktu pengurusannya.",
      "Konfirmasikan hasilnya ke petugas Bea Cukai sebelum menandatangani kontrak dengan buyer.",
    ],
    referensi: [
      { label: "INSW — cek Lartas berdasarkan HS Code", url: "https://insw.go.id" },
    ],
    pemicu: { questionId: "p3_2", opsiId: ["c", "d", "e"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "pelajari-peb",
    judul: "Pelajari alur PEB sampai terbitnya NPE",
    pillarId: 4,
    prioritas: 5,
    effort: 2,
    estimasi: "1 minggu belajar",
    ringkas:
      "Pahami rangkaian dokumen dari pengajuan PEB hingga barang boleh dimuat ke kapal.",
    mengapa:
      "Meski nantinya memakai jasa PPJK, tanggung jawab atas kebenaran data tetap ada pada Anda sebagai eksportir. Memahami alurnya membuat Anda bisa memeriksa pekerjaan pihak ketiga.",
    langkah: [
      "Pelajari isi dokumen PEB: data eksportir, penerima, HS Code, nilai, dan moda angkut.",
      "Siapkan dokumen pendukung: invoice, packing list, dan dokumen izin bila ada.",
      "Ajukan PEB melalui CEISA paling lambat sesuai batas waktu sebelum barang dimuat.",
      "Setelah PEB diterima, terbit NPE sebagai izin barang masuk kawasan pabean.",
      "Simpan seluruh dokumen sebagai arsip untuk pelaporan dan asesmen berikutnya.",
    ],
    referensi: [
      { label: "Panduan ekspor Bea Cukai", url: "https://www.beacukai.go.id" },
      { label: "Portal CEISA", url: "https://ceisa.beacukai.go.id" },
    ],
    pemicu: { questionId: "p4_1", opsiId: ["b", "c", "d"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "fasilitas-kite",
    judul: "Jajaki fasilitas KITE IKM untuk menekan biaya bahan baku",
    pillarId: 4,
    prioritas: 9,
    effort: 3,
    estimasi: "2 – 4 minggu",
    ringkas:
      "Pembebasan bea masuk dan PPN atas bahan baku impor yang diolah lalu diekspor kembali.",
    mengapa:
      "Bagi UMKM yang bahan bakunya sebagian diimpor, fasilitas ini langsung menurunkan harga pokok produksi dan membuat penawaran Anda kompetitif di pasar global.",
    langkah: [
      "Petakan bahan baku impor yang Anda gunakan beserta porsinya terhadap produk jadi.",
      "Pelajari syarat KITE IKM, termasuk kewajiban pencatatan dan pelaporan.",
      "Konsultasikan kelayakan usaha Anda ke Kantor Bea dan Cukai Surakarta.",
      "Siapkan sistem pencatatan bahan baku sebelum mengajukan permohonan.",
    ],
    referensi: [
      { label: "Fasilitas kepabeanan Bea Cukai", url: "https://www.beacukai.go.id" },
    ],
    pemicu: { questionId: "p4_4", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "sertifikasi-produk",
    judul: "Lengkapi sertifikasi halal dan izin edar produk",
    pillarId: 2,
    prioritas: 6,
    effort: 3,
    estimasi: "1 – 3 bulan",
    ringkas:
      "Sertifikat halal dan izin edar adalah tiket masuk pasar konsumsi di banyak negara tujuan.",
    mengapa:
      "Negara tujuan umumnya meminta bukti bahwa produk Anda legal beredar di negara asal. Untuk pasar Malaysia, Timur Tengah, dan konsumen muslim global, sertifikat halal sering menjadi syarat mutlak, bukan nilai tambah.",
    langkah: [
      "Tentukan jenis izin yang sesuai: PIRT untuk skala rumah tangga, BPOM untuk produk olahan yang lebih luas.",
      "Perbaiki tempat produksi agar memenuhi standar higienitas yang dipersyaratkan.",
      "Ajukan sertifikasi halal melalui BPJPH dengan lembaga pemeriksa halal terdaftar.",
      "Siapkan Health Certificate bila negara tujuan memintanya.",
    ],
    referensi: [
      { label: "BPJPH — sertifikasi halal", url: "https://bpjph.halal.go.id" },
      { label: "BPOM — izin edar", url: "https://www.pom.go.id" },
    ],
    pemicu: { questionId: "p2_4", opsiId: ["z"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "svlk",
    judul: "Urus sertifikasi SVLK untuk bahan kayu dan rotan",
    pillarId: 2,
    prioritas: 6,
    effort: 3,
    estimasi: "1 – 2 bulan",
    ringkas:
      "Tanpa SVLK, produk kayu dan rotan Anda tidak bisa masuk pasar Uni Eropa dan beberapa negara lain.",
    mengapa:
      "SVLK membuktikan bahan baku Anda berasal dari sumber yang legal. Ini bukan formalitas — banyak pembeli besar menjadikannya syarat awal sebelum membahas harga.",
    langkah: [
      "Kumpulkan bukti asal-usul bahan baku dari seluruh pemasok Anda.",
      "Bila pemasok sudah bersertifikat, minta salinan sertifikat dan dokumen angkutan yang sah.",
      "Ajukan sertifikasi melalui lembaga verifikasi legalitas kayu terakreditasi.",
      "Simpan dokumen rantai pasok secara rapi untuk keperluan audit berkala.",
    ],
    referensi: [
      { label: "Sistem informasi SVLK", url: "https://silk.menlhk.go.id" },
    ],
    pemicu: { questionId: "p2_6", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "kemasan-ekspor",
    judul: "Siapkan kemasan dan label standar ekspor",
    pillarId: 2,
    prioritas: 8,
    effort: 2,
    estimasi: "2 – 4 minggu",
    ringkas:
      "Kemasan pasar lokal jarang bertahan menghadapi perjalanan laut berminggu-minggu.",
    mengapa:
      "Kerusakan barang dalam perjalanan adalah keluhan paling umum pada pengiriman perdana. Label berbahasa Inggris dan informasi negara asal juga merupakan syarat bea cukai negara tujuan.",
    langkah: [
      "Tambahkan informasi wajib: nama produk, komposisi, berat bersih, negara asal, dan produsen dalam bahasa Inggris.",
      "Pilih material kemasan luar yang tahan lembap dan tumpukan.",
      "Uji kemasan dengan simulasi pengiriman jarak jauh sebelum produksi massal.",
      "Sesuaikan aturan label khusus negara tujuan, misalnya pencantuman alergen.",
    ],
    referensi: [],
    pemicu: { questionId: "p2_3", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "riset-pasar",
    judul: "Tentukan satu negara tujuan dan riset regulasinya",
    pillarId: 5,
    prioritas: 7,
    effort: 2,
    estimasi: "2 – 3 minggu",
    ringkas:
      "Fokus ke satu pasar lebih murah dan lebih cepat berbuah dibanding menyebar ke banyak negara.",
    mengapa:
      "Setiap negara punya aturan label, sertifikat, dan selera pasar yang berbeda. Menyiapkan satu pasar sampai tuntas jauh lebih realistis untuk UMKM daripada menyiapkan lima pasar setengah jalan.",
    langkah: [
      "Bandingkan 2 – 3 kandidat negara dari sisi permintaan produk dan hambatan masuknya.",
      "Cek tarif bea masuk dan ketersediaan tarif preferensi lewat perjanjian dagang.",
      "Pelajari persyaratan label dan sertifikat negara tersebut.",
      "Pilih satu negara sebagai target utama dan susun rencana penetrasinya.",
    ],
    referensi: [
      { label: "Kementerian Perdagangan — informasi pasar ekspor", url: "https://www.kemendag.go.id" },
    ],
    pemicu: { questionId: "p5_2", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "cari-buyer",
    judul: "Bangun jalur pencarian buyer yang terstruktur",
    pillarId: 5,
    prioritas: 10,
    effort: 2,
    estimasi: "berkelanjutan",
    ringkas:
      "Manfaatkan marketplace B2B, pameran, dan jaringan pemerintah secara bersamaan.",
    mengapa:
      "Buyer luar negeri jarang datang sendiri. Kombinasi kehadiran online yang kredibel dan jaringan resmi memberi peluang jauh lebih besar dibanding menunggu.",
    langkah: [
      "Susun company profile dan katalog berbahasa Inggris dengan harga FOB.",
      "Buat akun di satu marketplace B2B dan lengkapi profil usaha secara serius.",
      "Daftar ke program pendampingan ekspor pemerintah daerah dan asosiasi sektor Anda.",
      "Ikuti minimal satu pameran dagang dalam setahun, termasuk yang berformat daring.",
    ],
    referensi: [],
    pemicu: { questionId: "p5_1", opsiId: ["c", "d"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "pahami-incoterms",
    judul: "Kuasai Incoterms dan tentukan syarat penyerahan barang",
    pillarId: 6,
    prioritas: 11,
    effort: 1,
    estimasi: "3 – 5 hari belajar",
    ringkas:
      "Incoterms menentukan sampai titik mana biaya dan risiko menjadi tanggungan Anda.",
    mengapa:
      "Banyak eksportir pemula menyetujui syarat CIF tanpa menghitung ongkos angkut dan asuransi, lalu margin mereka habis. Memilih Incoterms yang tepat adalah keputusan harga, bukan sekadar istilah dokumen.",
    langkah: [
      "Pelajari tiga syarat paling umum: EXW, FOB, dan CIF beserta pembagian tanggung jawabnya.",
      "Hitung struktur biaya Anda untuk masing-masing syarat.",
      "Tentukan syarat default untuk penawaran ke buyer, umumnya FOB untuk eksportir pemula.",
      "Cantumkan Incoterms secara eksplisit di setiap penawaran dan invoice.",
    ],
    referensi: [],
    pemicu: { questionId: "p6_1", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "forwarder",
    judul: "Pilih mitra freight forwarder atau PPJK",
    pillarId: 6,
    prioritas: 12,
    effort: 1,
    estimasi: "1 – 2 minggu",
    ringkas:
      "Bandingkan minimal tiga penyedia jasa sebelum pengiriman pertama.",
    mengapa:
      "Selisih tarif dan kualitas layanan antar forwarder bisa sangat besar, terutama untuk volume kecil. Mitra yang tepat juga membantu Anda menghindari kesalahan dokumen pada pengiriman perdana.",
    langkah: [
      "Minta penawaran dari minimal tiga forwarder untuk rute dan volume Anda.",
      "Pastikan penyedia jasa kepabeanan yang dipilih terdaftar resmi sebagai PPJK.",
      "Perjelas pembagian tugas: siapa mengurus PEB, siapa mengurus booking kapal.",
      "Mulai dengan satu pengiriman kecil sebagai uji coba kerja sama.",
    ],
    referensi: [],
    pemicu: { questionId: "p6_3", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "rekening-valas",
    judul: "Buka rekening valas atas nama usaha",
    pillarId: 7,
    prioritas: 13,
    effort: 1,
    estimasi: "1 – 3 hari",
    ringkas:
      "Menerima pembayaran ekspor di rekening usaha, bukan rekening pribadi.",
    mengapa:
      "Pembayaran ekspor yang masuk ke rekening pribadi menyulitkan pencatatan, pelaporan DHE, dan pengajuan pembiayaan ke bank di kemudian hari.",
    langkah: [
      "Siapkan NIB, NPWP, dan dokumen badan usaha.",
      "Bandingkan biaya administrasi dan kurs beberapa bank.",
      "Buka rekening valas dalam mata uang yang paling sering dipakai buyer Anda.",
      "Pisahkan arus kas usaha dari keuangan pribadi sejak awal.",
    ],
    referensi: [],
    pemicu: { questionId: "p7_1", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "pahami-dhe",
    judul: "Pahami kewajiban Devisa Hasil Ekspor (DHE)",
    pillarId: 7,
    prioritas: 14,
    effort: 1,
    estimasi: "2 – 3 hari",
    ringkas:
      "Hasil ekspor wajib dimasukkan ke sistem keuangan dalam negeri sesuai ketentuan yang berlaku.",
    mengapa:
      "Ketentuan DHE mengatur porsi dan jangka waktu penempatan devisa hasil ekspor. Ketidaktahuan tidak membebaskan eksportir dari kewajiban dan sanksinya.",
    langkah: [
      "Pelajari ketentuan DHE yang berlaku beserta ambang nilai ekspornya.",
      "Diskusikan mekanisme penempatan dengan bank tempat rekening valas Anda.",
      "Siapkan pencatatan transaksi ekspor agar pelaporan mudah dilakukan.",
    ],
    referensi: [
      { label: "Bank Indonesia", url: "https://www.bi.go.id" },
    ],
    pemicu: { questionId: "p7_3", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "sop-mutu",
    judul: "Susun SOP produksi dan kontrol mutu tertulis",
    pillarId: 8,
    prioritas: 15,
    effort: 2,
    estimasi: "2 – 4 minggu",
    ringkas:
      "Jaminan mutu yang konsisten saat pesanan naik berkali lipat.",
    mengapa:
      "Pesanan ekspor datang dalam jumlah besar dan berulang. Tanpa SOP tertulis, mutu produk cenderung turun saat produksi dipercepat — penyebab paling umum putusnya hubungan dengan buyer.",
    langkah: [
      "Tuliskan alur produksi dari bahan baku sampai pengemasan.",
      "Tetapkan titik pemeriksaan mutu dan kriteria terima atau tolak.",
      "Buat formulir pencatatan sederhana untuk setiap batch produksi.",
      "Latih seluruh tim dan tinjau SOP setiap beberapa bulan.",
    ],
    referensi: [],
    pemicu: { questionId: "p8_3", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
  {
    id: "pelatihan-klinik",
    judul: "Ikuti pendampingan Klinik Ekspor Bea Cukai Surakarta",
    pillarId: 8,
    prioritas: 16,
    effort: 1,
    estimasi: "1 hari",
    ringkas:
      "Konsultasi gratis dengan petugas untuk memvalidasi seluruh rencana ekspor Anda.",
    mengapa:
      "Klinik Ekspor memberi akses langsung ke petugas yang memahami aturan terbaru. Satu sesi konsultasi bisa menghemat berminggu-minggu percobaan sendiri.",
    langkah: [
      "Siapkan pertanyaan spesifik: HS Code, status Lartas, dan dokumen yang perlu disiapkan.",
      "Bawa contoh produk dan draf dokumen bila sudah ada.",
      "Jadwalkan kunjungan ke Kantor Bea dan Cukai Surakarta.",
      "Catat arahan petugas dan perbarui rencana ekspor Anda.",
    ],
    referensi: [
      { label: "Klinik Ekspor Bea Cukai", url: "https://www.beacukai.go.id/klinik-ekspor" },
    ],
    pemicu: { questionId: "p8_4", opsiId: ["b", "c"] },
    reviewDefault: REVIEW_PENDING,
  },
];

/* ------------------------------------------------------------------ *
 * Mesin rekomendasi
 * ------------------------------------------------------------------ */

function terpicu(
  item: KatalogItem,
  answers: AnswerMap,
  pertanyaanBerlaku: Set<string>,
): boolean {
  if (!item.pemicu) return false;
  // Pertanyaan bercabang yang tidak ditanyakan ke kategori ini tidak boleh
  // memunculkan rekomendasi — mis. SVLK untuk usaha kopi.
  if (!pertanyaanBerlaku.has(item.pemicu.questionId)) return false;

  const jawaban = answers[item.pemicu.questionId];
  if (jawaban === undefined) return true; // belum dijawab = anggap gap
  const ids = Array.isArray(jawaban) ? jawaban : [jawaban];
  return ids.some((id) => item.pemicu!.opsiId.includes(id));
}

/**
 * Menyusun rekomendasi dari jawaban asesmen.
 * Diurutkan berdasarkan prioritas katalog, lalu skor pilar terendah.
 */
export function buatRekomendasi(
  answers: AnswerMap,
  hasil: AssessmentResult | null,
  profile: BusinessProfile | null = null,
): Recommendation[] {
  const skorPilar = new Map(
    (hasil?.pilar ?? []).map((p) => [p.pillarId, p.skor]),
  );
  const pertanyaanBerlaku = new Set(
    questionsForProfile(profile).map((q) => q.id),
  );

  return RECOMMENDATION_CATALOG.filter((item) =>
    terpicu(item, answers, pertanyaanBerlaku),
  )
    .sort((a, b) => {
      const sa = skorPilar.get(a.pillarId) ?? 0;
      const sb = skorPilar.get(b.pillarId) ?? 0;
      if (a.prioritas !== b.prioritas) return a.prioritas - b.prioritas;
      return sa - sb;
    })
    .map(({ reviewDefault, ...item }) => ({
      ...item,
      review: { ...reviewDefault },
      selesai: false,
    }));
}

export const EFFORT_LABEL: Record<1 | 2 | 3, string> = {
  1: "Ringan",
  2: "Sedang",
  3: "Berat",
};
