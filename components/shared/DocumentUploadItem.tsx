"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clock, FileText, Upload } from "lucide-react";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FilePreviewModal } from "@/components/shared/FilePreviewModal";
import { runOcr } from "@/lib/ocr-engine";
import { formatTanggalPendek } from "@/lib/utils";
import type { DocumentItem, DocumentOcrResult, OcrContext } from "@/lib/types";

interface Props {
  doc: DocumentItem;
  pengajuanId: string;
  bolehEdit: boolean;
  /** Data pengajuan/usaha untuk pencocokan silang OCR. */
  ocrContext?: OcrContext;
  onUpload: (docId: string, namaFile: string, fileUrl?: string, ocr?: DocumentOcrResult) => void;
}

const statusColor = {
  diverifikasi: "bg-green-100 text-green-700",
  revisi:       "bg-amber-100 text-amber-700",
  diunggah:     "bg-sky-100 text-sky-700",
  belum:        "bg-gray-100 text-gray-400",
};

export function DocumentUploadItem({ doc, bolehEdit, ocrContext, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const adaBerkas = doc.status === "diunggah" || doc.status === "diverifikasi";
  const iconCls = statusColor[doc.status] ?? statusColor.belum;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

    // OCR runs silently in the background — result saved to store for admin only
    let ocrResult: DocumentOcrResult | undefined;
    try {
      ocrResult = await runOcr(doc.id, file, dataUrl, ocrContext);
    } catch {
      ocrResult = undefined;
    }

    const fileUrlToStore = file.size <= 3_000_000 ? dataUrl : undefined;
    onUpload(doc.id, file.name, fileUrlToStore, ocrResult);
    setUploading(false);
  };

  return (
    <>
      <FilePreviewModal
        open={preview}
        fileUrl={doc.fileUrl}
        namaFile={doc.namaFile}
        onClose={() => setPreview(false)}
      />
    <li className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: icon + info */}
      <div className="flex items-start gap-4">
        <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconCls}`}>
          {doc.status === "diverifikasi" ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : doc.status === "revisi" ? (
            <Clock className="h-5 w-5" aria-hidden />
          ) : (
            <FileText className="h-5 w-5" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{doc.nama}</h3>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${doc.wajib ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>
              {doc.wajib ? "Wajib" : "Opsional"}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{doc.keterangan}</p>

          {/* File info */}
          {doc.namaFile && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400" aria-hidden />
              <span className="font-medium text-gray-900">{doc.namaFile}</span>
              {doc.fileUrl ? (
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className="ml-1 font-semibold text-primary-700 hover:underline"
                >
                  Lihat
                </button>
              ) : (
                <span className="ml-1 text-xs text-amber-600">
                  (file terlalu besar, tidak bisa ditampilkan)
                </span>
              )}
            </div>
          )}

          {/* Catatan petugas (tetap tampil agar UMKM tahu apa yang perlu diperbaiki) */}
          {doc.catatanPetugas && (
            <Alert tone="warning" className="mt-3 py-2">
              <p className="text-sm font-medium">Catatan petugas:</p>
              <p className="text-sm">{doc.catatanPetugas}</p>
              {doc.catatanPetugasOleh ? (
                <p className="mt-1 text-xs text-amber-700/80">
                  Diminta oleh {doc.catatanPetugasOleh}
                  {doc.catatanPetugasPeran ? ` — ${doc.catatanPetugasPeran}` : ""}
                  {doc.catatanPetugasPada ? ` · ${formatTanggalPendek(doc.catatanPetugasPada)}` : ""}
                </p>
              ) : null}
            </Alert>
          )}
        </div>
      </div>

      {/* Right: action buttons */}
      {bolehEdit && (
        <div className="mt-2 flex flex-col gap-3 sm:mt-0 sm:shrink-0 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            aria-label={`Unggah berkas ${doc.nama}`}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {!adaBerkas && (
            <Link
              href={`/panduan/dokumen/${doc.id}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-300 bg-primary-50 px-4 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
            >
              Cara membuat
            </Link>
          )}
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            {uploading ? "Mengunggah…" : adaBerkas ? "Ganti Berkas" : "Unggah"}
          </Button>
        </div>
      )}
    </li>
    </>  
  );
}
