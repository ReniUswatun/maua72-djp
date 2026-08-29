"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { levelLabel } from "@/lib/admin-data";
import { downloadCsv, stamp, toCsv } from "@/lib/csv";
import { slaInfo, slaTone } from "@/lib/sla";
import { formatTanggalPendek } from "@/lib/utils";
import { useCan } from "@/store/admin-store";
import type { ApplicationCase, ReviewStage } from "@/lib/types";

const PAGE_SIZE = 5;

function statusTone(status: ReviewStage) {
  if (status === "disetujui") return "success";
  if (status === "membutuhkan_info") return "warning";
  if (status === "ditolak") return "danger";
  if (status === "direview") return "info";
  return "neutral";
}

function statusLabel(status: ReviewStage) {
  return {
    baru: "Baru",
    direview: "Direview",
    disetujui: "Disetujui",
    membutuhkan_info: "Butuh Info",
    ditolak: "Ditolak",
  }[status];
}

function sortLabel(order: string) {
  return order === "score-desc" ? "Score tinggi" : order === "score-asc" ? "Score rendah" : order === "update-desc" ? "Update terbaru" : "Update terlama";
}

export function AdminCasesTable({
  cases,
  title = "Daftar Pengajuan",
  description = "Search, filter status, filter level, sorting, dan pagination tersedia di sini.",
}: {
  cases: ApplicationCase[];
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ReviewStage | "all">("all");
  const [level, setLevel] = React.useState<string>("all");
  const [sortOrder, setSortOrder] = React.useState("update-desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const lowered = query.toLowerCase();
    const result = cases.filter((item) => {
      const matchesQuery =
        item.businessName.toLowerCase().includes(lowered) ||
        item.ownerName.toLowerCase().includes(lowered) ||
        item.email.toLowerCase().includes(lowered) ||
        item.city.toLowerCase().includes(lowered);
      const matchesStatus = status === "all" ? true : item.status === status;
      const matchesLevel = level === "all" ? true : String(item.readinessLevel) === level;
      return matchesQuery && matchesStatus && matchesLevel;
    });

    result.sort((a, b) => {
      if (sortOrder === "score-desc") return b.readinessScore - a.readinessScore;
      if (sortOrder === "score-asc") return a.readinessScore - b.readinessScore;
      if (sortOrder === "update-asc") return +new Date(a.lastUpdatedAt) - +new Date(b.lastUpdatedAt);
      return +new Date(b.lastUpdatedAt) - +new Date(a.lastUpdatedAt);
    });

    return result;
  }, [cases, level, query, sortOrder, status]);

  const canExport = useCan("report.export");
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    const rows = filtered.map((item) => ({
      id: item.id,
      nama_umkm: item.businessName,
      pemilik: item.ownerName,
      kota: item.city,
      provinsi: item.province,
      email: item.email,
      telepon: item.phone,
      level: item.readinessLevel,
      skor: item.readinessScore,
      status: item.status,
      sla: slaInfo(item).label,
      masuk: item.submittedAt.slice(0, 10),
      update_terakhir: item.lastUpdatedAt.slice(0, 10),
    }));
    downloadCsv(`pengajuan-umkm-${stamp()}`, toCsv(rows));
  };

  React.useEffect(() => {
    setPage(1);
  }, [query, status, level, sortOrder]);

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {canExport ? (
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-4 w-4" aria-hidden />
              Export CSV
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.6fr_0.6fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama UMKM, owner, kota, atau email" className="pl-11" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as ReviewStage | "all")}> 
            <option value="all">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="direview">Direview</option>
            <option value="disetujui">Disetujui</option>
            <option value="membutuhkan_info">Butuh Info</option>
            <option value="ditolak">Ditolak</option>
          </Select>
          <Select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="all">Semua Level</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </Select>
          <Select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="update-desc">Update terbaru</option>
            <option value="update-asc">Update terlama</option>
            <option value="score-desc">Score tinggi</option>
            <option value="score-asc">Score rendah</option>
          </Select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">UMKM</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">SLA</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Update</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pageItems.length > 0 ? (
                pageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.businessName}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.city}, {item.province}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{item.ownerName}</td>
                    <td className="px-4 py-4">
                      <Badge tone="primary">{levelLabel(item.readinessLevel)}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const sla = slaInfo(item);
                        return (
                          <Badge tone={slaTone(sla.level)}>
                            {sla.level === "selesai" ? "—" : sla.label}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{item.readinessScore}</td>
                    <td className="px-4 py-4 text-slate-600">{formatTanggalPendek(item.lastUpdatedAt)}</td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/pengajuan/${item.id}`}>
                        <Button size="sm" variant="outline">Buka</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Tidak ada pengajuan yang cocok dengan pencarian atau filter saat ini.
                    Coba longgarkan filter status/level.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Menampilkan {pageItems.length} dari {filtered.length} pengajuan · {sortLabel(sortOrder)}
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Sebelumnya
            </Button>
            <span className="text-sm text-slate-600">
              Halaman {page} / {pageCount}
            </span>
            <Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
              Berikutnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
