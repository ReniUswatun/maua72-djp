"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardCheck,
  FileStack,
  ListChecks,
  RefreshCw,
  Send,
  TrendingUp,
} from "lucide-react";

import { PillarBars } from "@/components/dashboard/PillarRadarChart";
import { ReadinessScoreCard } from "@/components/dashboard/ReadinessScoreCard";
import { TodoList } from "@/components/dashboard/TodoList";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LEVELS } from "@/lib/scoring";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

export default function DashboardBeranda() {
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const hasil = useAppStore((s) => s.hasil);
  const riwayat = useAppStore((s) => s.riwayat);
  const answers = useAppStore((s) => s.answers);
  const rekomendasi = useAppStore((s) => s.rekomendasi);
  const dokumen = useAppStore((s) => s.dokumen);
  const timeline = useAppStore((s) => s.timeline);
  const dikirim = useAppStore((s) => s.dikirimKePetugas);
  const kirimKePetugas = useAppStore((s) => s.kirimKePetugas);

  const namaDepan = user?.nama?.split(" ")[0] ?? "Pengguna";

  if (!hasil) return <BelumAsesmen nama={namaDepan} />;

  const sebelumnya = riwayat.length > 0 ? riwayat[riwayat.length - 1] : null;
  const todo = rekomendasi.filter((r) => !r.selesai).slice(0, 5);
  const selesai = rekomendasi.filter((r) => r.selesai).length;
  const dokumenSiap = dokumen.filter(
    (d) => d.status === "diverifikasi" || d.status === "diunggah",
  ).length;
  const notifikasi = timeline.filter((t) => t.kind === "officer" || t.kind === "pesan");
  const semuaAsesmen = [...riwayat, hasil];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Beranda</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Halo, {namaDepan}
        </h1>
        <p className="mt-2 text-gray-600">
          Ringkasan kesiapan ekspor {profile?.namaUsaha}.
        </p>
      </div>

      {!dikirim ? (
        <Alert
          tone="accent"
          judul="Hasil asesmen belum dikirim ke petugas"
          icon={<Send className="h-5 w-5 text-accent-600" aria-hidden />}
        >
          <p className="mb-3">
            Rekomendasi Anda masih berupa draf sistem. Kirim ke petugas Bea
            Cukai Surakarta untuk ditinjau dan dikoreksi bila perlu.
          </p>
          <Button size="sm" onClick={kirimKePetugas}>
            Kirim ke Petugas
          </Button>
        </Alert>
      ) : null}

      <ReadinessScoreCard hasil={hasil} sebelumnya={sebelumnya} ringkas />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/asesmen">
          <Button variant="outline" full className="sm:w-auto">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Pengajuan Ekspor Ulang
          </Button>
        </Link>
        <Link href="/asesmen/hasil">
          <Button variant="ghost" full className="sm:w-auto">
            Lihat hasil lengkap
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-1">
        {[
          {
            Icon: FileStack,
            label: "Dokumen tersedia",
            nilai: `${dokumenSiap}/${dokumen.length}`,
            href: "/dashboard/dokumen",
          },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary-200"
          >
            <s.Icon className="h-5 w-5 text-primary-600" aria-hidden />
            <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
              {s.nilai}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Perkembangan antar asesmen */}
      {semuaAsesmen.length > 1 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <TrendingUp className="h-5 w-5 text-primary-600" aria-hidden />
            Perkembangan Kesiapan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Skor dari setiap kali Anda mengisi asesmen.
          </p>

          <ol className="mt-6 space-y-4">
            {semuaAsesmen.map((a, i) => (
              <li key={a.id} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-xs font-medium text-gray-500">
                  {formatTanggalPendek(a.tanggal)}
                </span>
                <span className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span
                    className="block h-full rounded-full transition-all"
                    style={{
                      width: `${a.skorTotal}%`,
                      backgroundColor: LEVELS[a.level].ring,
                    }}
                  />
                </span>
                <span className="w-32 shrink-0 text-right text-sm">
                  <span className="font-bold tabular-nums text-gray-900">
                    {a.skorTotal}
                  </span>
                  <span className="ml-1.5 text-xs text-gray-500">
                    Lv.{a.level}
                  </span>
                  {i === semuaAsesmen.length - 1 ? (
                    <span className="ml-1.5 text-xs font-semibold text-primary-600">
                      terkini
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* To-do */}

      {/* Notifikasi petugas */}
      {notifikasi.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bell className="h-5 w-5 text-primary-600" aria-hidden />
            Kabar dari Petugas
          </h2>
          <ul className="mt-5 space-y-4">
            {notifikasi.slice(0, 3).map((n) => (
              <li key={n.id} className="border-l-2 border-primary-200 pl-4">
                <p className="font-semibold text-gray-900">{n.judul}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {n.detail}
                </p>
                <p className="mt-1.5 text-xs text-gray-400">
                  {n.aktor} · {formatTanggalPendek(n.tanggal)}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/riwayat"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"
          >
            Lihat seluruh riwayat
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      ) : null}

      {/* Rincian pilar */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Skor per Pilar</h2>
        <div className="mt-4">
          <PillarBars pilar={hasil.pilar} answers={answers} profile={profile} />
        </div>
      </section>
    </div>
  );
}

function BelumAsesmen({ nama }: { nama: string }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Beranda</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Halo, {nama}</h1>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <ListChecks className="h-7 w-7" aria-hidden />
        </span>
        <h2 className="mt-5 text-xl font-semibold">
          Dashboard Anda masih kosong
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-gray-600">
          Isi pengajuan ekspor untuk mendapatkan skor, level kesiapan,
          dan daftar langkah yang akan ditinjau petugas Bea Cukai.
        </p>
        <Link href="/asesmen" className="mt-7 inline-block">
          <Button size="lg">
            Mulai Pengajuan Ekspor
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </Link>
      </div>
    </div>
  );
}
