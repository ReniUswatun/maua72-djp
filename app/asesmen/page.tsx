"use client";

import Link from "next/link";
import { ArrowRight, Clock, ListChecks, RotateCcw, Sparkles } from "lucide-react";

import { ButuhProfil } from "@/components/shared/Gate";
import { PillarIcon } from "@/components/shared/PillarIcon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import {
  PILLARS,
  conditionalQuestionCount,
  questionsForPillar,
  questionsForProfile,
} from "@/lib/assessment-config";
import { categoryLabel } from "@/lib/business-categories";
import { progresAsesmen } from "@/lib/scoring";
import { useAppStore } from "@/store/assessment-store";

export default function AsesmenIntroPage() {
  return (
    <ButuhProfil>
      <Intro />
    </ButuhProfil>
  );
}

function Intro() {
  const profile = useAppStore((s) => s.profile);
  const answers = useAppStore((s) => s.answers);
  const resetAsesmen = useAppStore((s) => s.resetAsesmen);

  const daftar = questionsForProfile(profile);
  const progres = progresAsesmen(answers, profile);
  const tambahan = conditionalQuestionCount(profile);
  const sudahMulai = progres.terjawab > 0;

  // Pilar pertama yang belum lengkap — titik lanjut yang paling masuk akal.
  const lanjutKe =
    PILLARS.find((p) => {
      const qs = questionsForPillar(p.id, profile);
      return qs.some((q) => answers[q.id] === undefined);
    })?.id ?? 1;

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
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

      <main id="konten-utama" className="container-form py-12">
        <p className="eyebrow">Pengajuan Ekspor</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Mari lihat sejauh mana kesiapan {profile?.namaUsaha}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Jawab sejujurnya — hasil yang akurat jauh lebih berguna daripada skor
          yang bagus. Tidak ada jawaban yang salah, dan Anda bisa berhenti kapan
          saja lalu melanjutkan nanti.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: ListChecks,
              label: `${daftar.length} pertanyaan`,
              sub: `Terbagi ke dalam ${PILLARS.length} pilar`,
            },
            {
              icon: Clock,
              label: "±10 menit",
              sub: "Bisa dijeda kapan saja",
            },
            {
              icon: Sparkles,
              label: `${tambahan} pertanyaan khusus`,
              sub: categoryLabel(profile?.kategoriId, profile?.kategoriLainnya),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <s.icon className="h-5 w-5 text-primary-600" aria-hidden />
              <dt className="mt-3 font-semibold text-gray-900">{s.label}</dt>
              <dd className="mt-0.5 text-sm text-gray-600">{s.sub}</dd>
            </div>
          ))}
        </dl>

        {tambahan > 0 ? (
          <Alert
            tone="accent"
            className="mt-6"
            icon={<Sparkles className="h-5 w-5 text-accent-600" aria-hidden />}
            judul="Pengajuan ini sudah disesuaikan dengan usaha Anda"
          >
            Karena kategori usaha Anda adalah{" "}
            <strong>
              {categoryLabel(profile?.kategoriId, profile?.kategoriLainnya)}
            </strong>
            , muncul {tambahan} pertanyaan tambahan yang tidak ditanyakan ke
            kategori lain — misalnya soal sertifikasi khusus yang berlaku untuk
            produk Anda.
          </Alert>
        ) : null}

        <ol className="mt-10 space-y-3">
          {PILLARS.map((p) => {
            const qs = questionsForPillar(p.id, profile);
            const jawab = qs.filter((q) => answers[q.id] !== undefined).length;
            return (
              <li key={p.id}>
                <Link
                  href={`/asesmen/${p.id}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <PillarIcon icon={p.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-900">
                      {p.id}. {p.nama}
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600">
                      {qs.length} pertanyaan · bobot {Math.round(p.bobot * 100)}%
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                      jawab === qs.length
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {jawab}/{qs.length}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={`/asesmen/${lanjutKe}`}>
            <Button size="lg" full className="sm:w-auto">
              {sudahMulai ? "Lanjutkan Pengajuan" : "Mulai Pengajuan"}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </Link>

          {sudahMulai ? (
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (
                  confirm(
                    "Semua jawaban akan dihapus dan Anda mulai dari pilar pertama. Lanjutkan?",
                  )
                ) {
                  resetAsesmen();
                }
              }}
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
              Mulai Ulang
            </Button>
          ) : null}
        </div>
      </main>
    </>
  );
}
