import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengajuan Ekspor",
  description:
    "Tujuh pilar, sekitar 30 pertanyaan, kurang lebih 10 menit. Progres tersimpan otomatis.",
};

export default function AsesmenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
