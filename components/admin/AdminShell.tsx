"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ShieldHalf,
  Users,
  Workflow,
  X,
} from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleCan, roleLabel, type AdminRole, type Permission } from "@/lib/rbac";
import { cn, initials } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
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
  /** Kelas warna titik peran, mis. "bg-primary-600". */
  accent: string;
  loginHref: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminStore((s) => s.session);
  const logout = useAdminStore((s) => s.logout);
  const rolePermissions = useAdminStore((s) => s.rolePermissions);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const visibleNav = navItems.filter(
    (item) => !item.permission || roleCan(rolePermissions, session?.role, item.permission),
  );

  const keluar = () => {
    logout();
    router.push(loginHref);
  };

  const homeHref = session?.role === "super_admin" ? "/super-admin" : "/admin";

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {visibleNav.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-50 text-primary-800"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Icon className={cn("h-5 w-5", active ? "text-primary-700" : "text-gray-400")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </>
  );

  const RoleTag = () => (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", accent)} aria-hidden />
      <span className="eyebrow">{brand}</span>
    </span>
  );

  const UserCard = () => (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800">
        {initials(session?.nama ?? "Admin")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900">
          {session?.nama ?? "Admin"}
        </span>
        <span className="block truncate text-xs text-gray-500">
          {session?.email ?? "Belum masuk"}
        </span>
      </span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-700">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Logo href={homeHref} />
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-6 py-4">
          <RoleTag />
          <Badge tone={session?.role === "super_admin" ? "accent" : "primary"}>
            {session ? roleLabel(session.role as AdminRole) : "Tamu"}
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label={`Navigasi ${brand}`}>
          <NavLinks />
        </nav>

        <div className="border-t border-gray-200 p-4">
          <UserCard />
          <Button full variant="ghost" className="mt-1 justify-start" onClick={keluar}>
            <LogOut className="h-4 w-4 text-gray-400" aria-hidden />
            Keluar
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-5 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
            <Logo href={homeHref} />
          </div>
          <Button size="sm" variant="ghost" onClick={keluar}>
            Keluar
          </Button>
        </header>

        {/* Menu mobile: overlay mengambang, tidak mendorong konten ke bawah */}
        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Tutup menu"
              className="absolute inset-0 h-full w-full bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <nav
              className="absolute left-0 top-0 flex h-full w-72 max-w-[82vw] flex-col border-r border-gray-200 bg-white shadow-lift"
              aria-label={`Navigasi ${brand}`}
            >
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
                <Logo href={homeHref} />
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup menu"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-5 py-4">
                <RoleTag />
                <Badge tone={session?.role === "super_admin" ? "accent" : "primary"}>
                  {session ? roleLabel(session.role as AdminRole) : "Tamu"}
                </Badge>
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto p-4">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
              </div>
              <div className="border-t border-gray-200 p-4">
                <UserCard />
                <Button full variant="ghost" className="mt-1 justify-start" onClick={keluar}>
                  <LogOut className="h-4 w-4 text-gray-400" aria-hidden />
                  Keluar
                </Button>
              </div>
            </nav>
          </div>
        ) : null}

        <main id="konten-utama" className="flex-1 px-5 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { href: "/admin/pengajuan", label: "Pengajuan", icon: ListChecks, permission: "case.view" },
  { href: "/admin/data-usaha", label: "Persetujuan Data Usaha", icon: BadgeCheck, permission: "case.review" },
  { href: "/admin/panduan", label: "Panduan (CMS)", icon: BookOpen, permission: "panduan.manage" },
  { href: "/admin/riwayat", label: "Riwayat", icon: Workflow, permission: "history.view" },
];

export const SUPER_ADMIN_NAV: AdminNavItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/akun", label: "Kelola Akun", icon: Users, permission: "account.manage" },
  { href: "/super-admin/akses", label: "Hak Akses Peran", icon: ShieldHalf, permission: "rbac.manage" },
  { href: "/super-admin/aktivitas", label: "Activity Log", icon: Workflow, permission: "activity.view" },
  { href: "/super-admin/akurasi-ai", label: "Akurasi OCR", icon: Gauge, permission: "ai.metrics.view" },
  { href: "/admin/pengajuan", label: "Lihat Pengajuan", icon: FileText, permission: "case.view" },
  { href: "/admin/data-usaha", label: "Persetujuan Data Usaha", icon: BadgeCheck, permission: "case.review" },
  { href: "/admin/panduan", label: "Panduan (CMS)", icon: BookOpen, permission: "panduan.manage" },
];
