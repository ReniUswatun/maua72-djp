"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PENGAJUAN_STATUS_LABEL, pengajuanStatusClass } from "@/lib/pengajuan-status";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";
import type { PengajuanStatus } from "@/lib/types";

const FILTER: { id: PengajuanStatus | "all"; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "draft", label: "Draft" },
  { id: "review", label: "Direview" },
  { id: "revisi", label: "Revisi" },
  { id: "ditolak", label: "Ditolak" },
  { id: "selesai", label: "Selesai" },
];

export default function RiwayatPengajuanPage() {
  const profile = useAppStore((s) => s.profile);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const [filter, setFilter] = React.useState<PengajuanStatus | "all">("all");

  const terurut = [...pengajuan].sort((a, b) => +new Date(b.tanggal) - +new Date(a.tanggal));
  const terlihat = filter === "all" ? terurut : terurut.filter((p) => p.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Riwayat Pengajuan</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Pengajuan Ekspor Anda</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Semua pengajuan ekspor beserta statusnya. Buka satu pengajuan untuk melihat
            dokumen, catatan petugas, dan mengirim ulang bila diminta revisi.
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
                  <Plus className="h-5 w-5" aria-hidden />
                  Buat Pengajuan Baru
                </Button>
              </Link>
            );
          }
          return (
            <div className="flex flex-col items-end gap-1">
              <Button size="lg" disabled>
                <Plus className="h-5 w-5" aria-hidden />
                Buat Pengajuan Baru
              </Button>
              <p className="text-xs text-amber-600 font-medium">Lengkapi Profil terlebih dahulu</p>
            </div>
          );
        })()}
      </div>

      {pengajuan.length > 0 ? (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {FILTER.map((f) => {
            const jumlah = f.id === "all" ? pengajuan.length : pengajuan.filter((p) => p.status === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  filter === f.id
                    ? "border-primary-700 bg-primary-700 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {f.label} ({jumlah})
              </button>
            );
          })}
        </div>
      ) : null}

      {terlihat.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
            <FileText className="h-6 w-6 text-primary-600" aria-hidden />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            {pengajuan.length === 0 ? "Belum ada pengajuan" : "Tidak ada pengajuan pada filter ini"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {pengajuan.length === 0
              ? "Mulai dengan membuat pengajuan ekspor pertama Anda."
              : "Coba pilih filter status lain."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {terlihat.map((p) => {
            const wajib = p.dokumen.filter((d) => d.wajib);
            const terunggah = wajib.filter((d) => d.status !== "belum").length;
            return (
              <li key={p.id}>
                <Link
                  href={`/dashboard/pengajuan/${p.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-primary-700">{p.id}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pengajuanStatusClass(p.status)}`}
                      >
                        {PENGAJUAN_STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-gray-900">{p.namaProduk}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Tujuan {p.negaraTujuan} · Dibuat {formatTanggalPendek(p.tanggal)} · Dokumen wajib {terunggah}/{wajib.length}
                    </p>
                    {p.catatanReview ? (
                      <p className="mt-2 line-clamp-2 text-xs text-red-700">Catatan petugas: {p.catatanReview}</p>
                    ) : null}
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
