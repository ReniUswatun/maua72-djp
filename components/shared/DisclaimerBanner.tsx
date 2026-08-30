import { ShieldAlert } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const TEKS_DISCLAIMER =
  "Platform ini adalah alat bantu edukasi dan pendampingan penyusunan dokumen ekspor. Panduan dan catatan yang diberikan sistem bersifat awal dan harus ditinjau oleh Petugas Bea dan Cukai berwenang sebelum ditindaklanjuti. Keputusan resmi kepabeanan dan validitas dokumen ekspor sepenuhnya menjadi kewenangan Direktorat Jenderal Bea dan Cukai.";

/** Disclaimer wajib (blueprint §18) — footer dan tiap halaman panduan. */
export function DisclaimerBanner({
  ringkas = false,
  className,
}: {
  ringkas?: boolean;
  className?: string;
}) {
  if (ringkas) {
    return (
      <p className={cn("text-xs leading-relaxed text-gray-500", className)}>
        <span className="font-semibold text-gray-700">Catatan Penting:</span>{" "}
        {TEKS_DISCLAIMER}
      </p>
    );
  }

  return (
    <Alert
      tone="neutral"
      judul="Catatan Penting"
      icon={<ShieldAlert className="h-5 w-5 text-gray-500" aria-hidden />}
      className={className}
    >
      {TEKS_DISCLAIMER}
    </Alert>
  );
}
