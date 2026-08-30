"use client";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { PanduanArticle } from "@/components/panduan/PanduanArticle";

export default function PanduanLangkahPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Navbar />
      <main id="konten-utama" className="container-page py-12">
        <PanduanArticle slug={params.slug} basePath="/panduan/langkah" />
      </main>
      <Footer />
    </>
  );
}
