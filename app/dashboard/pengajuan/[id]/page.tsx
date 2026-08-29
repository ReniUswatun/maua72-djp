"use client";

import { useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Upload,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatTanggalPendek } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

export default function PengajuanDetailPage({ params }: { params: { id: string } }) {
  const pengajuan = useAppStore((s) => s.pengajuan.find((p) => p.id === params.id));
  const unggah = useAppStore((s) => s.unggahDokumenPengajuan);
  const kirim = useAppStore((s) => s.kirimPengajuan);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!pengajuan) {
    notFound();
  }

  const { dokumen, status } = pengajuan;
  const sudahDikirim = status !== "draft";
  const semuaWajibDiupload = dokumen.filter((d) => d.wajib).every((d) => d.status === "diunggah" || d.status === "diverifikasi");

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Pengajuan: {pengajuan.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Dibuat pada {formatTanggalPendek(pengajuan.tanggal)}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
          status === 'draft' ? 'bg-gray-100 text-gray-800' :
          status === 'review' ? 'bg-blue-100 text-blue-800' :
          status === 'revisi' ? 'bg-red-100 text-red-800' :
          'bg-green-100 text-green-800'
        }`}>
          {status === 'draft' ? 'Draft' :
           status === 'review' ? 'Sedang Direview Bea Cukai' :
           status === 'revisi' ? 'Perlu Revisi Dokumen' : 'Selesai / Disetujui'}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Rincian Ekspor</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2">
              <dt className="text-gray-500">Produk</dt>
              <dd className="font-medium text-gray-900">{pengajuan.namaProduk}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-500">Negara Tujuan</dt>
              <dd className="font-medium text-gray-900">{pengajuan.negaraTujuan}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-500">Nilai Ekspor</dt>
              <dd className="font-medium text-gray-900">USD {pengajuan.nilaiEkspor}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-500">HS Code</dt>
              <dd className="font-medium text-gray-900">{pengajuan.hsCode || "-"}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Rincian Pengiriman</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2">
              <dt className="text-gray-500">Pembeli (Consignee)</dt>
              <dd className="font-medium text-gray-900">{pengajuan.pembeli}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-500">Tanggal Pengiriman</dt>
              <dd className="font-medium text-gray-900">{formatTanggalPendek(pengajuan.tanggalKirim)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Checklist Dokumen</h2>
        <p className="mt-2 text-sm text-gray-600">
          Unggah dokumen yang diperlukan untuk pengajuan ekspor ini.
        </p>

        <ul className="mt-8 space-y-6">
          {dokumen.map((d) => (
            <li key={d.id} className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    d.status === "diunggah" || d.status === "diverifikasi"
                      ? "bg-green-100 text-green-700"
                      : d.wajib
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {d.status === "diunggah" || d.status === "diverifikasi" ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden />
                  ) : d.status === "revisi" ? (
                    <Clock className="h-5 w-5 text-red-500" aria-hidden />
                  ) : (
                    <FileText className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {d.nama}{" "}
                    {d.wajib ? (
                      <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                        Wajib
                      </span>
                    ) : (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                        Opsional
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{d.keterangan}</p>
                  
                  {d.namaFile ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{d.namaFile}</span>
                    </div>
                  ) : null}

                  {d.catatanPetugas && d.status === "revisi" ? (
                    <Alert tone="danger" className="mt-3 border-red-200 bg-red-50 py-2">
                      <p className="text-sm font-medium text-red-900">Catatan Revisi:</p>
                      <p className="text-sm text-red-800">{d.catatanPetugas}</p>
                    </Alert>
                  ) : null}
                </div>
              </div>

              {!sudahDikirim || status === "revisi" ? (
                <div className="mt-2 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:items-center sm:shrink-0">
                  <input
                    ref={(el) => {
                      inputRefs.current[d.id] = el;
                    }}
                    type="file"
                    className="sr-only"
                    aria-label={`Unggah berkas ${d.nama}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) unggah(pengajuan.id, d.id, file.name);
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
                  <Button
                    variant="outline"
                    onClick={() => inputRefs.current[d.id]?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" aria-hidden />
                    {d.namaFile ? "Ganti Berkas" : "Unggah"}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>

        {status === "draft" && (
          <div className="mt-10 border-t border-gray-200 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-50 p-6 sm:flex-row">
              <div>
                <h3 className="font-semibold text-gray-900">Siap dikirim ke Bea Cukai?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Pastikan semua dokumen wajib telah diunggah dengan benar sebelum mengirim.
                </p>
              </div>
              <Button 
                size="lg" 
                disabled={!semuaWajibDiupload}
                onClick={() => kirim(pengajuan.id)}
              >
                <Send className="mr-2 h-4 w-4" />
                Kirim Pengajuan
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
