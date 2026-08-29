import { AdminGate } from "@/components/admin/AdminGate";
import { ADMIN_NAV, AdminShell } from "@/components/admin/AdminShell";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate
      allowedRoles={["officer", "super_admin"]}
      loginHref="/masuk?peran=officer"
      title="Dashboard Officer"
      description="Akses terproteksi untuk monitoring pengajuan, review AI Draft, dan histori keputusan."
      requiredPermission="dashboard.view"
    >
      <AdminShell
        brand="Ruang Kerja Officer"
        navItems={ADMIN_NAV}
        accent="bg-primary-600"
        loginHref="/masuk?peran=officer"
      >
        {children}
      </AdminShell>
    </AdminGate>
  );
}
