"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/assessment-store";

export default function PengajuanBaruPage() {
  const router = useRouter();
  const buatPengajuan = useAppStore((s) => s.buatPengajuan);
  const profile = useAppStore((s) => s.profile);

  const [formData, setFormData] = useState({
    namaProduk: "",
    hsCode: "",
    nilaiEkspor: "",
    pembeli: "",
    negaraTujuan: "",
    tanggalKirim: "",
  });

  const nibOk = !!(profile?.nomorNib?.trim()) && !!(profile?.fileNib);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = buatPengajuan(formData);
    router.push(`/dashboard/pengajuan/${id}`);
  };


  return (
    <div className="mx-auto max-w-2xl py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      {!nibOk ? (
        <Alert tone="warning" judul="NIB Belum Lengkap">
          <p className="mb-3">
            Nomor NIB dan dokumen NIB wajib diisi dan diunggah di halaman{" "}
            <Link href="/dashboard/profil" className="font-semibold underline">
              Profil
            </Link>{" "}
            sebelum bisa membuat pengajuan ekspor.
          </p>
          <Link href="/dashboard/profil">
            <Button size="sm" variant="outline">Lengkapi Profil</Button>
          </Link>
        </Alert>
      ) : (
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Buat Pengajuan Ekspor Baru
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Isi detail rencana ekspor Anda untuk membuat daftar periksa dokumen yang diperlukan.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="namaProduk" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nama Produk
              </label>
              <Input
                id="namaProduk"
                required
                placeholder="Misal: Kopi Arabika Gayo"
                value={formData.namaProduk}
                onChange={(e) => setFormData({ ...formData, namaProduk: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="negaraTujuan" className="mb-1.5 block text-sm font-medium text-gray-700">
                Negara Tujuan
              </label>
              <Input
                id="negaraTujuan"
                required
                placeholder="Misal: Amerika Serikat"
                value={formData.negaraTujuan}
                onChange={(e) => setFormData({ ...formData, negaraTujuan: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="pembeli" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nama Pembeli / Consignee
              </label>
              <Input
                id="pembeli"
                required
                placeholder="Misal: Starbucks Corp."
                value={formData.pembeli}
                onChange={(e) => setFormData({ ...formData, pembeli: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="hsCode" className="mb-1.5 block text-sm font-medium text-gray-700">
                HS Code (Opsional)
              </label>
              <Input
                id="hsCode"
                placeholder="Misal: 0901.11.10"
                value={formData.hsCode}
                onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="nilaiEkspor" className="mb-1.5 block text-sm font-medium text-gray-700">
                Estimasi Nilai Ekspor (USD)
              </label>
              <Input
                id="nilaiEkspor"
                required
                type="number"
                placeholder="Misal: 15000"
                value={formData.nilaiEkspor}
                onChange={(e) => setFormData({ ...formData, nilaiEkspor: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="tanggalKirim" className="mb-1.5 block text-sm font-medium text-gray-700">
                Rencana Tanggal Pengiriman
              </label>
              <Input
                id="tanggalKirim"
                type="date"
                required
                value={formData.tanggalKirim}
                onChange={(e) => setFormData({ ...formData, tanggalKirim: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-6">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              Buat Pengajuan
            </Button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
