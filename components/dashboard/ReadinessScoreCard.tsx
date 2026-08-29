"use client";

import { TrendingUp } from "lucide-react";

import { LEVELS } from "@/lib/scoring";
import type { AssessmentResult } from "@/lib/types";
import { cn, formatTanggal } from "@/lib/utils";

/** Gauge lingkaran untuk skor 0–100. */
function Gauge({
  skor,
  warna,
  ukuran = 180,
}: {
  skor: number;
  warna: string;
  ukuran?: number;
}) {
  const stroke = 14;
  const r = (ukuran - stroke) / 2;
  const keliling = 2 * Math.PI * r;
  const terisi = (Math.max(0, Math.min(100, skor)) / 100) * keliling;

  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox={`0 0 ${ukuran} ${ukuran}`}
      role="img"
      aria-label={`Skor kesiapan ${skor} dari 100`}
      className="shrink-0"
    >
      <circle
        cx={ukuran / 2}
        cy={ukuran / 2}
        r={r}
        fill="none"
        stroke="#E4E4E7"
        strokeWidth={stroke}
      />
      <circle
        cx={ukuran / 2}
        cy={ukuran / 2}
        r={r}
        fill="none"
        stroke={warna}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${terisi} ${keliling - terisi}`}
        transform={`rotate(-90 ${ukuran / 2} ${ukuran / 2})`}
        style={{ transition: "stroke-dasharray 700ms ease-out" }}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-primary-900 text-[2.6rem] font-bold"
        style={{ fontSize: ukuran * 0.26 }}
      >
        {skor}
      </text>
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        className="fill-gray-400 font-semibold"
        style={{ fontSize: ukuran * 0.085 }}
      >
        dari 100
      </text>
    </svg>
  );
}

export function ReadinessScoreCard({
  hasil,
  sebelumnya,
  ringkas = false,
  className,
}: {
  hasil: AssessmentResult;
  sebelumnya?: AssessmentResult | null;
  ringkas?: boolean;
  className?: string;
}) {
  const level = LEVELS[hasil.level];
  const selisih = sebelumnya ? hasil.skorTotal - sebelumnya.skorTotal : null;

  return (
    <section
      className={cn(
        "rounded-xl border bg-white p-6 sm:p-8",
        level.border,
        className,
      )}
    >
      <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:gap-9">
        <Gauge
          skor={hasil.skorTotal}
          warna={level.ring}
          ukuran={ringkas ? 150 : 180}
        />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Level Kesiapan Ekspor
          </p>
          <p className={cn("mt-1.5 text-3xl font-bold tracking-tight", level.warna)}>
            Level {hasil.level} — {level.nama}
          </p>
          <p className="mt-3 leading-relaxed text-gray-600">{level.deskripsi}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
              Rentang skor level ini: {level.rentang}
            </span>
            {selisih !== null ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  selisih >= 0
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                <TrendingUp
                  className={cn("h-3.5 w-3.5", selisih < 0 && "rotate-180")}
                  aria-hidden
                />
                {selisih >= 0 ? "+" : ""}
                {selisih} poin dari asesmen sebelumnya
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Asesmen {formatTanggal(hasil.tanggal)}
          </p>
        </div>
      </div>

      {hasil.overrides.length > 0 ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Aturan pembatas level diterapkan
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-amber-800">
            {hasil.overrides.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-amber-700">
            Tanpa pembatas ini, skor Anda setara Level{" "}
            {hasil.levelSebelumOverride}.
          </p>
        </div>
      ) : null}
    </section>
  );
}
