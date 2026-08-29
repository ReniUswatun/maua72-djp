"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  FileText,
  Upload,
  UploadCloud,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DocStatus } from "@/lib/types";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

const STATUS: Record<
  DocStatus,
  { label: string; tone: "neutral" | "info" | "success" | "warning" }
> = {
  belum: { label: "Belum diunggah", tone: "neutral" },
  diunggah: { label: "Menunggu verifikasi", tone: "info" },
  diverifikasi: { label: "Diverifikasi petugas", tone: "success" },
  revisi: { label: "Perlu perbaikan", tone: "warning" },
};

export default function DokumenPage() {
  const dokumen = useAppStore((s) => s.dokumen);
  const unggahDokumen = useAppStore((s) => s.unggahDokumen);
  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const wajib = dokumen.filter((d) => d.wajib);
  const wajibSiap = wajib.filter(
    (d) => d.status === "diverifikasi" || d.status === "diunggah",
  ).length;
  const persen = wajib.length === 0 ? 0 : (wajibSiap / wajib.length) * 100;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Dokumen Saya</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Berkas ekspor usaha Anda
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Kumpulkan dokumen di satu tempat agar petugas bisa memeriksanya
          sekaligus saat konsultasi. Dokumen bertanda wajib dibutuhkan untuk
          hampir semua pengiriman ekspor.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-semibold">Kelengkapan dokumen wajib</h2>
          <span className="text-sm font-bold tabular-nums text-gray-900">
            {wajibSiap}/{wajib.length}
          </span>
        </div>
        <Progress value={persen} className="mt-3" tone="primary" />
      </section>

      <Alert tone="info" icon={<UploadCloud className="h-5 w-5" aria-hidden />}>
        Pada prototipe ini berkas tidak benar-benar diunggah ke server — hanya
        nama file yang dicatat untuk memperlihatkan alurnya.
      </Alert>

      <ul className="space-y-4">
        {dokumen.map((d) => {
          const st = STATUS[d.status];
          return (
            <li
              key={d.id}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{d.nama}</h2>
                    {d.wajib ? <Badge tone="danger">Wajib</Badge> : null}
                    <Badge tone={st.tone}>
                      {d.status === "diverifikasi" ? (
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                      {d.status === "revisi" ? (
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                      {st.label}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {d.keterangan}
                  </p>

                  {d.namaFile ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <FileText className="h-4 w-4 text-gray-400" aria-hidden />
                      <span className="break-all">{d.namaFile}</span>
                      {d.tanggal ? (
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatTanggalPendek(d.tanggal)}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {d.catatanPetugas ? (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
                      <span className="font-semibold">Catatan petugas: </span>
                      {d.catatanPetugas}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:items-center sm:shrink-0">
                  <input
                    ref={(el) => {
                      inputRefs.current[d.id] = el;
                    }}
                    type="file"
                    className="sr-only"
                    aria-label={`Unggah berkas ${d.nama}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) unggahDokumen(d.id, file.name);
                      e.target.value = "";
                    }}
                  />
                  {!d.namaFile ? (
                    <Link
                      href={`/panduan/dokumen/${d.id}`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 sm:w-auto"
                    >
                      Buat Dokumen
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => inputRefs.current[d.id]?.click()}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 sm:w-auto"
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    {d.namaFile ? "Ganti Berkas" : "Unggah"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
