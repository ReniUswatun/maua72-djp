"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Star } from "lucide-react";

import { OfficerReviewBadge } from "@/components/dashboard/OfficerReviewBadge";
import { Badge } from "@/components/ui/badge";
import { getPillar } from "@/lib/assessment-config";
import { EFFORT_LABEL } from "@/lib/recommendations";
import type { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EffortMeter({ effort }: { effort: 1 | 2 | 3 }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`Tingkat usaha: ${EFFORT_LABEL[effort]}`}
    >
      <span className="sr-only">Tingkat usaha: {EFFORT_LABEL[effort]}</span>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= effort ? "fill-accent-500 text-accent-500" : "text-gray-300",
          )}
          aria-hidden
        />
      ))}
      <span className="ml-0.5 text-xs font-medium text-gray-600">
        {EFFORT_LABEL[effort]}
      </span>
    </span>
  );
}

export function RecommendationCard({
  rekomendasi,
  urutan,
}: {
  rekomendasi: Recommendation;
  urutan?: number;
}) {
  const pilar = getPillar(rekomendasi.pillarId);

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border bg-white p-6 transition-colors hover:border-primary-200",
        rekomendasi.selesai ? "border-green-200 bg-green-50/40" : "border-gray-200",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {urutan ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white">
            {urutan}
          </span>
        ) : null}
        <Badge tone="primary">{pilar?.nama}</Badge>
        <OfficerReviewBadge review={rekomendasi.review} ringkas />
        {rekomendasi.selesai ? (
          <Badge tone="success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Selesai
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-900">
        {rekomendasi.judul}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
        {rekomendasi.ringkas}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4">
        <EffortMeter effort={rekomendasi.effort} />
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden />
          {rekomendasi.estimasi}
        </span>
        <Link
          href={`/dashboard/rekomendasi/${rekomendasi.id}`}
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"
        >
          Lihat Detail
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
