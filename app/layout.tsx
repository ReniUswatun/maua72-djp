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
    default: "SiapEkspor — Platform Kesiapan Ekspor UMKM",
    template: "%s · SiapEkspor",
  },
  description:
    "Cek kesiapan ekspor usaha Anda dalam 10 menit. Dapatkan skor kesiapan, rekomendasi personal, dan validasi langsung dari petugas Bea dan Cukai Surakarta.",
  keywords: [
    "ekspor UMKM",
    "kesiapan ekspor",
    "Bea Cukai Surakarta",
    "PEB",
    "HS Code",
    "asesmen ekspor",
  ],
  openGraph: {
    title: "SiapEkspor — Platform Kesiapan Ekspor UMKM",
    description:
      "Asesmen kesiapan ekspor 8 pilar untuk UMKM Indonesia, divalidasi petugas Bea dan Cukai.",
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
