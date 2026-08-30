"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Send,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DocumentUploadItem } from "@/components/shared/DocumentUploadItem";
import { PENGAJUAN_STATUS_LABEL, bisaDiperbaiki, pengajuanStatusClass } from "@/lib/pengajuan-status";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";
import type { DocumentOcrResult, OcrContext } from "@/lib/types";

export default function PengajuanDetailPage({ params }: { params: { id: string } }) {
  const pengajuan = useAppStore((s) => s.pengajuan.find((p) => p.id === params.id));
  const profile = useAppStore((s) => s.profile);
  const unggah = useAppStore((s) => s.unggahDokumenPengajuan);
  const kirim = useAppStore((s) => s.kirimPengajuan);
  const tarik = useAppStore((s) => s.tarikPengajuan);

  if (!pengajuan) {
    notFound();
  }

  const { dokumen, status } = pengajuan;

  const ocrContext: OcrContext = {
    namaUsaha: profile?.namaUsaha,
    nomorNib: profile?.nomorNib,
    nomorNpwp: profile?.nomorNpwp,
    hsCode: pengajuan.hsCode,
    nilaiEkspor: pengajuan.nilaiEkspor,
    negaraTujuan: pengajuan.negaraTujuan,
    namaProduk: pengajuan.namaProduk,
    pembeli: pengajuan.pembeli,
  };
  const bolehEdit = bisaDiperbaiki(status);
  const semuaWajibDiupload = dokumen
    .filter((d) => d.wajib)
    .every((d) => d.status === "diunggah" || d.status === "diverifikasi");

  const handleUpload = (
    docId: string,
    namaFile: string,
    fileUrl?: string,
    ocr?: DocumentOcrResult
  ) => {
    unggah(pengajuan.id, docId, namaFile, fileUrl, ocr);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Checklist Dokumen</h2>
            <p className="mt-1 text-sm text-gray-500">
              {bolehEdit
                ? "Unggah atau perbarui dokumen. Setiap dokumen akan dibaca otomatis (OCR) untuk memvalidasi kelengkapan field."
                : "Dokumen terkunci selama pengajuan diproses petugas."}
            </p>
          </div>
        </div>

        <ul className="mt-8 space-y-6">
          {dokumen.map((d) => (
            <DocumentUploadItem
              key={d.id}
              doc={d}
              pengajuanId={pengajuan.id}
              bolehEdit={bolehEdit}
              ocrContext={ocrContext}
              onUpload={handleUpload}
            />
          ))}
        </ul>

        {bolehEdit ? (
          <div className="mt-10 border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-50 p-6 sm:flex-row">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {status === "draft" ? "Siap dikirim ke Bea Cukai?" : "Sudah selesai memperbaiki?"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Pastikan semua dokumen wajib telah diunggah. Hasil OCR hanyalah panduan — keputusan akhir ada di tangan petugas.
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
