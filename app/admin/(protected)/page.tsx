"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, Clock3, Layers3, Search, ShieldCheck, Sparkles } from "lucide-react";

import { AdminCasesTable } from "@/components/admin/AdminCasesTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { levelLabel, readinessBuckets } from "@/lib/admin-data";
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useAdminSummary } from "@/store/admin-store";

function SummaryCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint: string; icon: typeof Search }) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-sm text-slate-600">{hint}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
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
  const buckets = readinessBuckets(cases);
  const recent = [...cases].sort((a, b) => +new Date(b.lastUpdatedAt) - +new Date(a.lastUpdatedAt)).slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white">
          <CardContent className="relative p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_35%)]" />
            <div className="relative max-w-2xl">
              <Badge tone="accent" className="border-white/10 bg-white/10 text-white">Officer Monitoring</Badge>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">Monitoring Dashboard Pengajuan UMKM</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
                Summary pengajuan, distribusi level kesiapan, dan workspace review untuk mengubah AI Draft menjadi keputusan final officer.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/admin/pengajuan">
                  <Button size="lg" variant="accent">
                    Buka Daftar Pengajuan
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <Link href="/admin/riwayat">
                  <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    Lihat Riwayat Lengkap
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            <CardDescription>Update pengajuan yang paling baru diubah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.map((item) => (
              <Link key={item.id} href={`/admin/pengajuan/${item.id}`} className="block rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{item.businessName}</p>
                  <Badge tone="neutral">{levelLabel(item.readinessLevel)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.status} · {formatTanggalPendek(item.lastUpdatedAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Pengajuan" value={summary.total} hint="Seluruh case aktif pada prototipe" icon={ClipboardCheck} />
        <SummaryCard label="Baru" value={summary.baru} hint="Belum dibuka officer" icon={Sparkles} />
        <SummaryCard label="Direview" value={summary.direview} hint="Sedang dalam workspace review" icon={ShieldCheck} />
        <SummaryCard label="Butuh Info" value={summary.membutuhkanInfo} hint="Menunggu pelengkapan UMKM" icon={Clock3} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Ringkasan Level</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Sebaran kesiapan UMKM</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <div key={level} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">{levelLabel(level)}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{buckets[level]}</p>
              <p className="mt-2 text-sm text-slate-600">Pengajuan berada pada level ini.</p>
            </div>
          ))}
        </div>
      </section>

      <AdminCasesTable cases={cases} title="Monitoring Dashboard" description="Search, filter, sort, dan buka detail pengajuan dari sini." />
    </div>
  );
}
