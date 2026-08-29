import type { GlossaryEntry } from "./types";

/**
 * Glosarium istilah kepabeanan (blueprint §13).
 * Dipakai oleh <HelpTooltip> dan halaman /panduan.
 * Kunci di-lowercase agar pencocokan tidak case-sensitive.
 */
export const GLOSSARY: Record<string, GlossaryEntry> = {
  nib: {
    istilah: "NIB",
    kepanjangan: "Nomor Induk Berusaha",
    penjelasan:
      "Identitas resmi pelaku usaha yang diterbitkan lewat sistem OSS. NIB sekaligus berlaku sebagai Angka Pengenal Impor dan hak akses kepabeanan, jadi ini syarat paling dasar untuk ekspor.",
  },
  npwp: {
    istilah: "NPWP",
    kepanjangan: "Nomor Pokok Wajib Pajak",
    penjelasan:
      "Nomor identitas perpajakan. Untuk ekspor, NPWP dipakai saat pendaftaran kepabeanan dan pelaporan devisa hasil ekspor.",
  },
  "nik kepabeanan": {
    istilah: "NIK Kepabeanan",
    kepanjangan: "Nomor Identitas Kepabeanan",
    penjelasan:
      "Nomor akses agar usaha Anda bisa bertransaksi di sistem Bea Cukai (CEISA), termasuk mengajukan dokumen ekspor. Sekarang melekat pada NIB melalui aktivasi akses kepabeanan.",
  },
  "hs code": {
    istilah: "HS Code",
    kepanjangan: "Harmonized System Code",
    penjelasan:
      "Kode klasifikasi barang internasional. Kode ini menentukan tarif bea, aturan larangan/pembatasan, dan dokumen apa yang diminta negara tujuan. Salah HS Code = salah semua perhitungan.",
  },
  peb: {
    istilah: "PEB",
    kepanjangan: "Pemberitahuan Ekspor Barang",
    penjelasan:
      "Dokumen pemberitahuan yang wajib diajukan ke Bea Cukai sebelum barang dikirim ke luar negeri. Diajukan lewat CEISA, bisa mandiri atau melalui PPJK.",
  },
  npe: {
    istilah: "NPE",
    kepanjangan: "Nota Pelayanan Ekspor",
    penjelasan:
      "Dokumen persetujuan dari Bea Cukai setelah PEB Anda diterima. NPE adalah tiket agar barang boleh masuk ke area pelabuhan/bandara untuk dimuat.",
  },
  lartas: {
    istilah: "Lartas",
    kepanjangan: "Larangan dan Pembatasan",
    penjelasan:
      "Daftar barang yang ekspornya dilarang atau dibatasi dan butuh izin dari kementerian/lembaga terkait. Cek status Lartas produk Anda berdasarkan HS Code sebelum menerima pesanan.",
  },
  ceisa: {
    istilah: "CEISA",
    kepanjangan: "Customs Excise Information System and Automation",
    penjelasan:
      "Portal layanan online Bea Cukai. Di sinilah PEB diajukan dan status dokumen ekspor dipantau.",
  },
  "kite ikm": {
    istilah: "KITE IKM",
    kepanjangan: "Kemudahan Impor Tujuan Ekspor untuk Industri Kecil Menengah",
    penjelasan:
      "Fasilitas pembebasan bea masuk dan PPN atas bahan baku impor yang diolah lalu diekspor kembali. Dirancang khusus supaya UMKM bisa bersaing dari sisi harga.",
  },
  ppjk: {
    istilah: "PPJK",
    kepanjangan: "Pengusaha Pengurusan Jasa Kepabeanan",
    penjelasan:
      "Pihak ketiga berizin yang mengurus dokumen kepabeanan atas nama Anda. Praktis untuk eksportir pemula, tapi tetap Anda yang bertanggung jawab atas kebenaran data.",
  },
  incoterms: {
    istilah: "Incoterms",
    kepanjangan: "International Commercial Terms",
    penjelasan:
      "Aturan baku yang menentukan sampai titik mana biaya dan risiko pengiriman ditanggung penjual. Contoh: EXW, FOB, CIF. Salah pilih Incoterms bisa membuat margin Anda habis di ongkos.",
  },
  fob: {
    istilah: "FOB",
    kepanjangan: "Free On Board",
    penjelasan:
      "Penjual menanggung biaya sampai barang naik ke kapal di pelabuhan asal. Setelah itu biaya dan risiko pindah ke pembeli. Paling umum dipakai eksportir Indonesia.",
  },
  cif: {
    istilah: "CIF",
    kepanjangan: "Cost, Insurance and Freight",
    penjelasan:
      "Penjual menanggung biaya barang, asuransi, dan ongkos angkut sampai pelabuhan tujuan. Harga jual lebih tinggi, tapi Anda harus paham struktur biayanya.",
  },
  exw: {
    istilah: "EXW",
    kepanjangan: "Ex Works",
    penjelasan:
      "Pembeli mengambil barang dari gudang Anda dan menanggung seluruh biaya berikutnya. Paling ringan bagi penjual, tapi nilai transaksinya paling kecil.",
  },
  "l/c": {
    istilah: "L/C",
    kepanjangan: "Letter of Credit",
    penjelasan:
      "Jaminan pembayaran yang diterbitkan bank pembeli. Aman untuk transaksi besar dengan buyer baru, tetapi prosesnya lebih rumit dan berbiaya.",
  },
  "t/t": {
    istilah: "T/T",
    kepanjangan: "Telegraphic Transfer",
    penjelasan:
      "Transfer bank langsung dari pembeli. Sederhana dan murah, biasanya dengan skema uang muka lalu pelunasan sebelum barang dikirim.",
  },
  dhe: {
    istilah: "DHE",
    kepanjangan: "Devisa Hasil Ekspor",
    penjelasan:
      "Kewajiban memasukkan hasil ekspor ke sistem keuangan dalam negeri sesuai aturan Bank Indonesia. Ada ketentuan porsi dan jangka waktu penempatan yang perlu dipenuhi eksportir.",
  },
  "b/l": {
    istilah: "B/L",
    kepanjangan: "Bill of Lading",
    penjelasan:
      "Dokumen dari perusahaan pelayaran yang berfungsi sebagai bukti muat sekaligus bukti kepemilikan barang. Versi untuk pengiriman udara disebut AWB.",
  },
  awb: {
    istilah: "AWB",
    kepanjangan: "Airway Bill",
    penjelasan:
      "Dokumen pengangkutan untuk kargo udara. Fungsinya mirip B/L, tapi tidak menjadi bukti kepemilikan barang.",
  },
  ska: {
    istilah: "SKA",
    kepanjangan: "Surat Keterangan Asal / Certificate of Origin",
    penjelasan:
      "Dokumen yang menyatakan barang berasal dari Indonesia. Dengan SKA preferensi (misal Form D untuk ASEAN), pembeli Anda bisa dapat potongan bea masuk — nilai jual tambahan.",
  },
  svlk: {
    istilah: "SVLK",
    kepanjangan: "Sistem Verifikasi Legalitas dan Kelestarian",
    penjelasan:
      "Sertifikasi legalitas kayu. Wajib untuk ekspor produk kayu, rotan, dan furnitur ke banyak negara, terutama Uni Eropa.",
  },
  sni: {
    istilah: "SNI",
    kepanjangan: "Standar Nasional Indonesia",
    penjelasan:
      "Standar mutu resmi Indonesia. Bukan syarat ekspor untuk semua produk, tapi menjadi bukti mutu yang kuat di mata pembeli luar negeri.",
  },
  bpjph: {
    istilah: "BPJPH",
    kepanjangan: "Badan Penyelenggara Jaminan Produk Halal",
    penjelasan:
      "Lembaga yang menerbitkan sertifikat halal Indonesia. Penting untuk pasar Malaysia, Timur Tengah, dan konsumen muslim global.",
  },
  bpom: {
    istilah: "BPOM",
    kepanjangan: "Badan Pengawas Obat dan Makanan",
    penjelasan:
      "Izin edar untuk produk makanan olahan, kosmetik, dan obat tradisional. Banyak negara tujuan meminta izin edar dalam negeri sebagai prasyarat.",
  },
  oss: {
    istilah: "OSS",
    kepanjangan: "Online Single Submission",
    penjelasan:
      "Sistem perizinan berusaha terintegrasi milik pemerintah. Di sinilah NIB dan izin usaha diurus, gratis dan online.",
  },
  "packing list": {
    istilah: "Packing List",
    penjelasan:
      "Rincian isi setiap kemasan: jumlah, berat, dan dimensi. Dipakai petugas dan forwarder untuk mencocokkan fisik barang dengan dokumen.",
  },
  "freight forwarder": {
    istilah: "Freight Forwarder",
    penjelasan:
      "Penyedia jasa yang mengatur pengangkutan barang Anda dari gudang sampai negara tujuan, termasuk booking kapal dan pengurusan dokumen angkut.",
  },
  pirt: {
    istilah: "PIRT",
    kepanjangan: "Pangan Industri Rumah Tangga",
    penjelasan:
      "Izin edar pangan skala rumah tangga dari dinas kesehatan. Untuk ekspor umumnya perlu naik kelas ke izin edar BPOM.",
  },
};

export function lookupGlossary(istilah: string): GlossaryEntry | undefined {
  return GLOSSARY[istilah.toLowerCase()];
}

export const GLOSSARY_LIST = Object.values(GLOSSARY).sort((a, b) =>
  a.istilah.localeCompare(b.istilah, "id"),
);
