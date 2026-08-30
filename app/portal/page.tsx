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
    "SiapEkspor: platform asesmen kesiapan ekspor UMKM dengan validasi petugas Bea dan Cukai. Kenali tiga peran dalam sistem dan cara masuk.",
};

const LANGKAH = [
  {
    icon: ClipboardCheck,
    judul: "UMKM mengisi pengajuan",
    teks: "Data usaha, rencana ekspor, dan unggahan dokumen diisi dalam bahasa awam.",
  },
  {
    icon: Sparkles,
    judul: "OCR membaca dokumen",
    teks: "Setiap dokumen PDF yang diunggah dibandingkan dengan template contoh. Bagian yang tidak sesuai ditandai sebagai catatan.",
  },
  {
    icon: ShieldCheck,
    judul: "Admin meninjau",
    teks: "Admin memeriksa data usaha dan dokumen beserta catatan OCR, lalu mengambil keputusan: setujui, tolak, atau minta info.",
  },
  {
    icon: FileCheck2,
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
      "Isi asesmen kesiapan ekspor 8 pilar",
      "Lihat skor, level kesiapan, dan rekomendasi",
      "Terima rekomendasi yang sudah divalidasi petugas",
      "Pantau dokumen dan riwayat konsultasi",
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
              Platform kesiapan ekspor UMKM, dengan petugas tetap di dalam keputusan
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
              SiapEkspor membantu UMKM mengukur kesiapan ekspornya lewat asesmen 8 pilar,
              lalu menyusun rekomendasi langkah lanjutan dalam bahasa awam. Setiap rekomendasi
              divalidasi petugas Bea dan Cukai sebelum sampai ke pemilik usaha — sistem
              menyusun draf, keputusan tetap pada petugas.
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

        <section className="border-t border-gray-200 bg-white">
          <div className="container-page py-16">
            <p className="eyebrow">Tiga peran dalam sistem</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Satu halaman masuk, akses sesuai peran
            </h2>
            <p className="mt-3 max-w-2xl text-gray-600">
              Semua peran masuk lewat halaman <span className="font-semibold">/masuk</span> yang sama,
              lalu diarahkan ke ruang kerjanya masing-masing.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {PERAN.map((peran) => (
                <div
                  key={peran.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-card"
                >
                  <div
                    className={
                      "flex h-12 w-12 items-center justify-center rounded-2xl " +
                      (peran.tone === "primary"
                        ? "bg-primary-700 text-white"
                        : peran.tone === "accent"
                          ? "bg-accent-500 text-primary-900"
                          : "bg-slate-900 text-white")
                    }
                  >
                    <peran.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight">{peran.nama}</h3>
                  <p className="mt-1 text-sm text-gray-600">{peran.ringkas}</p>

                  <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-700">
                    {peran.bisa.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2">
                    <Link href={peran.primary.href} className="block">
                      <Button full>
                        {peran.primary.label}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </Link>
                    {peran.secondary ? (
                      <Link href={peran.secondary.href} className="block">
                        <Button full variant="ghost" size="sm">
                          {peran.secondary.label}
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-16">
          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-8">
            <h2 className="text-xl font-bold tracking-tight text-primary-900">
              Kenapa selalu ada petugas di dalam keputusan?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-900/80">
              Rekomendasi yang salah atau terlalu percaya diri bisa membuat sebuah usaha
              membuang waktu dan biaya. Karena itu draf AI di sini selalu menampilkan alasan
              di balik skornya dan menandai ketika keyakinannya rendah, dan tidak ada
              pengajuan yang bisa disetujui otomatis tanpa petugas. Prototipe ini dikembangkan
              bersama {KANTOR.nama}.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
