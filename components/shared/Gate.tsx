"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/assessment-store";

/**
 * Menahan render sampai state dari localStorage selesai dimuat, lalu
 * memastikan profil usaha sudah diisi. Menggantikan proteksi rute yang
 * di produksi nanti ditangani autentikasi backend.
 */
export function ButuhLogin({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const user = useAppStore((s) => s.user);

  if (!hydrated) return <MemuatLayar />;

  if (!user) {
    return (
      <div className="container-form flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Silakan Masuk</h1>
        <p className="mt-3 max-w-md leading-relaxed text-gray-600">
          Anda perlu masuk untuk mengakses halaman ini.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/masuk">
            <Button size="lg">Masuk</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ButuhProfil({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const profile = useAppStore((s) => s.profile);

  if (!hydrated) return <MemuatLayar />;

  if (!profile) {
    return (
      <div className="container-form flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Lengkapi profil / legalitas usaha dulu
        </h1>
        <p className="mt-3 max-w-md leading-relaxed text-gray-600">
          Profil usaha dipakai untuk menyesuaikan pertanyaan pengajuan ekspor dengan
          kategori produk Anda.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/profil">
            <Button size="lg">Isi Profil Usaha</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function MemuatLayar() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Memuat data Anda…
      </p>
    </div>
  );
}
