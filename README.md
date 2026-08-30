# SiapEkspor — Pendampingan Dokumen Ekspor UMKM

Platform yang menemani UMKM menyusun dan memeriksa dokumen ekspor sampai siap
ditinjau petugas Bea dan Cukai, lalu memberi petugas satu tempat untuk menilai
tiap dokumen dengan bantuan pembacaan OCR.

Dibangun untuk **Hackathon Hilirisasi Maua 72 — Kantor Bea dan Cukai Surakarta**.

> Prototipe frontend. Belum ada backend: semua data awal berasal dari `lib/` dan
> tersimpan di `localStorage` lewat store Zustand, jadi demo tetap utuh setelah
> refresh. Keputusan resmi kepabeanan tetap sepenuhnya kewenangan Direktorat
> Jenderal Bea dan Cukai.

---

## Handover — satu halaman, tidak lebih

### Apa yang dikerjakan aplikasi ini

UMKM mengisi profil usaha (termasuk berkas NIB & NPWP), membuat **pengajuan
ekspor** (produk, HS Code, nilai, pembeli, negara tujuan), lalu mengunggah
dokumen transaksi: Commercial Invoice, Packing List, PEB, dan SKA. Setiap PDF
yang diunggah langsung **dibaca OCR di browser** dan field pentingnya dicocokkan
dengan template contoh dan data pengajuan — HS Code, nilai ekspor, dan nama usaha
harus konsisten di semua dokumen.

Setelah dikirim, **petugas Bea dan Cukai** meninjau tiap dokumen satu per satu:
setujui, minta revisi, atau tolak, dengan catatan. UMKM memperbaiki dan
mengirim ulang sampai pengajuan `selesai`. Di samping alur utama ada **panduan
ekspor** berurutan, **konsultasi berbentuk tiket**, dan **super admin** untuk
mengelola akun petugas beserta hak aksesnya.

### Siapa yang menjalankan

Reni Uswatun (`gitvibecode@gmail.com`). Aplikasi dijalankan dari server milik
sendiri sebagai container Docker dan dipublikasikan lewat Cloudflare Tunnel di
**reniuswatun.my.id**. Tidak ada backend, database, atau layanan berbayar yang
perlu dijaga — OCR berjalan di browser pengunjung.

### Biaya untuk merawatnya

| Komponen | Biaya |
|---|---|
| Domain `reniuswatun.my.id` | ~Rp 15–30 rb / tahun |
| Server | PC milik Reni (hanya listrik), atau Vercel free tier |
| Cloudflare Tunnel | Gratis |
| Backend / database / API | Tidak ada |

### Kalau rusak, lakukan ini

| Gejala | Tindakan |
|---|---|
| Situs tidak terbuka di domain | `docker restart siapekspor`, lalu `cloudflared tunnel run siapekspor` |
| Internet rumah putus | Alihkan demo ke URL cadangan di Vercel (lihat bagian Deploy) |
| Container gagal start setelah perubahan | Rebuild image: `docker build --network=host -t siapekspor:latest .` lalu recreate container |
| Data demo aneh / menumpuk di browser | Hapus site data untuk domain tersebut (localStorage), muat ulang |
| OCR gagal baca sebuah PDF | Wajar untuk scan buram; petugas tetap bisa menilai manual |

---

## Menjalankan lokal

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # build produksi (Next.js standalone)
npm run start    # jalankan hasil build
npm run lint     # eslint
```

Butuh Node.js 20+.

### Jalur demo tercepat

Tanpa mengisi apa pun: di halaman depan klik **Lihat Contoh Dashboard**, atau di
`/masuk` klik **Masuk sebagai akun demo**. Dashboard terisi data "Kopi Merapi
Nusantara" — tiga pengajuan ekspor (satu sedang direview, satu ditolak dan perlu
perbaikan, satu selesai), timeline, dan beberapa tiket konsultasi.

Jalur lengkap dari nol: `/daftar` → `/dashboard/profil` (lengkapi data usaha +
unggah PDF NIB & NPWP) → `/dashboard/pengajuan/baru` → unggah dokumen → kirim.

### Akun uji coba

Satu halaman masuk (`/masuk`), tanpa pemilih peran — email + kata sandi yang
menentukan peran dan tujuan pengalihan.

| Peran | Email | Kata sandi | Diarahkan ke |
|---|---|---|---|
| UMKM (demo) | `sari@kopimerapi.id` | `umkm123` | `/dashboard` (data demo) |
| UMKM (lain) | email apa pun | bebas (mock) | `/dashboard` |
| Admin | `ahmad.fauzi@beacukai.go.id` | `admin123` | `/admin` |
| Admin | `retno.wulandari@beacukai.go.id` | `admin123` | `/admin` |
| Super Admin | `dewi.lestari@beacukai.go.id` | `superadmin123` | `/super-admin` |

Kredensial admin ada di `lib/admin-data.ts`. RBAC di `lib/rbac.ts`: `AdminGate`
memblokir halaman dan `AdminShell` menyembunyikan menu, jadi pembatasan bukan
sekadar kosmetik. Super admin mengubah izin peran `admin` di `/super-admin/akses`
(peran `super_admin` terkunci).

---

## Alur aplikasi

### UMKM — `/dashboard`

1. **Daftar**, lalu di `/dashboard/profil` lengkapi data usaha dan **unggah PDF
   NIB & NPWP**. Nomor dan berkas dua-duanya wajib sebelum bisa mengajukan.
2. **`/dashboard/pengajuan/baru`** — isi rencana ekspor: produk, HS Code, nilai,
   pembeli, negara tujuan, tanggal kirim.
3. Buka pengajuan, **unggah dokumen transaksi** (Commercial Invoice, Packing
   List, PEB, SKA). Tiap PDF langsung dibaca OCR dan dicek terhadap template +
   data pengajuan.
4. **Kirim** untuk ditinjau. Status: `draft` → `review` → `revisi`/`ditolak` →
   (unggah ulang & kirim ulang) → `selesai`. Selama `review` pengajuan bisa
   ditarik dulu untuk diperbaiki.
5. **`/dashboard/riwayat`** — konsultasi berbentuk tiket: tiap pertanyaan jadi
   satu tiket dengan riwayat percakapan UMKM ↔ petugas.

### Admin / petugas — `/admin`

Berpusat pada dokumen, bukan skor.

- **`/admin/pengajuan`** — antrean; dokumen dibuka per pengajuan lewat daftar
  yang bisa dikuncupkan. Petugas menyetujui atau meminta revisi tiap dokumen,
  menulis catatan, lalu mengambil keputusan pengajuan. Timer SLA menandai yang
  mendekati atau melewati batas waktu.
- **`/admin/data-usaha`** — persetujuan NIB / NPWP / profil, terpisah dari
  keputusan dokumen ekspor.
- **`/admin/pertanyaan`** — inbox tiket konsultasi; balas / tutup. Draf pesan
  WhatsApp bisa disiapkan per pengajuan.
- **`/admin/panduan`** — CMS panduan ekspor.
- **`/admin/riwayat`** — riwayat keputusan + audit trail.

### Super admin — `/super-admin`

Hanya soal admin, tidak ikut memproses pengajuan.

- **`/super-admin/akun`** — CRUD akun admin.
- **`/super-admin/akses`** — matriks RBAC; ubah izin peran `admin`.
- **`/super-admin/aktivitas`** — log aktivitas admin (baca saja).
- **`/super-admin`** — ringkasan kinerja tiap admin & SLA.

---

## Panduan ekspor & validasi OCR

**Panduan** adalah satu daftar langkah berurutan — 6 tahap ekspor dari nol
sampai barang berangkat, lalu 6 dokumen inti + cara mendapatkannya, plus
glosarium istilah kepabeanan. Isi yang sama tampil publik di `/panduan` dan di
dalam dashboard di `/dashboard/panduan`. Petugas menyuntingnya lewat CMS di
`/admin/panduan` (editor blok: paragraf, poin, langkah, gambar, catatan,
tautan); entri inti bawaan terkunci dari penghapusan.

**OCR** (`lib/ocr-engine.ts`, memakai `tesseract.js` + `pdfjs-dist`) mengekstrak
teks dari PDF yang diunggah, menormalkannya, lalu mencocokkan field penting
dengan yang seharusnya. Hasilnya berstatus `cocok` / `perlu_perbaikan` /
`gagal_baca` dengan daftar temuan per field, ditampilkan ke petugas saat review.
Uji cepat: `tsx scripts/test-ocr.ts` (PDF contoh dibuat dengan
`node scripts/generate-test-pdfs.mjs`).

---

## Deploy

Dua opsi dijalankan bersamaan. **Server sendiri** adalah yang utama; **Vercel**
adalah cadangan kalau internet rumah putus saat demo, dan URL-nya bisa langsung
dipakai tanpa menyiapkan apa pun.

### Opsi A — Server sendiri (Docker + Cloudflare Tunnel)

```bash
# build (--network=host wajib di mesin ini: resolver DNS bridge default tidak jalan)
docker build --network=host -t siapekspor:latest .
docker run -d --name siapekspor --restart unless-stopped -p 1555:1555 siapekspor:latest
# cek: http://localhost:1555
```

Image memakai Next.js standalone output; container listen di port **1555**.
Deploy ulang = rebuild image lalu `docker rm -f siapekspor` dan `docker run` lagi.

Publikasikan lewat named tunnel supaya memakai domain sendiri:

```bash
cloudflared tunnel login                       # pilih zona reniuswatun.my.id
cloudflared tunnel create siapekspor           # simpan <TUNNEL_ID>.json
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
cloudflared tunnel run siapekspor              # atau: cloudflared service install
```

Cara cepat tanpa DNS (URL acak `*.trycloudflare.com`):
`cloudflared tunnel --url http://localhost:1555`.

### Opsi B — Vercel (cadangan)

Tanpa konfigurasi: tidak ada environment variable, tidak ada backend. Next.js 14
terdeteksi otomatis dan OCR berjalan di browser pengunjung.

```bash
npm i -g vercel
vercel            # deploy preview
vercel --prod     # deploy produksi, dapat URL *.vercel.app
```

Atau hubungkan repo di dashboard Vercel supaya tiap push ke `dev` otomatis
ter-deploy. Simpan URL `*.vercel.app` sebagai cadangan demo.

---

## Checklist demo — Jam 72

Yang harus tampil di layar saat presentasi:

- **Data asli mereka, termasuk yang berantakan.** Masuk dengan akun demo dan
  buka pengajuan yang **ditolak** — tunjukkan temuan OCR yang menandai field
  tidak konsisten, bukan hanya contoh yang mulus.
- **Jam sebelum, jam sesudah.** Tanpa alat ini UMKM bolak-balik revisi
  berhari-hari karena baru tahu dokumennya salah setelah ditolak; di sini OCR
  menandai field yang keliru sebelum dikirim. Di sisi petugas, tunjukkan timer
  SLA di `/admin/pengajuan`.
- **Nama pemiliknya.** Reni Uswatun — dijalankan dari server sendiri di
  `reniuswatun.my.id`, dengan cadangan Vercel.
- **Bagian yang masih rusak.** Sampaikan terus terang: belum ada backend jadi
  data hanya di `localStorage` satu browser dan tidak sinkron antar perangkat;
  OCR bisa `gagal_baca` untuk scan buram; `pdfjs-dist` v6 tidak jalan di Node
  pada sebagian mesin (SIGILL) sehingga uji OCR dilakukan lewat `tsx`.

---

## Stack

| Kategori | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS, primitif bergaya shadcn/ui di `components/ui` |
| State | Zustand + `persist` (localStorage) — store terpisah untuk sesi UMKM, admin, dan konten panduan |
| Form | react-hook-form + zod |
| Animasi | framer-motion |
| Ikon / Font | lucide-react · Plus Jakarta Sans |
| OCR | tesseract.js + pdfjs-dist (di sisi browser) |

Kontrak data domain ada di `lib/types.ts` — titik sambung saat backend
ditambahkan. Pengajuan UMKM yang terkirim disalin ke daftar case admin oleh
`components/shared/PengajuanBridge.tsx`, jembatan antar-store karena belum ada
server.

---

## Catatan

Angka statistik di landing page dilabeli sebagai ilustrasi dan testimoni ditandai
eksplisit sebagai bukan kutipan pengguna nyata. Disclaimer wajib tampil di footer
dan setiap halaman panduan: platform ini alat bantu edukasi dan pendampingan
penyusunan dokumen ekspor; panduan dan catatan sistem bersifat awal dan harus
ditinjau petugas berwenang. UI mobile-first (sidebar jadi bottom navigation di
layar kecil), target sentuh minimal 44 px, kontras memenuhi WCAG AA pada teks
utama.
