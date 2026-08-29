"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileText,
  PencilLine,
  Send,
  Sparkles,
  TimerReset,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Input, Label } from "@/components/ui/input";
import { WhatsAppDraftPanel } from "@/components/admin/WhatsAppDraftPanel";
import { confidenceLabel, confidenceTone } from "@/lib/ai-insights";
import { formatTanggal, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";
import type { ApplicationCase, ReviewDimension } from "@/lib/types";

function statusTone(status: ReviewDimension["status"]) {
  if (status === "disetujui") return "success";
  if (status === "membutuhkan_info") return "warning";
  if (status === "ditolak") return "danger";
  if (status === "direview") return "info";
  return "neutral";
}

function statusLabel(status: ReviewDimension["status"]) {
  return {
    baru: "AI Draft",
    direview: "Direview",
    disetujui: "Disetujui",
    membutuhkan_info: "Minta Info",
    ditolak: "Ditolak",
  }[status];
}

function diffChanged(dimension: ReviewDimension) {
  return (
    dimension.aiScore !== dimension.officerScore ||
    dimension.aiDraft !== dimension.officerDraft ||
    dimension.status !== "baru" ||
    Boolean(dimension.officerNote)
  );
}

function DimensionEditor({
  caseItem,
  dimension,
}: {
  caseItem: ApplicationCase;
  dimension: ReviewDimension;
}) {
  const updateDimension = useAdminStore((s) => s.updateDimension);
  const canReview = useCan("case.review");
  const [score, setScore] = React.useState(String(dimension.officerScore));
  const [draft, setDraft] = React.useState(dimension.officerDraft);
  const [note, setNote] = React.useState(dimension.officerNote ?? "");
  const [decisionReason, setDecisionReason] = React.useState(dimension.decisionReason ?? "");
  const [status, setStatus] = React.useState<ReviewDimension["status"]>(dimension.status);

  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{dimension.label}</CardTitle>
            <CardDescription>Pilar {dimension.pillarId} dari asesmen AI</CardDescription>
          </div>
          <Badge tone={statusTone(status)}>
            {statusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">AI Draft</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{dimension.aiDraft}</p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Skor AI: {dimension.aiScore}</p>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Officer Decision</p>
            <p className="mt-2 text-sm leading-relaxed text-sky-900">{draft}</p>
            <p className="mt-4 text-sm font-semibold text-sky-900">Skor officer: {Number(score) || 0}</p>
          </div>
        </div>

        {dimension.aiReason ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Alasan AI (Explainability)
              </p>
              {dimension.aiConfidence ? (
                <Badge tone={confidenceTone(dimension.aiConfidence)}>
                  {confidenceLabel(dimension.aiConfidence)}
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{dimension.aiReason}</p>
            {dimension.confidenceReason ? (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Catatan keyakinan: {dimension.confidenceReason}
              </p>
            ) : null}
            {dimension.aiConfidence === "rendah" ? (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                AI menandai dimensi ini <strong>perlu dicek manual</strong> sebelum keputusan diambil.
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`${dimension.id}-score`}>Score officer</Label>
            <Input id={`${dimension.id}-score`} type="number" min={0} max={100} value={score} onChange={(event) => setScore(event.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${dimension.id}-status`}>Status dimensi</Label>
            <select
              id={`${dimension.id}-status`}
              className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900"
              value={status}
              onChange={(event) => setStatus(event.target.value as ReviewDimension["status"])}
            >
              <option value="baru">AI Draft</option>
              <option value="direview">Direview</option>
              <option value="disetujui">Disetujui</option>
              <option value="membutuhkan_info">Minta Info</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${dimension.id}-draft`}>Teks rekomendasi officer</Label>
          <Textarea id={`${dimension.id}-draft`} value={draft} onChange={(event) => setDraft(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${dimension.id}-note`}>Catatan officer</Label>
          <Textarea id={`${dimension.id}-note`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tulis alasan singkat, koreksi AI, atau konteks tambahan." />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${dimension.id}-reason`}>Alasan status / keputusan</Label>
          <Textarea id={`${dimension.id}-reason`} value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} placeholder="Contoh: perlu lampiran komposisi lengkap untuk verifikasi status Lartas." />
        </div>

        {diffChanged(dimension) ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <Sparkles className="h-4 w-4" aria-hidden />
              Ada perbedaan dari AI Draft
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
              Officer telah mengubah skor, teks rekomendasi, status, atau menambahkan catatan.
              Perubahan ini akan dicatat di audit trail case {caseItem.id}.
            </p>
          </div>
        ) : null}

        {!canReview ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Peran Anda tidak memiliki izin menyunting review dimensi.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!canReview}
            onClick={() =>
              updateDimension(caseItem.id, dimension.id, {
                officerScore: Math.max(0, Math.min(100, Number(score) || 0)),
                officerDraft: draft,
                status,
                officerNote: note,
                decisionReason,
              })
            }
          >
            <PencilLine className="h-4 w-4" aria-hidden />
            Simpan Dimensi
          </Button>
          <Button variant="outline" onClick={() => {
            setScore(String(dimension.aiScore));
            setDraft(dimension.aiDraft);
            setNote("");
            setDecisionReason("");
            setStatus("baru");
          }}>
            <TimerReset className="h-4 w-4" aria-hidden />
            Reset ke AI Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminReviewWorkspace({ caseItem }: { caseItem: ApplicationCase }) {
  const addCaseNote = useAdminStore((s) => s.addCaseNote);
  const setCaseDecision = useAdminStore((s) => s.setCaseDecision);
  const submitReview = useAdminStore((s) => s.submitReview);
  const canDecide = useCan("case.decide");
  const [noteDraft, setNoteDraft] = React.useState("");
  const [finalReason, setFinalReason] = React.useState("");
  const [busyAction, setBusyAction] = React.useState<
    "submit" | "approve" | "request_info" | "reject" | "note" | null
  >(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = React.useState<"success" | "danger" | "primary">(
    "primary",
  );

  const changedDimensions = caseItem.dimensions.filter(diffChanged);
  const lastTimeline = [...caseItem.timeline, ...caseItem.auditTrail]
    .map((entry) =>
      "tanggal" in entry
        ? {
            id: entry.id,
            kind: entry.kind,
            title: entry.judul,
            detail: entry.detail,
            actor: entry.aktor,
            date: entry.tanggal,
          }
        : {
            id: entry.id,
            kind: "audit" as const,
            title: entry.action,
            detail: [entry.field, entry.before, entry.after, entry.note]
              .filter(Boolean)
              .join(" · "),
            actor: entry.officer,
            date: entry.timestamp,
          },
    )
    .sort((left, right) => +new Date(right.date) - +new Date(left.date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {statusMessage ? (
        <Alert tone={feedbackTone} judul={feedbackTone === "success" ? "Tersimpan" : feedbackTone === "danger" ? "Gagal" : "Info"}>
          {statusMessage}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{caseItem.status}</Badge>
              <Badge tone="neutral">Level {caseItem.readinessLevel}</Badge>
              <Badge tone="success">Skor {caseItem.readinessScore}</Badge>
            </div>
            <CardTitle className="mt-2 text-2xl">{caseItem.businessName}</CardTitle>
            <CardDescription>
              {caseItem.ownerName} · {caseItem.city}, {caseItem.province}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">AI Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{caseItem.aiSummary}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Info utama</p>
              <dl className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <dt>Email</dt><dd className="font-medium">{caseItem.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Telepon</dt><dd className="font-medium">{caseItem.phone}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Masuk</dt><dd className="font-medium">{formatTanggal(caseItem.submittedAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Update</dt><dd className="font-medium">{formatTanggal(caseItem.lastUpdatedAt)}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Decision Center</CardTitle>
            <CardDescription>Approval final, reject, atau minta info tambahan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canDecide ? (
              <Alert tone="warning" judul="Tidak bisa mengambil keputusan">
                Peran Anda tidak memiliki izin <span className="font-semibold">case.decide</span>.
                Anda masih dapat meninjau, tetapi keputusan akhir harus diambil peran lain.
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="final-reason">Alasan keputusan akhir</Label>
              <Textarea id="final-reason" value={finalReason} onChange={(event) => setFinalReason(event.target.value)} placeholder="Tulis alasan singkat dan dapat diaudit." />
            </div>

            <div className="flex flex-col gap-3">
              {caseItem.status === "baru" ? (
                <Button
                  disabled={busyAction !== null || !canDecide}
                  onClick={async () => {
                    setStatusMessage(null);
                    setBusyAction("submit");
                    await new Promise((resolve) => window.setTimeout(resolve, 300));
                    submitReview(caseItem.id);
                    setBusyAction(null);
                    setFeedbackTone("success");
                    setStatusMessage("Pengajuan masuk ke workspace review.");
                  }}
                >
                  <Send className="h-4 w-4" aria-hidden />
                  {busyAction === "submit" ? "Memproses..." : "Mulai Review"}
                </Button>
              ) : null}
              <Button
                disabled={busyAction !== null || !canDecide}
                onClick={async () => {
                  setStatusMessage(null);
                  setBusyAction("approve");
                  await new Promise((resolve) => window.setTimeout(resolve, 300));
                  setCaseDecision(caseItem.id, "disetujui", finalReason || "Disetujui oleh officer.", "approve");
                  setBusyAction(null);
                  setFeedbackTone("success");
                  setStatusMessage("Keputusan approve sudah dikirim ke UMKM.");
                }}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {busyAction === "approve" ? "Memproses..." : "Approve & Kirim ke UMKM"}
              </Button>
              <Button
                variant="outline"
                disabled={busyAction !== null || !canDecide}
                onClick={async () => {
                  if (!finalReason.trim()) {
                    setFeedbackTone("danger");
                    setStatusMessage("Alasan wajib diisi untuk meminta info tambahan.");
                    return;
                  }
                  setStatusMessage(null);
                  setBusyAction("request_info");
                  await new Promise((resolve) => window.setTimeout(resolve, 300));
                  setCaseDecision(caseItem.id, "membutuhkan_info", finalReason, "request_info");
                  setBusyAction(null);
                  setFeedbackTone("success");
                  setStatusMessage("Permintaan info tambahan sudah dikirim.");
                }}
              >
                <CircleAlert className="h-4 w-4" aria-hidden />
                {busyAction === "request_info" ? "Memproses..." : "Minta Info Tambahan"}
              </Button>
              <Button
                variant="danger"
                disabled={busyAction !== null || !canDecide}
                onClick={async () => {
                  if (!finalReason.trim()) {
                    setFeedbackTone("danger");
                    setStatusMessage("Alasan wajib diisi untuk menolak pengajuan.");
                    return;
                  }
                  if (!window.confirm(`Tolak pengajuan ${caseItem.businessName}?`)) {
                    return;
                  }
                  setStatusMessage(null);
                  setBusyAction("reject");
                  await new Promise((resolve) => window.setTimeout(resolve, 300));
                  setCaseDecision(caseItem.id, "ditolak", finalReason, "reject");
                  setBusyAction(null);
                  setFeedbackTone("success");
                  setStatusMessage("Keputusan penolakan sudah dicatat.");
                }}
              >
                <AlertTriangle className="h-4 w-4" aria-hidden />
                {busyAction === "reject" ? "Memproses..." : "Reject"}
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Perubahan yang sudah terjadi</p>
              <p className="mt-2">{changedDimensions.length} dimensi sudah memiliki perubahan dari AI Draft.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {caseItem.dimensions.map((dimension) => (
          <DimensionEditor key={dimension.id} caseItem={caseItem} dimension={dimension} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Perbedaan AI Draft vs Officer Decision</CardTitle>
            <CardDescription>Ringkasan perubahan yang paling penting untuk diaudit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {changedDimensions.length > 0 ? (
              changedDimensions.map((dimension) => (
                <div key={dimension.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{dimension.label}</p>
                    <Badge tone={statusTone(dimension.status)}>{statusLabel(dimension.status)}</Badge>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">AI</p>
                      <p className="mt-2 text-sm text-slate-700">Skor {dimension.aiScore}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{dimension.aiDraft}</p>
                    </div>
                    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-sky-700">Officer</p>
                      <p className="mt-2 text-sm font-semibold text-sky-900">Skor {dimension.officerScore}</p>
                      <p className="mt-2 text-sm leading-relaxed text-sky-900">{dimension.officerDraft}</p>
                    </div>
                  </div>
                  {dimension.officerNote ? <p className="mt-3 text-sm text-slate-600">Catatan: {dimension.officerNote}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                Belum ada perubahan officer dari AI Draft.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Timeline & Audit Trail</CardTitle>
            <CardDescription>Riwayat chronology yang mencakup event, review, dan keputusan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {lastTimeline.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={entry.kind === "audit" ? "accent" : entry.kind === "officer" ? "success" : "neutral"}>{entry.kind}</Badge>
                    <span className="text-xs text-slate-500">{formatTanggalPendek(entry.date)}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{entry.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.detail}</p>
                  <p className="mt-2 text-xs text-slate-500">oleh {entry.actor}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="case-note">Catatan officer baru</Label>
              <Textarea id="case-note" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Tambahkan catatan singkat yang akan masuk audit trail." />
            </div>
            <Button
              variant="outline"
              disabled={busyAction !== null}
              onClick={async () => {
                if (!noteDraft.trim()) {
                  setFeedbackTone("danger");
                  setStatusMessage("Catatan tidak boleh kosong.");
                  return;
                }
                setStatusMessage(null);
                setBusyAction("note");
                await new Promise((resolve) => window.setTimeout(resolve, 200));
                addCaseNote(caseItem.id, noteDraft.trim());
                setNoteDraft("");
                setBusyAction(null);
                setFeedbackTone("success");
                setStatusMessage("Catatan officer berhasil disimpan.");
              }}
            >
              <FileText className="h-4 w-4" aria-hidden />
              {busyAction === "note" ? "Menyimpan..." : "Simpan Catatan"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Raw Assessment Answers</CardTitle>
            <CardDescription>Jawaban mentah disimpan apa adanya untuk audit dan integrasi backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Pertanyaan</th>
                    <th className="px-4 py-3">Jawaban</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(caseItem.rawAnswers).map(([questionId, answer]) => (
                    <tr key={questionId} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-700">{questionId}</td>
                      <td className="px-4 py-3 text-slate-600">{Array.isArray(answer) ? answer.join(", ") : answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Dokumen & Pre-check</CardTitle>
            <CardDescription>Invoice/Packing List bisa diberi tanda jika backend menyediakan validasi isi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {caseItem.documents.map((document) => (
                <div key={document.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{document.nama}</p>
                      <p className="mt-1 text-sm text-slate-600">{document.keterangan}</p>
                    </div>
                    <Badge tone={document.status === "diverifikasi" ? "success" : document.status === "revisi" ? "warning" : document.status === "diunggah" ? "info" : "neutral"}>
                      {document.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {caseItem.precheckFindings?.length ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">Temuan pre-check</p>
                {caseItem.precheckFindings.map((finding) => (
                  <div key={`${finding.documentId}-${finding.field}`} className="rounded-lg bg-white p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{finding.documentName} · {finding.field}</p>
                    <p className="mt-1">{finding.issue}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{finding.severity}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                Belum ada hasil pre-check dokumen.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WhatsAppDraftPanel caseItem={caseItem} />

      <Alert tone="primary" judul="Pengiriman keputusan">
        <p className="mb-3 text-sm leading-relaxed">
          Saat approval dikirim, status case akan disimpan di audit trail dan UMKM dapat menerima versi final dari officer. Semua perubahan dimensi harus tetap bisa ditelusuri.
        </p>
        <Link href="/admin/pengajuan">
          <Button variant="subtle" size="sm">
            Kembali ke Daftar Pengajuan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </Alert>
    </div>
  );
}
