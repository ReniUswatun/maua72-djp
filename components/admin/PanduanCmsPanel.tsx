"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { useCan } from "@/store/admin-store";
import { usePanduanSorted, usePanduanStore, type PanduanEntryInput } from "@/store/panduan-store";
import type { PanduanEntry } from "@/lib/types";

/* ---------- serialisasi field daftar ke/dari textarea ---------- */

function poinToText(poin: string[]) {
  return poin.join("\n");
}
function textToPoin(text: string) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}
function langkahToText(langkah: { judul: string; detail: string }[]) {
  return langkah.map((l) => (l.judul ? `${l.judul} :: ${l.detail}` : l.detail)).join("\n");
}
function textToLangkah(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf("::");
      if (idx === -1) return { judul: "", detail: l };
      return { judul: l.slice(0, idx).trim(), detail: l.slice(idx + 2).trim() };
    });
}
function tautanToText(tautan: { teks: string; url: string }[]) {
  return tautan.map((t) => `${t.teks} :: ${t.url}`).join("\n");
}
function textToTautan(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf("::");
      if (idx === -1) return null;
      return { teks: l.slice(0, idx).trim(), url: l.slice(idx + 2).trim() };
    })
    .filter((t): t is { teks: string; url: string } => Boolean(t && t.teks && t.url));
}

const KOSONG: PanduanEntryInput = {
  tipe: "tahap",
  judul: "",
  ringkas: "",
  deskripsi: "",
  poin: [],
  langkah: [],
  tautan: [],
  dibuatSendiri: false,
  status: "draf",
};

function EntryForm({
  awal,
  judulForm,
  onSimpan,
  onBatal,
}: {
  awal: PanduanEntryInput;
  judulForm: string;
  onSimpan: (value: PanduanEntryInput) => void;
  onBatal: () => void;
}) {
  const [tipe, setTipe] = React.useState(awal.tipe);
  const [judul, setJudul] = React.useState(awal.judul);
  const [ringkas, setRingkas] = React.useState(awal.ringkas);
  const [deskripsi, setDeskripsi] = React.useState(awal.deskripsi);
  const [poin, setPoin] = React.useState(poinToText(awal.poin));
  const [langkah, setLangkah] = React.useState(langkahToText(awal.langkah));
  const [tautan, setTautan] = React.useState(tautanToText(awal.tautan));
  const [dibuatSendiri, setDibuatSendiri] = React.useState(awal.dibuatSendiri);
  const [status, setStatus] = React.useState(awal.status);
  const [error, setError] = React.useState<string | null>(null);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (judul.trim().length < 3) {
      setError("Judul wajib diisi.");
      return;
    }
    setError(null);
    onSimpan({
      tipe,
      judul,
      ringkas,
      deskripsi: deskripsi.trim(),
      poin: textToPoin(poin),
      langkah: textToLangkah(langkah),
      tautan: textToTautan(tautan),
      dibuatSendiri: tipe === "dokumen" ? dibuatSendiri : false,
      status,
    });
  };

  return (
    <form onSubmit={simpan} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{judulForm}</p>
        <Button type="button" size="sm" variant="ghost" onClick={onBatal}>
          <X className="h-4 w-4" aria-hidden />
          Tutup
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pd-tipe">Tipe</Label>
          <Select id="pd-tipe" value={tipe} onChange={(e) => setTipe(e.target.value as PanduanEntry["tipe"])}>
            <option value="tahap">Tahap alur</option>
            <option value="dokumen">Panduan dokumen</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pd-status">Status</Label>
          <Select id="pd-status" value={status} onChange={(e) => setStatus(e.target.value as PanduanEntry["status"])}>
            <option value="terbit">Terbit (tampil ke UMKM)</option>
            <option value="draf">Draf (disembunyikan)</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-judul">Judul</Label>
        <Input id="pd-judul" value={judul} onChange={(e) => setJudul(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-ringkas">Ringkas / subjudul</Label>
        <Input id="pd-ringkas" value={ringkas} onChange={(e) => setRingkas(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-deskripsi">Deskripsi (paragraf)</Label>
        <Textarea id="pd-deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="min-h-[5rem]" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-poin">Poin (satu baris = satu poin)</Label>
        <Textarea id="pd-poin" value={poin} onChange={(e) => setPoin(e.target.value)} className="min-h-[6rem] font-mono text-sm" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-langkah">Langkah bernomor — format: <span className="font-mono">Judul :: Detail</span> per baris</Label>
        <Textarea id="pd-langkah" value={langkah} onChange={(e) => setLangkah(e.target.value)} className="min-h-[6rem] font-mono text-sm" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-tautan">Tautan — format: <span className="font-mono">Teks :: https://…</span> per baris</Label>
        <Textarea id="pd-tautan" value={tautan} onChange={(e) => setTautan(e.target.value)} className="min-h-[4rem] font-mono text-sm" />
      </div>

      {tipe === "dokumen" ? (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={dibuatSendiri}
            onChange={(e) => setDibuatSendiri(e.target.checked)}
          />
          Dokumen ini dibuat sendiri oleh eksportir (bukan diurus ke instansi)
        </label>
      ) : null}

      {error ? <FieldError>{error}</FieldError> : null}

      <div className="flex gap-2">
        <Button type="submit">Simpan</Button>
        <Button type="button" variant="ghost" onClick={onBatal}>Batal</Button>
      </div>
    </form>
  );
}

export function PanduanCmsPanel() {
  const hydrated = usePanduanStore((s) => s.hydrated);
  const entries = usePanduanSorted();
  const canManage = useCan("panduan.manage");

  const tambahEntry = usePanduanStore((s) => s.tambahEntry);
  const ubahEntry = usePanduanStore((s) => s.ubahEntry);
  const hapusEntry = usePanduanStore((s) => s.hapusEntry);
  const pindah = usePanduanStore((s) => s.pindah);
  const setStatus = usePanduanStore((s) => s.setStatus);
  const resetPanduan = usePanduanStore((s) => s.resetPanduan);

  const [mode, setMode] = React.useState<"list" | "baru" | string>("list");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  if (!hydrated) {
    return <p className="text-sm text-gray-500">Memuat konten panduan…</p>;
  }

  if (!canManage) {
    return (
      <Alert tone="warning" judul="Hak akses tidak mencukupi">
        Peran Anda tidak memiliki izin <span className="font-semibold">panduan.manage</span>.
      </Alert>
    );
  }

  const editing = typeof mode === "string" && mode !== "list" && mode !== "baru"
    ? entries.find((e) => e.id === mode) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Super Admin · Konten</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Kelola panduan ekspor</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Tambah, sunting, atur urutan, sembunyikan, atau hapus entri panduan. Perubahan langsung
          tampil di halaman panduan UMKM. Entri inti bawaan bisa disunting tapi tidak bisa dihapus —
          sembunyikan saja (jadikan draf).
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="flex flex-wrap gap-3 p-6">
          {mode !== "baru" ? (
            <Button onClick={() => { setMode("baru"); setFeedback(null); setError(null); }}>
              <Plus className="h-4 w-4" aria-hidden />
              Tambah Entri
            </Button>
          ) : null}
          <Link href="/panduan" target="_blank">
            <Button variant="outline">
              <Eye className="h-4 w-4" aria-hidden />
              Lihat halaman panduan
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm("Kembalikan seluruh panduan ke isi bawaan? Semua perubahan hilang.")) {
                resetPanduan();
                setMode("list");
                setFeedback("Panduan dikembalikan ke isi bawaan.");
              }
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Kembalikan ke bawaan
          </Button>
        </CardContent>
      </Card>

      {feedback ? <Alert tone="success" judul="Tersimpan">{feedback}</Alert> : null}
      {error ? <Alert tone="danger" judul="Gagal">{error}</Alert> : null}

      {mode === "baru" ? (
        <EntryForm
          awal={KOSONG}
          judulForm="Entri Panduan Baru"
          onBatal={() => setMode("list")}
          onSimpan={(value) => {
            tambahEntry(value);
            setMode("list");
            setFeedback(`Entri "${value.judul}" ditambahkan.`);
          }}
        />
      ) : null}

      {editing ? (
        <EntryForm
          awal={{
            tipe: editing.tipe,
            judul: editing.judul,
            ringkas: editing.ringkas,
            deskripsi: editing.deskripsi,
            poin: editing.poin,
            langkah: editing.langkah,
            tautan: editing.tautan,
            dibuatSendiri: editing.dibuatSendiri,
            status: editing.status,
          }}
          judulForm={`Sunting: ${editing.judul}`}
          onBatal={() => setMode("list")}
          onSimpan={(value) => {
            ubahEntry(editing.id, value);
            setMode("list");
            setFeedback(`Entri "${value.judul}" diperbarui.`);
          }}
        />
      ) : null}

      <ol className="space-y-2">
        {entries.map((entry, index) => (
          <li key={entry.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                  <Badge tone={entry.tipe === "tahap" ? "info" : "neutral"}>
                    {entry.tipe === "tahap" ? "Tahap" : "Dokumen"}
                  </Badge>
                  <Badge tone={entry.status === "terbit" ? "success" : "warning"}>
                    {entry.status === "terbit" ? "Terbit" : "Draf"}
                  </Badge>
                  {entry.terkunci ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Lock className="h-3 w-3" aria-hidden />
                      inti
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-semibold text-gray-900">{entry.judul}</p>
                {entry.ringkas ? <p className="text-sm text-gray-500">{entry.ringkas}</p> : null}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" disabled={index === 0} onClick={() => pindah(entry.id, "naik")} aria-label="Naikkan urutan">
                  <ArrowUp className="h-4 w-4" aria-hidden />
                </Button>
                <Button size="sm" variant="outline" disabled={index === entries.length - 1} onClick={() => pindah(entry.id, "turun")} aria-label="Turunkan urutan">
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus(entry.id, entry.status === "terbit" ? "draf" : "terbit")}
                >
                  {entry.status === "terbit" ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  {entry.status === "terbit" ? "Sembunyikan" : "Terbitkan"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setMode(entry.id); setFeedback(null); setError(null); }}>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Sunting
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={entry.terkunci}
                  onClick={() => {
                    if (!window.confirm(`Hapus entri "${entry.judul}"?`)) return;
                    const res = hapusEntry(entry.id);
                    if (!res.ok) setError(res.message ?? "Gagal menghapus.");
                    else setFeedback(`Entri "${entry.judul}" dihapus.`);
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
