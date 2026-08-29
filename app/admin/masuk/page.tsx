import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Masuk Admin",
  description: "Masuk ke dashboard officer SiapEkspor.",
};

export default function AdminLoginPage() {
  return (
    <AdminLoginForm
      title="Masuk Officer"
      description="Gunakan akun officer untuk meninjau pengajuan UMKM, memperbaiki draf AI, dan mengirim keputusan final ke UMKM."
      defaultRole="officer"
      successHref={{ officer: "/admin", super_admin: "/super-admin" }}
    />
  );
}
