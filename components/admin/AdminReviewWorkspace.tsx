"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  FileText,
  Send,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Label } from "@/components/ui/input";
import { DocumentReviewList } from "@/components/admin/DocumentReviewList";
import { WhatsAppDraftPanel } from "@/components/admin/WhatsAppDraftPanel";
import { DATA_USAHA_LABEL, STATUS_LABEL } from "@/lib/admin-data";
import { slaInfo, slaTone } from "@/lib/sla";
import { formatTanggal, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";
import type { ApplicationCase, BusinessApprovalStatus, ReviewStage } from "@/lib/types";

function statusTone(status: ReviewStage) {
  if (status === "disetujui") return "success";
  if (status === "membutuhkan_info") return "warning";
  if (status === "ditolak") return "danger";
  if (status === "direview") return "info";
  return "neutral";
}

function dataUsahaTone(status: BusinessApprovalStatus) {
  if (status === "disetujui") return "success";
  if (status === "ditolak") return "danger";
  return "warning";
}

function InfoBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-gray-500">{title}</p>
      <dl className="mt-3 space-y-2 text-sm text-gray-700">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt>{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function AdminReviewWorkspace({ caseItem }: { caseItem: ApplicationCase }) {
  const addCaseNote = useAdminStore((s) => s.addCaseNote);
  const setCaseDecision = useAdminStore((s) => s.setCaseDecision);
  const submitReview = useAdminStore((s) => s.submitReview);
  const canDecide = useCan("case.decide");
  const canReview = useCan("case.review");

  const [noteDraft, setNoteDraft] = React.useState("");
  const [finalReason, setFinalReason] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = React.useState<"success" | "danger" | "primary">("primary");

  const sla = slaInfo(caseItem);
  const ocrTemuan = caseItem.documents.filter((doc) => doc.ocr && doc.ocr.status !== "cocok").length;

  const feed = [
    ...caseItem.timeline.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      title: entry.judul,
      detail: entry.detail,
      actor: entry.aktor,
      date: entry.tanggal,
    })),
    ...caseItem.auditTrail.map((entry) => ({
      id: entry.id,
      kind: "audit" as const,
      title: entry.action,
      detail: [entry.field, entry.before, entry.after, entry.note].filter(Boolean).join(" · "),
      actor: entry.admin,
      date: entry.timestamp,
    })),
  ]
    .sort((left, right) => +new Date(right.date) - +new Date(left.date))
    .slice(0, 6);

  const decide = (decision: ReviewStage, message: string, requireReason: boolean) => {
    if (requireReason && !finalReason.trim()) {
      setFeedbackTone("danger");
      setStatusMessage("Alasan keputusan wajib diisi.");
      return;
    }
    if (decision === "ditolak" && !window.confirm(`Tolak pengajuan ${caseItem.businessName}?`)) {
      return;
    }
    setCaseDecision(caseItem.id, decision, finalReason || message);
    setFeedbackTone("success");
    setStatusMessage(message);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/pengajuan"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
        Kembali ke daftar pengajuan
      </Link>

      {statusMessage ? (
        <Alert
          tone={feedbackTone}
          judul={feedbackTone === "success" ? "Tersimpan" : feedbackTone === "danger" ? "Perlu dilengkapi" : "Info"}
        >
          {statusMessage}
        </Alert>
      ) : null}

      {/* 1. Ringkasan */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(caseItem.status)}>{STATUS_LABEL[caseItem.status]}</Badge>
            <Badge tone={dataUsahaTone(caseItem.dataUsaha)}>
              Data usaha: {DATA_USAHA_LABEL[caseItem.dataUsaha]}
            </Badge>
            <Badge tone={slaTone(sla.level)}>{sla.level === "selesai" ? "Selesai diproses" : sla.label}</Badge>
            {ocrTemuan > 0 ? <Badge tone="warning">{ocrTemuan} temuan OCR</Badge> : null}
          </div>
          <CardTitle className="mt-2 text-2xl">{caseItem.businessName}</CardTitle>
          <CardDescription>
            {caseItem.ownerName} · {caseItem.city}, {caseItem.province} · {caseItem.id}
          </CardDescription>
          <a
            href="#keputusan"
            className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            Ke blok keputusan ↓
          </a>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoBlock
            title="Kontak"
            rows={[
              ["Email", caseItem.email],
              ["Telepon", caseItem.phone],
              ["Masuk", formatTanggal(caseItem.submittedAt)],
              ["Update", formatTanggal(caseItem.lastUpdatedAt)],
            ]}
          />
          <InfoBlock
            title="Rencana ekspor"
            rows={[
              ["Produk", caseItem.namaProduk],
              ["Negara tujuan", caseItem.negaraTujuan],
              ["HS Code", caseItem.hsCode || "-"],
              ["Nilai ekspor", `USD ${caseItem.nilaiEkspor}`],
            ]}
          />
        </CardContent>
      </Card>

      {/* 2. Dokumen & OCR */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Dokumen &amp; Hasil OCR</CardTitle>
          <CardDescription>
            Klik satu dokumen untuk membuka isinya. Tiap dokumen PDF dibandingkan otomatis dengan
            template contoh — catatan ketidaksesuaian ada di dalam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentReviewList caseItem={caseItem} />
        </CardContent>
      </Card>

      {/* 3. Timeline & catatan (collapsible) */}
      <Card className="border-gray-200">
        <details>
          <summary className="cursor-pointer px-6 py-4 text-lg font-semibold text-gray-900 marker:text-gray-400">
            Timeline &amp; catatan internal
          </summary>
          <div className="space-y-4 border-t border-gray-200 px-6 py-5">
            <div className="space-y-3">
              {feed.map((entry) => (
                <div key={`${entry.kind}-${entry.id}`} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={entry.kind === "audit" ? "accent" : entry.kind === "officer" ? "success" : "neutral"}
                    >
                      {entry.kind === "audit" ? "audit" : entry.kind === "officer" ? "admin" : entry.kind}
                    </Badge>
                    <span className="text-xs text-gray-500">{formatTanggalPendek(entry.date)}</span>
                  </div>
                  <p className="mt-2 font-semibold text-gray-900">{entry.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{entry.detail || "-"}</p>
                  <p className="mt-2 text-xs text-gray-500">oleh {entry.actor}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="case-note">Catatan internal admin</Label>
              <Textarea
                id="case-note"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Catatan singkat yang masuk audit trail (tidak dikirim ke UMKM)."
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (!noteDraft.trim()) {
                  setFeedbackTone("danger");
                  setStatusMessage("Catatan tidak boleh kosong.");
                  return;
                }
                addCaseNote(caseItem.id, noteDraft.trim());
                setNoteDraft("");
                setFeedbackTone("success");
                setStatusMessage("Catatan admin berhasil disimpan.");
              }}
            >
              <FileText className="h-4 w-4" aria-hidden />
              Simpan Catatan
            </Button>

            {caseItem.internalNotes?.length ? (
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Catatan tersimpan
                </p>
                {caseItem.internalNotes.map((note, index) => (
                  <p key={index} className="text-sm text-gray-700">• {note}</p>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      </Card>

      {/* 4. Draf WhatsApp (collapsible) */}
      <Card className="border-gray-200">
        <details>
          <summary className="cursor-pointer px-6 py-4 text-lg font-semibold text-gray-900 marker:text-gray-400">
            Draf pesan WhatsApp ke UMKM
          </summary>
          <div className="border-t border-gray-200 px-6 py-5">
            <WhatsAppDraftPanel caseItem={caseItem} embedded />
          </div>
        </details>
      </Card>

      {/* 5. Keputusan (di bawah) */}
      <Card id="keputusan" className="border-gray-200 scroll-mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Keputusan Pengajuan</CardTitle>
          <CardDescription>Setujui, minta info tambahan, atau tolak pengajuan ekspor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canDecide ? (
            <Alert tone="warning" judul="Tidak bisa mengambil keputusan">
              Peran Anda tidak memiliki izin <span className="font-semibold">case.decide</span>. Anda masih
              dapat meninjau dokumen dan catatan OCR.
            </Alert>
          ) : null}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              Persetujuan data usaha
            </p>
            <p className="mt-2">
              Status: <span className="font-medium">{DATA_USAHA_LABEL[caseItem.dataUsaha]}</span>
              {caseItem.dataUsahaCatatan ? ` — ${caseItem.dataUsahaCatatan}` : ""}
            </p>
            <Link href="/admin/data-usaha" className="mt-3 inline-block">
              <Button size="sm" variant="subtle">Buka halaman persetujuan data usaha</Button>
            </Link>
          </div>

          <div className="space-y-2">
            <Label htmlFor="final-reason">Alasan keputusan</Label>
            <Textarea
              id="final-reason"
              value={finalReason}
              onChange={(event) => setFinalReason(event.target.value)}
              placeholder="Tulis alasan singkat dan dapat diaudit."
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {caseItem.status === "baru" ? (
              <Button
                disabled={!canDecide}
                onClick={() => {
                  submitReview(caseItem.id);
                  setFeedbackTone("success");
                  setStatusMessage("Pengajuan ditandai sedang direview.");
                }}
              >
                <Send className="h-4 w-4" aria-hidden />
                Mulai Review
              </Button>
            ) : null}
            <Button
              disabled={!canDecide}
              onClick={() => decide("disetujui", "Pengajuan disetujui dan siap dikabari ke UMKM.", false)}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Setujui Pengajuan
            </Button>
            <Button
              variant="outline"
              disabled={!canDecide}
              onClick={() => decide("membutuhkan_info", "Permintaan info tambahan sudah dicatat.", true)}
            >
              <CircleAlert className="h-4 w-4" aria-hidden />
              Minta Info Tambahan
            </Button>
            <Button
              variant="danger"
              disabled={!canDecide}
              onClick={() => decide("ditolak", "Keputusan penolakan sudah dicatat.", true)}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Tolak Pengajuan
            </Button>
          </div>
        </CardContent>
      </Card>

      {!canReview ? (
        <Alert tone="neutral">
          Peran Anda hanya bisa melihat. Semua tombol keputusan dan verifikasi dokumen dinonaktifkan.
        </Alert>
      ) : null}
    </div>
  );
}
