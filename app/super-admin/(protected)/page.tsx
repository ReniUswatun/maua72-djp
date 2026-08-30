"use client";

import Link from "next/link";
import { Activity, ArrowRight, ShieldHalf, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { summarizeAdminPerformance, summarizeGovernance } from "@/lib/admin-data";
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import { useAppStore } from "@/store/assessment-store";

const SHORTCUTS = [
  {
    href: "/super-admin/akun",
    icon: Users,
    title: "Kelola Akun",
    desc: "Tambah, sunting, nonaktifkan, atau hapus akun admin.",
  },
  {
    href: "/super-admin/akses",
    icon: ShieldHalf,
    title: "Hak Akses Peran",
    desc: "Atur izin RBAC untuk peran admin.",
  },
  {
    href: "/super-admin/aktivitas",
    icon: Activity,
    title: "Log Aktivitas",
    desc: "Jejak kronologis keputusan admin dan perubahan akun.",
  },
];

export default function SuperAdminDashboardPage() {
  const accounts = useAdminStore((s) => s.accounts);
  const cases = useAdminStore((s) => s.cases);
  const tickets = useAppStore((s) => s.tickets);

  const governance = summarizeGovernance(cases, accounts);
  const performance = summarizeAdminPerformance(cases, accounts, tickets);

  const STATS = [
    { label: "Total admin", value: governance.totalAdmin, hint: "Akun peran admin" },
    { label: "Admin aktif", value: governance.adminAktif, hint: "Bisa login ke ruang kerja" },
    { label: "Case aktif", value: governance.caseAktif, hint: "Pengajuan berjalan" },
    { label: "Terlambat (SLA)", value: governance.terlambat, hint: "Menunggu > 3 hari" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Super Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pantau kinerja admin</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Ringkasan apa yang sudah dikerjakan tiap admin — pengajuan yang ditangani, keputusan yang
          diambil, dan pertanyaan UMKM yang dijawab. Super admin memantau, tidak ikut memproses.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-gray-200 shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-600">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Rekap per admin</CardTitle>
          <CardDescription>Dihitung dari audit trail pengajuan dan balasan pertanyaan.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {performance.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Belum ada akun admin.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-[0.14em] text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Admin</th>
                  <th className="px-4 py-3 text-left">Ditangani</th>
                  <th className="px-4 py-3 text-left">Disetujui</th>
                  <th className="px-4 py-3 text-left">Ditolak</th>
                  <th className="px-4 py-3 text-left">Minta info</th>
                  <th className="px-4 py-3 text-left">Tiket dijawab</th>
                  <th className="px-4 py-3 text-left">Login terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {performance.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{row.nama}</p>
                      <p className="mt-1 text-xs text-gray-500">{row.email}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{row.ditangani}</td>
                    <td className="px-4 py-4 text-gray-700">{row.disetujui}</td>
                    <td className="px-4 py-4 text-gray-700">{row.ditolak}</td>
                    <td className="px-4 py-4 text-gray-700">{row.mintaInfo}</td>
                    <td className="px-4 py-4 text-gray-700">{row.tiketDijawab}</td>
                    <td className="px-4 py-4">
                      {row.aktif ? (
                        <span className="text-gray-600">
                          {row.lastLoginAt ? formatTanggalPendek(row.lastLoginAt) : "-"}
                        </span>
                      ) : (
                        <Badge tone="danger">Nonaktif</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
