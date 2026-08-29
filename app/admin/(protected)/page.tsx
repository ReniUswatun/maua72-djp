"use client";

import Link from "next/link";
import { AlarmClock, ArrowRight, BadgeCheck, ClipboardCheck, Clock3, ScanLine, ShieldCheck, Sparkles } from "lucide-react";

import { AdminCasesTable } from "@/components/admin/AdminCasesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeOcrAccuracy } from "@/lib/ai-accuracy";
import { DATA_USAHA_LABEL, STATUS_LABEL } from "@/lib/admin-data";
import { countOverdue, SLA_LIMIT_DAYS } from "@/lib/sla";
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useAdminSummary } from "@/store/admin-store";

function SummaryCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint: string; icon: typeof ClipboardCheck }) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
            <p className="mt-2 text-sm text-gray-600">{hint}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const cases = useAdminStore((s) => s.cases);
  const summary = useAdminSummary();
  const overdue = countOverdue(cases);
  const ocr = computeOcrAccuracy(cases);
  const recent = [...cases].sort((a, b) => +new Date(b.lastUpdatedAt) - +new Date(a.lastUpdatedAt)).slice(0, 4);

  const dataUsahaMenunggu = cases.filter((item) => item.dataUsaha === "menunggu").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Ruang Kerja Officer</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Monitoring pengajuan ekspor</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Ringkasan pengajuan, persetujuan data usaha, dan hasil pembacaan OCR dokumen —
            untuk membantu menentukan mana yang perlu ditangani lebih dulu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/pengajuan">
            <Button size="lg">
              Buka Daftar Pengajuan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Link href="/admin/data-usaha">
            <Button size="lg" variant="outline">Persetujuan Data Usaha</Button>
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total Pengajuan" value={summary.total} hint="Seluruh case aktif" icon={ClipboardCheck} />
        <SummaryCard label="Baru" value={summary.baru} hint="Belum dibuka officer" icon={Sparkles} />
        <SummaryCard label="Sedang direview" value={summary.direview} hint="Dalam proses review" icon={ShieldCheck} />
        <SummaryCard label="Data usaha menunggu" value={dataUsahaMenunggu} hint="Perlu persetujuan officer" icon={BadgeCheck} />
        <SummaryCard label="Terlambat (SLA)" value={overdue} hint={`Menunggu > ${SLA_LIMIT_DAYS} hari`} icon={AlarmClock} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Sebaran status pengajuan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {([
              ["baru", summary.baru],
              ["direview", summary.direview],
              ["disetujui", summary.disetujui],
              ["membutuhkan_info", summary.membutuhkanInfo],
              ["ditolak", summary.ditolak],
            ] as const).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-gray-500">{STATUS_LABEL[key]}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-gray-400" aria-hidden />
              <CardTitle className="text-lg">Hasil OCR dokumen</CardTitle>
            </div>
            <CardDescription>Perbandingan dokumen UMKM dengan template contoh.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Akurasi dokumen</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{ocr.akurasiDokumen}%</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Dokumen dibaca</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{ocr.diperiksa}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs text-amber-700">Perlu perbaikan</p>
              <p className="mt-2 text-2xl font-bold text-amber-900">{ocr.perluPerbaikan}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Kolom sesuai</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{ocr.akurasiField}%</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
          <CardDescription>Pengajuan yang paling baru diperbarui.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {recent.map((item) => (
            <Link key={item.id} href={`/admin/pengajuan/${item.id}`} className="block rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">{item.businessName}</p>
                <Badge tone="neutral">{STATUS_LABEL[item.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Data usaha: {DATA_USAHA_LABEL[item.dataUsaha]} · {formatTanggalPendek(item.lastUpdatedAt)}
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <AdminCasesTable cases={cases} title="Daftar Pengajuan" description="Cari, filter, dan buka detail pengajuan dari sini." />
    </div>
  );
}
