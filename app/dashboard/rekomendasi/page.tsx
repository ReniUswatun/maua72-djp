"use client";

import * as React from "react";
import Link from "next/link";
import { ListChecks } from "lucide-react";

import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { Button } from "@/components/ui/button";
import { PILLARS } from "@/lib/assessment-config";
import { useAppStore } from "@/store/assessment-store";
import { cn } from "@/lib/utils";

type Saring = "semua" | "berjalan" | "selesai" | "ditinjau";

const TAB: { id: Saring; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "berjalan", label: "Belum selesai" },
  { id: "ditinjau", label: "Sudah ditinjau petugas" },
  { id: "selesai", label: "Selesai" },
];

export default function RekomendasiPage() {
  const rekomendasi = useAppStore((s) => s.rekomendasi);
  const [tab, setTab] = React.useState<Saring>("semua");
  const [pilar, setPilar] = React.useState<number | null>(null);

  const tersaring = rekomendasi.filter((r) => {
    if (pilar !== null && r.pillarId !== pilar) return false;
    if (tab === "berjalan") return !r.selesai;
    if (tab === "selesai") return !!r.selesai;
    if (tab === "ditinjau") return r.review.status !== "pending_review";
    return true;
  });

  if (rekomendasi.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <ListChecks className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-xl font-semibold">Belum ada rekomendasi</h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-gray-600">
          Rekomendasi disusun otomatis setelah Anda menyelesaikan asesmen
          kesiapan ekspor.
        </p>
        <Link href="/asesmen" className="mt-7 inline-block">
          <Button size="lg">Mulai Asesmen</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Rekomendasi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {rekomendasi.length} langkah untuk usaha Anda
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Disusun berdasarkan jawaban asesmen Anda dan diurutkan dari yang paling
          menentukan. Setiap rekomendasi menampilkan status peninjauan petugas.
        </p>
      </div>

      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="Saring rekomendasi"
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          {TAB.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "border-primary-700 bg-primary-700 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            onClick={() => setPilar(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              pilar === null
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
            )}
          >
            Semua pilar
          </button>
          {PILLARS.filter((p) =>
            rekomendasi.some((r) => r.pillarId === p.id),
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setPilar(pilar === p.id ? null : p.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                pilar === p.id
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
              )}
            >
              {p.nama}
            </button>
          ))}
        </div>
      </div>

      {tersaring.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Tidak ada rekomendasi yang cocok dengan saringan ini.
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {tersaring.map((r) => (
            <RecommendationCard key={r.id} rekomendasi={r} />
          ))}
        </div>
      )}

      <DisclaimerBanner ringkas />
    </div>
  );
}
