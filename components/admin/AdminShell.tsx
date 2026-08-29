"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Shield,
  Users,
  History,
  FileText,
  Workflow,
  Menu,
} from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/super-admin") return pathname === "/super-admin";
  return pathname.startsWith(href);
}

export function AdminShell({
  children,
  brand,
  navItems,
  accent,
  loginHref,
}: {
  children: React.ReactNode;
  brand: string;
  navItems: AdminNavItem[];
  accent: string;
  loginHref: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminStore((s) => s.session);
  const logout = useAdminStore((s) => s.logout);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Logo href={session?.role === "super_admin" ? "/super-admin" : "/admin"} />
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55">{brand}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", accent)}>
              <Shield className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{session?.nama ?? "Admin"}</p>
              <p className="truncate text-xs text-white/60">{session?.email ?? "Belum masuk"}</p>
            </div>
          </div>
          <Badge tone="neutral" className="mt-3 border-white/10 bg-white/5 text-white">
            {session?.role === "super_admin" ? "Super Admin" : "Officer"}
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label={`${brand} navigation`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                  active ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-white" : "text-white/45")} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Button
            full
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              router.push(loginHref);
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Keluar
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
              onClick={() => {
                const menu = document.getElementById("mobile-admin-nav");
                if (menu) menu.classList.toggle("hidden");
              }}
              aria-label="Buka menu admin"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <Logo href={session?.role === "super_admin" ? "/super-admin" : "/admin"} />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              logout();
              router.push(loginHref);
            }}
          >
            Keluar
          </Button>
        </header>

        <div id="mobile-admin-nav" className="hidden border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <main id="konten-utama" className="flex-1 px-5 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pengajuan", label: "Pengajuan", icon: ListChecks },
  { href: "/admin/riwayat", label: "Riwayat", icon: History },
];

export const SUPER_ADMIN_NAV: AdminNavItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/akun", label: "Kelola Akun", icon: Users },
  { href: "/super-admin/aktivitas", label: "Activity Log", icon: Workflow },
  { href: "/admin/pengajuan", label: "Lihat Pengajuan", icon: FileText },
];
