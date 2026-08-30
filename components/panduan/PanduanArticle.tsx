"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Info, Loader2 } from "lucide-react";

import { usePanduanStore, usePublishedPanduan } from "@/store/panduan-store";
import { formatTanggalPendek } from "@/lib/utils";
import type { PanduanBlok } from "@/lib/types";

function Blok({ blok }: { blok: PanduanBlok }) {
  switch (blok.tipe) {
    case "paragraf":
      return <p className="text-[15px] leading-relaxed text-gray-700">{blok.teks}</p>;
    case "poin":
      return (
        <ul className="space-y-2.5">
          {blok.items.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-gray-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      );
    case "langkah":
      return (
        <ol className="space-y-4">
          {blok.items.map((l, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                {l.judul ? <p className="font-semibold text-gray-900">{l.judul}</p> : null}
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{l.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "gambar":
      return (
        <figure className="overflow-hidden rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blok.dataUrl} alt={blok.keterangan ?? "Gambar panduan"} className="w-full" />
          {blok.keterangan ? (
            <figcaption className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
              {blok.keterangan}
            </figcaption>
          ) : null}
        </figure>
      );
    case "catatan":
      return (
        <div className="flex gap-3 rounded-xl border border-primary-100 bg-primary-50/60 p-4 text-sm leading-relaxed text-primary-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
          <p>{blok.teks}</p>
        </div>
      );
    case "tautan":
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-4">
          {blok.items.map((t, i) => (
            <a
              key={i}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {t.teks}
            </a>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function PanduanArticle({ slug, basePath }: { slug: string; basePath: string }) {
  const hydrated = usePanduanStore((s) => s.hydrated);
  const entries = usePublishedPanduan();

  if (!hydrated) {
    return (
      <p className="flex items-center gap-2 py-16 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Memuat panduan…
      </p>
    );
  }

  const index = entries.findIndex((e) => e.slug === slug);
  const entry = index >= 0 ? entries[index] : null;

  if (!entry) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Langkah tidak ditemukan</h1>
        <p className="mt-2 text-gray-600">Langkah ini mungkin sudah diubah atau disembunyikan.</p>
        <Link href={basePath} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar panduan
        </Link>
      </div>
    );
  }

  const prev = index > 0 ? entries[index - 1] : null;
  const next = index < entries.length - 1 ? entries[index + 1] : null;

  return (
    <article className="mx-auto max-w-2xl">
      <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Semua langkah
      </Link>

      <p className="mt-6 text-sm font-semibold text-primary-700">Langkah {index + 1}</p>
      <h1 className="mt-1 text-3xl font-bold leading-tight tracking-tight">{entry.judul}</h1>
      {entry.ringkas ? <p className="mt-3 text-lg leading-relaxed text-gray-600">{entry.ringkas}</p> : null}

      {entry.gambarSampul ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.gambarSampul} alt={entry.judul} className="w-full" />
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        {entry.blok.map((b, i) => (
          <Blok key={i} blok={b} />
        ))}
      </div>

      {entry.diperbaruiOleh ? (
        <p className="mt-10 border-t border-gray-100 pt-4 text-xs text-gray-400">
          Diperbarui oleh {entry.diperbaruiOleh}
          {entry.diperbaruiPada ? ` · ${formatTanggalPendek(entry.diperbaruiPada)}` : ""}
        </p>
      ) : null}

      <nav className="mt-8 flex items-stretch justify-between gap-4 border-t border-gray-200 pt-6">
        {prev ? (
          <Link href={`${basePath}/${prev.slug}`} className="group flex-1 rounded-xl border border-gray-200 p-4 hover:border-primary-200">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Sebelumnya
            </span>
            <span className="mt-1 block text-sm font-semibold text-gray-900">{prev.judul}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link href={`${basePath}/${next.slug}`} className="group flex-1 rounded-xl border border-gray-200 p-4 text-right hover:border-primary-200">
            <span className="flex items-center justify-end gap-1 text-xs text-gray-500">
              Berikutnya <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="mt-1 block text-sm font-semibold text-gray-900">{next.judul}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  );
}
