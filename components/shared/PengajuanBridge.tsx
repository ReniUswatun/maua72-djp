"use client";

import * as React from "react";

import { pengajuanToCase } from "@/lib/pengajuan-bridge";
import { useAdminStore } from "@/store/admin-store";
import { useAppStore } from "@/store/assessment-store";

/**
 * Menyalin pengajuan UMKM yang sudah dikirim ke daftar case admin
 * (prototipe tanpa backend — dua store localStorage terpisah).
 * Dipasang di layout dashboard UMKM.
 */
export function PengajuanBridge() {
  const pengajuan = useAppStore((s) => s.pengajuan);
  const profile = useAppStore((s) => s.profile);
  const user = useAppStore((s) => s.user);
  const hydrated = useAppStore((s) => s.hydrated);

  React.useEffect(() => {
    if (!hydrated) return;
    const { cases, upsertCaseFromPengajuan } = useAdminStore.getState();
    for (const p of pengajuan) {
      if (p.status === "draft") continue;
      const existing = cases.find((c) => c.id === p.id);
      upsertCaseFromPengajuan(pengajuanToCase(p, profile, user, existing));
    }
  }, [pengajuan, profile, user, hydrated]);

  return null;
}
