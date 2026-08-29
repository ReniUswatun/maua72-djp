"use client";

import {
  ClipboardList,
  FileText,
  ListChecks,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { TimelineKind } from "@/lib/types";
import { formatTanggal } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

const IKON: Record<
  TimelineKind,
  { Icon: typeof ClipboardList; kelas: string; label: string }
> = {
  asesmen: {
    Icon: ClipboardList,
    kelas: "bg-primary-50 text-primary-700",
    label: "Pengajuan Ekspor",
  },
  officer: {
    Icon: ShieldCheck,
    kelas: "bg-green-50 text-green-700",
    label: "Petugas",
  },
  dokumen: { Icon: FileText, kelas: "bg-sky-50 text-sky-700", label: "Dokumen" },
  rekomendasi: {
    Icon: ListChecks,
    kelas: "bg-accent-50 text-accent-700",
    label: "Rekomendasi",
  },
  pesan: {
    Icon: MessageSquare,
    kelas: "bg-gray-100 text-gray-600",
    label: "Pesan",
  },
};

export default function RiwayatPage() {
  const timeline = useAppStore((s) => s.timeline);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Riwayat Konsultasi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Semua yang sudah terjadi
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Catatan interaksi antara Anda dan petugas Bea Cukai, termasuk setiap
          kali rekomendasi ditinjau atau dokumen diverifikasi.
        </p>
      </div>

      {timeline.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          Belum ada aktivitas. Riwayat akan terisi setelah Anda menyelesaikan
          pengajuan ekspor dan mengirimkannya ke petugas.
        </p>
      ) : (
        <ol className="relative space-y-6 border-l border-gray-200 pl-6">
          {timeline.map((t) => {
            const { Icon, kelas, label } = IKON[t.kind];
            return (
              <li key={t.id} className="relative">
                <span
                  className={`absolute -left-[2.4rem] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-gray-50 ${kelas}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{label}</Badge>
                    <span className="text-xs text-gray-400">
                      {formatTanggal(t.tanggal)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-semibold text-gray-900">{t.judul}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    {t.detail}
                  </p>
                  <p className="mt-3 text-xs font-medium text-gray-500">
                    oleh {t.aktor}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
