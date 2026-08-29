"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <TriangleAlert className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
          Terjadi kesalahan di Super Admin Center
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Halaman ini gagal dimuat. Coba muat ulang halaman.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Coba lagi
          </Button>
          <Link href="/super-admin">
            <Button variant="outline">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
