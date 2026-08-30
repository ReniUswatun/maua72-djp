import type { Metadata } from "next";

import {
  BottomNav,
  DashboardTopbar,
  Sidebar,
} from "@/components/dashboard/Sidebar";
import { ButuhLogin } from "@/components/shared/Gate";
import { PengajuanBridge } from "@/components/shared/PengajuanBridge";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Kelola pengajuan ekspor, dokumen usaha, dan konsultasi dengan petugas Bea dan Cukai.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PengajuanBridge />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main
          id="konten-utama"
          className="flex-1 px-5 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-12"
        >
          <div className="mx-auto w-full max-w-5xl">
            <ButuhLogin>{children}</ButuhLogin>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
