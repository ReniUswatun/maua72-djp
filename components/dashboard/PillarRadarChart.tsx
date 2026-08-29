"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { PillarIcon } from "@/components/shared/PillarIcon";
import {
  getPillar,
  questionsForPillar,
} from "@/lib/assessment-config";
import { maxPoin, poinJawaban } from "@/lib/scoring";
import type { AnswerMap, BusinessProfile, PillarScore } from "@/lib/types";
import { cn } from "@/lib/utils";

const UKURAN = 320;
const PUSAT = UKURAN / 2;
const RADIUS = 118;

function titik(indeks: number, jumlah: number, nilai: number) {
  const sudut = (Math.PI * 2 * indeks) / jumlah - Math.PI / 2;
  const r = (RADIUS * Math.max(0, Math.min(100, nilai))) / 100;
  return [PUSAT + r * Math.cos(sudut), PUSAT + r * Math.sin(sudut)] as const;
}

export function PillarRadarChart({ pilar }: { pilar: PillarScore[] }) {
  const n = pilar.length;
  const poligon = pilar
    .map((p, i) => titik(i, n, p.skor).join(","))
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${UKURAN} ${UKURAN}`}
      className="mx-auto h-auto w-full max-w-[20rem]"
      role="img"
      aria-label="Grafik radar skor delapan pilar kesiapan ekspor"
    >
      {[25, 50, 75, 100].map((lingkar) => (
        <polygon
          key={lingkar}
          points={pilar.map((_, i) => titik(i, n, lingkar).join(",")).join(" ")}
          fill="none"
          stroke="#E4E4E7"
          strokeWidth={1}
        />
      ))}

      {pilar.map((_, i) => {
        const [x, y] = titik(i, n, 100);
        return (
          <line
            key={i}
            x1={PUSAT}
            y1={PUSAT}
            x2={x}
            y2={y}
            stroke="#E4E4E7"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={poligon}
        fill="rgba(46, 90, 138, 0.18)"
        stroke="#2E5A8A"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {pilar.map((p, i) => {
        const [x, y] = titik(i, n, p.skor);
        return <circle key={p.pillarId} cx={x} cy={y} r={3.5} fill="#1E3F63" />;
      })}

      {pilar.map((p, i) => {
        const [x, y] = titik(i, n, 118);
        return (
          <text
            key={`l-${p.pillarId}`}
            x={x}
            y={y}
            textAnchor={x > PUSAT + 4 ? "start" : x < PUSAT - 4 ? "end" : "middle"}
            dominantBaseline={y > PUSAT + 4 ? "hanging" : y < PUSAT - 4 ? "auto" : "middle"}
            className="fill-gray-500"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {p.pillarId}
          </text>
        );
      })}
    </svg>
  );
}

export function PillarBars({
  pilar,
  answers,
  profile,
}: {
  pilar: PillarScore[];
  answers: AnswerMap;
  profile: BusinessProfile | null;
}) {
  const [terbuka, setTerbuka] = React.useState<number | null>(null);

  return (
    <ul className="divide-y divide-gray-100">
      {pilar.map((p) => {
        const info = getPillar(p.pillarId);
        const aktif = terbuka === p.pillarId;
        const warna =
          p.skor >= 70
            ? "bg-success"
            : p.skor >= 50
              ? "bg-accent-500"
              : p.skor >= 30
                ? "bg-warning"
                : "bg-danger";

        return (
          <li key={p.pillarId}>
            <button
              type="button"
              onClick={() => setTerbuka(aktif ? null : p.pillarId)}
              aria-expanded={aktif}
              className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <PillarIcon icon={info?.icon ?? ""} className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-semibold text-gray-900">
                    {p.pillarId}. {info?.nama}
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-gray-900">
                    {p.skor}
                  </span>
                </span>
                <span className="mt-2 block h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <span
                    className={cn("block h-full rounded-full transition-all", warna)}
                    style={{ width: `${p.skor}%` }}
                  />
                </span>
                <span className="mt-1.5 block text-xs text-gray-500">
                  Bobot {Math.round((info?.bobot ?? 0) * 100)}% · {p.terjawab}/
                  {p.total} pertanyaan terjawab
                </span>
              </span>

              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-gray-400 transition-transform",
                  aktif && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {aktif ? (
              <div className="animate-fade-in pb-5 pl-14 pr-2">
                <p className="mb-3 text-sm leading-relaxed text-gray-600">
                  {info?.ringkas}
                </p>
                <ul className="space-y-2.5">
                  {questionsForPillar(p.pillarId, profile).map((q) => {
                    const maks = maxPoin(q);
                    const poin = poinJawaban(q, answers[q.id]);
                    const persen = maks === 0 ? 0 : Math.round((poin / maks) * 100);
                    return (
                      <li
                        key={q.id}
                        className="flex items-start justify-between gap-4 rounded-lg bg-gray-50 p-3 text-sm"
                      >
                        <span className="min-w-0 text-gray-700">{q.teks}</span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                            persen >= 70
                              ? "bg-green-100 text-green-700"
                              : persen >= 40
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700",
                          )}
                        >
                          {persen}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
