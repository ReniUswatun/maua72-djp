import type { Metadata } from "next";

import {
  BottomNav,
  DashboardTopbar,
  Sidebar,
} from "@/components/dashboard/Sidebar";
import { ButuhLogin } from "@/components/shared/Gate";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Pantau level kesiapan ekspor, rekomendasi tervalidasi petugas, dan dokumen usaha Anda.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
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
