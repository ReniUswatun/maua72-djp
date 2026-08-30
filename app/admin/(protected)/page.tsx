"use client";

import Link from "next/link";
import { AlarmClock, ArrowRight, BadgeCheck, MessageSquare, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DATA_USAHA_LABEL, STATUS_LABEL } from "@/lib/admin-data";
import { countOverdue, SLA_LIMIT_DAYS, slaInfo, slaTone } from "@/lib/sla";
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import { useAppStore } from "@/store/assessment-store";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Sparkles;
  tone?: "neutral" | "warning";
}) {
  return (
    <Card className="border-gray-200 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p
              className={`mt-2 text-3xl font-bold tracking-tight ${
                tone === "warning" && value > 0 ? "text-amber-700" : "text-gray-900"
              }`}
            >
              {value}
            </p>
            <p className="mt-2 text-sm text-gray-600">{hint}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const cases = useAdminStore((s) => s.cases);
  const tickets = useAppStore((s) => s.tickets);

  const baru = cases.filter((item) => item.status === "baru").length;
  const dataUsahaMenunggu = cases.filter((item) => item.dataUsaha === "menunggu").length;
  const overdue = countOverdue(cases);
  const tiketMenunggu = tickets.filter((t) => t.status === "menunggu").length;

  const perluDitangani = cases
    .filter(
      (item) =>
        item.status === "baru" ||
        item.status === "membutuhkan_info" ||
        item.dataUsaha === "menunggu",
    )
    .sort((a, b) => +new Date(a.submittedAt) - +new Date(b.submittedAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Ruang Kerja Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Beranda admin</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Yang perlu ditangani lebih dulu — pengajuan baru, data usaha yang menunggu
            verifikasi, dan pertanyaan UMKM.
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pengajuan baru" value={baru} hint="Belum dibuka admin" icon={Sparkles} tone="warning" />
        <StatCard
          label="Data usaha menunggu"
          value={dataUsahaMenunggu}
          hint="Perlu verifikasi NIB / NPWP"
          icon={BadgeCheck}
          tone="warning"
        />
        <StatCard
          label="Terlambat (SLA)"
          value={overdue}
          hint={`Menunggu lebih dari ${SLA_LIMIT_DAYS} hari`}
          icon={AlarmClock}
          tone="warning"
        />
      </section>

      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Perlu ditangani</h2>
            <Link href="/admin/pengajuan" className="text-sm font-semibold text-primary-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          {perluDitangani.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">
              Tidak ada pengajuan yang menunggu tindakan. 🎉
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {perluDitangani.map((item) => {
                const sla = slaInfo(item);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/admin/pengajuan/${item.id}`}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{item.businessName}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.namaProduk} · {item.negaraTujuan} · masuk {formatTanggalPendek(item.submittedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge tone="neutral">{STATUS_LABEL[item.status]}</Badge>
                        {item.dataUsaha === "menunggu" ? (
                          <Badge tone="warning">Data usaha: {DATA_USAHA_LABEL[item.dataUsaha]}</Badge>
                        ) : null}
                        {sla.level === "terlambat" ? <Badge tone={slaTone(sla.level)}>Terlambat</Badge> : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {tiketMenunggu > 0
                  ? `${tiketMenunggu} pertanyaan menunggu jawaban`
                  : "Tidak ada pertanyaan yang menunggu"}
              </p>
              <p className="text-sm text-gray-600">Konsultasi dari UMKM lewat inbox pertanyaan.</p>
            </div>
          </div>
          <Link href="/admin/pertanyaan">
            <Button variant="outline" size="sm">
              Buka Pertanyaan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
