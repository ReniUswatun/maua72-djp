# SiapEkspor — Pendampingan Dokumen Ekspor UMKM

Frontend prototipe untuk platform pendampingan penyusunan dokumen ekspor UMKM.
Dibangun untuk **Hackathon Hilirisasi Maua 72 — Kantor Bea dan Cukai Surakarta**.

UMKM melengkapi profil usaha (termasuk berkas NIB/NPWP), membuat **pengajuan
ekspor**, mengunggah dokumen transaksi (Invoice, Packing List, PEB, SKA), lalu
mengirimkannya untuk **ditinjau petugas Bea dan Cukai**. Di sisi petugas, tiap
PDF dibaca **OCR** dan dicocokkan dengan template contoh serta data pengajuan;
petugas memberi keputusan per dokumen dan per pengajuan. Platform juga berisi
**panduan ekspor** runtut, **konsultasi berbentuk tiket**, dan **super admin**
untuk kelola akun admin + hak akses.

> Prototipe frontend saja — belum ada backend. Seluruh data berasal dari `lib/`
> dan disimpan di localStorage lewat store Zustand, sehingga demo tetap berjalan
> setelah refresh.

---

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
```

Perintah lain:

```bash
npm run build    # build produksi (Next.js standalone)
npm run start    # jalankan hasil build
npm run lint     # eslint
```

Butuh Node.js 20+ (image Docker memakai `node:20-alpine`).

## Jalur demo tercepat

Tanpa mengisi apa pun:

1. Di halaman depan klik **Lihat Contoh Dashboard**, atau di `/masuk` klik
   **Masuk sebagai akun demo**.
2. Dashboard akan terisi data "Kopi Merapi Nusantara": tiga pengajuan ekspor
   (satu sedang direview petugas, satu ditolak dan perlu perbaikan, satu sudah
   selesai/disetujui), riwayat timeline, dan beberapa tiket konsultasi.

Jalur lengkap dari nol: `/daftar` → `/dashboard/profil` (lengkapi data usaha +
unggah PDF NIB) → `/dashboard/pengajuan/baru` → unggah dokumen → kirim untuk
review.

---

## Peran & akun uji coba

Tiga peran, satu halaman masuk (`/masuk`) **tanpa pemilih peran**. Email + kata
sandi sudah menentukan peran; setelah login sistem otomatis mengarahkan ke area
yang sesuai.

| Peran | Email | Kata sandi | Diarahkan ke |
|---|---|---|---|
| UMKM (demo) | `sari@kopimerapi.id` | `umkm123` | `/dashboard` (memuat data demo) |
| UMKM (lain) | email apa pun | bebas (mock) | `/dashboard` |
| Admin | `ahmad.fauzi@beacukai.go.id` | `admin123` | `/admin` |
| Admin | `retno.wulandari@beacukai.go.id` | `admin123` | `/admin` |
| Super Admin | `dewi.lestari@beacukai.go.id` | `superadmin123` | `/super-admin` |

Kredensial admin ada di `lib/admin-data.ts` (`ADMIN_CREDENTIALS`). RBAC diatur di
`lib/rbac.ts`: `AdminGate` memblokir halaman dan `AdminShell` menyembunyikan menu
lewat helper `roleCan()`, jadi pembatasan bukan sekadar kosmetik. Super admin
mengubah izin peran `admin` di `/super-admin/akses` (peran `super_admin`
terkunci).

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
| OCR | tesseract.js + pdfjs-dist (dijalankan di sisi browser) |

Tiga store Zustand terpisah, masing-masing dengan key localStorage sendiri:

| Store | Key localStorage | Isi |
|---|---|---|
| `store/assessment-store.ts` | `siapekspor-state` | Sesi UMKM: user, profil, pengajuan, timeline, tiket |
| `store/admin-store.ts` | `siapekspor-admin-state` | Sesi admin, daftar case, hak akses per peran |
| `store/panduan-store.ts` | `siapekspor-panduan` | Konten panduan (CMS), seed dari `lib/panduan.ts` |

Pengajuan UMKM yang sudah dikirim disalin ke daftar case admin oleh
`components/shared/PengajuanBridge.tsx` — jembatan antar-store karena belum ada
backend.

---

## Struktur

```
app/
├── page.tsx                       Landing page
├── portal/                        Pengantar publik + penjelasan tiga peran
├── panduan/
│   ├── page.tsx                   Panduan ekspor runtut (publik)
│   ├── [slug]/                    Artikel panduan (lib/articles.ts)
│   ├── langkah/[slug]/            Detail langkah panduan (CMS)
│   └── dokumen/[id]/              Cara membuat tiap dokumen + flowchart
├── (auth)/masuk | daftar          Autentikasi (mock)
├── dashboard/                     Area UMKM
│   ├── page.tsx                   Beranda: pengajuan terbaru, notifikasi petugas
│   ├── pengajuan/                 Daftar + detail + form "pengajuan baru"
│   ├── riwayat/                   Konsultasi berbentuk tiket
│   ├── panduan/                   Panduan yang sama, di dalam shell dashboard
│   └── profil/                    Data usaha + unggah PDF NIB & NPWP
├── admin/(protected)/             Area admin (petugas)
│   ├── page.tsx                   Beranda: yang perlu ditangani + status SLA
│   ├── pengajuan/                 Antrean pengajuan + workspace review per pengajuan
│   ├── data-usaha/                Persetujuan data usaha (NIB, NPWP, profil)
│   ├── pertanyaan/                Inbox tiket konsultasi UMKM
│   ├── panduan/                   CMS panduan
│   └── riwayat/                   Riwayat & audit trail
└── super-admin/(protected)/
    ├── page.tsx                   Pantau kinerja admin
    ├── akun/                      CRUD akun admin
    ├── akses/                     Matriks hak akses peran (RBAC)
    └── aktivitas/                 Log aktivitas admin

components/
├── ui/                           Button, Card, Input, Badge, Progress, Alert
├── landing/                      Hero, HowItWorks, ForWho, Footer
├── dashboard/                    Sidebar (+ BottomNav, DashboardTopbar)
├── admin/                        AdminShell, AdminGate, AdminReviewWorkspace,
│                                 DocumentReviewList, BusinessApprovalPanel,
│                                 PanduanCmsPanel, RolePermissionMatrix,
│                                 SuperAdminAccountsPanel, TicketInboxPanel,
│                                 WhatsAppDraftPanel, AdminCasesTable
├── panduan/                      PanduanReader, PanduanArticle, PanduanSearch,
│                                 PanduanRangkuman
└── shared/                       Navbar, Logo, DisclaimerBanner, Gate,
                                  DocumentUploadItem, FilePreviewModal,
                                  FlowChart, PengajuanBridge, EmptyState

lib/
├── types.ts                      Kontrak data domain (titik sambung backend)
├── mock-data.ts                  Petugas, kantor, akun demo UMKM, timeline
├── admin-data.ts                 Akun admin + kredensial + case contoh
├── rbac.ts                       Permission, hak akses bawaan, helper roleCan()
├── ocr-engine.ts                 Ekstraksi teks PDF + pencocokan field
├── doc-templates.ts              Template contoh tiap jenis dokumen
├── panduan.ts                    Seed panduan (6 tahap ekspor + 6 dokumen inti)
├── panduan-search.ts             Pencarian panduan
├── articles.ts                   9 artikel panduan + kategori
├── glossary.ts                   Glosarium istilah kepabeanan (tooltip & daftar)
├── business-categories.ts        14 kategori usaha + trait
├── sla.ts                        Hitung keterlambatan SLA pengajuan
├── pengajuan-status.ts           Label & warna status pengajuan
└── ...                           wa-template, csv, upload, file-url, sample-doc,
                                  pengajuan-bridge, admin-api, utils

scripts/
├── generate-test-pdfs.mjs        Buat PDF contoh di file-testing-pdf/
├── test-ocr.ts                   Uji validasi OCR terhadap PDF contoh
└── test-panduan-search.ts        Uji pencarian panduan
```

---

## Alur inti

### UMKM (`/dashboard`)

1. **Daftar** (nama, email, HP, kata sandi) → langsung ke dashboard.
2. **`/dashboard/profil`** — lengkapi data usaha dan **unggah berkas PDF NIB**
   (dan NPWP). Nomor + berkas dua-duanya wajib sebelum bisa mengajukan.
3. **`/dashboard/pengajuan/baru`** — isi rencana ekspor: produk, HS Code, nilai
   ekspor, pembeli, negara tujuan, tanggal kirim.
4. Buka pengajuan, **unggah dokumen transaksi** (Commercial Invoice, Packing
   List, PEB, SKA). Tiap PDF langsung dibaca OCR dan dicek terhadap template +
   data pengajuan.
5. **Kirim** untuk ditinjau. Status pengajuan: `draft` → `review` →
   `revisi`/`ditolak` → (unggah ulang & kirim ulang) → `selesai`. Saat masih
   `review` pengajuan bisa **ditarik** dulu untuk diperbaiki.
6. **`/dashboard/riwayat`** — konsultasi berbentuk **ticketing**: tiap pertanyaan
   jadi satu tiket dengan riwayat percakapan UMKM ↔ petugas.

### Admin / petugas (`/admin`) — berpusat pada dokumen, bukan skor

- **`/admin/pengajuan`** — antrean pengajuan; dokumen dibuka per pengajuan lewat
  daftar yang bisa dikuncupkan (tidak ditampilkan sekaligus). Petugas menyetujui
  atau meminta revisi tiap dokumen, menulis catatan, lalu mengambil keputusan
  pengajuan.
- **`/admin/data-usaha`** — persetujuan NIB / NPWP / profil, terpisah dari
  keputusan dokumen ekspor.
- **`/admin/pertanyaan`** — inbox tiket konsultasi; balas / tutup.
- **`/admin/panduan`** — CMS panduan (lihat bawah).
- **`/admin/riwayat`** — riwayat keputusan + audit trail.
- Draf pesan **WhatsApp** untuk UMKM bisa disiapkan per pengajuan
  (`WhatsAppDraftPanel`).

### Super admin (`/super-admin`) — hanya soal admin

- **`/super-admin/akun`** — CRUD akun admin.
- **`/super-admin/akses`** — matriks RBAC; ubah izin peran `admin`.
- **`/super-admin/aktivitas`** — log aktivitas admin (baca saja).
- **`/super-admin`** — ringkasan kinerja tiap admin & SLA. Super admin memantau,
  tidak ikut memproses pengajuan.

---

## Panduan ekspor & CMS

Panduan adalah **satu daftar langkah berurutan**, bukan kumpulan artikel lepas:
6 tahap ekspor dari nol sampai barang berangkat, lalu 6 dokumen inti + cara
mendapatkannya, plus glosarium yang bisa dikuncupkan. Isi yang sama tampil publik
di `/panduan` dan di dalam dashboard di `/dashboard/panduan`.

**CMS** di `/admin/panduan` (izin `panduan.manage`, default untuk peran `admin`):
tambah / sunting / hapus / urutkan / terbitkan-sembunyikan entri lewat editor
blok (paragraf, poin, langkah, gambar, catatan, tautan). Data di
`store/panduan-store.ts` (localStorage `siapekspor-panduan`), seed dari
`lib/panduan.ts`. Entri inti bawaan `terkunci` — boleh disunting, tidak boleh
dihapus (jadikan draf untuk menyembunyikan). Tombol "Kembalikan ke bawaan"
me-reset ke seed.

---

## Validasi dokumen (OCR)

`lib/ocr-engine.ts` mengekstrak teks dari PDF yang diunggah (line-aware),
menormalkannya, lalu mencocokkan field penting dengan yang seharusnya — mis. HS
Code di Commercial Invoice harus sama dengan HS Code di pengajuan, nilai ekspor
harus konsisten, nama usaha harus cocok. Hasilnya `DocumentOcrResult` dengan
status `cocok` / `perlu_perbaikan` / `gagal_baca` dan daftar `temuan` per field,
yang ditampilkan ke petugas saat review.

pdfjs-dist v6 aman di browser tetapi tidak jalan di Node pada sebagian mesin
(SIGILL). Uji cepat di dalam container:

```bash
tsx scripts/test-ocr.ts             # validasi terhadap PDF di file-testing-pdf/
tsx scripts/test-panduan-search.ts  # uji pencarian panduan
```

PDF contoh dibuat dengan `node scripts/generate-test-pdfs.mjs`.

---

## Titik sambung ke backend

Kontrak data ada di `lib/types.ts`. Yang perlu diganti sumber datanya:

| Sekarang | Nanti |
|---|---|
| `ADMIN_CREDENTIALS` / `masuk()` / `daftar()` di store | autentikasi sungguhan |
| `PengajuanBridge` + dua store localStorage | `GET/POST /pengajuan` |
| `unggahDokumenPengajuan()` di store | `POST /pengajuan/:id/dokumen` (multipart) |
| `kirimPengajuan()` / `terapkanReviewAdmin()` | `POST /pengajuan/:id/kirim`, `/pengajuan/:id/review` |
| `useAdminStore.cases` | `GET /admin/pengajuan` |
| tiket konsultasi di store | `GET/POST /konsultasi` |
| OCR di browser (`lib/ocr-engine.ts`) | layanan OCR di server |
| `rolePermissions` di `admin-store` | `GET/PUT /rbac` |

Bentuk `ApplicationCase`, `PengajuanEkspor`, `DocumentItem`,
`ConsultationTicket`, dan `TimelineEvent` sudah mengikuti kebutuhan sisi petugas,
jadi penggantian sumber data tidak perlu mengubah komponen.

---

## Aksesibilitas & responsif

- Mobile-first; sidebar dashboard & admin berubah jadi bottom navigation / menu
  overlay di layar kecil.
- Target sentuh minimal 44 px, font body 16 px.
- Semua input punya `<label>`, ada tautan lompat ke konten (`#konten-utama`), dan
  focus ring yang jelas.
- Palet navy/emas dengan kontras yang memenuhi WCAG AA pada teks utama.

---

## Deploy

### Docker

```bash
docker build --network=host -t siapekspor:latest .   # --network=host: resolver DNS jaringan bridge default tidak jalan di host ini
docker run -d --name siapekspor --restart unless-stopped -p 1555:1555 siapekspor:latest
# buka http://localhost:1555
```

Image memakai Next.js standalone output; container listen di port **1555**
(`ENV PORT=1555`). Deploy = rebuild image lalu recreate container (belum ada
compose file / CI).

### Tunnel Cloudflare (reniuswatun.my.id)

Named tunnel supaya domain sendiri yang dipakai:

```bash
cloudflared tunnel login                           # pilih zona reniuswatun.my.id
cloudflared tunnel create siapekspor               # simpan <TUNNEL_ID>.json
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
ditandai eksplisit sebagai bukan kutipan pengguna nyata. Disclaimer wajib tampil
di footer dan setiap halaman panduan: platform ini alat bantu edukasi dan
pendampingan penyusunan dokumen ekspor; panduan dan catatan sistem bersifat awal
dan harus ditinjau petugas berwenang, dan keputusan resmi kepabeanan serta
validitas dokumen ekspor sepenuhnya menjadi kewenangan Direktorat Jenderal Bea
dan Cukai.
