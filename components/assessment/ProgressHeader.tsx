"use client";

import Link from "next/link";
import { Save } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { Progress } from "@/components/ui/progress";
import { PILLARS } from "@/lib/assessment-config";
import { cn } from "@/lib/utils";

export function ProgressHeader({
  pilarAktif,
  persen,
  terjawab,
  totalPertanyaan,
}: {
  pilarAktif: number;
  persen: number;
  terjawab: number;
  totalPertanyaan: number;
}) {
  const pilar = PILLARS.find((p) => p.id === pilarAktif);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-form flex h-16 items-center justify-between gap-4">
        <Logo />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <Save className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Simpan &amp; Lanjut Nanti</span>
          <span className="sm:hidden">Simpan</span>
        </Link>
      </div>

      <div className="container-form pb-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-semibold text-gray-900">
            Pilar {pilarAktif} dari {PILLARS.length}: {pilar?.nama}
          </p>
          <p className="text-sm tabular-nums text-gray-500">
            {terjawab}/{totalPertanyaan} pertanyaan · {Math.round(persen)}%
          </p>
        </div>

        <Progress value={persen} label="Progres asesmen keseluruhan" />

        <ol className="mt-3 flex gap-1.5" aria-label="Daftar pilar">
          {PILLARS.map((p) => (
            <li key={p.id} className="flex-1">
              <Link
                href={`/asesmen/${p.id}`}
                aria-label={`Pilar ${p.id}: ${p.nama}`}
                aria-current={p.id === pilarAktif ? "step" : undefined}
                className={cn(
                  "block h-1.5 rounded-full transition-colors",
                  p.id === pilarAktif
                    ? "bg-primary-700"
                    : p.id < pilarAktif
                      ? "bg-primary-300"
                      : "bg-gray-200 hover:bg-gray-300",
                )}
              />
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
