import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { FlowChart, type FlowStep } from "@/components/shared/FlowChart";

// Definisi panduan statis per dokumen
const PANDUAN_DOKUMEN: Record<string, {
  judul: string;
  deskripsi: string;
  sumberLuar?: { teks: string; url: string }[];
  flowSteps: FlowStep[];
  langkah: { judul: string; detail: string }[];
}> = {
  "doc-invoice": {
    judul: "Panduan Pembuatan Commercial Invoice",
    deskripsi: "Commercial Invoice (Faktur Komersial) adalah dokumen utama dalam transaksi ekspor yang berisi rincian barang, nilai barang, dan pihak yang terlibat. Dokumen ini menjadi dasar perhitungan pajak dan bea masuk di negara tujuan.",
    sumberLuar: [
      { teks: "Template Invoice Standar (Kemendag)", url: "https://djpen.kemendag.go.id/app_frontend/links/57-template-dokumen-ekspor" },
      { teks: "Penjelasan Lengkap Invoice Ekspor (UKM Indonesia)", url: "https://www.ukmindonesia.id/baca-deskripsi-program/dokumen-ekspor" }
    ],
    flowSteps: [
      { id: "s1", label: "Terima Purchase Order dari Buyer" },
      { id: "s2", label: "Siapkan Kop Surat Perusahaan" },
      { id: "s3", label: "Isi Data Penjual & Pembeli" },
      { id: "s4", label: "Rincikan Barang, Jumlah & Harga" },
      { id: "s5", label: "Cantumkan Incoterms & Term of Payment" },
      { id: "s6", label: "Tandatangani & Cap Perusahaan" },
    ],
    langkah: [
      { judul: "Siapkan Template Resmi", detail: "Gunakan kop surat perusahaan yang mencantumkan nama, alamat, nomor telepon, dan email perusahaan secara jelas." },
      { judul: "Isi Data Penjual dan Pembeli", detail: "Cantumkan data Shipper/Exporter (Anda) dan Consignee/Buyer (Pembeli di luar negeri)." },
      { judul: "Rincian Barang", detail: "Masukkan deskripsi barang, HS Code, jumlah barang, harga satuan, dan total harga (dalam valuta asing yang disepakati, misal USD)." },
      { judul: "Incoterms & Pembayaran", detail: "Sebutkan Incoterms yang dipakai (contoh: FOB Tanjung Priok, CIF Tokyo) dan sistem pembayaran (T/T, L/C, dsb)." },
      { judul: "Pengesahan", detail: "Invoice harus ditandatangani oleh direktur/pimpinan perusahaan dan dicap basah." }
    ]
  },
  "doc-packing": {
    judul: "Panduan Pembuatan Packing List",
    deskripsi: "Packing list adalah dokumen yang memuat rincian fisik barang yang akan diekspor, termasuk jumlah kemasan, jenis kemasan, berat kotor (gross weight), berat bersih (net weight), dan dimensi kemasan.",
    sumberLuar: [
      { teks: "Template Packing List", url: "https://djpen.kemendag.go.id/app_frontend/links/57-template-dokumen-ekspor" }
    ],
    flowSteps: [
      { id: "s1", label: "Barang Selesai Diproduksi & Dikemas" },
      { id: "s2", label: "Timbang & Ukur Tiap Kemasan" },
      { id: "s3", label: "Catat Gross Weight & Net Weight" },
      { id: "s4", label: "Isi Detail Sesuai Invoice" },
      { id: "s5", label: "Tandatangani & Cap Perusahaan" },
    ],
    langkah: [
      { judul: "Sesuaikan dengan Invoice", detail: "Nomor dan tanggal Packing List biasanya sama dengan Commercial Invoice. Data pembeli dan penjual juga harus identik." },
      { judul: "Rincikan Kemasan", detail: "Jelaskan jenis kemasan (carton, pallet, wooden box) dan jumlahnya." },
      { judul: "Berat dan Volume", detail: "Cantumkan berat bersih (Net Weight), berat kotor (Gross Weight), dan volume dimensi tiap kemasan." },
      { judul: "Pengesahan", detail: "Dokumen ditandatangani oleh pimpinan perusahaan dan dicap basah." }
    ]
  },
  "doc-ska": {
    judul: "Panduan Pembuatan Surat Keterangan Asal (SKA / COO)",
    deskripsi: "SKA atau Certificate of Origin (COO) adalah dokumen yang membuktikan bahwa barang ekspor berasal dari Indonesia. Ini sering dibutuhkan untuk mendapatkan tarif bea masuk preferensi (diskon pajak) di negara tujuan.",
    sumberLuar: [
      { teks: "Portal e-SKA Kemendag", url: "https://eska.kemendag.go.id/" },
      { teks: "Panduan Penggunaan e-SKA", url: "https://eska.kemendag.go.id/home/faq" }
    ],
    flowSteps: [
      { id: "s1", label: "Siapkan Invoice, Packing List, PEB" },
      { id: "s2", label: "Login ke Portal e-SKA Kemendag" },
      { id: "s3", label: "Pilih Jenis Form SKA" },
      { id: "s4", label: "Isi Data & Upload Dokumen Pendukung" },
      { id: "s5", label: "Persetujuan Instansi Penerbit" },
      { id: "s6", label: "Cetak SKA Resmi" },
    ],
    langkah: [
      { judul: "Pendaftaran Hak Akses", detail: "Daftar di portal e-SKA Kementerian Perdagangan menggunakan NIPB (Nomor Induk Kepabeanan) / NIB." },
      { judul: "Siapkan Dokumen Pendukung", detail: "Anda memerlukan Commercial Invoice, Packing List, dan PEB yang sudah mendapat NPE (Nota Pelayanan Ekspor) dari Bea Cukai." },
      { judul: "Pilih Form SKA", detail: "Pilih form SKA yang sesuai dengan negara tujuan dan perjanjian dagang (misal: Form D untuk ASEAN, Form E untuk Tiongkok)." },
      { judul: "Pengisian dan Submit", detail: "Isi data barang, HS code, dan kriteria asal barang. Setelah diajukan secara online, tunggu persetujuan Instansi Penerbit SKA (IPSKA)." },
      { judul: "Pencetakan", detail: "Setelah disetujui, SKA bisa dicetak mandiri atau diambil di kantor IPSKA terdekat." }
    ]
  },
  "doc-peb": {
    judul: "Panduan Pengajuan Pemberitahuan Ekspor Barang (PEB)",
    deskripsi: "Pemberitahuan Ekspor Barang (PEB) adalah dokumen pabean yang digunakan untuk memberitahukan pelaksanaan ekspor barang. PEB wajib diajukan ke Bea Cukai untuk setiap pengiriman ekspor.",
    sumberLuar: [
      { teks: "Portal INSW (Indonesia National Single Window)", url: "https://insw.go.id/" },
      { teks: "CEISA 4.0 Bea Cukai", url: "https://portal.beacukai.go.id/" }
    ],
    flowSteps: [
      { id: "s1", label: "Siapkan Invoice, Packing List, NIB" },
      { id: "s2", label: "Akses CEISA 4.0 / Modul PEB" },
      { id: "s3", label: "Input Data Ekspor & Nilai Barang" },
      { id: "s4", label: "Submit ke Sistem Bea Cukai" },
      {
        id: "s5",
        label: "Ada Pemeriksaan Fisik?",
        shape: "diamond",
        branches: [
          { label: "Tidak", targetId: "s7" },
          { label: "Ya", targetId: "s6" },
        ],
      },
      { id: "s6", label: "Pemeriksaan Fisik oleh Petugas" },
      { id: "s7", label: "Terbit NPE (Nota Pelayanan Ekspor)" },
    ],
    langkah: [
      { judul: "Persiapan Akses", detail: "Pastikan Anda memiliki modul PEB, atau menggunakan layanan portal CEISA 4.0. Anda butuh NIB dan nomor rekening untuk bayar Bea Keluar (jika ada)." },
      { judul: "Input Data", detail: "Masukkan detail pengirim, penerima, rincian barang, HS Code, dan nilai FOB berdasarkan Invoice dan Packing List." },
      { judul: "Pengiriman Data (Submit)", detail: "Kirim data PEB secara elektronik ke sistem Bea Cukai. Sistem akan memvalidasi data." },
      { judul: "Tindak Lanjut", detail: "Jika barang tidak kena lartas atau bea keluar dan profil perusahaan baik, Anda akan langsung mendapat NPE. Jika terkena random check, Bea Cukai akan melakukan pemeriksaan fisik terlebih dahulu." },
      { judul: "Nota Pelayanan Ekspor (NPE)", detail: "NPE adalah bukti bahwa barang Anda telah diizinkan untuk dimuat ke kapal/pesawat. Bawa dokumen ini ke pelabuhan." }
    ]
  }
};

export default function PanduanDokumenPage({ params }: { params: { id: string } }) {
  const panduan = PANDUAN_DOKUMEN[params.id];

  if (!panduan) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl py-8">
      <Link
        href="/panduan#dokumen"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Panduan
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <FileText className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {panduan.judul}
          </h1>
        </div>

        <p className="mt-6 text-lg leading-relaxed text-gray-600">
          {panduan.deskripsi}
        </p>

        {panduan.sumberLuar && panduan.sumberLuar.length > 0 && (
          <div className="mt-8 rounded-xl bg-gray-50 p-6 border border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Tautan Eksternal & Referensi Resmi
            </h2>
            <ul className="mt-4 space-y-3">
              {panduan.sumberLuar.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 font-medium text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 text-primary-500 transition-colors group-hover:text-primary-700" />
                    {link.teks}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Gambaran Alur (Flowchart)
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Visualisasi alur pembuatan dokumen dari awal hingga akhir — baca dari kiri ke kanan.
          </p>
          <FlowChart steps={panduan.flowSteps} className="mt-4" />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            Langkah-langkah Detail
          </h2>
          <div className="mt-6 space-y-8">
            {panduan.langkah.map((l, index) => (
              <div key={index} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{l.judul}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{l.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
