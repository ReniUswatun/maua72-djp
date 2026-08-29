"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, HardDriveDownload } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavigationButtons({
  onSebelumnya,
  onLanjut,
  labelLanjut,
  bisaSebelumnya,
  langkahTerakhir,
  belumLengkap,
}: {
  onSebelumnya: () => void;
  onLanjut: () => void;
  labelLanjut: string;
  bisaSebelumnya: boolean;
  langkahTerakhir: boolean;
  belumLengkap: number;
}) {
  return (
    <div className="mt-8">
      {belumLengkap > 0 ? (
        <p className="mb-4 text-sm text-gray-500">
          Masih ada {belumLengkap} pertanyaan yang belum dijawab di pilar ini.
          Anda tetap bisa lanjut dan kembali lagi nanti — pertanyaan kosong
          dihitung nol pada skor.
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          onClick={onSebelumnya}
          disabled={!bisaSebelumnya}
          className={bisaSebelumnya ? "" : "invisible"}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Sebelumnya
        </Button>

        <Button onClick={onLanjut} size="lg">
          {langkahTerakhir ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : null}
          {labelLanjut}
          {!langkahTerakhir ? (
            <ArrowRight className="h-5 w-5" aria-hidden />
          ) : null}
        </Button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <HardDriveDownload className="h-4 w-4" aria-hidden />
        Progres tersimpan otomatis di perangkat ini
      </p>
    </div>
  );
}
