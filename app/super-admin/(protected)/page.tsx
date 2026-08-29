"use client";

import Link from "next/link";
import { Activity, ArrowRight, Gauge, ShieldCheck, ShieldHalf, Users } from "lucide-react";

import { SuperAdminAccountsPanel } from "@/components/admin/SuperAdminAccountsPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAccuracy } from "@/lib/ai-accuracy";
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
    title: "Akurasi AI",
    desc: "Pantau seberapa sering draf AI dipakai apa adanya.",
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
  const accuracy = computeAccuracy(cases).overall;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-slate-950 text-white">
        <CardHeader>
          <Badge tone="accent" className="w-fit border-white/10 bg-white/10 text-white">Super Admin</Badge>
          <CardTitle className="text-2xl">Pusat Kendali Akun Admin</CardTitle>
          <CardDescription className="text-white/70">
            Kelola officer, nonaktifkan akses, dan audit perubahan tanpa menyentuh flow user.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-300" aria-hidden />
              <p className="text-sm text-white/70">Total akun</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{accounts.length}</p>
            <p className="mt-2 text-sm text-white/60">Officer dan super admin</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden />
              <p className="text-sm text-white/70">Officer aktif</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{officerCount}</p>
            <p className="mt-2 text-sm text-white/60">Siap login ke dashboard officer</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-sky-300" aria-hidden />
              <p className="text-sm text-white/70">Akurasi draf AI</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{accuracy.akurasi}%</p>
            <p className="mt-2 text-sm text-white/60">
              {accuracy.total - accuracy.belumDireview} dari {accuracy.total} dimensi direview · {summary.total} case
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-slate-300"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <item.icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 flex items-center gap-1 font-semibold text-slate-900">
              {item.title}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </p>
            <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
          </Link>
        ))}
      </div>

      <SuperAdminAccountsPanel />
    </div>
  );
}
