"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/assessment-store";

const TAUTAN = [
  { href: "/portal", label: "Tentang Platform" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#pilar", label: "8 Pilar" },
  { href: "/panduan", label: "Panduan" },
];

export function Navbar() {
  const [buka, setBuka] = React.useState(false);
  const user = useAppStore((s) => s.user);
  const hydrated = useAppStore((s) => s.hydrated);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav
        className="container-page flex h-16 items-center justify-between gap-4"
        aria-label="Navigasi utama"
      >
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {TAUTAN.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {hydrated && user ? (
            <Link href="/dashboard">
              <Button size="sm">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/masuk">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/daftar">
                <Button size="sm">Daftar Gratis</Button>
              </Link>
              <Link href="/masuk?peran=officer">
                <Button variant="outline" size="sm">
                  <ShieldCheck className="h-4 w-4" />
                  Officer
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setBuka((v) => !v)}
          aria-expanded={buka}
          aria-label={buka ? "Tutup menu" : "Buka menu"}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          {buka ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {buka ? (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="container-page space-y-1 py-4">
            {TAUTAN.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setBuka(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                {t.label}
              </Link>
            ))}
            <div className="grid gap-2 pt-3">
              {hydrated && user ? (
                <Link href="/dashboard" onClick={() => setBuka(false)}>
                  <Button full>Buka Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/masuk" onClick={() => setBuka(false)}>
                    <Button variant="outline" full>
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/daftar" onClick={() => setBuka(false)}>
                    <Button full>Daftar Gratis</Button>
                  </Link>
                  <Link href="/masuk?peran=officer" onClick={() => setBuka(false)}>
                    <Button variant="ghost" full>
                      Officer Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
