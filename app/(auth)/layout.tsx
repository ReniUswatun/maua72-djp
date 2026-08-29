import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { KANTOR } from "@/lib/mock-data";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Beranda
          </Link>
        </div>
      </header>

      <main id="konten-utama" className="flex flex-1 items-center py-12">
        <div className="mx-auto w-full max-w-md px-5">{children}</div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <p className="container-page flex items-center justify-center gap-2 text-center text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          Prototipe yang dikembangkan bersama {KANTOR.nama}
        </p>
      </footer>
    </div>
  );
}
