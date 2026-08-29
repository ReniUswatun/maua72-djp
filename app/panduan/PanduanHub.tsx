"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ARTICLES, KATEGORI_PANDUAN } from "@/lib/articles";
import { GLOSSARY_LIST } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export function PanduanHub() {
  const [cari, setCari] = React.useState("");
  const [kategori, setKategori] = React.useState("Semua");

  const kunci = cari.trim().toLowerCase();

  const artikel = ARTICLES.filter((a) => {
    const cocokKategori = kategori === "Semua" || a.kategori === kategori;
    const cocokCari =
      kunci === "" ||
      a.judul.toLowerCase().includes(kunci) ||
      a.ringkas.toLowerCase().includes(kunci) ||
      a.istilahTerkait.some((i) => i.toLowerCase().includes(kunci));
    return cocokKategori && cocokCari;
  });

  const glosarium = GLOSSARY_LIST.filter(
    (g) =>
      kunci === "" ||
      g.istilah.toLowerCase().includes(kunci) ||
      g.kepanjangan?.toLowerCase().includes(kunci) ||
      g.penjelasan.toLowerCase().includes(kunci),
  );

  return (
    <>
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">Panduan</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            Semua yang perlu dipahami sebelum ekspor pertama
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            Ditulis dengan bahasa sehari-hari. Setiap istilah teknis dijelaskan,
            dan Anda bisa mencarinya langsung di glosarium di bawah.
          </p>

          <div className="relative mt-8 max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <Input
              type="search"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari panduan atau istilah, misalnya: HS Code"
              aria-label="Cari panduan atau istilah"
              className="pl-12"
            />
          </div>

          <div className="no-scrollbar -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1">
            {KATEGORI_PANDUAN.map((k) => (
              <button
                key={k}
                onClick={() => setKategori(k)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  kategori === k
                    ? "border-primary-700 bg-primary-700 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-14 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight">
            {artikel.length} artikel
            {kategori !== "Semua" ? ` di kategori ${kategori}` : ""}
          </h2>

          {artikel.length === 0 ? (
            <p className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              Tidak ada artikel yang cocok. Coba kata kunci lain atau lihat
              glosarium di bawah.
            </p>
          ) : (
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {artikel.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/panduan/${a.slug}`}
                    className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 hover:bg-primary-50/30"
                  >
                    <div className="flex items-center gap-2">
                      <Badge tone="primary">{a.kategori}</Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {a.bacaMenit} menit
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-900">
                      {a.judul}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                      {a.ringkas}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
                      Baca panduan
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="glosarium" className="scroll-mt-20 border-t border-gray-200 bg-gray-50">
        <div className="container-page py-14 sm:py-16">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary-600" aria-hidden />
            <h2 className="text-2xl font-bold tracking-tight">
              Glosarium Istilah Ekspor
            </h2>
          </div>
          <p className="mt-3 max-w-2xl leading-relaxed text-gray-600">
            {glosarium.length} istilah yang paling sering muncul dalam urusan
            kepabeanan, dijelaskan tanpa jargon.
          </p>

          <dl className="mt-8 grid gap-4 md:grid-cols-2">
            {glosarium.map((g) => (
              <div
                key={g.istilah}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <dt>
                  <span className="font-bold text-gray-900">{g.istilah}</span>
                  {g.kepanjangan ? (
                    <span className="ml-2 text-sm text-gray-500">
                      {g.kepanjangan}
                    </span>
                  ) : null}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-600">
                  {g.penjelasan}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
