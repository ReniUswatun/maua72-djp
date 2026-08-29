import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Masuk Super Admin",
  description: "Masuk ke pusat kendali akun admin SiapEkspor.",
};

export default function SuperAdminLoginPage() {
  return (
    <AdminLoginForm
      title="Masuk Super Admin"
      description="Gunakan akun super admin untuk mengelola officer, menonaktifkan akses, dan mereset credential prototipe."
      defaultRole="super_admin"
      successHref={{ officer: "/admin", super_admin: "/super-admin" }}
    />
  );
}
