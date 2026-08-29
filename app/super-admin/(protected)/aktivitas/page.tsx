"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTanggal, formatTanggalPendek } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";

const KIND_LABEL: Record<string, string> = { account: "Akun", audit: "Audit" };

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
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Super Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Log aktivitas</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Rekap perubahan akun dan jejak audit pengajuan, tersusun dari yang terbaru.
        </p>
      </div>

      {feed.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center text-sm text-gray-500">Belum ada aktivitas.</CardContent>
        </Card>
      ) : (
        <ol className="relative space-y-4 border-l border-gray-200 pl-6">
          {feed.map((entry) => (
            <li key={`${entry.kind}-${entry.id}`} className="relative">
              <span
                className={`absolute -left-[1.9rem] mt-1.5 h-3 w-3 rounded-full ring-4 ring-gray-50 ${
                  entry.kind === "audit" ? "bg-accent-500" : "bg-primary-400"
                }`}
                aria-hidden
              />
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={entry.kind === "audit" ? "accent" : "neutral"}>{KIND_LABEL[entry.kind] ?? entry.kind}</Badge>
                  <span className="text-xs text-gray-400">{formatTanggal(entry.date)}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-gray-900">{entry.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{entry.detail}</p>
                <p className="mt-2 text-xs text-gray-400">oleh {entry.actor} · {formatTanggalPendek(entry.date)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
