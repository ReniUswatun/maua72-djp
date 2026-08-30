"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Search, Sparkles, X } from "lucide-react";

import type { PanduanEntry } from "@/lib/types";
import { jawabPencarian } from "@/lib/panduan-search";

const CONTOH = ["cara buat NIB", "HS Code", "SKA form D", "ajukan PEB", "pembayaran L/C"];

export function PanduanSearch({
  entries,
  basePath,
  query,
  onQuery,
}: {
  entries: PanduanEntry[];
  basePath: string;
  query: string;
  onQuery: (value: string) => void;
}) {
  const aktif = query.trim().length > 0;
  const jawaban = React.useMemo(
    () => (aktif ? jawabPencarian(entries, query) : null),
    [aktif, entries, query],
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Cari di panduan — mis. “cara membuat SKA” atau “HS Code”"
          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-11 text-[15px] shadow-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          aria-label="Cari di panduan"
        />
        {aktif ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {!aktif ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>Coba:</span>
          {CONTOH.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onQuery(c)}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700"
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      {jawaban ? <HasilPencarian jawaban={jawaban} basePath={basePath} /> : null}
    </div>
  );
}

function HasilPencarian({
  jawaban,
  basePath,
}: {
  jawaban: ReturnType<typeof jawabPencarian>;
  basePath: string;
}) {
  if (!jawaban.ada) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-6 text-sm text-gray-600">
        Tidak ada bagian panduan yang cocok dengan{" "}
        <span className="font-semibold text-gray-900">“{jawaban.query}”</span>. Coba kata kunci lain,
        atau lihat seluruh langkah panduan di bawah.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Jawaban ringkas ala AI overview */}
      <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50">
        <div className="flex items-center gap-2.5 border-b border-indigo-100 px-5 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-gray-900">Ringkasan AI</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
            dari panduan petugas
          </span>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-[15px] leading-relaxed text-gray-800">{jawaban.jawaban}</p>

          {jawaban.poin.length > 0 ? (
            <ul className="space-y-2.5">
              {jawaban.poin.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
                  <span>
                    {p.teks}{" "}
                    <Link
                      href={`${basePath}/${p.sumberSlug}`}
                      className="whitespace-nowrap text-xs font-medium text-indigo-700 hover:underline"
                    >
                      — {p.sumberJudul}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {jawaban.sumber.length > 0 ? (
            <div className="border-t border-indigo-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Sumber</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {jawaban.sumber.map((s) => (
                  <Link
                    key={s.id}
                    href={`${basePath}/${s.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    {s.judul}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <p className="text-[11px] leading-relaxed text-gray-500">
            Ringkasan otomatis dari panduan yang diterbitkan petugas. Selalu buka halaman sumber untuk
            detail lengkap.
          </p>
        </div>
      </section>

      {/* Daftar hasil */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700">
          {jawaban.hasil.length} bagian panduan terkait
        </h3>
        <ol className="mt-3 space-y-2.5">
          {jawaban.hasil.map((r) => (
            <li key={r.entry.id}>
              <Link
                href={`${basePath}/${r.entry.slug}`}
                className="group block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary-200 hover:bg-primary-50/30"
              >
                <span className="flex items-center gap-1.5 font-semibold text-gray-900 group-hover:text-primary-700">
                  {r.entry.judul}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600">{r.cuplikan}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
