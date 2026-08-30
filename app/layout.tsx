import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "SiapEkspor — Pendampingan Dokumen Ekspor UMKM",
    template: "%s · SiapEkspor",
  },
  description:
    "Susun dokumen ekspor UMKM Anda langkah demi langkah — dari NIB sampai PEB — dan kirimkan untuk ditinjau langsung oleh petugas Bea dan Cukai Surakarta.",
  keywords: [
    "ekspor UMKM",
    "dokumen ekspor",
    "Bea Cukai Surakarta",
    "PEB",
    "HS Code",
    "panduan ekspor",
  ],
  openGraph: {
    title: "SiapEkspor — Pendampingan Dokumen Ekspor UMKM",
    description:
      "Pendampingan penyusunan dokumen ekspor untuk UMKM Indonesia, ditinjau langsung oleh petugas Bea dan Cukai.",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3F63",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-screen bg-white font-sans">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-3 focus:text-white"
        >
          Lompat ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
