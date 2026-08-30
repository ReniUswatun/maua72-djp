import { AdminGate } from "@/components/admin/AdminGate";
import { AdminShell, SUPER_ADMIN_NAV } from "@/components/admin/AdminShell";

export default function SuperAdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate
      allowedRoles={["super_admin"]}
      loginHref="/masuk?peran=super_admin"
      title="Super Admin Center"
      description="Area khusus untuk kelola akun admin, hak akses peran, dan memantau kinerja admin."
    >
      <AdminShell
        brand="Super Admin"
        navItems={SUPER_ADMIN_NAV}
        accent="bg-accent-500"
        loginHref="/masuk?peran=super_admin"
      >
        {children}
      </AdminShell>
    </AdminGate>
  );
}
