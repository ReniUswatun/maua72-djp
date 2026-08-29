"use client";

import { Download, Gauge } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAccuracy, type AccuracyBucket } from "@/lib/ai-accuracy";
import { downloadCsv, stamp, toCsv } from "@/lib/csv";
import { useAdminStore, useCan } from "@/store/admin-store";

function Bar({ bucket }: { bucket: AccuracyBucket }) {
  const reviewed = bucket.total - bucket.belumDireview;
  const pct = (n: number) => (reviewed === 0 ? 0 : (n / reviewed) * 100);
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
      <span className="block bg-emerald-500" style={{ width: `${pct(bucket.diterima)}%` }} />
      <span className="block bg-amber-400" style={{ width: `${pct(bucket.skorDisesuaikan)}%` }} />
      <span className="block bg-sky-500" style={{ width: `${pct(bucket.teksDisunting)}%` }} />
    </div>
  );
}

export function AiAccuracyPanel() {
  const cases = useAdminStore((s) => s.cases);
  const canExport = useCan("report.export");
  const report = computeAccuracy(cases);
  const { overall } = report;

  const exportCsv = () => {
    const rows = [
      { dimensi: "Keseluruhan", ...bucketRow(overall) },
      ...report.perPillar.map((p) => ({ dimensi: p.label, ...bucketRow(p.bucket) })),
    ];
    downloadCsv(`akurasi-ai-${stamp()}`, toCsv(rows));
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-slate-950 text-white">
        <CardHeader>
          <Badge tone="accent" className="w-fit border-white/10 bg-white/10 text-white">
            <Gauge className="h-3.5 w-3.5" aria-hidden />
            AI Accuracy Tracker
          </Badge>
          <CardTitle className="text-2xl">Seberapa sering draf AI dipakai apa adanya</CardTitle>
          <CardDescription className="text-white/70">
            Dihitung dari perbandingan draf AI vs keputusan officer pada setiap dimensi.
            Sistem mengukur akurasinya sendiri dari waktu ke waktu.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Stat label="Akurasi keseluruhan" value={`${overall.akurasi}%`} hint="Draf diterima tanpa edit" />
          <Stat label="Dimensi direview" value={overall.total - overall.belumDireview} hint={`dari ${overall.total} dimensi`} />
          <Stat label="Skor disesuaikan" value={overall.skorDisesuaikan} hint="Officer ubah angka skor" />
          <Stat label="Teks disunting" value={overall.teksDisunting} hint="Officer tulis ulang rekomendasi" />
        </CardContent>
      </Card>

      {overall.total - overall.belumDireview === 0 ? (
        <Alert tone="neutral" judul="Belum ada data">
          Belum ada dimensi yang direview officer. Angka akan muncul setelah officer mulai
          menyetujui atau menyunting draf AI.
        </Alert>
      ) : null}

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">Rincian per dimensi</CardTitle>
              <CardDescription>Hijau = diterima · kuning = skor disesuaikan · biru = teks disunting</CardDescription>
            </div>
            {canExport ? (
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4" aria-hidden />
                Export CSV
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.perPillar.map((p) => (
            <div key={p.pillarId} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-900">{p.label}</span>
                <span className="text-slate-500">
                  {p.bucket.akurasi}% diterima · {p.bucket.total - p.bucket.belumDireview}/{p.bucket.total} direview
                </span>
              </div>
              <Bar bucket={p.bucket} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-white/50">{hint}</p>
    </div>
  );
}

function bucketRow(bucket: AccuracyBucket) {
  return {
    total_dimensi: bucket.total,
    direview: bucket.total - bucket.belumDireview,
    diterima: bucket.diterima,
    skor_disesuaikan: bucket.skorDisesuaikan,
    teks_disunting: bucket.teksDisunting,
    akurasi_persen: bucket.akurasi,
  };
}
