import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import { HelpTooltip } from "@/components/assessment/HelpTooltip";
import { Footer } from "@/components/landing/Footer";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ARTICLES, getArticle } from "@/lib/articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const artikel = getArticle(params.slug);
  if (!artikel) return { title: "Panduan tidak ditemukan" };
  return { title: artikel.judul, description: artikel.ringkas };
}

export default function ArtikelPage({ params }: { params: { slug: string } }) {
  const artikel = getArticle(params.slug);
  if (!artikel) notFound();

  const lainnya = ARTICLES.filter((a) => a.slug !== artikel.slug).slice(0, 3);

  return (
    <>
      <Navbar />

      <main id="konten-utama">
        <article className="container-form py-12">
          <Link
            href="/panduan"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Semua panduan
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone="primary">{artikel.kategori}</Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" aria-hidden />
              {artikel.bacaMenit} menit baca
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {artikel.judul}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {artikel.ringkas}
          </p>

          {artikel.istilahTerkait.length > 0 ? (
            <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Istilah yang muncul di panduan ini
              </p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {artikel.istilahTerkait.map((i) => (
                  <HelpTooltip key={i} istilah={i} />
                ))}
              </p>
            </div>
          ) : null}

          <div className="mt-10 space-y-10">
            {artikel.isi.map((bagian) => (
              <section key={bagian.heading}>
                <h2 className="text-2xl font-bold tracking-tight">
                  {bagian.heading}
                </h2>
                {bagian.paragraf.map((p) => (
                  <p key={p} className="mt-4 text-lg leading-relaxed text-gray-700">
                    {p}
                  </p>
                ))}
                {bagian.list ? (
                  <ul className="mt-5 space-y-3">
                    {bagian.list.map((l) => (
                      <li key={l} className="flex gap-3 leading-relaxed text-gray-700">
                        <span
                          aria-hidden
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                        />
                        {l}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-12">
            <DisclaimerBanner />
          </div>

          <div className="mt-10 rounded-xl border border-primary-100 bg-primary-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-primary-900">
              Ingin tahu posisi usaha Anda sekarang?
            </h2>
            <p className="mt-2 leading-relaxed text-primary-900/80">
              Asesmen kesiapan ekspor menunjukkan gap mana yang paling
              menentukan, lengkap dengan langkah yang ditinjau petugas.
            </p>
            <Link href="/daftar" className="mt-5 inline-block">
              <Button>
                Mulai Asesmen Gratis
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>

          <section className="mt-14">
            <h2 className="text-xl font-semibold">Panduan lainnya</h2>
            <ul className="mt-5 space-y-3">
              {lainnya.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/panduan/${a.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary-200"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-900">
                        {a.judul}
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        {a.kategori} · {a.bacaMenit} menit
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
}
