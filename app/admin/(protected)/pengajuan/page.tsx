"use client";

import { AdminCasesTable } from "@/components/admin/AdminCasesTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStore } from "@/store/admin-store";

export default function AdminApplicationsPage() {
  const cases = useAdminStore((s) => s.cases);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <Badge tone="primary" className="w-fit">Monitoring</Badge>
          <CardTitle className="text-2xl">Daftar Pengajuan UMKM</CardTitle>
          <CardDescription>
            Semua data case disajikan sebagai sumber tunggal untuk officer review dan reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Gunakan pencarian, filter status, filter level, dan sorting untuk menemukan pengajuan yang perlu ditangani terlebih dahulu.
          </p>
        </CardContent>
      </Card>

      <AdminCasesTable cases={cases} title="Tabel Pengajuan" description="Daftar operasional untuk membuka detail review." />
    </div>
  );
}
