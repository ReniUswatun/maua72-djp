"use client";

import Link from "next/link";
import { Activity, ArrowRight, Gauge, ShieldCheck, ShieldHalf, Users } from "lucide-react";

import { SuperAdminAccountsPanel } from "@/components/admin/SuperAdminAccountsPanel";
import { Card, CardContent } from "@/components/ui/card";
import { computeOcrAccuracy } from "@/lib/ai-accuracy";
import { useAdminStore, useAdminSummary } from "@/store/admin-store";

const SHORTCUTS = [
  {
    href: "/super-admin/akses",
    icon: ShieldHalf,
    title: "Hak Akses Peran",
    desc: "Atur izin RBAC untuk officer & super admin.",
  },
  {
    href: "/super-admin/akurasi-ai",
    icon: Gauge,
    title: "Akurasi OCR",
    desc: "Pantau kecocokan dokumen UMKM dengan template contoh.",
  },
  {
    href: "/super-admin/aktivitas",
    icon: Activity,
    title: "Activity Log",
    desc: "Rekap aktivitas akun dan audit trail case.",
  },
];

export default function SuperAdminDashboardPage() {
  const accounts = useAdminStore((s) => s.accounts);
  const cases = useAdminStore((s) => s.cases);
  const summary = useAdminSummary();
  const officerCount = accounts.filter((account) => account.role === "officer").length;
  const ocr = computeOcrAccuracy(cases);

  const STATS = [
    { icon: Users, label: "Total akun", value: accounts.length, hint: "Officer dan super admin" },
    { icon: ShieldCheck, label: "Officer aktif", value: officerCount, hint: "Siap login ke ruang kerja officer" },
    { icon: Gauge, label: "Akurasi OCR dokumen", value: `${ocr.akurasiDokumen}%`, hint: `${ocr.diperiksa} dokumen dibaca · ${summary.total} case` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Super Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pusat kendali akun &amp; tata kelola</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Kelola akun officer, atur hak akses per peran, dan audit perubahan — tanpa menyentuh
          alur UMKM.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-gray-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 text-gray-500">
                <stat.icon className="h-4 w-4" aria-hidden />
                <p className="text-sm font-medium">{stat.label}</p>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-600">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-card transition-colors hover:border-primary-200 hover:bg-primary-50/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <item.icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 flex items-center gap-1 font-semibold text-gray-900">
              {item.title}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </p>
            <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
          </Link>
        ))}
      </div>

      <SuperAdminAccountsPanel />
    </div>
  );
}
