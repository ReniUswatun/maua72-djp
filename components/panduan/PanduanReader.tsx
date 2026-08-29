"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  PenLine,
  Stamp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { GLOSSARY_LIST } from "@/lib/glossary";
import { usePanduanStore, usePublishedPanduan } from "@/store/panduan-store";
import type { PanduanEntry } from "@/lib/types";

const PUNYA_ALUR_DETAIL = new Set(["doc-invoice", "doc-packing", "doc-ska", "doc-peb"]);

function TahapCard({ entry, nomor }: { entry: PanduanEntry; nomor: number }) {
  return (
    <li className="relative">
      <span className="absolute -left-[2.15rem] flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white ring-4 ring-white sm:-left-[2.65rem]">
        {nomor}
      </span>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">{entry.judul}</h3>
        {entry.ringkas ? <p className="mt-1 text-sm font-medium text-primary-700">{entry.ringkas}</p> : null}
        {entry.deskripsi ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-700">{entry.deskripsi}</p>
        ) : null}
        {entry.poin.length > 0 ? (
          <ul className="mt-4 space-y-2.5">
            {entry.poin.map((p) => (
              <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        ) : null}
        {entry.tautan.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-4">
            {entry.tautan.map((t) => (
              <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline">
                <ExternalLink className="h-4 w-4" aria-hidden />
                {t.teks}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function DokumenCard({ entry, embedded }: { entry: PanduanEntry; embedded: boolean }) {
  return (
    <article className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <FileText className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-xl font-bold tracking-tight text-gray-900">{entry.judul}</h3>
        <Badge tone={entry.dibuatSendiri ? "accent" : "primary"}>
          {entry.dibuatSendiri ? (
            <>
              <PenLine className="h-3.5 w-3.5" aria-hidden />
              Dibuat sendiri
            </>
          ) : (
            <>
              <Stamp className="h-3.5 w-3.5" aria-hidden />
              Diurus ke instansi
            </>
          )}
        </Badge>
      </div>

      {entry.ringkas ? <p className="mt-2 text-sm font-medium text-primary-700">{entry.ringkas}</p> : null}
      {entry.deskripsi ? <p className="mt-3 leading-relaxed text-gray-700">{entry.deskripsi}</p> : null}

      {entry.poin.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {entry.poin.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      ) : null}

      {entry.langkah.length > 0 ? (
        <>
          <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">Cara mendapatkannya</h4>
          <ol className="mt-4 space-y-4">
            {entry.langkah.map((langkah, i) => (
              <li key={`${langkah.judul}-${i}`} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  {langkah.judul ? <p className="font-semibold text-gray-900">{langkah.judul}</p> : null}
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{langkah.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      {entry.tautan.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-4">
          {entry.tautan.map((t) => (
            <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline">
              <ExternalLink className="h-4 w-4" aria-hidden />
              {t.teks}
            </a>
          ))}
        </div>
      ) : null}

      {!embedded && PUNYA_ALUR_DETAIL.has(entry.id) ? (
        <Link href={`/panduan/dokumen/${entry.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline">
          Lihat diagram alur pembuatan
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </article>
  );
}

export function PanduanReader({ embedded = false }: { embedded?: boolean }) {
  const hydrated = usePanduanStore((s) => s.hydrated);
  const entries = usePublishedPanduan();

  if (!hydrated) {
    return (
      <div className={embedded ? "flex min-h-[40vh] items-center justify-center" : "container-page py-24"}>
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Memuat panduan…
        </p>
      </div>
    );
  }

  const tahap = entries.filter((e) => e.tipe === "tahap");
  const dokumen = entries.filter((e) => e.tipe === "dokumen");

  const inner = embedded ? "space-y-6" : "container-page py-14 sm:py-16";

  return (
    <>
      {!embedded ? (
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="container-page py-14 sm:py-16">
            <p className="eyebrow">Panduan Ekspor</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
              Dari nol sampai barang berangkat — satu alur runtut
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
              Baca dari atas ke bawah. Setiap tahap menyebut dokumen yang dipakai, lalu di bawah
              ada cara mendapatkan tiap dokumen.
            </p>
          </div>
        </section>
      ) : (
        <div>
          <p className="eyebrow">Panduan Ekspor</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Panduan Ekspor, dari nol sampai berangkat</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Setiap tahap menyebut dokumen yang dipakai, lalu di bawah ada cara mendapatkan tiap dokumen.
          </p>
        </div>
      )}

      {tahap.length > 0 ? (
        <section id="alur" className={embedded ? "scroll-mt-20" : "scroll-mt-20 bg-white"}>
          <div className={inner}>
            <h2 className="text-2xl font-bold tracking-tight">Alur ekspor, tahap demi tahap</h2>
            <ol className="mt-10 space-y-8 border-l-2 border-gray-200 pl-6 sm:pl-8">
              {tahap.map((entry, i) => (
                <TahapCard key={entry.id} entry={entry} nomor={i + 1} />
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {dokumen.length > 0 ? (
        <section id="dokumen" className={embedded ? "scroll-mt-20" : "scroll-mt-20 border-t border-gray-200 bg-gray-50"}>
          <div className={inner}>
            <h2 className="text-2xl font-bold tracking-tight">Dokumen ekspor &amp; cara mendapatkannya</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-gray-600">
              Tanda menunjukkan apakah Anda membuatnya sendiri atau mengurusnya ke instansi.
            </p>
            <div className="mt-10 space-y-6">
              {dokumen.map((entry) => (
                <DokumenCard key={entry.id} entry={entry} embedded={embedded} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="glosarium" className={embedded ? "scroll-mt-20" : "scroll-mt-20 border-t border-gray-200 bg-white"}>
        <div className={inner}>
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary-600" aria-hidden />
            <h2 className="text-2xl font-bold tracking-tight">Glosarium Istilah</h2>
          </div>
          <details className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
              Tampilkan {GLOSSARY_LIST.length} istilah
            </summary>
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              {GLOSSARY_LIST.map((g) => (
                <div key={g.istilah} className="rounded-xl border border-gray-200 bg-white p-5">
                  <dt>
                    <span className="font-bold text-gray-900">{g.istilah}</span>
                    {g.kepanjangan ? <span className="ml-2 text-sm text-gray-500">{g.kepanjangan}</span> : null}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-gray-600">{g.penjelasan}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </section>
    </>
  );
}
