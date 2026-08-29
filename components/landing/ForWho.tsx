import Link from "next/link";
import {
  ClipboardList,
  FileCheck2,
  MessageSquareQuote,
  Quote,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TESTIMONI } from "@/lib/mock-data";

const SEGMEN = [
  {
    icon: Sparkles,
    judul: "UMKM Pemula",
    sub: "Belum pernah ekspor",
    detail:
      "Anda punya produk bagus tapi belum tahu harus mulai dari mana. Asesmen akan menunjukkan fondasi apa yang perlu dibereskan lebih dulu.",
  },
  {
    icon: TrendingUp,
    judul: "UMKM Sedang Berkembang",
    sub: "Sudah legal, bingung dokumen",
    detail:
      "Legalitas sudah jalan dan mungkin sudah ada calon pembeli, tapi urusan HS Code dan dokumen kepabeanan masih membingungkan.",
  },
  {
    icon: FileCheck2,
    judul: "UMKM Siap Naik Kelas",
    sub: "Sudah ekspor, ingin optimasi",
    detail:
      "Anda sudah pernah mengirim ke luar negeri dan ingin memanfaatkan fasilitas kepabeanan serta memperluas pasar tujuan.",
  },
];

const MANFAAT = [
  {
    icon: ClipboardList,
    judul: "Skor kesiapan dengan 5 level",
    detail:
      "Bukan sekadar angka — setiap level menjelaskan apa arti posisi Anda dan apa fokus berikutnya.",
  },
  {
    icon: Sparkles,
    judul: "Rekomendasi terpersonalisasi",
    detail:
      "Pertanyaan bercabang sesuai kategori usaha, sehingga saran yang muncul relevan dengan produk Anda.",
  },
  {
    icon: FileCheck2,
    judul: "Panduan langkah demi langkah PEB",
    detail:
      "Dari penentuan HS Code sampai terbitnya Nota Pelayanan Ekspor, dijelaskan dengan bahasa awam.",
  },
  {
    icon: MessageSquareQuote,
    judul: "Akses konsultasi petugas",
    detail:
      "Setiap rekomendasi ditinjau petugas Bea Cukai, dan Anda bisa meminta pendampingan langsung.",
  },
];

export function ForWho() {
  return (
    <section id="untuk-siapa" className="scroll-mt-20 bg-gray-50">
      <div className="container-page section-y">
        <p className="eyebrow">Untuk Siapa</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
          Di tahap mana pun usaha Anda sekarang
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {SEGMEN.map((s) => (
            <div
              key={s.judul}
              className="rounded-xl border border-gray-200 bg-white p-8"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{s.judul}</h3>
              <p className="mt-1 text-sm font-medium text-accent-700">{s.sub}</p>
              <p className="mt-3 leading-relaxed text-gray-600">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function YangDidapat() {
  return (
    <section className="bg-white">
      <div className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Yang Anda Dapatkan</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Bukan sekadar hasil tes, tapi rencana kerja
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Hasil asesmen dirancang untuk langsung bisa dikerjakan: apa yang
              harus diurus, ke mana mengurusnya, dan berapa lama perkiraan
              waktunya.
            </p>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:col-span-7">
            {MANFAAT.map((m) => (
              <li key={m.judul} className="bg-white p-6">
                <m.icon className="h-5 w-5 text-primary-600" aria-hidden />
                <h3 className="mt-4 font-semibold leading-snug">{m.judul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {m.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Testimoni() {
  return (
    <section className="border-y border-gray-200 bg-gray-50">
      <div className="container-page section-y">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">Testimoni</p>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Ilustrasi — bukan kutipan pengguna nyata
          </span>
        </div>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
          Gambaran manfaat yang diharapkan
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TESTIMONI.map((t) => (
            <figure
              key={t.nama}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-8"
            >
              <Quote className="h-6 w-6 text-accent-500" aria-hidden />
              <blockquote className="mt-4 flex-1 leading-relaxed text-gray-700">
                &ldquo;{t.kutipan}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-gray-100 pt-4 text-sm">
                <span className="block font-semibold text-gray-900">
                  {t.nama}
                </span>
                <span className="text-gray-500">{t.kota}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaAkhir() {
  return (
    <section className="bg-primary-900">
      <div className="container-page py-20 text-center sm:py-24">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Mulai Perjalanan Ekspor Anda Hari Ini
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary-100">
          Sepuluh menit untuk mengetahui posisi usaha Anda, dan daftar langkah
          yang sudah ditinjau petugas Bea dan Cukai.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/daftar">
            <Button size="lg" variant="accent" full className="sm:w-auto">
              Daftar Gratis
            </Button>
          </Link>
          <Link href="/panduan">
            <Button
              size="lg"
              variant="outline"
              full
              className="border-primary-500 bg-transparent text-white hover:border-primary-300 hover:bg-primary-800 hover:text-white sm:w-auto"
            >
              Baca Panduan Dulu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
