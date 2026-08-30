"use client";

import Link from "next/link";
import { ArrowRight, Bell, FileText, LifeBuoy, Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PENGAJUAN_STATUS_LABEL, pengajuanStatusClass } from "@/lib/pengajuan-status";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

export default function DashboardBeranda() {
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const timeline = useAppStore((s) => s.timeline);
  const tickets = useAppStore((s) => s.tickets);

  const namaDepan = user?.nama?.split(" ")[0] ?? "Pengguna";
  const notifikasi = timeline.filter((t) => t.kind === "officer" || t.kind === "pesan");
  const perluTindakan = pengajuan.filter((p) => p.status === "revisi" || p.status === "ditolak");
  const tiketDijawab = tickets.filter((t) => t.status === "dijawab").length;
  const recent = [...pengajuan].sort((a, b) => +new Date(b.tanggal) - +new Date(a.tanggal)).slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Beranda</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Halo, {namaDepan}
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola pengajuan dokumen ekspor {profile?.namaUsaha}.
          </p>
        </div>
        {(() => {
          const profilLengkap = !!(
            profile?.namaUsaha?.trim() &&
            profile?.kota?.trim() &&
            profile?.provinsi?.trim() &&
            profile?.tahunBerdiri?.trim() &&
            profile?.kategoriId?.trim()
          );
          const nibOk = !!(profile?.nomorNib?.trim()) && !!(profile?.fileNib);
          const siapEkspor = profilLengkap && nibOk;
          
          if (siapEkspor) {
            return (
              <Link href="/dashboard/pengajuan/baru">
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" aria-hidden />
                  Buat Pengajuan Baru
                </Button>
              </Link>
            );
          }
          return (
            <div className="flex flex-col items-end gap-1">
              <Button size="lg" disabled>
                <Plus className="mr-2 h-5 w-5" aria-hidden />
                Buat Pengajuan Baru
              </Button>
              <p className="text-xs text-amber-600 font-medium">Lengkapi Profil terlebih dahulu</p>
            </div>
          );
        })()}
      </div>

      {(() => {
        const profilLengkap = !!(
          profile?.namaUsaha?.trim() &&
          profile?.kota?.trim() &&
          profile?.provinsi?.trim() &&
          profile?.tahunBerdiri?.trim() &&
          profile?.kategoriId?.trim()
        );
        const nibOk = !!(profile?.nomorNib?.trim()) && !!(profile?.fileNib);
        const siapEkspor = profilLengkap && nibOk;
        
        if (!siapEkspor) {
          return (
            <Alert
              tone="warning"
              judul="Profil Usaha Belum Lengkap"
              icon={<FileText className="h-5 w-5 text-amber-600" aria-hidden />}
            >
              <p className="mb-3">
                Data usaha dan dokumen NIB wajib diisi dengan lengkap di halaman Profil sebelum bisa membuat pengajuan ekspor.
              </p>
              <Link href="/dashboard/profil">
                <Button size="sm" variant="outline">
                  Lengkapi Profil
                </Button>
              </Link>
            </Alert>
          );
        }
        return null;
      })()}

      {perluTindakan.length > 0 ? (
        <Alert tone="danger" judul="Ada pengajuan yang perlu diperbaiki">
          <ul className="mb-3 space-y-1">
            {perluTindakan.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/pengajuan/${p.id}`} className="font-semibold underline">
                  {p.id} — {p.namaProduk}
                </Link>{" "}
                ({PENGAJUAN_STATUS_LABEL[p.status]})
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {tiketDijawab > 0 ? (
        <Alert
          tone="info"
          judul="Petugas menjawab pertanyaan Anda"
          icon={<LifeBuoy className="h-5 w-5" aria-hidden />}
        >
          <p className="mb-3">{tiketDijawab} pertanyaan konsultasi sudah dibalas petugas.</p>
          <Link href="/dashboard/riwayat">
            <Button size="sm" variant="outline">Buka Konsultasi</Button>
          </Link>
        </Alert>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">Pengajuan Terbaru</h2>
          {pengajuan.length > 0 ? (
            <Link href="/dashboard/pengajuan" className="text-sm font-semibold text-primary-700 hover:underline">
              Lihat semua
            </Link>
          ) : null}
        </div>

        {pengajuan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">Belum ada pengajuan</h3>
            <p className="mt-1 text-sm text-gray-500">Anda belum membuat pengajuan ekspor apa pun.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/pengajuan/${p.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-primary-700">{p.id}</p>
                    <p className="text-sm font-semibold text-gray-900">{p.namaProduk}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Tujuan: {p.negaraTujuan} · Dibuat: {formatTanggalPendek(p.tanggal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className={`hidden items-center rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${pengajuanStatusClass(p.status)}`}>
                      {PENGAJUAN_STATUS_LABEL[p.status]}
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notifikasi petugas */}
      {notifikasi.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bell className="h-5 w-5 text-primary-600" aria-hidden />
            Kabar Terbaru
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
        </section>
      ) : null}
    </div>
  );
}
