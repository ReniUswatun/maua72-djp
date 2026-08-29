"use client";

import { useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  Send,
  Upload,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PENGAJUAN_STATUS_LABEL, bisaDiperbaiki, pengajuanStatusClass } from "@/lib/pengajuan-status";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

export default function PengajuanDetailPage({ params }: { params: { id: string } }) {
  const pengajuan = useAppStore((s) => s.pengajuan.find((p) => p.id === params.id));
  const unggah = useAppStore((s) => s.unggahDokumenPengajuan);
  const kirim = useAppStore((s) => s.kirimPengajuan);
  const tarik = useAppStore((s) => s.tarikPengajuan);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!pengajuan) {
    notFound();
  }

  const { dokumen, status } = pengajuan;
  const bolehEdit = bisaDiperbaiki(status);
  const semuaWajibDiupload = dokumen
    .filter((d) => d.wajib)
    .every((d) => d.status === "diunggah" || d.status === "diverifikasi");

  const handleFile = (docId: string, file: File | undefined) => {
    if (!file) return;
    if (file.size > 3_000_000) {
      // Berkas besar tidak disimpan sebagai data URI agar tidak melebihi kuota localStorage.
      unggah(pengajuan.id, docId, file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      unggah(pengajuan.id, docId, file.name, typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => unggah(pengajuan.id, docId, file.name);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/pengajuan"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke Riwayat Pengajuan
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pengajuan: {pengajuan.id}</h1>
          <p className="mt-1 text-sm text-gray-500">Dibuat pada {formatTanggalPendek(pengajuan.tanggal)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${pengajuanStatusClass(status)}`}>
          {PENGAJUAN_STATUS_LABEL[status]}
        </span>
      </div>

      {pengajuan.catatanReview && (status === "revisi" || status === "ditolak") ? (
        <Alert
          tone={status === "ditolak" ? "danger" : "warning"}
          judul={status === "ditolak" ? "Pengajuan ditolak petugas" : "Petugas meminta revisi"}
        >
          <p className="mb-2">{pengajuan.catatanReview}</p>
          <p className="text-sm">
            Perbaiki dokumen yang ditandai di bawah, lalu tekan{" "}
            <span className="font-semibold">Kirim Ulang Pengajuan</span>.
          </p>
        </Alert>
      ) : null}

      {status === "review" ? (
        <Alert tone="info" judul="Sedang direview petugas">
          <p className="mb-3">
            Pengajuan Anda sedang diperiksa. Bila ada yang perlu diperbaiki sebelum petugas selesai,
            Anda bisa menariknya dulu.
          </p>
          <Button size="sm" variant="outline" onClick={() => tarik(pengajuan.id)}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Tarik untuk perbaiki
          </Button>
        </Alert>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Rincian Ekspor</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2"><dt className="text-gray-500">Produk</dt><dd className="font-medium text-gray-900">{pengajuan.namaProduk}</dd></div>
            <div className="grid grid-cols-2"><dt className="text-gray-500">Negara Tujuan</dt><dd className="font-medium text-gray-900">{pengajuan.negaraTujuan}</dd></div>
            <div className="grid grid-cols-2"><dt className="text-gray-500">Nilai Ekspor</dt><dd className="font-medium text-gray-900">USD {pengajuan.nilaiEkspor}</dd></div>
            <div className="grid grid-cols-2"><dt className="text-gray-500">HS Code</dt><dd className="font-medium text-gray-900">{pengajuan.hsCode || "-"}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Rincian Pengiriman</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2"><dt className="text-gray-500">Pembeli (Consignee)</dt><dd className="font-medium text-gray-900">{pengajuan.pembeli}</dd></div>
            <div className="grid grid-cols-2"><dt className="text-gray-500">Tanggal Pengiriman</dt><dd className="font-medium text-gray-900">{formatTanggalPendek(pengajuan.tanggalKirim)}</dd></div>
          </dl>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Checklist Dokumen</h2>
        <p className="mt-2 text-sm text-gray-600">
          {bolehEdit
            ? "Unggah atau perbarui dokumen yang diperlukan untuk pengajuan ini."
            : "Dokumen terkunci selama pengajuan diproses petugas."}
        </p>

        <ul className="mt-8 space-y-6">
          {dokumen.map((d) => {
            const adaBerkas = d.status === "diunggah" || d.status === "diverifikasi";
            return (
              <li key={d.id} className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      d.status === "diverifikasi"
                        ? "bg-green-100 text-green-700"
                        : d.status === "revisi"
                          ? "bg-amber-100 text-amber-700"
                          : d.status === "diunggah"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {d.status === "diverifikasi" ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden />
                    ) : d.status === "revisi" ? (
                      <Clock className="h-5 w-5" aria-hidden />
                    ) : (
                      <FileText className="h-5 w-5" aria-hidden />
                    )}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {d.nama}{" "}
                      <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${d.wajib ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                        {d.wajib ? "Wajib" : "Opsional"}
                      </span>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{d.keterangan}</p>

                    {d.namaFile ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-400" aria-hidden />
                        <span className="font-medium text-gray-900">{d.namaFile}</span>
                        {d.fileUrl ? (
                          <a href={d.fileUrl} target="_blank" rel="noreferrer" className="ml-1 font-semibold text-primary-700 hover:underline">
                            Lihat PDF
                          </a>
                        ) : null}
                      </div>
                    ) : null}

                    {d.catatanPetugas ? (
                      <Alert tone="warning" className="mt-3 py-2">
                        <p className="text-sm font-medium">Catatan petugas:</p>
                        <p className="text-sm">{d.catatanPetugas}</p>
                      </Alert>
                    ) : null}
                  </div>
                </div>

                {bolehEdit ? (
                  <div className="mt-2 flex flex-col gap-3 sm:mt-0 sm:shrink-0 sm:flex-row sm:items-center">
                    <input
                      ref={(el) => {
                        inputRefs.current[d.id] = el;
                      }}
                      type="file"
                      className="sr-only"
                      aria-label={`Unggah berkas ${d.nama}`}
                      onChange={(e) => {
                        handleFile(d.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    {!adaBerkas ? (
                      <Link
                        href={`/panduan/dokumen/${d.id}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                      >
                        Cara membuat
                      </Link>
                    ) : null}
                    <Button variant="outline" onClick={() => inputRefs.current[d.id]?.click()}>
                      <Upload className="mr-2 h-4 w-4" aria-hidden />
                      {adaBerkas ? "Ganti Berkas" : "Unggah"}
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        {bolehEdit ? (
          <div className="mt-10 border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-50 p-6 sm:flex-row">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {status === "draft" ? "Siap dikirim ke Bea Cukai?" : "Sudah selesai memperbaiki?"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Pastikan semua dokumen wajib telah diunggah dengan benar sebelum mengirim.
                </p>
              </div>
              <Button size="lg" disabled={!semuaWajibDiupload} onClick={() => kirim(pengajuan.id)}>
                <Send className="mr-2 h-4 w-4" aria-hidden />
                {status === "draft" ? "Kirim Pengajuan" : "Kirim Ulang Pengajuan"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
