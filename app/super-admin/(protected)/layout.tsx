import { AdminGate } from "@/components/admin/AdminGate";
import { AdminShell, SUPER_ADMIN_NAV } from "@/components/admin/AdminShell";

export default function SuperAdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate
      allowedRoles={["super_admin"]}
      loginHref="/masuk?peran=super_admin"
      title="Super Admin Center"
      description="Area khusus untuk CRUD akun admin dan pengelolaan akses."
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
