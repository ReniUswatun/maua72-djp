"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, FileText, Sparkles } from "lucide-react";

import type { PanduanEntry } from "@/lib/types";
import { buatRangkuman } from "@/lib/panduan-summary";

/**
 * Rangkuman ala "AI overview": satu ikhtisar dari seluruh panduan yang
 * disusun petugas, dengan tiap bagian bisa langsung diklik ke halamannya.
 */
export function PanduanRangkuman({
  entries,
  basePath,
}: {
  entries: PanduanEntry[];
  basePath: string;
}) {
  const [terbuka, setTerbuka] = React.useState(true);
  const rangkuman = React.useMemo(() => buatRangkuman(entries), [entries]);

  if (rangkuman.jumlah === 0) return null;

  return (
    <section
      id="rangkuman"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50"
    >
      <div className="flex items-start justify-between gap-4 border-b border-indigo-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Ringkasan panduan</h2>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                AI
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Dirangkum otomatis dari {rangkuman.jumlah} panduan yang diterbitkan petugas — Anda tidak perlu membuka satu per satu.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTerbuka((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          aria-expanded={terbuka}
        >
          {terbuka ? "Sembunyikan" : "Tampilkan"}
          <ChevronDown className={`h-4 w-4 transition-transform ${terbuka ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {terbuka ? (
        <div className="space-y-6 px-5 py-5 sm:px-6">
          <p className="text-[15px] leading-relaxed text-gray-700">{rangkuman.pembuka}</p>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Ikhtisar tiap bagian
            </h3>
            <ol className="mt-3 space-y-3">
              {rangkuman.langkah.map((item, i) => (
                <li key={item.entry.id} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`${basePath}/${item.entry.slug}`}
                      className="group inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-indigo-700"
                    >
                      {item.entry.judul}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </Link>
                    <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{item.inti}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {rangkuman.dokumen.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                Dokumen yang perlu disiapkan
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {rangkuman.dokumen.map((d) => (
                  <li key={d.entry.id}>
                    <Link
                      href={`${basePath}/${d.entry.slug}`}
                      className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-900">{d.entry.judul}</span>
                        <span className="mt-0.5 block text-xs text-gray-500">{d.penerbit}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="border-t border-indigo-100 pt-3 text-xs text-gray-500">
            Rangkuman ini ikhtisar otomatis. Selalu buka halaman terkait untuk detail lengkap, dan
            konfirmasikan ke petugas bila ragu.
          </p>
        </div>
      ) : null}
    </section>
  );
}
