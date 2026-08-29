import type { Metadata } from "next";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { PanduanReader } from "@/components/panduan/PanduanReader";

export const metadata: Metadata = {
  title: "Panduan Ekspor",
  description:
    "Satu panduan ekspor runtut dari nol sampai barang berangkat: setiap tahap, dokumen yang dibutuhkan, dan cara mendapatkan tiap dokumen.",
};

export default function PanduanPage() {
  return (
    <>
      <Navbar />
      <main id="konten-utama">
        <PanduanReader />
      </main>
      <Footer />
    </>
  );
}
