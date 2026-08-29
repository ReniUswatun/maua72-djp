"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileStack,
  Home,
  LifeBuoy,
  LogOut,
  UserRound,
} from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { useAppStore } from "@/store/assessment-store";
import { cn, initials } from "@/lib/utils";

const MENU = [
  { href: "/dashboard", label: "Beranda", short: "Beranda", Icon: Home },
  { href: "/dashboard/pengajuan", label: "Riwayat Pengajuan", short: "Pengajuan", Icon: FileStack },
  { href: "/dashboard/riwayat", label: "Riwayat Konsultasi", short: "Konsultasi", Icon: LifeBuoy },
  { href: "/dashboard/panduan", label: "Panduan Ekspor", short: "Panduan", Icon: BookOpen },
  { href: "/dashboard/profil", label: "Profil", short: "Profil", Icon: UserRound },
];

/** Menu di mobile — semua item ditampilkan sebagai bottom bar. */
const MENU_MOBILE = MENU;

function aktifkan(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const keluar = useAppStore((s) => s.keluar);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Menu dashboard">
        {MENU.map(({ href, label, Icon }) => {
          const aktif = aktifkan(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                aktif
                  ? "bg-primary-50 text-primary-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn("h-5 w-5", aktif ? "text-primary-700" : "text-gray-400")}
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800">
            {initials(user?.nama ?? "U")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-gray-900">
              {user?.nama ?? "Pengguna"}
            </span>
            <span className="block truncate text-xs text-gray-500">
              {profile?.namaUsaha ?? "-"}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            keluar();
            router.push("/");
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5 text-gray-400" aria-hidden />
          Keluar
        </button>
      </div>
    </aside>
  );
}

/** Bottom navigation — alternatif sidebar di mobile (blueprint §14). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {MENU_MOBILE.map(({ href, short, Icon }) => {
          const aktif = aktifkan(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium leading-tight",
                  aktif ? "text-primary-700" : "text-gray-500",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="text-center">{short}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Topbar khusus mobile — sidebar disembunyikan di layar kecil. */
export function DashboardTopbar() {
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-5 backdrop-blur lg:hidden">
      <Logo href="/dashboard" />
      <Link
        href="/dashboard/pengajuan/baru"
        className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
      >
        Pengajuan Ekspor
      </Link>
    </div>
  );
}
