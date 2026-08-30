"use client";

import * as React from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { useViewableUrl } from "@/lib/file-url";

interface FilePreviewModalProps {
  open: boolean;
  fileUrl: string | null | undefined;
  namaFile?: string;
  onClose: () => void;
}

export function FilePreviewModal({
  open,
  fileUrl,
  namaFile,
  onClose,
}: FilePreviewModalProps) {
  const blobUrl = useViewableUrl(open ? fileUrl : null);

  // Tutup dengan Escape
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  // Cegah scroll body saat modal terbuka
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isPdf =
    namaFile?.toLowerCase().endsWith(".pdf") ||
    fileUrl?.startsWith("data:application/pdf") ||
    (blobUrl && !isImageUrl(blobUrl, namaFile));

  function handleDownload() {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = namaFile ?? "dokumen";
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={namaFile ?? "Pratinjau dokumen"}
    >
      <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <p className="truncate text-sm font-semibold text-gray-900">
            {namaFile ?? "Pratinjau Dokumen"}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {blobUrl && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Unduh"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Buka di tab baru"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Tutup"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 overflow-hidden bg-gray-50">
          {!blobUrl ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <svg
                  className="h-8 w-8 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                <p className="text-sm">Memuat dokumen…</p>
              </div>
            </div>
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={namaFile ?? "Dokumen"}
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center overflow-auto p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt={namaFile ?? "Dokumen"}
                className="max-h-full max-w-full rounded-lg object-contain shadow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Cek apakah URL / nama file merupakan gambar */
function isImageUrl(url: string, nama?: string): boolean {
  const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];
  const lower = (nama ?? url).toLowerCase();
  return imageExts.some((ext) => lower.endsWith(ext));
}
