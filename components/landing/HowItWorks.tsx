import { STATISTIK_LANDING } from "@/lib/mock-data";

const LANGKAH = [
  {
    no: "01",
    judul: "Isi Asesmen Kesiapan",
    detail:
      "Sekitar 10 menit, 8 kategori pertanyaan. Setiap istilah teknis dijelaskan dengan bahasa sehari-hari.",
  },
  {
    no: "02",
    judul: "Dapatkan Skor & Klasifikasi",
    detail:
      "Skor 0–100 dan level kesiapan 1–5, lengkap dengan rincian nilai per pilar.",
  },
  {
    no: "03",
    judul: "Lihat Rekomendasi Personal",
    detail:
      "Daftar langkah yang disusun berurutan sesuai kondisi usaha Anda, bukan daftar umum.",
  },
  {
    no: "04",
    judul: "Diskusikan dengan Petugas",
    detail:
      "Rekomendasi ditinjau petugas Bea Cukai sebelum Anda tindak lanjuti. Anda melihat bila ada koreksi.",
  },
  {
    no: "05",
    judul: "Ikuti Roadmap sampai Ekspor Perdana",
    detail:
      "Tandai langkah yang selesai, unggah dokumen, dan ulangi asesmen untuk melihat perkembangan.",
  },
];

export function Statistik() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="container-page py-14 sm:py-16">
        <p className="eyebrow">Kenapa ini penting</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
          UMKM adalah tulang punggung ekonomi, tapi sedikit yang menembus pasar
          global
        </h2>

        <dl className="mt-10 grid gap-8 sm:grid-cols-3">
          {STATISTIK_LANDING.map((s) => (
            <div key={s.label} className="border-t-2 border-accent-500 pt-5">
              <dt className="text-4xl font-bold tracking-tight text-primary-900">
                {s.angka}
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-gray-600">
                {s.label}
              </dd>
              <p className="mt-3 text-xs text-gray-400">{s.sumber}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 bg-gray-50">
      <div className="container-page section-y">
        <p className="eyebrow">Cara Kerja</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
          Lima langkah dari ragu-ragu sampai pengiriman pertama
        </h2>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-5">
          {LANGKAH.map((l) => (
            <li key={l.no} className="bg-white p-6">
              <span className="text-sm font-bold tabular-nums text-accent-600">
                {l.no}
              </span>
              <h3 className="mt-3 text-lg font-semibold leading-snug">
                {l.judul}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {l.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
