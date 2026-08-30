"use client";

import * as React from "react";
import { Building2, CheckCircle2, ChevronDown, Clock3, XCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea, Label, Select } from "@/components/ui/input";
import { DATA_USAHA_LABEL } from "@/lib/admin-data";
import { cn, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";
import type { ApplicationCase, BusinessApprovalStatus } from "@/lib/types";

function tone(status: BusinessApprovalStatus) {
  if (status === "disetujui") return "success" as const;
  if (status === "ditolak") return "danger" as const;
  return "warning" as const;
}

function DataRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

function CaseRow({ caseItem, canReview }: { caseItem: ApplicationCase; canReview: boolean }) {
  const setDataUsaha = useAdminStore((s) => s.setDataUsaha);
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<BusinessApprovalStatus>(caseItem.dataUsaha);
  const [catatan, setCatatan] = React.useState(caseItem.dataUsahaCatatan ?? "");
  const [saved, setSaved] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const simpan = (next: BusinessApprovalStatus) => {
    if ((next === "ditolak" || next === "menunggu") && !catatan.trim()) {
      setError("Catatan wajib diisi saat menolak atau mengembalikan ke status menunggu.");
      return;
    }
    setError(null);
    setDataUsaha(caseItem.id, next, catatan.trim());
    setStatus(next);
    setSaved(
      next === "disetujui"
        ? "Data usaha disetujui."
        : next === "ditolak"
          ? "Data usaha ditolak. UMKM perlu melengkapi."
          : "Data usaha dikembalikan ke status menunggu.",
    );
  };

  return (
    <li className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">{caseItem.businessName}</span>
            <Badge tone={tone(caseItem.dataUsaha)}>{DATA_USAHA_LABEL[caseItem.dataUsaha]}</Badge>
          </span>
          <span className="mt-0.5 block truncate text-xs text-gray-500">
            {caseItem.ownerName} · {caseItem.kategori} · {caseItem.id} · masuk{" "}
            {formatTanggalPendek(caseItem.submittedAt)}
          </span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4">
          <dl className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
            <DataRow label="Nomor NIB" value={caseItem.profile.nomorNib} />
            <DataRow label="Nomor NPWP" value={caseItem.profile.nomorNpwp} />
            <DataRow label="Kota / Provinsi" value={`${caseItem.city}, ${caseItem.province}`} />
            <DataRow label="Tahun berdiri" value={caseItem.profile.tahunBerdiri} />
            <DataRow label="Email" value={caseItem.email} />
            <DataRow label="Telepon" value={caseItem.phone} />
          </dl>

          {caseItem.dataUsahaCatatan ? (
            <p className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
              <span className="font-semibold">Catatan terakhir: </span>
              {caseItem.dataUsahaCatatan}
            </p>
          ) : null}

          {canReview ? (
            <>
              <div className="grid gap-3 sm:grid-cols-[0.6fr_1fr]">
                <div className="space-y-2">
                  <Label htmlFor={`${caseItem.id}-status`}>Set status</Label>
                  <Select
                    id={`${caseItem.id}-status`}
                    value={status}
                    onChange={(event) => setStatus(event.target.value as BusinessApprovalStatus)}
                  >
                    <option value="menunggu">Menunggu verifikasi</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${caseItem.id}-catatan`}>Catatan untuk UMKM</Label>
                  <Textarea
                    id={`${caseItem.id}-catatan`}
                    value={catatan}
                    onChange={(event) => setCatatan(event.target.value)}
                    className="min-h-[5rem]"
                    placeholder="Contoh: NPWP badan usaha belum dilampirkan."
                  />
                </div>
              </div>

              {error ? <Alert tone="danger" judul="Perlu dilengkapi">{error}</Alert> : null}
              {saved ? <Alert tone="success" judul="Tersimpan">{saved}</Alert> : null}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => simpan("disetujui")}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Setujui
                </Button>
                <Button size="sm" variant="danger" onClick={() => simpan("ditolak")}>
                  <XCircle className="h-4 w-4" aria-hidden />
                  Tolak
                </Button>
                <Button size="sm" variant="outline" onClick={() => simpan("menunggu")}>
                  <Clock3 className="h-4 w-4" aria-hidden />
                  Tandai menunggu
                </Button>
              </div>
            </>
          ) : (
            <Alert tone="neutral">Peran Anda hanya bisa melihat status persetujuan data usaha.</Alert>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function BusinessApprovalPanel() {
  const cases = useAdminStore((s) => s.cases);
  const canReview = useCan("case.review");
  const [filter, setFilter] = React.useState<BusinessApprovalStatus | "all">("all");

  const counts = {
    menunggu: cases.filter((item) => item.dataUsaha === "menunggu").length,
    disetujui: cases.filter((item) => item.dataUsaha === "disetujui").length,
    ditolak: cases.filter((item) => item.dataUsaha === "ditolak").length,
  };

  const visible = (filter === "all" ? cases : cases.filter((item) => item.dataUsaha === filter))
    .slice()
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Ruang Kerja Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Persetujuan data usaha</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Periksa NIB, NPWP, dan profil usaha sebelum pengajuan ekspor diproses. Klik satu UMKM
          untuk membuka datanya.
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">Menunggu verifikasi</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{counts.menunggu}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs text-green-700">Disetujui</p>
              <p className="mt-1 text-2xl font-bold text-green-900">{counts.disetujui}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs text-red-700">Ditolak</p>
              <p className="mt-1 text-2xl font-bold text-red-900">{counts.ditolak}</p>
            </div>
          </div>
          <div className="mt-4 max-w-xs">
            <Label htmlFor="data-usaha-filter">Filter</Label>
            <Select
              id="data-usaha-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as BusinessApprovalStatus | "all")}
              className="mt-2"
            >
              <option value="all">Semua ({cases.length})</option>
              <option value="menunggu">Menunggu ({counts.menunggu})</option>
              <option value="disetujui">Disetujui ({counts.disetujui})</option>
              <option value="ditolak">Ditolak ({counts.ditolak})</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {visible.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center text-sm text-gray-500">
            Tidak ada data usaha pada filter ini.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visible.map((caseItem) => (
            <CaseRow key={caseItem.id} caseItem={caseItem} canReview={canReview} />
          ))}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-gray-500">
        Terakhir dimuat {formatTanggalPendek(new Date().toISOString())}. Perubahan tersimpan di
        state prototipe dan tercatat pada audit trail masing-masing pengajuan.
      </p>
    </div>
  );
}
