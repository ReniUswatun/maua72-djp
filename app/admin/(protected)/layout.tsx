import { AdminGate } from "@/components/admin/AdminGate";
import { ADMIN_NAV, AdminShell } from "@/components/admin/AdminShell";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate
      allowedRoles={["officer", "super_admin"]}
      loginHref="/admin/masuk"
      title="Dashboard Officer"
      description="Akses terproteksi untuk monitoring pengajuan, review AI Draft, dan histori keputusan."
    >
      <AdminShell
        brand="Officer Workspace"
        navItems={ADMIN_NAV}
        accent="bg-gradient-to-br from-slate-700 to-slate-950"
        loginHref="/admin/masuk"
      >
        {children}
      </AdminShell>
    </AdminGate>
  );
}
