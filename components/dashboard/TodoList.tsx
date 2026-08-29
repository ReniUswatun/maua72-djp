"use client";

import Link from "next/link";
import { ArrowRight, Circle, CheckCircle2 } from "lucide-react";

import { OfficerReviewBadge } from "@/components/dashboard/OfficerReviewBadge";
import { getPillar } from "@/lib/assessment-config";
import type { Recommendation } from "@/lib/types";
import { useAppStore } from "@/store/assessment-store";
import { cn } from "@/lib/utils";

export function TodoList({ items }: { items: Recommendation[] }) {
  const tandaiSelesai = useAppStore((s) => s.tandaiSelesai);

  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-6 text-sm text-gray-600">
        Belum ada langkah yang perlu dikerjakan. Selesaikan asesmen untuk
        mendapatkan daftar tindakan.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((r) => (
        <li key={r.id} className="flex items-start gap-3 py-4">
          <button
            type="button"
            onClick={() => tandaiSelesai(r.id, !r.selesai)}
            aria-pressed={!!r.selesai}
            aria-label={
              r.selesai
                ? `Batalkan tanda selesai untuk ${r.judul}`
                : `Tandai ${r.judul} selesai`
            }
            className="mt-0.5 shrink-0 rounded-full p-0.5 text-gray-300 transition-colors hover:text-primary-600"
          >
            {r.selesai ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/rekomendasi/${r.id}`}
              className={cn(
                "font-semibold text-gray-900 hover:text-primary-700 hover:underline",
                r.selesai && "text-gray-400 line-through",
              )}
            >
              {r.judul}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">
                {getPillar(r.pillarId)?.nama} · {r.estimasi}
              </span>
              <OfficerReviewBadge review={r.review} ringkas />
            </div>
          </div>

          <Link
            href={`/dashboard/rekomendasi/${r.id}`}
            aria-label={`Buka detail ${r.judul}`}
            className="mt-0.5 shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
