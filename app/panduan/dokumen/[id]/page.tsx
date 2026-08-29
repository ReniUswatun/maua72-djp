import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUIDE_DATA: Record<string, { title: string; desc: string; steps: string[] }> = {
  "doc-nib": {
    title: "Panduan Pembuatan NIB",
    desc: "Nomor Induk Berusaha (NIB) adalah identitas pelaku usaha yang wajib dimiliki sebelum melakukan ekspor.",
    steps: [
      "Siapkan KTP dan NPWP Pribadi/Badan.",
      "Kunjungi website OSS (Online Single Submission) di oss.go.id.",
      "Pilih 'Daftar' dan ikuti panduan pembuatan akun.",
      "Masuk ke akun OSS Anda dan pilih menu 'Perizinan Berusaha'.",
      "Isi data profil perusahaan dan detail usaha (pastikan KBLI sesuai).",
      "Selesaikan proses pengajuan dan unduh NIB Anda.",
    ],
  },
  "doc-npwp": {
    title: "Panduan Pembuatan NPWP Badan",
    desc: "NPWP (Nomor Pokok Wajib Pajak) Badan digunakan untuk keperluan administrasi perpajakan usaha Anda.",
    steps: [
      "Siapkan fotokopi Akta Pendirian, NIB, dan KTP direktur.",
      "Akses ereg.pajak.go.id atau kunjungi KPP (Kantor Pelayanan Pajak) terdekat.",
      "Isi formulir pendaftaran Wajib Pajak Badan.",
      "Unggah atau serahkan dokumen yang dipersyaratkan.",
      "Tunggu verifikasi dari pihak KPP.",
      "Cetak kartu NPWP Anda.",
    ],
  },
  "doc-izin": {
    title: "Panduan Pembuatan Izin Edar (PIRT / BPOM)",
    desc: "Izin edar memastikan produk Anda aman dikonsumsi dan memenuhi standar yang ditetapkan.",
    steps: [
      "Pastikan Anda memiliki NIB dan NPWP.",
      "Untuk PIRT: Kunjungi Dinas Kesehatan setempat atau daftar melalui SPP-IRT (sppirt.pom.go.id).",
      "Untuk BPOM: Daftarkan akun di e-reg.pom.go.id.",
      "Unggah dokumen persyaratan (hasil uji lab, rancangan label, dll).",
      "Tunggu proses evaluasi dan audit fasilitas.",
      "Nomor izin edar akan diterbitkan setelah semua syarat terpenuhi.",
    ],
  },
  "doc-halal": {
    title: "Panduan Pembuatan Sertifikat Halal",
    desc: "Sertifikat Halal diterbitkan oleh BPJPH untuk menjamin kehalalan produk Anda.",
    steps: [
      "Akses ptsp.halal.go.id (SIHALAL) dan buat akun.",
      "Pilih jalur pendaftaran (Self-Declare atau Reguler).",
      "Isi data produk, bahan baku, dan proses pengolahan.",
      "Tunggu proses audit oleh LPH (Lembaga Pemeriksa Halal).",
      "Fatwa Halal akan diterbitkan oleh MUI.",
      "Unduh Sertifikat Halal dari akun SIHALAL.",
    ],
  },
  "doc-invoice": {
    title: "Panduan Pembuatan Commercial Invoice",
    desc: "Commercial Invoice adalah faktur komersial yang digunakan dalam perdagangan internasional.",
    steps: [
      "Cantumkan identitas eksportir (Anda) dan importir (buyer).",
      "Tuliskan nomor invoice dan tanggal penerbitan.",
      "Deskripsikan produk secara detail (nama barang, HS Code, jumlah, harga satuan).",
      "Tentukan Incoterms yang disepakati (misal: FOB, CIF).",
      "Cantumkan informasi pembayaran (nomor rekening bank valas).",
      "Tandatangani dan stempel invoice tersebut.",
    ],
  },
  "doc-packing": {
    title: "Panduan Pembuatan Packing List",
    desc: "Packing List merincikan isi dari setiap kemasan pengiriman untuk keperluan logistik dan bea cukai.",
    steps: [
      "Gunakan format dasar (sama dengan Commercial Invoice).",
      "Cantumkan nomor packing list (biasanya sama dengan nomor invoice).",
      "Tuliskan rincian jumlah kemasan (karton, palet, dll).",
      "Sertakan berat bersih (Net Weight) dan berat kotor (Gross Weight).",
      "Tuliskan dimensi kemasan (Panjang x Lebar x Tinggi).",
      "Tandatangani dan stempel packing list tersebut.",
    ],
  },
  "doc-ska": {
    title: "Panduan Pembuatan SKA (Certificate of Origin)",
    desc: "SKA membuktikan asal barang untuk mendapatkan preferensi tarif di negara tujuan.",
    steps: [
      "Pastikan NIB Anda sudah terdaftar untuk akses SKA.",
      "Akses e-ska.kemendag.go.id dan login dengan akun perusahaan.",
      "Pilih jenis formulir SKA sesuai negara tujuan.",
      "Isi data PEB, Invoice, dan rincian produk.",
      "Unggah dokumen pendukung (Invoice, Packing List, B/L).",
      "Cetak SKA setelah disetujui oleh Instansi Penerbit SKA (IPSKA).",
    ],
  },
  "doc-peb": {
    title: "Panduan Pembuatan PEB (Pemberitahuan Ekspor Barang)",
    desc: "PEB adalah dokumen pabean yang wajib diajukan ke Bea Cukai sebelum barang diekspor.",
    steps: [
      "Pastikan Anda memiliki NIK Kepabeanan (melalui OSS).",
      "Akses portal CEISA Bea Cukai (ceisa.customs.go.id) atau gunakan jasa PPJK.",
      "Isi data eksportir, importir, dan data pengangkutan.",
      "Masukkan detail barang, nilai barang, dan HS Code.",
      "Submit dokumen PEB dan tunggu respons dari sistem CEISA.",
      "Jika disetujui, Anda akan mendapatkan NPE (Nota Pelayanan Ekspor).",
    ],
  },
};

function renderStepText(text: string) {
  const urlRegex = /(oss\.go\.id|ereg\.pajak\.go\.id|sppirt\.pom\.go\.id|e-reg\.pom\.go\.id|ptsp\.halal\.go\.id|e-ska\.kemendag\.go\.id|ceisa\.customs\.go\.id)/gi;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={`https://${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-600 underline hover:text-primary-700"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function DocumentGuidePage({ params }: { params: { id: string } }) {
  const guide = GUIDE_DATA[params.id];

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/dokumen"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dokumen
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {guide.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {guide.desc}
          </p>

          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900">Langkah-langkah (Flowchart)</h2>
            <div className="mt-6 space-y-8">
              {guide.steps.map((step, index) => (
                <div key={index} className="relative">
                  {index !== guide.steps.length - 1 && (
                    <div
                      className="absolute left-[1.125rem] top-10 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-4">
                    <div>
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 ring-8 ring-white">
                        <span className="text-sm font-bold text-primary-700">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-1.5">
                      <p className="text-base text-gray-800">{renderStepText(step)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 flex justify-end">
            <Link href="/dashboard/dokumen">
              <Button size="lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Saya Mengerti
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
