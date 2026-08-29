"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminReviewWorkspace } from "@/components/admin/AdminReviewWorkspace";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/admin-store";

export default function AdminApplicationDetailPage({ params }: { params: { id: string } }) {
  const caseItem = useAdminStore((s) => s.cases.find((item) => item.id === params.id));

  if (!caseItem) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengajuan tidak ditemukan</h1>
        <p className="mt-3 text-slate-600">Case ini mungkin sudah dipindahkan atau belum tersinkron ke state lokal.</p>
        <Link href="/admin/pengajuan" className="mt-6 inline-block">
          <Button>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke daftar pengajuan
          </Button>
        </Link>
      </div>
    );
  }

  return <AdminReviewWorkspace caseItem={caseItem} />;
}
