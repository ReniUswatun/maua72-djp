"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  FileText,
  ScanLine,
  TriangleAlert,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";
import type { ApplicationCase, DocStatus, DocumentItem } from "@/lib/types";

const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  belum: "Belum diunggah",
  diunggah: "Menunggu verifikasi",
  diverifikasi: "Diverifikasi",
  revisi: "Perlu revisi",
};

function docTone(status: DocStatus): "neutral" | "info" | "success" | "warning" {
  if (status === "diverifikasi") return "success";
  if (status === "revisi") return "warning";
  if (status === "diunggah") return "info";
  return "neutral";
}

function ocrBadgeTone(status: NonNullable<DocumentItem["ocr"]>["status"]) {
  if (status === "cocok") return "success" as const;
  if (status === "perlu_perbaikan") return "warning" as const;
  if (status === "gagal_baca") return "danger" as const;
  return "neutral" as const;
}

function ocrBadgeLabel(status: NonNullable<DocumentItem["ocr"]>["status"]) {
  return {
    cocok: "OCR cocok",
    perlu_perbaikan: "OCR: perlu perbaikan",
    gagal_baca: "OCR gagal baca",
    belum_dibaca: "Belum dibaca OCR",
  }[status];
}

/** Dialog sederhana untuk melihat berkas PDF yang diunggah UMKM. */
function PdfDialog({
  doc,
  onClose,
}: {
  doc: DocumentItem;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup pratinjau"
        className="absolute inset-0 h-full w-full bg-gray-950/60"
        onClick={onClose}
      />
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lift">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{doc.nama}</p>
            <p className="truncate text-xs text-gray-500">{doc.namaFile ?? "berkas.pdf"}</p>
          </div>
          <div className="flex items-center gap-2">
            {doc.fileUrl ? (
              <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  Buka di tab baru
                </Button>
              </a>
            ) : null}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-100">
          {doc.fileUrl ? (
            <iframe title={`Pratinjau ${doc.nama}`} src={doc.fileUrl} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500">
              Berkas belum tersedia untuk pengajuan ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OcrPanel({ doc }: { doc: DocumentItem }) {
  const ocr = doc.ocr;
  if (!ocr) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-500">
        Dokumen ini belum dibaca OCR (biasanya karena belum diunggah).
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ScanLine className="h-4 w-4 text-gray-500" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
          Hasil OCR
        </span>
        <Badge tone={ocrBadgeTone(ocr.status)}>{ocrBadgeLabel(ocr.status)}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{ocr.ringkas}</p>
      <p className="text-xs text-gray-500">
        Dibandingkan dengan: <span className="font-medium text-gray-700">{ocr.template}</span> ·
        diperiksa {formatTanggalPendek(ocr.diperiksaPada)}
      </p>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Kolom</th>
              <th className="px-3 py-2 text-left">Terbaca di PDF</th>
              <th className="px-3 py-2 text-left">Sesuai template</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ocr.temuan.map((temuan) => (
              <tr key={temuan.field} className={temuan.sesuai ? "" : "bg-amber-50/60"}>
                <td className="px-3 py-2 font-medium text-gray-700">{temuan.field}</td>
                <td className="px-3 py-2 text-gray-600">{temuan.terbaca || "-"}</td>
                <td className="px-3 py-2">
                  {temuan.sesuai ? (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="h-4 w-4" aria-hidden /> Cocok
                    </span>
                  ) : (
                    <span className="inline-flex items-start gap-1 text-amber-800">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span>
                        Beda — diharapkan <span className="font-medium">{temuan.diharapkan}</span>
                        {temuan.catatan ? <span className="block text-xs text-amber-700">{temuan.catatan}</span> : null}
                      </span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentRow({
  caseId,
  doc,
  onView,
}: {
  caseId: string;
  doc: DocumentItem;
  onView: (doc: DocumentItem) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const canReview = useCan("case.review");
  const updateDocStatus = useAdminStore((s) => s.setDocStatus);

  const hasFile = Boolean(doc.namaFile);
  const needsAttention = doc.ocr && doc.ocr.status !== "cocok";

  return (
    <li className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            doc.status === "diverifikasi"
              ? "bg-green-100 text-green-700"
              : doc.status === "belum"
                ? "bg-gray-100 text-gray-400"
                : needsAttention
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sky-100 text-sky-700",
          )}
        >
          {doc.status === "diverifikasi" ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : doc.status === "belum" ? (
            <CircleDashed className="h-5 w-5" aria-hidden />
          ) : needsAttention ? (
            <TriangleAlert className="h-5 w-5" aria-hidden />
          ) : (
            <FileText className="h-5 w-5" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">{doc.nama}</span>
            {doc.wajib ? (
              <Badge tone="neutral" className="text-[10px]">Wajib</Badge>
            ) : (
              <Badge tone="neutral" className="text-[10px]">Opsional</Badge>
            )}
            <Badge tone={docTone(doc.status)}>{DOC_STATUS_LABEL[doc.status]}</Badge>
            {doc.ocr ? <Badge tone={ocrBadgeTone(doc.ocr.status)}>{ocrBadgeLabel(doc.ocr.status)}</Badge> : null}
          </span>
          <span className="mt-0.5 block truncate text-xs text-gray-500">
            {hasFile ? doc.namaFile : "Belum ada berkas"}
            {doc.tanggal ? ` · ${formatTanggalPendek(doc.tanggal)}` : ""}
          </span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4">
          <p className="text-sm text-gray-600">{doc.keterangan}</p>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={!hasFile} onClick={() => onView(doc)}>
              <FileText className="h-4 w-4" aria-hidden />
              {hasFile ? "Lihat PDF" : "Berkas belum ada"}
            </Button>
            {canReview && hasFile ? (
              <>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => updateDocStatus(caseId, doc.id, "diverifikasi")}
                >
                  Tandai diverifikasi
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const catatan = window.prompt("Catatan revisi untuk UMKM:", doc.catatanPetugas ?? "");
                    if (catatan !== null) updateDocStatus(caseId, doc.id, "revisi", catatan || undefined);
                  }}
                >
                  Minta revisi
                </Button>
              </>
            ) : null}
          </div>

          {doc.catatanPetugas ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              <span className="font-semibold">Catatan petugas: </span>
              {doc.catatanPetugas}
            </p>
          ) : null}

          <OcrPanel doc={doc} />
        </div>
      ) : null}
    </li>
  );
}

export function DocumentReviewList({ caseItem }: { caseItem: ApplicationCase }) {
  const [viewing, setViewing] = React.useState<DocumentItem | null>(null);

  const wajib = caseItem.documents.filter((doc) => doc.wajib);
  const terunggah = wajib.filter((doc) => doc.status !== "belum").length;
  const perluPerbaikan = caseItem.documents.filter(
    (doc) => doc.ocr && doc.ocr.status !== "cocok",
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <Badge tone={terunggah === wajib.length ? "success" : "neutral"}>
          {terunggah}/{wajib.length} dokumen wajib terunggah
        </Badge>
        {perluPerbaikan > 0 ? (
          <Badge tone="warning">{perluPerbaikan} dokumen perlu perbaikan menurut OCR</Badge>
        ) : (
          <Badge tone="success">Tidak ada temuan OCR</Badge>
        )}
      </div>

      <ul className="space-y-2">
        {caseItem.documents.map((doc) => (
          <DocumentRow key={doc.id} caseId={caseItem.id} doc={doc} onView={setViewing} />
        ))}
      </ul>

      {viewing ? <PdfDialog doc={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}
