"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTanggal, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";

type FeedEntry = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  actor: string;
  date: string;
};

export default function SuperAdminActivityPage() {
  const accounts = useAdminStore((s) => s.accounts);
  const cases = useAdminStore((s) => s.cases);

  const feed: FeedEntry[] = [
    ...accounts.map((account) => ({
      id: account.id,
      kind: "account",
      title: `Akun ${account.aktif ? "aktif" : "nonaktif"}`,
      detail: `${account.nama} · ${account.email} · reset ${account.passwordResetAt ?? "-"}`,
      actor: account.role,
      date: account.lastLoginAt ?? account.passwordResetAt ?? new Date().toISOString(),
    })),
    ...cases.flatMap((item) =>
      item.auditTrail.map((entry) => ({
        id: entry.id,
        kind: "audit",
        title: entry.action,
        detail: [item.businessName, entry.field, entry.note].filter(Boolean).join(" · "),
        actor: entry.officer,
        date: entry.timestamp,
      })),
    ),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <Badge tone="primary" className="w-fit">Activity Log</Badge>
          <CardTitle className="text-2xl">Log Aktivitas Admin</CardTitle>
          <CardDescription>Rekap aktivitas akun dan audit trail case yang tersimpan di state prototipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-600">
            Ini adalah tampilan opsional untuk membantu super admin memonitor perubahan penting sebelum integrasi ke backend audit service.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {feed.map((entry) => (
          <Card key={`${entry.kind}-${entry.id}`} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={entry.kind === "audit" ? "accent" : "neutral"}>{entry.kind}</Badge>
                <span className="text-xs text-slate-500">{formatTanggal(entry.date)}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{entry.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{entry.detail}</p>
              <p className="mt-3 text-xs text-slate-500">actor: {entry.actor} · {formatTanggalPendek(entry.date)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
