import { PillarIcon } from "@/components/shared/PillarIcon";
import { PILLARS } from "@/lib/assessment-config";

export function PillarsGrid() {
  return (
    <section id="pilar" className="scroll-mt-20 bg-white">
      <div className="container-page section-y">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">8 Pilar Kesiapan</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Kesiapan ekspor bukan satu hal, melainkan delapan
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Setiap pilar punya bobot berbeda terhadap skor akhir. Legalitas
              memberi pengaruh terbesar karena tanpanya dokumen ekspor tidak bisa
              diproses sama sekali.
            </p>
          </div>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <li
              key={p.id}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <PillarIcon icon={p.icon} className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold tabular-nums text-gray-600">
                  {Math.round(p.bobot * 100)}%
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug">
                {p.id}. {p.nama}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {p.ringkas}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
