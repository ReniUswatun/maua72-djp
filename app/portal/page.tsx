import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  UserCog,
} from "lucide-react";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KANTOR } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Tentang Platform",
  description:
    "SiapEkspor: pendampingan penyusunan dokumen ekspor UMKM dengan peninjauan petugas Bea dan Cukai. Kenali tiga peran dalam sistem dan cara masuk.",
};

const LANGKAH = [
  {
    icon: ClipboardCheck,
    judul: "UMKM melengkapi profil & pengajuan",
    teks: "Data usaha, NIB/NPWP, lalu rencana ekspor (produk, tujuan, pembeli, HS Code) diisi dalam bahasa awam.",
  },
  {
    icon: FileCheck2,
    judul: "UMKM menyusun & mengunggah dokumen",
    teks: "Mengikuti checklist dan panduan tiap dokumen — Invoice, Packing List, SKA, sampai PEB.",
  },
  {
    icon: ShieldCheck,
    judul: "Petugas meninjau",
    teks: "Admin memeriksa data usaha dan tiap dokumen (dibantu pembacaan otomatis), lalu memutuskan: setujui, tolak, atau minta perbaikan.",
  },
  {
    icon: Sparkles,
    judul: "UMKM menerima hasil",
    teks: "Keputusan dan catatan petugas dikirim ke UMKM, termasuk daftar dokumen yang perlu diperbaiki.",
  },
];

const PERAN = [
  {
    id: "umkm",
    icon: Building2,
    nama: "UMKM",
    ringkas: "Pemilik usaha yang ingin menembus pasar ekspor.",
    bisa: [
      "Lengkapi profil usaha & unggah NIB/NPWP",
      "Buat pengajuan ekspor dengan checklist dokumen",
      "Ikuti panduan cara membuat tiap dokumen",
      "Terima catatan petugas & ajukan konsultasi",
    ],
    primary: { label: "Daftar gratis", href: "/daftar" },
    secondary: { label: "Sudah punya akun — masuk", href: "/masuk?peran=umkm" },
    tone: "primary" as const,
  },
  {
    id: "admin",
    icon: ShieldCheck,
    nama: "Admin",
    ringkas: "Pengelola pengajuan ekspor dan pendampingan UMKM.",
    bisa: [
      "Monitoring semua pengajuan ekspor UMKM masuk",
      "Setujui data usaha (NIB, NPWP, profil)",
      "Buka dokumen PDF & baca catatan OCR per dokumen",
      "Balas pertanyaan UMKM & susun draf pesan WhatsApp",
    ],
    primary: { label: "Masuk sebagai Admin", href: "/masuk" },
    secondary: null,
    tone: "neutral" as const,
  },
  {
    id: "super_admin",
    icon: UserCog,
    nama: "Super Admin",
    ringkas: "Mengelola akun admin dan memantau kinerjanya.",
    bisa: [
      "CRUD akun admin & super admin, reset akses",
      "Atur hak akses per peran (RBAC)",
      "Pantau log aktivitas admin",
      "Lihat rekap kerja tiap admin (baca saja)",
    ],
    primary: { label: "Masuk sebagai Super Admin", href: "/masuk" },
    secondary: null,
    tone: "accent" as const,
  },
];

export default function PortalPage() {
  return (
    <>
      <Navbar />
      <main id="konten-utama" className="bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="container-page py-16 sm:py-20">
            <Badge tone="primary" className="w-fit">
              Kantor Bea dan Cukai Surakarta
            </Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Pendampingan dokumen ekspor UMKM, dengan petugas tetap di dalam keputusan
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              SiapEkspor menuntun UMKM menyusun setiap dokumen ekspor — dari NIB sampai PEB —
              dalam bahasa awam, lengkap dengan panduan tiap dokumen. Setiap berkas ditinjau
              petugas Bea dan Cukai sebelum pengajuan disetujui; keputusan tetap pada petugas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/daftar">
                <Button size="lg">
                  Mulai sebagai UMKM
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="/masuk">
                <Button size="lg" variant="outline">
                  Masuk
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container-page py-16">
          <p className="eyebrow">Cara kerja</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Empat langkah, satu alur
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {LANGKAH.map((item, i) => (
              <div
                key={item.judul}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Langkah {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{item.judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.teks}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-16">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-8">
            <h2 className="text-xl font-bold tracking-tight text-primary-900">
              Kenapa selalu ada petugas di dalam keputusan?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-900/80">
              Dokumen ekspor yang salah bisa membuat sebuah usaha membuang waktu dan biaya.
              Karena itu pembacaan otomatis di sini hanya berupa catatan bantu untuk petugas —
              tidak ada pengajuan yang bisa disetujui otomatis tanpa petugas memeriksanya
              sendiri. Prototipe ini dikembangkan bersama {KANTOR.nama}.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
