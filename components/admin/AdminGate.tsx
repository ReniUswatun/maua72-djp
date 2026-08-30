"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PERMISSION_LABELS, roleCan, roleLabel, type AdminRole, type Permission } from "@/lib/rbac";
import { useAdminStore } from "@/store/admin-store";

export function AdminGate({
  children,
  allowedRoles,
  loginHref,
  title,
  description,
  requiredPermission,
}: {
  children: React.ReactNode;
  allowedRoles: AdminRole[];
  loginHref: string;
  title: string;
  description: string;
  requiredPermission?: Permission;
}) {
  const pathname = usePathname();
  const hydrated = useAdminStore((s) => s.hydrated);
  const session = useAdminStore((s) => s.session);
  const logout = useAdminStore((s) => s.logout);
  const rolePermissions = useAdminStore((s) => s.rolePermissions);

  if (!hydrated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldCheck className="h-4 w-4 animate-pulse text-primary-600" aria-hidden />
          Memuat akses admin...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <ShieldAlert className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-600">
            Anda belum masuk sebagai akun admin atau super admin. Silakan login
            untuk melanjutkan ke halaman ini.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={loginHref}>
              <Button size="lg">Buka Halaman Login</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (
    requiredPermission &&
    !roleCan(rolePermissions, session.role, requiredPermission)
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-xl font-bold tracking-tight text-amber-950">
            Hak akses tidak mencukupi
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-amber-900/80">
            Peran Anda ({roleLabel(session.role as AdminRole)}) belum
            memiliki izin <span className="font-semibold">{PERMISSION_LABELS[requiredPermission]}</span>.
            Hubungi super admin untuk penyesuaian hak akses peran.
          </p>
          <div className="mt-7">
            <Link href="/admin">
              <Button size="lg" variant="outline">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(session.role)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-xl font-bold tracking-tight text-amber-950">
            Akses ditolak
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-amber-900/80">
            Akun {session.email} tidak punya hak akses untuk area ini. Halaman aktif:
            {pathname}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={loginHref}>
              <Button size="lg">Ganti Akun</Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                logout();
                window.location.href = loginHref;
              }}
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
