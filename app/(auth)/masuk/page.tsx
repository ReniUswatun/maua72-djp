import type { Metadata } from "next";
import { Suspense } from "react";

import { FormMasuk } from "./FormMasuk";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke SiapEkspor sebagai UMKM, Officer, atau Super Admin.",
};

export default function MasukPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100" />}>
      <FormMasuk />
    </Suspense>
  );
}
