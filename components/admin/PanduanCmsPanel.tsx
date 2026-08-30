"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
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
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";
import { usePanduanSorted, usePanduanStore, type PanduanEntryInput } from "@/store/panduan-store";
import type { PanduanBlok, PanduanBlokTipe, PanduanEntry } from "@/lib/types";

const BLOK_LABEL: Record<PanduanBlokTipe, string> = {
  paragraf: "Paragraf",
  poin: "Daftar poin",
  langkah: "Langkah bernomor",
  gambar: "Gambar",
  catatan: "Kotak catatan",
  tautan: "Tautan",
};

/* ---------- serialisasi list <-> textarea (per blok) ---------- */

const linesToItems = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
const itemsToLines = (items: string[]) => items.join("\n");

function pairToLines(items: { judul?: string; teks?: string; detail?: string; url?: string }[], sep: "detail" | "url") {
  return items
    .map((i) => {
      const kiri = i.judul ?? i.teks ?? "";
      const kanan = (sep === "detail" ? i.detail : i.url) ?? "";
      return kiri ? `${kiri} :: ${kanan}` : kanan;
    })
    .join("\n");
}
function linesToLangkah(t: string) {
  return linesToItems(t).map((l) => {
    const idx = l.indexOf("::");
    return idx === -1 ? { judul: "", detail: l } : { judul: l.slice(0, idx).trim(), detail: l.slice(idx + 2).trim() };
  });
}
function linesToTautan(t: string) {
  return linesToItems(t)
    .map((l) => {
      const idx = l.indexOf("::");
      if (idx === -1) return null;
      return { teks: l.slice(0, idx).trim(), url: l.slice(idx + 2).trim() };
    })
    .filter((x): x is { teks: string; url: string } => Boolean(x && x.teks && x.url));
}

function emptyBlok(tipe: PanduanBlokTipe): PanduanBlok {
  switch (tipe) {
    case "poin":
      return { tipe: "poin", items: [] };
    case "langkah":
      return { tipe: "langkah", items: [] };
    case "gambar":
      return { tipe: "gambar", dataUrl: "" };
    case "catatan":
      return { tipe: "catatan", teks: "" };
    case "tautan":
      return { tipe: "tautan", items: [] };
    default:
      return { tipe: "paragraf", teks: "" };
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/* ---------- editor satu blok ---------- */

function BlokEditor({
  blok,
  onChange,
  onHapus,
  onNaik,
  onTurun,
}: {
  blok: PanduanBlok;
  onChange: (next: PanduanBlok) => void;
  onHapus: () => void;
  onNaik: () => void;
  onTurun: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Badge tone="neutral">{BLOK_LABEL[blok.tipe]}</Badge>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={onNaik} aria-label="Naikkan blok">
            <ArrowUp className="h-4 w-4" aria-hidden />
          </Button>
          <Button size="sm" variant="outline" onClick={onTurun} aria-label="Turunkan blok">
            <ArrowDown className="h-4 w-4" aria-hidden />
          </Button>
          <Button size="sm" variant="danger" onClick={onHapus} aria-label="Hapus blok">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {blok.tipe === "paragraf" || blok.tipe === "catatan" ? (
        <Textarea
          value={blok.teks}
          onChange={(e) => onChange({ ...blok, teks: e.target.value })}
          className="min-h-[5rem]"
          placeholder={blok.tipe === "catatan" ? "Catatan singkat yang menonjol." : "Tulis paragraf penjelasan."}
        />
      ) : null}

      {blok.tipe === "poin" ? (
        <Textarea
          value={itemsToLines(blok.items)}
          onChange={(e) => onChange({ tipe: "poin", items: linesToItems(e.target.value) })}
          className="min-h-[6rem] font-mono text-sm"
          placeholder={"Satu poin per baris"}
        />
      ) : null}

      {blok.tipe === "langkah" ? (
        <>
          <p className="mb-1 text-xs text-gray-500">
            Satu langkah per baris — format <span className="font-mono">Judul :: Detail</span>
          </p>
          <Textarea
            value={pairToLines(blok.items, "detail")}
            onChange={(e) => onChange({ tipe: "langkah", items: linesToLangkah(e.target.value) })}
            className="min-h-[6rem] font-mono text-sm"
          />
        </>
      ) : null}

      {blok.tipe === "tautan" ? (
        <>
          <p className="mb-1 text-xs text-gray-500">
            Satu tautan per baris — format <span className="font-mono">Teks :: https://…</span>
          </p>
          <Textarea
            value={pairToLines(blok.items, "url")}
            onChange={(e) => onChange({ tipe: "tautan", items: linesToTautan(e.target.value) })}
            className="min-h-[4rem] font-mono text-sm"
          />
        </>
      ) : null}

      {blok.tipe === "gambar" ? (
        <div className="space-y-3">
          {blok.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blok.dataUrl} alt="" className="max-h-52 rounded-lg border border-gray-200" />
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              if (f.size > 2_000_000) {
                alert("Gambar terlalu besar (maks 2 MB).");
                return;
              }
              const dataUrl = await fileToDataUrl(f);
              onChange({ ...blok, dataUrl });
            }}
            className="block text-sm text-gray-600 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Input
            value={blok.keterangan ?? ""}
            onChange={(e) => onChange({ ...blok, keterangan: e.target.value })}
            placeholder="Keterangan gambar (opsional)"
          />
        </div>
      ) : null}
    </div>
  );
}

/* ---------- editor artikel ---------- */

const KOSONG: PanduanEntryInput = {
  judul: "",
  ringkas: "",
  gambarSampul: undefined,
  blok: [{ tipe: "paragraf", teks: "" }],
  status: "draf",
};

function ArticleEditor({
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
  const [judul, setJudul] = React.useState(awal.judul);
  const [ringkas, setRingkas] = React.useState(awal.ringkas);
  const [gambarSampul, setGambarSampul] = React.useState(awal.gambarSampul);
  const [blok, setBlok] = React.useState<PanduanBlok[]>(awal.blok);
  const [status, setStatus] = React.useState(awal.status);
  const [tambahTipe, setTambahTipe] = React.useState<PanduanBlokTipe>("paragraf");
  const [error, setError] = React.useState<string | null>(null);

  const swap = (i: number, j: number) => {
    if (j < 0 || j >= blok.length) return;
    const next = [...blok];
    [next[i], next[j]] = [next[j], next[i]];
    setBlok(next);
  };

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (judul.trim().length < 3) {
      setError("Judul wajib diisi.");
      return;
    }
    setError(null);
    onSimpan({ judul, ringkas, gambarSampul, blok, status });
  };

  return (
    <form onSubmit={simpan} className="space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{judulForm}</p>
        <Button type="button" size="sm" variant="ghost" onClick={onBatal}>
          <X className="h-4 w-4" aria-hidden />
          Tutup
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="pd-judul">Judul langkah</Label>
          <Input id="pd-judul" value={judul} onChange={(e) => setJudul(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pd-status">Status</Label>
          <Select id="pd-status" value={status} onChange={(e) => setStatus(e.target.value as PanduanEntry["status"])}>
            <option value="terbit">Terbit</option>
            <option value="draf">Draf</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pd-ringkas">Ringkas / subjudul</Label>
        <Input id="pd-ringkas" value={ringkas} onChange={(e) => setRingkas(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Gambar sampul (opsional)</Label>
        {gambarSampul ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gambarSampul} alt="" className="max-h-40 rounded-lg border border-gray-200" />
            <Button type="button" size="sm" variant="outline" onClick={() => setGambarSampul(undefined)}>
              Hapus
            </Button>
          </div>
        ) : (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ImagePlus className="h-4 w-4" aria-hidden />
            Unggah gambar
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                if (f.size > 2_000_000) {
                  alert("Gambar terlalu besar (maks 2 MB).");
                  return;
                }
                setGambarSampul(await fileToDataUrl(f));
              }}
            />
          </label>
        )}
      </div>

      <div className="space-y-3">
        <Label>Isi artikel</Label>
        {blok.map((b, i) => (
          <BlokEditor
            key={i}
            blok={b}
            onChange={(next) => setBlok(blok.map((x, xi) => (xi === i ? next : x)))}
            onHapus={() => setBlok(blok.filter((_, xi) => xi !== i))}
            onNaik={() => swap(i, i - 1)}
            onTurun={() => swap(i, i + 1)}
          />
        ))}

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={tambahTipe}
            onChange={(e) => setTambahTipe(e.target.value as PanduanBlokTipe)}
            className="w-auto"
          >
            {(Object.keys(BLOK_LABEL) as PanduanBlokTipe[]).map((t) => (
              <option key={t} value={t}>
                {BLOK_LABEL[t]}
              </option>
            ))}
          </Select>
          <Button type="button" variant="outline" size="sm" onClick={() => setBlok([...blok, emptyBlok(tambahTipe)])}>
            <Plus className="h-4 w-4" aria-hidden />
            Tambah blok
          </Button>
        </div>
      </div>

      {error ? <FieldError>{error}</FieldError> : null}

      <div className="flex gap-2">
        <Button type="submit">Simpan langkah</Button>
        <Button type="button" variant="ghost" onClick={onBatal}>
          Batal
        </Button>
      </div>
    </form>
  );
}

/* ---------- panel ---------- */

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

  const logActivity = useAdminStore((s) => s.logActivity);
  const namaAdmin = useAdminStore((s) => s.session?.nama ?? "Admin");

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

  const editing =
    typeof mode === "string" && mode !== "list" && mode !== "baru"
      ? entries.find((e) => e.id === mode) ?? null
      : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ruang Kerja Admin · Konten</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Kelola panduan ekspor</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Panduan = daftar langkah berurutan; tiap langkah adalah artikel dengan halaman sendiri.
          Perubahan langsung tampil ke UMKM dan tercatat di Log Aktivitas super admin. Langkah inti
          bawaan bisa disunting tapi tidak bisa dihapus — sembunyikan saja (jadikan draf).
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="flex flex-wrap gap-3 p-6">
          {mode !== "baru" ? (
            <Button
              onClick={() => {
                setMode("baru");
                setFeedback(null);
                setError(null);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Tambah Langkah
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
                logActivity("panduan", "Panduan dikembalikan ke bawaan");
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
        <ArticleEditor
          awal={KOSONG}
          judulForm="Langkah panduan baru"
          onBatal={() => setMode("list")}
          onSimpan={(value) => {
            tambahEntry(value, namaAdmin);
            logActivity("panduan", "Langkah panduan ditambahkan", value.judul.trim());
            setMode("list");
            setFeedback(`Langkah "${value.judul}" ditambahkan.`);
          }}
        />
      ) : null}

      {editing ? (
        <ArticleEditor
          awal={{
            judul: editing.judul,
            ringkas: editing.ringkas,
            gambarSampul: editing.gambarSampul,
            blok: editing.blok,
            status: editing.status,
          }}
          judulForm={`Sunting: ${editing.judul}`}
          onBatal={() => setMode("list")}
          onSimpan={(value) => {
            ubahEntry(editing.id, value, namaAdmin);
            logActivity("panduan", "Langkah panduan disunting", value.judul.trim());
            setMode("list");
            setFeedback(`Langkah "${value.judul}" diperbarui.`);
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
                {entry.diperbaruiOleh ? (
                  <p className="mt-1 text-xs text-gray-400">
                    diperbarui oleh {entry.diperbaruiOleh}
                    {entry.diperbaruiPada ? ` · ${formatTanggalPendek(entry.diperbaruiPada)}` : ""}
                  </p>
                ) : null}
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
                  onClick={() => {
                    const next = entry.status === "terbit" ? "draf" : "terbit";
                    setStatus(entry.id, next);
                    logActivity("panduan", next === "terbit" ? "Langkah panduan diterbitkan" : "Langkah panduan disembunyikan", entry.judul);
                  }}
                >
                  {entry.status === "terbit" ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  {entry.status === "terbit" ? "Sembunyikan" : "Terbitkan"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMode(entry.id);
                    setFeedback(null);
                    setError(null);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Sunting
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={entry.terkunci}
                  onClick={() => {
                    if (!window.confirm(`Hapus langkah "${entry.judul}"?`)) return;
                    const res = hapusEntry(entry.id);
                    if (!res.ok) setError(res.message ?? "Gagal menghapus.");
                    else {
                      logActivity("panduan", "Langkah panduan dihapus", entry.judul);
                      setFeedback(`Langkah "${entry.judul}" dihapus.`);
                    }
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
