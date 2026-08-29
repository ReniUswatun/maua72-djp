# SiapEkspor — Platform Kesiapan Ekspor UMKM

Frontend sisi UMKM untuk platform self-assessment kesiapan ekspor.
Dibangun untuk **Hackathon Hilirisasi Maua 72 — Kantor Bea dan Cukai Surakarta**.

Prototipe ini mengukur kesiapan ekspor sebuah UMKM lintas **8 pilar**, menyusun
rekomendasi langkah lanjutan dalam bahasa awam, lalu menampilkan status
**validasi petugas Bea dan Cukai** pada setiap rekomendasi.

---

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
```

Perintah lain:

```bash
npm run build    # build produksi
npm run start    # jalankan hasil build
npm run lint     # eslint
```

Butuh Node.js 18.17+ (diuji pada Node 24).

## Jalur demo tercepat

Untuk melihat produk dalam kondisi terisi tanpa mengisi asesmen:

1. Buka halaman depan, klik **Lihat Contoh Hasil** (atau **Masuk → Masuk sebagai
   akun demo**).
2. Dashboard akan terisi data usaha "Kopi Merapi Nusantara": hasil asesmen
   Level 3, 13 rekomendasi, riwayat dua kali asesmen, dokumen, dan catatan
   petugas — termasuk satu rekomendasi yang **disunting petugas** dan satu yang
   **butuh info tambahan**.

Jalur lengkap dari nol: `/daftar` → `/onboarding` → `/asesmen` → `/asesmen/hasil`
→ `/dashboard`.

---

## Stack

| Kategori | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Komponen | Primitif bergaya shadcn/ui, ditulis langsung di `components/ui` |
| Ikon | lucide-react |
| Font | Plus Jakarta Sans (`next/font`) |
| State | Zustand + `persist` (localStorage) |
| Form | react-hook-form + zod |
| Animasi | framer-motion |

Belum ada backend. Seluruh data berasal dari `lib/` dan disimpan di
localStorage lewat store Zustand, sehingga demo tetap berjalan setelah refresh.

---

## Struktur

```
app/
├── page.tsx                      Landing page
├── (auth)/masuk | daftar         Autentikasi (mock)
├── onboarding/                   Profil bisnis 3 langkah
├── asesmen/
│   ├── page.tsx                  Intro + daftar pilar
│   ├── [step]/                   Satu halaman per pilar (1–8)
│   └── hasil/                    Skor, radar pilar, rekomendasi, kirim ke petugas
├── dashboard/
│   ├── page.tsx                  Beranda: level, perkembangan, to-do, notifikasi
│   ├── rekomendasi/[id]/         Detail + versi AI vs versi petugas
│   ├── dokumen/                  Checklist dokumen ekspor
│   ├── riwayat/                  Timeline interaksi dengan petugas
│   └── profil/                   Profil usaha (bisa diubah)
└── panduan/[slug]/               Hub artikel + glosarium

components/
├── ui/                           Button, Card, Input, Badge, Progress, Alert
├── landing/                      Hero, HowItWorks, PillarsGrid, ForWho, Footer
├── assessment/                   QuestionCard, ProgressHeader, HelpTooltip, Option*
├── dashboard/                    Sidebar, ReadinessScoreCard, PillarRadarChart,
│                                 RecommendationCard, OfficerReviewBadge, TodoList
└── shared/                       Navbar, Logo, DisclaimerBanner, Gate

lib/
├── assessment-config.ts          8 pilar + 35 pertanyaan (termasuk bercabang)
├── scoring.ts                    Perhitungan skor, level, override, naratif
├── recommendations.ts            Katalog 17 rekomendasi + mesin pemicu
├── business-categories.ts        14 kategori usaha beserta trait-nya
├── glossary.ts                   27 istilah kepabeanan untuk tooltip & glosarium
├── articles.ts                   9 panduan
└── mock-data.ts                  Data petugas, dokumen, timeline, akun demo

store/assessment-store.ts         Sumber kebenaran state di sisi klien
```

---

## Logika skoring

```
Skor pilar   = Σ (poin jawaban / poin maksimal × bobot pertanyaan)
               ────────────────────────────────────────────────── × 100
                            Σ bobot pertanyaan

Skor overall = Σ (skor pilar × bobot pilar)
```

Bobot pilar: Legalitas 20%, Produk 15%, Klasifikasi 15%, Kepabeanan 15%,
Pasar 10%, Logistik 10%, Keuangan 10%, SDM 5%.

Level: 1 Belum Siap (<30) · 2 Tahap Awal (30–49) · 3 Sedang Berkembang (50–69)
· 4 Hampir Siap (70–84) · 5 Siap Ekspor (85+).

**Aturan override**

- Tanpa NIB, level dibatasi maksimal 2 berapa pun skor totalnya. Halaman hasil
  menampilkan level sebelum dan sesudah pembatasan agar transparan.
- Kategori berisiko Lartas yang belum pernah mengecek status Lartas akan
  memunculkan *flag* khusus untuk petugas, ditampilkan di halaman hasil.
- Produk konsumsi tanpa sertifikat apa pun dan bahan kayu tanpa SVLK juga
  memunculkan flag.

Pengujian logika ini bisa dijalankan cepat dengan mengompilasi folder `lib/`
ke CommonJS dan memanggil `hitungHasil()` langsung dari Node.

---

## Tiga hal yang jadi bobot penilaian

**1. Officer-in-the-loop terlihat (25%)**

`OfficerReviewBadge` muncul pada setiap kartu rekomendasi, item to-do, dan
halaman detail, dengan empat status: `pending_review`, `approved`, `edited`,
`needs_more_info`. Pada rekomendasi berstatus `edited`, halaman detail
menampilkan **versi draf sistem berdampingan dengan versi petugas** supaya
pengguna tahu persis apa yang diubah. Tombol **Kirim ke Petugas** di halaman
hasil memicu alurnya.

**2. Asesmen membedakan situasi (25%)**

Kategori usaha yang dipilih saat onboarding menentukan `traits`, dan `traits`
menentukan pertanyaan bercabang. Contoh nyata: usaha kopi mendapat pertanyaan
sertifikat halal/izin edar dan karantina, sedangkan usaha furnitur mendapat
pertanyaan SVLK — dan rekomendasi SVLK tidak akan pernah muncul untuk usaha
kopi. Pertanyaan bercabang ditandai lencana "Khusus kategori usaha Anda".

**3. Kontinuitas (15%)**

Dashboard menyimpan riwayat setiap asesmen dan menampilkan perbandingan skor
antar waktu beserta selisihnya. Halaman Riwayat Konsultasi merekam seluruh
kejadian — asesmen selesai, rekomendasi ditinjau petugas, dokumen diverifikasi,
permintaan bantuan — sebagai timeline.

---

## Titik sambung ke backend

Kontrak data ada di `lib/types.ts`. Yang perlu diganti sumber datanya:

| Sekarang | Nanti |
|---|---|
| `MOCK_OFFICER_REVIEWS` di `lib/mock-data.ts` | `GET /rekomendasi/:id/review` |
| `kirimKePetugas()` di store | `POST /asesmen/:id/kirim-review` |
| `unggahDokumen()` di store | `POST /dokumen` (multipart) |
| `MOCK_TIMELINE` | `GET /riwayat` |
| `daftar()` / `masuk()` di store | autentikasi sungguhan |

Bentuk `OfficerReview`, `Recommendation`, dan `TimelineEvent` sudah mengikuti
apa yang dibutuhkan sisi petugas, jadi penggantian sumber data tidak perlu
mengubah komponen.

---

## Aksesibilitas & responsif

- Mobile-first; sidebar dashboard berubah menjadi bottom navigation di layar kecil.
- Seluruh tombol dan target sentuh minimal 44 px, font body 16 px.
- Semua input punya `<label>`, ada tautan lompat ke konten, dan focus ring yang jelas.
- Progress bar asesmen sticky di bagian atas layar.
- Palet warna mengikuti kombinasi navy/emas dengan kontras yang memenuhi WCAG AA
  pada teks utama.

---

## Peran & akses

Tiga peran, satu halaman masuk (`/masuk`) **tanpa pemilih peran**. Email + kata
sandi sudah menentukan peran; setelah login sistem otomatis mengarahkan ke area
yang sesuai.

| Peran | Login | Diarahkan ke | Kredensial |
|---|---|---|---|
| UMKM (demo) | `sari@kopimerapi.id` | `/dashboard` | `umkm123` (memuat data demo) |
| UMKM (lain) | email apa pun | `/dashboard` | kata sandi bebas (mock) |
| Officer | `ahmad.fauzi@beacukai.go.id` | `/admin` | `officer123` |
| Super Admin | `dewi.lestari@beacukai.go.id` | `/super-admin` | `superadmin123` |

Kredensial admin/officer ada di `lib/admin-data.ts` (`ADMIN_CREDENTIALS`). RBAC
diatur di `lib/rbac.ts`; super admin mengubah izin per peran di
`/super-admin/akses`, mengelola akun (CRUD penuh) di `/super-admin/akun`, dan
`AdminGate` memblokir halaman sekaligus `AdminShell` menyembunyikan menu.

**Area UMKM** (`/dashboard`):

- `/dashboard/pengajuan` — riwayat semua pengajuan ekspor + filter status. Buka
  satu pengajuan untuk mengelola dokumen. Jika status `revisi`/`ditolak`, UMKM
  mengunggah ulang dokumen yang ditandai lalu **kirim ulang**; saat masih
  `review` bisa ditarik dulu untuk diperbaiki.
- `/dashboard/riwayat` — konsultasi berbentuk **ticketing**: tiap pertanyaan jadi
  satu tiket dengan riwayat percakapan UMKM ↔ petugas.
- `/dashboard/profil` — data usaha + **unggah berkas PDF NIB dan NPWP**
  (`fileNib` / `fileNpwp`), bukan hanya nomor.
- `/dashboard/panduan` — panduan runtut (bukan kumpulan artikel) di dalam shell
  dashboard: tahap ekspor dari nol sampai barang berangkat, lalu tiap dokumen +
  cara mendapatkannya, plus glosarium yang bisa dikuncupkan. Isi yang sama juga
  tampil publik di `/panduan`.

**Panduan CMS** (`/admin/panduan`, izin `panduan.manage`, default officer &
super admin): tambah / sunting / hapus / urutkan / terbitkan-sembunyikan entri
panduan. Data di `store/panduan-store.ts` (localStorage `siapekspor-panduan`,
seed dari `lib/panduan.ts`). Entri inti bawaan `terkunci` — boleh disunting,
tidak boleh dihapus (jadikan draf untuk menyembunyikan). Tombol "Kembalikan ke
bawaan" me-reset ke seed.

**Alur officer** berpusat pada dokumen, bukan skor asesmen:

- `/admin/pengajuan` — daftar pengajuan; dokumen dibuka per pengajuan (tidak
  ditampilkan sekaligus) lewat daftar yang bisa dikuncupkan.
- `/admin/data-usaha` — persetujuan data usaha (NIB, NPWP, profil) terpisah dari
  keputusan dokumen ekspor.
- OCR membaca tiap PDF yang diunggah UMKM dan membandingkannya dengan template
  contoh; ketidaksesuaian menjadi catatan yang dibaca officer & super admin.
  Metrik akurasinya di `/super-admin/akurasi-ai`.

Halaman `/portal` adalah pengantar publik: penjelasan platform + tiga peran.

## Menjalankan dengan Docker

```bash
docker build --network=host -t siapekspor:latest .   # --network=host: host ini pakai DNS Tailscale
docker run -d --name siapekspor -p 1555:1555 siapekspor:latest
# buka http://localhost:1555
```

Image memakai Next.js standalone output; container listen di port **1555**
(`ENV PORT=1555`).

## Tunnel Cloudflare (reniuswatun.my.id)

Named tunnel supaya domain sendiri yang dipakai:

```bash
cloudflared tunnel login                               # pilih zona reniuswatun.my.id
cloudflared tunnel create siapekspor                   # simpan <TUNNEL_ID>.json
cloudflared tunnel route dns siapekspor reniuswatun.my.id
```

`~/.cloudflared/config.yml`:

```yaml
tunnel: siapekspor
credentials-file: /home/reni/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: reniuswatun.my.id
    service: http://localhost:1555
  - service: http_status:404
```

```bash
cloudflared tunnel run siapekspor        # atau: cloudflared service install
```

Cara cepat tanpa DNS setup (URL acak `*.trycloudflare.com`):

```bash
cloudflared tunnel --url http://localhost:1555
```

---

## Catatan

Angka statistik di landing page dilabeli sebagai ilustrasi, dan testimoni
ditandai eksplisit sebagai bukan kutipan pengguna nyata. Disclaimer wajib
tampil di footer, halaman hasil asesmen, dan setiap detail rekomendasi:
platform ini alat bantu, dan keputusan resmi kepabeanan tetap kewenangan
Direktorat Jenderal Bea dan Cukai.
