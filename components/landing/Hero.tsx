"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KANTOR } from "@/lib/mock-data";
import { useAppStore } from "@/store/assessment-store";

export function Hero() {
  const router = useRouter();
  const muatDemo = useAppStore((s) => s.muatDemo);

  const bukaDemo = () => {
    muatDemo();
    router.push("/dashboard");
  };

  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-primary-50/70 to-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-accent-100/50 blur-3xl"
      />
      <div className="container-page relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700">
            <ShieldCheck className="h-4 w-4 text-accent-600" aria-hidden />
            Dikembangkan bersama {KANTOR.nama}
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-primary-900 sm:text-5xl">
            Siap Ekspor, Selangkah Lebih Dekat ke Pasar Global
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
            Cek kesiapan ekspor UMKM Anda dalam 10 menit. Dapatkan panduan
            personal dari sistem yang divalidasi langsung oleh petugas Bea dan
            Cukai Surakarta.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/daftar" className="sm:w-auto">
              <Button size="lg" full className="sm:w-auto">
                Mulai Asesmen Gratis
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={bukaDemo}
              className="sm:w-auto"
              full
            >
              <PlayCircle className="h-5 w-5" aria-hidden />
              Lihat Contoh Hasil
            </Button>
          </div>

          <ul className="mt-8 grid gap-2.5 text-sm text-gray-600 sm:grid-cols-2">
            {[
              "Gratis, tanpa biaya apa pun",
              "8 pilar kesiapan, ±35 pertanyaan",
              "Bahasa awam, istilah dijelaskan",
              "Rekomendasi ditinjau petugas",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

/** Mockup ringan hasil asesmen — menggantikan foto stok. */
function HeroMockup() {
  const pilar = [
    { nama: "Legalitas Usaha", skor: 83 },
    { nama: "Kesiapan Produk", skor: 58 },
    { nama: "Klasifikasi & Regulasi", skor: 39 },
    { nama: "Pengetahuan Kepabeanan", skor: 33 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lift sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Skor Kesiapan
            </p>
            <p className="mt-1 text-4xl font-bold text-primary-900">
              57<span className="text-xl text-gray-400">/100</span>
            </p>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
            Level 3 · Sedang Berkembang
          </span>
        </div>

        <div className="mt-6 space-y-3.5">
          {pilar.map((p) => (
            <div key={p.nama}>
              <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-600">
                <span>{p.nama}</span>
                <span className="tabular-nums text-gray-900">{p.skor}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${p.skor}%` }}
                />
              </div>
            </div>
          ))}
          <p className="pt-1 text-xs text-gray-400">+ 4 pilar lainnya</p>
        </div>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Divalidasi Petugas Ahmad Fauzi
          </p>
          <p className="mt-1 text-xs leading-relaxed text-green-700">
            &ldquo;Prioritaskan pengurusan HS Code sebelum menerima pesanan
            pertama dari buyer.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
