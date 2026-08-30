"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, CheckCircle2, Clock, PlayCircle, ShieldCheck } from "lucide-react";

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
            Urus Dokumen Ekspor Pertama Anda, Ditemani Petugas
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
            SiapEkspor menuntun UMKM menyusun setiap dokumen ekspor — dari NIB
            sampai PEB — lalu mengirimkannya untuk ditinjau langsung oleh petugas
            Bea dan Cukai Surakarta sebelum barang berangkat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/daftar" className="sm:w-auto">
              <Button size="lg" full className="sm:w-auto">
                Mulai Gratis
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
              Lihat Contoh Dashboard
            </Button>
          </div>

          <ul className="mt-8 grid gap-2.5 text-sm text-gray-600 sm:grid-cols-2">
            {[
              "Gratis, tanpa biaya apa pun",
              "Checklist dokumen sesuai produk Anda",
              "Bahasa awam, istilah dijelaskan",
              "Setiap dokumen ditinjau petugas",
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

/** Mockup ringan status pengajuan ekspor — menggantikan foto stok. */
function HeroMockup() {
  const dokumen = [
    { nama: "NIB & NPWP", status: "ok" as const },
    { nama: "Commercial Invoice", status: "ok" as const },
    { nama: "Packing List", status: "review" as const },
    { nama: "PEB / NPE", status: "belum" as const },
  ];

  const badge = {
    ok: { teks: "Diverifikasi", cls: "bg-green-100 text-green-700" },
    review: { teks: "Ditinjau petugas", cls: "bg-sky-100 text-sky-700" },
    belum: { teks: "Belum diunggah", cls: "bg-gray-100 text-gray-500" },
  };

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lift sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pengajuan Ekspor
            </p>
            <p className="mt-1 text-lg font-bold text-primary-900">
              Kerajinan Rotan → Jerman
            </p>
          </div>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
            Sedang direview
          </span>
        </div>

        <div className="mt-6 space-y-2.5">
          {dokumen.map((d) => (
            <div
              key={d.nama}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {d.status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                ) : d.status === "review" ? (
                  <Clock className="h-4 w-4 text-sky-600" aria-hidden />
                ) : (
                  <span className="h-4 w-4 rounded-full border-2 border-gray-300" aria-hidden />
                )}
                {d.nama}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge[d.status].cls}`}>
                {badge[d.status].teks}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Catatan Petugas Ahmad Fauzi
          </p>
          <p className="mt-1 text-xs leading-relaxed text-green-700">
            &ldquo;Packing List sudah sesuai. Lengkapi PEB lewat CEISA, lalu unggah
            NPE-nya di sini.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
