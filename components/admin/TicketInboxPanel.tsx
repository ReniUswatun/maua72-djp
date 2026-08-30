"use client";

import * as React from "react";
import { ArrowLeft, CheckCircle2, Send, ShieldCheck, UserRound } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import { formatTanggal, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";
import { useAppStore } from "@/store/assessment-store";
import type { ConsultationTicket, TicketStatus } from "@/lib/types";

const STATUS_META: Record<TicketStatus, { label: string; tone: "warning" | "info" | "success" }> = {
  menunggu: { label: "Menunggu jawaban admin", tone: "warning" },
  dijawab: { label: "Sudah dijawab", tone: "info" },
  selesai: { label: "Selesai", tone: "success" },
};

function TicketThread({
  ticket,
  onBack,
  canReply,
}: {
  ticket: ConsultationTicket;
  onBack: () => void;
  canReply: boolean;
}) {
  const jawabTiket = useAppStore((s) => s.jawabTiket);
  const tutupTiket = useAppStore((s) => s.tutupTiket);
  const namaAdmin = useAdminStore((s) => s.session?.nama ?? "Admin");
  const [balasan, setBalasan] = React.useState("");

  const kirim = () => {
    if (!balasan.trim()) return;
    jawabTiket(ticket.id, balasan.trim(), `${namaAdmin} — Klinik Ekspor`);
    setBalasan("");
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Semua pertanyaan
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{ticket.kategori}</Badge>
          <Badge tone={STATUS_META[ticket.status].tone}>{STATUS_META[ticket.status].label}</Badge>
          <span className="text-xs text-gray-400">Dibuat {formatTanggal(ticket.dibuat)}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{ticket.judul}</h1>
      </div>

      <ol className="space-y-4">
        {ticket.pesan.map((m) => {
          const dariAdmin = m.dari === "petugas";
          return (
            <li
              key={m.id}
              className={`rounded-xl border p-5 ${
                dariAdmin ? "border-green-200 bg-green-50/60" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    dariAdmin ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-700"
                  }`}
                >
                  {dariAdmin ? <ShieldCheck className="h-4 w-4" aria-hidden /> : <UserRound className="h-4 w-4" aria-hidden />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.aktor}</p>
                  <p className="text-xs text-gray-400">{formatTanggal(m.tanggal)}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{m.pesan}</p>
            </li>
          );
        })}
      </ol>

      {!canReply ? (
        <Alert tone="neutral">Peran Anda hanya bisa melihat pertanyaan, tidak bisa membalas.</Alert>
      ) : ticket.status === "selesai" ? (
        <Alert tone="success" judul="Pertanyaan ditutup">
          Tiket ini sudah ditandai selesai.
        </Alert>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Label htmlFor="balasan">Balas sebagai admin</Label>
          <Textarea
            id="balasan"
            value={balasan}
            onChange={(e) => setBalasan(e.target.value)}
            className="mt-2"
            placeholder="Tulis jawaban yang jelas dan dapat ditindaklanjuti UMKM…"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <Button onClick={kirim} disabled={!balasan.trim()}>
              <Send className="h-4 w-4" aria-hidden />
              Kirim Jawaban
            </Button>
            <Button variant="outline" onClick={() => tutupTiket(ticket.id)}>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Tandai Selesai
            </Button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Jawaban langsung tampil di riwayat konsultasi UMKM dan status tiket menjadi
            &ldquo;sudah dijawab&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

export function TicketInboxPanel() {
  const tickets = useAppStore((s) => s.tickets);
  const canReply = useCan("ticket.reply");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<TicketStatus | "all">("all");

  const active = tickets.find((t) => t.id === openId) ?? null;

  if (active) {
    return <TicketThread ticket={active} onBack={() => setOpenId(null)} canReply={canReply} />;
  }

  const counts = {
    menunggu: tickets.filter((t) => t.status === "menunggu").length,
    dijawab: tickets.filter((t) => t.status === "dijawab").length,
    selesai: tickets.filter((t) => t.status === "selesai").length,
  };

  const visible = (filter === "all" ? tickets : tickets.filter((t) => t.status === filter))
    .slice()
    .sort((a, b) => +new Date(b.diperbarui) - +new Date(a.diperbarui));

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Ruang Kerja Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pertanyaan UMKM</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Konsultasi yang dikirim UMKM. Setiap pertanyaan adalah satu tiket dengan riwayat
          percakapan — buka satu untuk membalas.
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">Menunggu jawaban</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{counts.menunggu}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs text-sky-700">Sudah dijawab</p>
              <p className="mt-1 text-2xl font-bold text-sky-900">{counts.dijawab}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs text-green-700">Selesai</p>
              <p className="mt-1 text-2xl font-bold text-green-900">{counts.selesai}</p>
            </div>
          </div>
          <div className="mt-4 max-w-xs">
            <Label htmlFor="ticket-filter">Filter</Label>
            <Select
              id="ticket-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as TicketStatus | "all")}
              className="mt-2"
            >
              <option value="all">Semua ({tickets.length})</option>
              <option value="menunggu">Menunggu ({counts.menunggu})</option>
              <option value="dijawab">Sudah dijawab ({counts.dijawab})</option>
              <option value="selesai">Selesai ({counts.selesai})</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {visible.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center text-sm text-gray-500">
            Tidak ada pertanyaan pada filter ini.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {visible.map((t) => {
            const terakhir = t.pesan[t.pesan.length - 1];
            const belumDijawab = terakhir?.dari === "umkm" && t.status !== "selesai";
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(t.id)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{t.kategori}</Badge>
                    <Badge tone={STATUS_META[t.status].tone}>{STATUS_META[t.status].label}</Badge>
                    <span className="text-xs text-gray-400">
                      {t.pesan.length} pesan · diperbarui {formatTanggalPendek(t.diperbarui)}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-gray-900">{t.judul}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {terakhir ? `${terakhir.dari === "petugas" ? "Admin" : "UMKM"}: ${terakhir.pesan}` : ""}
                  </p>
                  {belumDijawab ? (
                    <p className="mt-2 text-xs font-medium text-amber-700">Menunggu jawaban admin</p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
