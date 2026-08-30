import { AdminGate } from "@/components/admin/AdminGate";
import { ADMIN_NAV, AdminShell } from "@/components/admin/AdminShell";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate
      allowedRoles={["admin"]}
      loginHref="/masuk?peran=admin"
      title="Ruang Kerja Admin"
      description="Akses terproteksi untuk review pengajuan, persetujuan data usaha, dokumen, dan pertanyaan UMKM."
    >
      <AdminShell
        brand="Ruang Kerja Admin"
        navItems={ADMIN_NAV}
        accent="bg-primary-600"
        loginHref="/masuk?peran=admin"
      >
        {children}
      </AdminShell>
    </AdminGate>
  );
}
