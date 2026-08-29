"use client";

import * as React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { KATEGORI_KONSULTASI } from "@/lib/panduan";
import { formatTanggal } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";
import type { ConsultationTicket, TicketStatus } from "@/lib/types";

const STATUS_META: Record<TicketStatus, { label: string; tone: "warning" | "info" | "success" }> = {
  menunggu: { label: "Menunggu jawaban petugas", tone: "warning" },
  dijawab: { label: "Sudah dijawab", tone: "info" },
  selesai: { label: "Selesai", tone: "success" },
};

function TicketThread({
  ticket,
  onBack,
}: {
  ticket: ConsultationTicket;
  onBack: () => void;
}) {
  const balasTiket = useAppStore((s) => s.balasTiket);
  const tutupTiket = useAppStore((s) => s.tutupTiket);
  const [balasan, setBalasan] = React.useState("");

  const kirim = () => {
    if (!balasan.trim()) return;
    balasTiket(ticket.id, balasan.trim());
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
          const dariPetugas = m.dari === "petugas";
          return (
            <li
              key={m.id}
              className={`rounded-xl border p-5 ${
                dariPetugas ? "border-green-200 bg-green-50/60" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    dariPetugas ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-700"
                  }`}
                >
                  {dariPetugas ? <ShieldCheck className="h-4 w-4" aria-hidden /> : <UserRound className="h-4 w-4" aria-hidden />}
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

      {ticket.status === "selesai" ? (
        <Alert tone="success" judul="Pertanyaan ditutup">
          Anda menandai pertanyaan ini selesai. Buat pertanyaan baru bila masih ada yang perlu ditanyakan.
        </Alert>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <Label htmlFor="balasan">Tulis balasan</Label>
          <Textarea
            id="balasan"
            value={balasan}
            onChange={(e) => setBalasan(e.target.value)}
            className="mt-2"
            placeholder="Tambahkan detail atau pertanyaan lanjutan…"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <Button onClick={kirim} disabled={!balasan.trim()}>
              <Send className="h-4 w-4" aria-hidden />
              Kirim Balasan
            </Button>
            <Button variant="outline" onClick={() => tutupTiket(ticket.id)}>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Tandai Selesai
            </Button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Petugas Klinik Ekspor akan membalas melalui tiket ini. Anda menerima kabar di Beranda saat ada jawaban.
          </p>
        </div>
      )}
    </div>
  );
}

function NewTicketForm({ onCreated }: { onCreated: (id: string) => void }) {
  const buatTiket = useAppStore((s) => s.buatTiket);
  const [judul, setJudul] = React.useState("");
  const [kategori, setKategori] = React.useState(KATEGORI_KONSULTASI[0]);
  const [pesan, setPesan] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (judul.trim().length < 5) {
      setError("Judul terlalu pendek — tulis inti pertanyaan Anda.");
      return;
    }
    if (pesan.trim().length < 10) {
      setError("Jelaskan pertanyaan Anda sedikit lebih rinci.");
      return;
    }
    setError(null);
    onCreated(buatTiket(judul.trim(), kategori, pesan.trim()));
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <div className="space-y-2">
        <Label htmlFor="judul">Judul pertanyaan</Label>
        <Input
          id="judul"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          placeholder="Contoh: Apakah produk saya butuh izin edar BPOM?"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kategori">Kategori</Label>
        <Select id="kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
          {KATEGORI_KONSULTASI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pesan">Pertanyaan</Label>
        <Textarea
          id="pesan"
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          placeholder="Ceritakan situasi Anda: produk, negara tujuan, dan apa yang ingin ditanyakan."
        />
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button type="submit">
        <Send className="h-4 w-4" aria-hidden />
        Kirim Pertanyaan
      </Button>
    </form>
  );
}

export default function KonsultasiPage() {
  const tickets = useAppStore((s) => s.tickets);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const active = tickets.find((t) => t.id === openId) ?? null;

  if (active) {
    return <TicketThread ticket={active} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Riwayat Konsultasi</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Tanya Petugas Bea Cukai</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Setiap pertanyaan menjadi satu tiket dengan riwayat percakapan. Ajukan pertanyaan
            baru kapan saja dan lanjutkan pembahasan di tiket yang sama.
          </p>
        </div>
        {!creating ? (
          <Button size="lg" onClick={() => setCreating(true)}>
            <MessageSquarePlus className="h-5 w-5" aria-hidden />
            Pertanyaan Baru
          </Button>
        ) : (
          <Button size="lg" variant="ghost" onClick={() => setCreating(false)}>
            Batal
          </Button>
        )}
      </div>

      {creating ? (
        <NewTicketForm
          onCreated={(id) => {
            setCreating(false);
            setOpenId(id);
          }}
        />
      ) : null}

      {tickets.length === 0 && !creating ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          Belum ada pertanyaan. Klik <span className="font-semibold">Pertanyaan Baru</span> untuk
          mulai berkonsultasi dengan petugas.
        </div>
      ) : null}

      {tickets.length > 0 ? (
        <ul className="space-y-3">
          {[...tickets]
            .sort((a, b) => +new Date(b.diperbarui) - +new Date(a.diperbarui))
            .map((t) => {
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
                        {t.pesan.length} pesan · diperbarui {formatTanggal(t.diperbarui)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-gray-900">{t.judul}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {terakhir ? `${terakhir.dari === "petugas" ? "Petugas" : "Anda"}: ${terakhir.pesan}` : ""}
                    </p>
                    {belumDijawab ? (
                      <p className="mt-2 text-xs font-medium text-amber-700">Menunggu jawaban petugas</p>
                    ) : null}
                  </button>
                </li>
              );
            })}
        </ul>
      ) : null}
    </div>
  );
}
