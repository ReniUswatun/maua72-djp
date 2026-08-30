"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";

import { GLOSSARY_LIST } from "@/lib/glossary";
import { usePanduanStore, usePublishedPanduan } from "@/store/panduan-store";
import type { PanduanEntry } from "@/lib/types";

import { PanduanSearch } from "./PanduanSearch";

function StepCard({
  entry,
  nomor,
  basePath,
}: {
  entry: PanduanEntry;
  nomor: number;
  basePath: string;
}) {
  return (
    <li>
      <Link
        href={`${basePath}/${entry.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-primary-200 hover:bg-primary-50/30 sm:p-5"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white">
          {nomor}
        </span>
        {entry.gambarSampul ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.gambarSampul}
            alt=""
            className="hidden h-14 w-20 shrink-0 rounded-lg object-cover sm:block"
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-gray-900">{entry.judul}</span>
          {entry.ringkas ? (
            <span className="mt-0.5 block text-sm leading-relaxed text-gray-600">{entry.ringkas}</span>
          ) : null}
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  );
}

export function PanduanReader({ embedded = false }: { embedded?: boolean }) {
  const hydrated = usePanduanStore((s) => s.hydrated);
  const entries = usePublishedPanduan();
  const basePath = embedded ? "/dashboard/panduan" : "/panduan/langkah";
  const [query, setQuery] = React.useState("");
  const mencari = query.trim().length > 0;

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

  const Head = embedded ? (
    <div>
      <p className="eyebrow">Panduan Ekspor</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Panduan ekspor, langkah demi langkah</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
        Cari langsung apa yang Anda butuhkan lewat kotak pencarian di bawah, atau baca rangkuman dan seluruh langkahnya dari awal.
      </p>
    </div>
  ) : (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="container-page py-14 sm:py-16">
        <p className="eyebrow">Panduan Ekspor</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
          Panduan ekspor, langkah demi langkah
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
          Cari langsung apa yang Anda butuhkan lewat kotak pencarian di bawah, atau baca rangkuman dan seluruh langkahnya dari awal.
        </p>
      </div>
    </section>
  );

  const Body = (
    <div className={embedded ? "mt-8 space-y-10" : "container-page space-y-10 py-14 sm:py-16"}>
      <PanduanSearch entries={entries} basePath={basePath} query={query} onQuery={setQuery} />


      {!mencari ? (
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Semua langkah panduan</h2>
          <p className="mt-1 text-sm text-gray-600">Urut dari awal. Klik satu langkah untuk penjelasan lengkap beserta contohnya.</p>
          <ol className="mt-5 space-y-3">
            {entries.map((entry, i) => (
              <StepCard key={entry.id} entry={entry} nomor={i + 1} basePath={basePath} />
            ))}
          </ol>
        </section>
      ) : null}

      <section id="glosarium" className="scroll-mt-24">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary-600" aria-hidden />
          <h2 className="text-2xl font-bold tracking-tight">Glosarium istilah</h2>
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
      </section>
    </div>
  );

  if (embedded) {
    return (
      <div>
        {Head}
        {Body}
      </div>
    );
  }

  return (
    <>
      {Head}
      {Body}
    </>
  );
}
