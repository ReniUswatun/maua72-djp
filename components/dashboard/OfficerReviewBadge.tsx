"use client";

import {
  BadgeCheck,
  Clock3,
  MessageCircleQuestion,
  PencilLine,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OfficerReview, OfficerStatus } from "@/lib/types";
import { formatTanggalPendek } from "@/lib/utils";

const PETA: Record<
  OfficerStatus,
  {
    label: string;
    tone: "neutral" | "success" | "info" | "warning";
    Icon: typeof BadgeCheck;
  }
> = {
  pending_review: { label: "Sedang direview petugas", tone: "neutral", Icon: Clock3 },
  approved: { label: "Disetujui petugas", tone: "success", Icon: BadgeCheck },
  edited: { label: "Diedit petugas", tone: "info", Icon: PencilLine },
  needs_more_info: {
    label: "Petugas butuh info tambahan",
    tone: "warning",
    Icon: MessageCircleQuestion,
  },
};

/**
 * Badge status validasi petugas (blueprint §11 & §16 no.1).
 * Inilah komponen yang menunjukkan officer-in-the-loop pada tiap rekomendasi.
 */
export function OfficerReviewBadge({
  review,
  ringkas = false,
}: {
  review: OfficerReview;
  ringkas?: boolean;
}) {
  const { label, tone, Icon } = PETA[review.status];

  return (
    <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
      {!ringkas && review.namaPetugas ? (
        <span className="font-normal opacity-80">
          · {review.namaPetugas}
          {review.tanggal ? `, ${formatTanggalPendek(review.tanggal)}` : ""}
        </span>
      ) : null}
    </Badge>
  );
}

export function CatatanPetugas({ review }: { review: OfficerReview }) {
  if (!review.catatan) return null;

  const tone =
    review.status === "needs_more_info"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : review.status === "edited"
        ? "border-sky-200 bg-sky-50 text-sky-900"
        : "border-green-200 bg-green-50 text-green-900";

  return (
    <div className={`rounded-lg border p-4 text-sm leading-relaxed ${tone}`}>
      <p className="mb-1 font-semibold">
        Catatan {review.namaPetugas ?? "petugas"}
        {review.tanggal ? ` · ${formatTanggalPendek(review.tanggal)}` : ""}
      </p>
      <p>{review.catatan}</p>
    </div>
  );
}
