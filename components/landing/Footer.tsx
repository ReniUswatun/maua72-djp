import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { TEKS_DISCLAIMER } from "@/components/shared/DisclaimerBanner";
import { KANTOR } from "@/lib/mock-data";

const KOLOM = [
  {
    judul: "Platform",
    tautan: [
      { href: "/#cara-kerja", label: "Cara Kerja" },
      { href: "/#untuk-siapa", label: "Untuk Siapa" },
      { href: "/portal", label: "Tentang Platform" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    judul: "Panduan",
    tautan: [
      { href: "/panduan", label: "Panduan Ekspor" },
      { href: "/panduan#rangkuman", label: "Rangkuman AI" },
      { href: "/panduan#glosarium", label: "Glosarium Istilah" },
      { href: "/daftar", label: "Daftar Gratis" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo subtitle="Pendampingan Ekspor UMKM" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              Pendampingan penyusunan dokumen ekspor untuk UMKM Indonesia,
              dikembangkan bersama {KANTOR.nama}.
            </p>
          </div>

          {KOLOM.map((kol) => (
            <div key={kol.judul} className="lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-900">{kol.judul}</h3>
              <ul className="mt-4 space-y-2.5">
                {kol.tautan.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="text-sm text-gray-600 hover:text-primary-700 hover:underline"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold text-gray-900">Kontak</h3>
            <p className="mt-4 text-sm font-semibold text-gray-900">
              {KANTOR.nama}
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-gray-600">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span>{KANTOR.alamat}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span>{KANTOR.telepon}</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span className="break-all">{KANTOR.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-gray-500">
            <span className="font-semibold text-gray-700">Catatan Penting:</span>{" "}
            {TEKS_DISCLAIMER}
          </p>
          <p className="mt-6 text-xs text-gray-500">
            © {new Date().getFullYear()} SiapEkspor — prototipe Hackathon
            Hilirisasi Maua 72. Bukan layanan resmi Direktorat Jenderal Bea dan
            Cukai.
          </p>
        </div>
      </div>
    </footer>
  );
}
