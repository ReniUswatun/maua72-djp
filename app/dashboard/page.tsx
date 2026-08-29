"use client";

import Link from "next/link";
import { ArrowRight, Bell, FileText, Plus, Send } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

export default function DashboardBeranda() {
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const timeline = useAppStore((s) => s.timeline);

  const namaDepan = user?.nama?.split(" ")[0] ?? "Pengguna";
  const notifikasi = timeline.filter((t) => t.kind === "officer" || t.kind === "pesan");

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
        <Link href="/dashboard/pengajuan/baru">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" aria-hidden />
            Buat Pengajuan Baru
          </Button>
        </Link>
      </div>

      {!profile?.nomorNib || !profile?.nomorNpwp ? (
        <Alert
          tone="warning"
          judul="Profil Belum Lengkap"
          icon={<FileText className="h-5 w-5 text-amber-600" aria-hidden />}
        >
          <p className="mb-3">
            NIB atau NPWP perusahaan Anda belum dilengkapi. Mohon lengkapi terlebih dahulu di halaman Profil sebelum mengajukan ekspor.
          </p>
          <Link href="/dashboard/profil">
            <Button size="sm" variant="outline">
              Lengkapi Profil
            </Button>
          </Link>
        </Alert>
      ) : null}

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Daftar Pengajuan Ekspor
          </h2>
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
            {pengajuan.map((p) => {
              const dokLengkap = p.dokumen.every(d => d.status === "diunggah" || d.status === "diverifikasi" || !d.wajib);
              
              return (
                <li key={p.id}>
                  <Link
                    href={`/dashboard/pengajuan/${p.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-primary-700">{p.id}</p>
                      <p className="text-sm font-semibold text-gray-900">{p.namaProduk}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Tujuan: {p.negaraTujuan} · Dibuat: {formatTanggalPendek(p.tanggal)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          p.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          p.status === 'review' ? 'bg-blue-100 text-blue-800' :
                          p.status === 'revisi' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {p.status === 'draft' ? 'Draft' :
                           p.status === 'review' ? 'Sedang Direview' :
                           p.status === 'revisi' ? 'Perlu Revisi' : 'Selesai'}
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                </li>
              );
            })}
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
