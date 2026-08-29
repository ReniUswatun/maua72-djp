"use client";

import { AdminCasesTable } from "@/components/admin/AdminCasesTable";
import { useAdminStore } from "@/store/admin-store";

export default function AdminApplicationsPage() {
  const cases = useAdminStore((s) => s.cases);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Ruang Kerja Officer</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Daftar pengajuan ekspor</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Cari, saring, dan urutkan untuk menemukan pengajuan yang perlu ditangani lebih dulu.
          Dokumen dan catatan OCR dibuka per pengajuan lewat tombol Buka.
        </p>
      </div>

      <AdminCasesTable cases={cases} title="Semua Pengajuan" description="Klik Buka untuk melihat dokumen, data usaha, dan mengambil keputusan." />
    </div>
  );
}
