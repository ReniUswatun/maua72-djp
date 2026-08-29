"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  HandHelping,
  Sparkles,
} from "lucide-react";

import {
  CatatanPetugas,
  OfficerReviewBadge,
} from "@/components/dashboard/OfficerReviewBadge";
import { EffortMeter } from "@/components/dashboard/RecommendationCard";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPillar } from "@/lib/assessment-config";
import { useAppStore } from "@/store/assessment-store";

export default function DetailRekomendasiPage({
  params,
}: {
  params: { id: string };
}) {
  const rekomendasi = useAppStore((s) => s.rekomendasi);
  const tandaiSelesai = useAppStore((s) => s.tandaiSelesai);
  const mintaBantuan = useAppStore((s) => s.mintaBantuan);
  const [bantuanTerkirim, setBantuanTerkirim] = React.useState(false);

  const rec = rekomendasi.find((r) => r.id === params.id);

  if (!rec) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">Rekomendasi tidak ditemukan</h1>
        <p className="mt-3 text-gray-600">
          Rekomendasi ini mungkin berasal dari asesmen yang sudah diperbarui.
        </p>
        <Link href="/dashboard/rekomendasi" className="mt-7 inline-block">
          <Button>Kembali ke daftar rekomendasi</Button>
        </Link>
      </div>
    );
  }

  const pilar = getPillar(rec.pillarId);
  const diedit = rec.review.status === "edited";

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/rekomendasi"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Semua rekomendasi
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">
            Pilar {rec.pillarId} · {pilar?.nama}
          </Badge>
          <OfficerReviewBadge review={rec.review} />
          {rec.selesai ? (
            <Badge tone="success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Selesai
            </Badge>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">{rec.judul}</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600">
          {rec.ringkas}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <EffortMeter effort={rec.effort} />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" aria-hidden />
            Perkiraan waktu: {rec.estimasi}
          </span>
        </div>
      </header>

      <CatatanPetugas review={rec.review} />

      {/* Transparansi versi AI vs versi petugas (blueprint §5.7) */}
      {diedit && rec.review.versiAsliAI && rec.review.versiPetugas ? (
        <section className="rounded-xl border border-sky-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold">
            Rekomendasi ini disunting petugas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Kami menampilkan kedua versi supaya Anda tahu persis apa yang diubah.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Versi draf sistem
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {rec.review.versiAsliAI}
              </p>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
                Versi petugas {rec.review.namaPetugas}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sky-900">
                {rec.review.versiPetugas}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Kenapa ini penting</h2>
        <p className="mt-3 leading-relaxed text-gray-700">{rec.mengapa}</p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Langkah-langkah</h2>
        <ol className="mt-5 space-y-4">
          {rec.langkah.map((l, i) => (
            <li key={l} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
                {i + 1}
              </span>
              <p className="pt-0.5 leading-relaxed text-gray-700">{l}</p>
            </li>
          ))}
        </ol>
      </section>

      {rec.referensi.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Referensi Resmi</h2>
          <ul className="mt-4 space-y-2.5">
            {rec.referensi.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-primary-700 hover:underline"
                >
                  {r.label}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {bantuanTerkirim ? (
        <Alert tone="success" judul="Permintaan bantuan terkirim">
          Petugas Klinik Ekspor Bea Cukai Surakarta akan menghubungi Anda lewat
          WhatsApp dalam 1–2 hari kerja. Riwayatnya tercatat di halaman Riwayat
          Konsultasi.
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          variant={rec.selesai ? "outline" : "default"}
          onClick={() => tandaiSelesai(rec.id, !rec.selesai)}
        >
          {rec.selesai ? (
            <Circle className="h-5 w-5" aria-hidden />
          ) : (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          )}
          {rec.selesai ? "Batalkan Tanda Selesai" : "Tandai Selesai"}
        </Button>

        <Button
          size="lg"
          variant="subtle"
          onClick={() => {
            mintaBantuan(rec.id);
            setBantuanTerkirim(true);
          }}
          disabled={bantuanTerkirim}
        >
          <HandHelping className="h-5 w-5" aria-hidden />
          Butuh Bantuan Petugas
        </Button>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
