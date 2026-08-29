import type { Metadata } from "next";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { PanduanHub } from "./PanduanHub";

export const metadata: Metadata = {
  title: "Panduan Ekspor",
  description:
    "Kumpulan panduan ekspor bahasa awam: legalitas, HS Code, dokumen PEB, Lartas, logistik, dan pembayaran.",
};

export default function PanduanPage() {
  return (
    <>
      <Navbar />
      <main id="konten-utama">
        <PanduanHub />
      </main>
      <Footer />
    </>
  );
}
