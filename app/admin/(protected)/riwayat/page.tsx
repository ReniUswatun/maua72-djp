"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTanggal, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";

type FeedEntry = {
  id: string;
  caseId: string;
  businessName: string;
  kind: "timeline" | "audit";
  title: string;
  detail: string;
  actor: string;
  date: string;
};

export default function AdminHistoryPage() {
  const cases = useAdminStore((s) => s.cases);

  const feed: FeedEntry[] = cases
    .flatMap((item) => [
      ...item.timeline.map((entry) => ({
        id: entry.id,
        caseId: item.id,
        businessName: item.businessName,
        kind: "timeline" as const,
        title: entry.judul,
        detail: entry.detail,
        actor: entry.aktor,
        date: entry.tanggal,
      })),
      ...item.auditTrail.map((entry) => ({
        id: entry.id,
        caseId: item.id,
        businessName: item.businessName,
        kind: "audit" as const,
        title: entry.action,
        detail: [entry.field, entry.before, entry.after, entry.note].filter(Boolean).join(" · "),
        actor: entry.officer,
        date: entry.timestamp,
      })),
    ])
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <Badge tone="primary" className="w-fit">Chronological History</Badge>
          <CardTitle className="text-2xl">Timeline Seluruh UMKM</CardTitle>
          <CardDescription>
            Semua assessment, review, request info, approval, dan audit officer ditampilkan secara urut waktu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-600">
            Riwayat di sini menggabungkan event bisnis dan keputusan officer untuk memudahkan investigasi dan audit internal.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {feed.map((entry) => (
          <Card key={`${entry.kind}-${entry.id}`} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={entry.kind === "audit" ? "accent" : "neutral"}>{entry.kind}</Badge>
                <Badge tone="primary">{entry.caseId}</Badge>
                <span className="text-xs text-slate-500">{formatTanggal(entry.date)}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{entry.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{entry.detail || "-"}</p>
              <p className="mt-3 text-xs text-slate-500">
                {entry.businessName} · oleh {entry.actor} · {formatTanggalPendek(entry.date)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
