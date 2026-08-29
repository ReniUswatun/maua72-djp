import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Halaman 404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        Halaman yang Anda cari tidak ada
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-gray-600">
        Tautannya mungkin salah ketik atau halamannya sudah dipindahkan.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button size="lg">Kembali ke Beranda</Button>
        </Link>
        <Link href="/panduan">
          <Button size="lg" variant="outline">
            Lihat Panduan
          </Button>
        </Link>
      </div>
    </div>
  );
}
