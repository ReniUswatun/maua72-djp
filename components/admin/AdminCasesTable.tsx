"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { DATA_USAHA_LABEL, STATUS_LABEL } from "@/lib/admin-data";
import { downloadCsv, stamp, toCsv } from "@/lib/csv";
import { slaInfo, slaTone } from "@/lib/sla";
import { formatTanggalPendek } from "@/lib/utils";
import { useCan } from "@/store/admin-store";
import type { ApplicationCase, BusinessApprovalStatus, ReviewStage } from "@/lib/types";

const PAGE_SIZE = 5;

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

function docSummary(caseItem: ApplicationCase) {
  const wajib = caseItem.documents.filter((doc) => doc.wajib);
  const terunggah = wajib.filter((doc) => doc.status !== "belum").length;
  const perluPerbaikan = caseItem.documents.filter(
    (doc) => doc.ocr && doc.ocr.status !== "cocok",
  ).length;
  return { total: wajib.length, terunggah, perluPerbaikan };
}

export function AdminCasesTable({
  cases,
  title = "Daftar Pengajuan",
  description = "Cari, filter status, filter data usaha, dan buka detail pengajuan.",
}: {
  cases: ApplicationCase[];
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<ReviewStage | "all">("all");
  const [dataUsaha, setDataUsaha] = React.useState<BusinessApprovalStatus | "all">("all");
  const [sortOrder, setSortOrder] = React.useState("update-desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const lowered = query.toLowerCase();
    const result = cases.filter((item) => {
      const matchesQuery =
        item.businessName.toLowerCase().includes(lowered) ||
        item.ownerName.toLowerCase().includes(lowered) ||
        item.email.toLowerCase().includes(lowered) ||
        item.city.toLowerCase().includes(lowered) ||
        item.namaProduk.toLowerCase().includes(lowered);
      const matchesStatus = status === "all" ? true : item.status === status;
      const matchesDataUsaha = dataUsaha === "all" ? true : item.dataUsaha === dataUsaha;
      return matchesQuery && matchesStatus && matchesDataUsaha;
    });

    result.sort((a, b) => {
      if (sortOrder === "update-asc") return +new Date(a.lastUpdatedAt) - +new Date(b.lastUpdatedAt);
      if (sortOrder === "masuk-desc") return +new Date(b.submittedAt) - +new Date(a.submittedAt);
      if (sortOrder === "masuk-asc") return +new Date(a.submittedAt) - +new Date(b.submittedAt);
      return +new Date(b.lastUpdatedAt) - +new Date(a.lastUpdatedAt);
    });

    return result;
  }, [cases, dataUsaha, query, sortOrder, status]);

  const canExport = useCan("report.export");
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    const rows = filtered.map((item) => {
      const docs = docSummary(item);
      return {
        id: item.id,
        nama_umkm: item.businessName,
        pemilik: item.ownerName,
        kota: item.city,
        provinsi: item.province,
        email: item.email,
        telepon: item.phone,
        produk: item.namaProduk,
        negara_tujuan: item.negaraTujuan,
        status: STATUS_LABEL[item.status],
        data_usaha: DATA_USAHA_LABEL[item.dataUsaha],
        dokumen_wajib: `${docs.terunggah}/${docs.total}`,
        temuan_ocr: docs.perluPerbaikan,
        sla: slaInfo(item).label,
        masuk: item.submittedAt.slice(0, 10),
        update_terakhir: item.lastUpdatedAt.slice(0, 10),
      };
    });
    downloadCsv(`pengajuan-umkm-${stamp()}`, toCsv(rows));
  };

  React.useEffect(() => {
    setPage(1);
  }, [query, status, dataUsaha, sortOrder]);

  return (
    <Card className="border-gray-200">
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
        <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari UMKM, owner, kota, produk" className="pl-11" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as ReviewStage | "all")}>
            <option value="all">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="direview">Sedang direview</option>
            <option value="disetujui">Disetujui</option>
            <option value="membutuhkan_info">Butuh info tambahan</option>
            <option value="ditolak">Ditolak</option>
          </Select>
          <Select value={dataUsaha} onChange={(event) => setDataUsaha(event.target.value as BusinessApprovalStatus | "all")}>
            <option value="all">Semua Data Usaha</option>
            <option value="menunggu">Data usaha: menunggu</option>
            <option value="disetujui">Data usaha: disetujui</option>
            <option value="ditolak">Data usaha: ditolak</option>
          </Select>
          <Select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="update-desc">Update terbaru</option>
            <option value="update-asc">Update terlama</option>
            <option value="masuk-desc">Masuk terbaru</option>
            <option value="masuk-asc">Masuk terlama</option>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-[0.14em] text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">UMKM</th>
                <th className="px-4 py-3 text-left">Produk / tujuan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Data usaha</th>
                <th className="px-4 py-3 text-left">Dokumen</th>
                <th className="px-4 py-3 text-left">SLA</th>
                <th className="px-4 py-3 text-left">Update</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pageItems.length > 0 ? (
                pageItems.map((item) => {
                  const docs = docSummary(item);
                  const sla = slaInfo(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">{item.businessName}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.ownerName} · {item.city}, {item.province}</p>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {item.namaProduk}
                        <span className="mt-1 block text-xs text-gray-500">{item.negaraTujuan}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={statusTone(item.status)}>{STATUS_LABEL[item.status]}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={dataUsahaTone(item.dataUsaha)}>{DATA_USAHA_LABEL[item.dataUsaha]}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-700">{docs.terunggah}/{docs.total} wajib</span>
                        {docs.perluPerbaikan > 0 ? (
                          <span className="mt-1 block text-xs text-amber-700">{docs.perluPerbaikan} temuan OCR</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={slaTone(sla.level)}>{sla.level === "selesai" ? "—" : sla.label}</Badge>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{formatTanggalPendek(item.lastUpdatedAt)}</td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/pengajuan/${item.id}`}>
                          <Button size="sm" variant="outline">Buka</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    Tidak ada pengajuan yang cocok dengan pencarian atau filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {pageItems.length} dari {filtered.length} pengajuan
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600">
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
