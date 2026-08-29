"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  Download,
  Flag,
  Send,
  ShieldCheck,
} from "lucide-react";

import { PillarBars, PillarRadarChart } from "@/components/dashboard/PillarRadarChart";
import { ReadinessScoreCard } from "@/components/dashboard/ReadinessScoreCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ButuhProfil } from "@/components/shared/Gate";
import { Logo } from "@/components/shared/Logo";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ringkasanNaratif } from "@/lib/scoring";
import { useAppStore } from "@/store/assessment-store";

export default function HasilPage() {
  return (
    <ButuhProfil>
      <Hasil />
    </ButuhProfil>
  );
}

function Hasil() {
  const router = useRouter();
  const hasil = useAppStore((s) => s.hasil);
  const riwayat = useAppStore((s) => s.riwayat);
  const answers = useAppStore((s) => s.answers);
  const profile = useAppStore((s) => s.profile);
  const rekomendasi = useAppStore((s) => s.rekomendasi);
  const dikirim = useAppStore((s) => s.dikirimKePetugas);
  const kirimKePetugas = useAppStore((s) => s.kirimKePetugas);

  if (!hasil) {
    return (
      <div className="container-form py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Belum ada hasil pengajuan
        </h1>
        <p className="mt-3 leading-relaxed text-gray-600">
          Selesaikan pengajuan tujuh pilar untuk melihat skor dan rekomendasi
          Anda.
        </p>
        <Link href="/asesmen" className="mt-7 inline-block">
          <Button size="lg">Mulai Pengajuan Ekspor</Button>
        </Link>
      </div>
    );
  }

  const sebelumnya = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null;
  const top3 = rekomendasi.slice(0, 3);

  return (
    <>
      <header className="no-print border-b border-gray-200 bg-white">
        <div className="container-form flex h-16 items-center justify-between">
          <Logo />
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main id="konten-utama" className="container-form space-y-10 py-10 sm:py-12">
        <div>
          <p className="eyebrow">Hasil Pengajuan Ekspor</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Kesiapan ekspor {profile?.namaUsaha}
          </h1>
        </div>

        <ReadinessScoreCard hasil={hasil} sebelumnya={sebelumnya} />

        {/* Ringkasan naratif */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Ringkasan</h2>
          <p className="mt-3 text-lg leading-relaxed text-gray-700">
            {ringkasanNaratif(hasil, profile?.namaUsaha)}
          </p>
        </section>

        {/* Skor per pilar */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Skor per Pilar</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ketuk salah satu pilar untuk melihat rincian jawaban Anda.
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <PillarRadarChart pilar={hasil.pilar} />
            </div>
            <div className="lg:col-span-7">
              <PillarBars
                pilar={hasil.pilar}
                answers={answers}
                profile={profile}
              />
            </div>
          </div>
        </section>

        {/* Rekomendasi prioritas */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {top3.length} Rekomendasi Prioritas
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Dari total {rekomendasi.length} rekomendasi yang disusun untuk
                usaha Anda.
              </p>
            </div>
            <Link
              href="/dashboard/rekomendasi"
              className="no-print hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline sm:inline-flex"
            >
              Lihat semua
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {top3.map((r, i) => (
              <RecommendationCard key={r.id} rekomendasi={r} urutan={i + 1} />
            ))}
          </div>
        </section>

        {/* Status validasi petugas */}
        <section
          className={`rounded-xl border p-6 sm:p-8 ${
            dikirim
              ? "border-primary-100 bg-primary-50"
              : "border-accent-100 bg-accent-50"
          }`}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-card">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-primary-900">
                {dikirim
                  ? "Rekomendasi Anda sedang direview Petugas Bea Cukai Surakarta"
                  : "Kirim hasil ini untuk divalidasi petugas"}
              </h2>
              <p className="mt-2 leading-relaxed text-primary-900/80">
                {dikirim
                  ? "Anda akan menerima notifikasi WhatsApp dalam 1–2 hari kerja. Rekomendasi yang sudah ditinjau akan ditandai di dashboard, termasuk bila petugas mengubah isinya."
                  : "Petugas akan memeriksa rekomendasi sistem, mengoreksi bila ada yang tidak sesuai kondisi usaha Anda, lalu mengembalikannya ke dashboard Anda."}
              </p>
            </div>
            {!dikirim ? (
              <Button
                className="no-print shrink-0"
                size="lg"
                onClick={kirimKePetugas}
              >
                <Send className="h-5 w-5" aria-hidden />
                Kirim ke Petugas
              </Button>
            ) : null}
          </div>

          {hasil.flagPetugas.length > 0 ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Flag className="h-4 w-4" aria-hidden />
                Catatan khusus yang disorot untuk petugas
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
                {hasil.flagPetugas.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <Alert tone="info" icon={<ClipboardList className="h-5 w-5" aria-hidden />}>
          Ulangi pengajuan setelah beberapa rekomendasi selesai dikerjakan untuk
          melihat perubahan skor. Riwayat pengajuan tersimpan di dashboard.
        </Alert>

        <DisclaimerBanner />

        <div className="no-print flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => router.push("/dashboard")}>
            Ke Dashboard
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.print()}
          >
            <Download className="h-5 w-5" aria-hidden />
            Unduh Ringkasan (PDF)
          </Button>
        </div>
      </main>
    </>
  );
}
