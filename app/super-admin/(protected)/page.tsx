"use client";

import { Activity, ShieldCheck, Users } from "lucide-react";

import { SuperAdminAccountsPanel } from "@/components/admin/SuperAdminAccountsPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStore, useAdminSummary } from "@/store/admin-store";

export default function SuperAdminDashboardPage() {
  const accounts = useAdminStore((s) => s.accounts);
  const summary = useAdminSummary();
  const officerCount = accounts.filter((account) => account.role === "officer").length;
  const superAdminCount = accounts.filter((account) => account.role === "super_admin").length;

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
              <Activity className="h-5 w-5 text-sky-300" aria-hidden />
              <p className="text-sm text-white/70">Case aktif</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{summary.total}</p>
            <p className="mt-2 text-sm text-white/60">Pengajuan UMKM yang dipantau</p>
          </div>
        </CardContent>
      </Card>

      <SuperAdminAccountsPanel />
    </div>
  );
}
