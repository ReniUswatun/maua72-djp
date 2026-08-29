"use client";

import { Download, ScanLine } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeOcrAccuracy } from "@/lib/ai-accuracy";
import { downloadCsv, stamp, toCsv } from "@/lib/csv";
import { useAdminStore, useCan } from "@/store/admin-store";

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

export function AiAccuracyPanel() {
  const cases = useAdminStore((s) => s.cases);
  const canExport = useCan("report.export");
  const report = computeOcrAccuracy(cases);

  const exportCsv = () => {
    const rows = report.perTemplate.map((row) => ({
      template: row.template,
      dokumen_diperiksa: row.diperiksa,
      dokumen_cocok: row.cocok,
      akurasi_persen: row.akurasi,
    }));
    downloadCsv(`akurasi-ocr-${stamp()}`, toCsv(rows));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Super Admin</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <ScanLine className="h-6 w-6 text-gray-400" aria-hidden />
          Akurasi OCR
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          OCR membaca tiap dokumen PDF yang diunggah UMKM dan membandingkannya dengan template
          contoh. Panel ini mengukur seberapa sering pembacaan itu cocok.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Akurasi dokumen" value={`${report.akurasiDokumen}%`} hint="Dokumen lolos tanpa catatan" />
        <Stat label="Akurasi kolom" value={`${report.akurasiField}%`} hint={`${report.fieldSesuai}/${report.totalField} kolom sesuai`} />
        <Stat label="Dokumen dibaca OCR" value={report.diperiksa} hint={`${report.cocok} cocok · ${report.perluPerbaikan} perlu perbaikan`} />
        <Stat label="Gagal dibaca" value={report.gagalBaca} hint="OCR tidak bisa membaca isi" />
      </div>

      {report.diperiksa === 0 ? (
        <Alert tone="neutral" judul="Belum ada data">
          Belum ada dokumen yang dibaca OCR. Angka akan muncul setelah UMKM mengunggah dokumen
          pada pengajuannya.
        </Alert>
      ) : null}

      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">Rincian per template</CardTitle>
              <CardDescription>Akurasi pembacaan OCR untuk setiap jenis dokumen.</CardDescription>
            </div>
            {canExport ? (
              <Button size="sm" variant="outline" onClick={exportCsv} disabled={report.perTemplate.length === 0}>
                <Download className="h-4 w-4" aria-hidden />
                Export CSV
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.perTemplate.map((row) => (
            <div key={row.template} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-gray-900">{row.template}</span>
                <span className="text-gray-500">
                  {row.akurasi}% cocok · {row.cocok}/{row.diperiksa} dokumen
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <span className="block h-full bg-emerald-500" style={{ width: `${row.akurasi}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
