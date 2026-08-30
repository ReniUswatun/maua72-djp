import { buildSamplePdf } from "./sample-doc";
import { PETUGAS } from "./mock-data";
import type {
  AdminAccount,
  ApplicationCase,
  AuditLogEntry,
  ConsultationTicket,
  DocumentItem,
  DocumentOcrResult,
  OcrFieldCheck,
  ReviewStage,
  TimelineEvent,
} from "./types";
import { countOverdue } from "./sla";

/* ------------------------------------------------------------------ *
 * Data admin — daftar akun admin/super admin + pengajuan ekspor
 * UMKM yang masuk ke meja admin. Semua ini pengganti backend.
 * ------------------------------------------------------------------ */

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: "off-001",
    nama: PETUGAS[0].nama,
    email: "ahmad.fauzi@beacukai.go.id",
    role: "admin",
    aktif: true,
    lastLoginAt: "2026-08-29T08:10:00.000Z",
  },
  {
    id: "off-002",
    nama: PETUGAS[1].nama,
    email: "retno.wulandari@beacukai.go.id",
    role: "admin",
    aktif: true,
    lastLoginAt: "2026-08-28T14:40:00.000Z",
  },
  {
    id: "sup-001",
    nama: "Dewi Lestari",
    email: "dewi.lestari@beacukai.go.id",
    role: "super_admin",
    aktif: true,
    lastLoginAt: "2026-08-29T07:55:00.000Z",
  },
];

/** Kredensial login prototipe. Password sudah menentukan peran. */
export const ADMIN_CREDENTIALS: {
  email: string;
  password: string;
  role: AdminAccount["role"];
}[] = [
  { email: "ahmad.fauzi@beacukai.go.id", password: "admin123", role: "admin" },
  { email: "retno.wulandari@beacukai.go.id", password: "admin123", role: "admin" },
  { email: "dewi.lestari@beacukai.go.id", password: "superadmin123", role: "super_admin" },
];

function audit(action: string, admin: string, note?: string): AuditLogEntry {
  return {
    id: `audit-${action.slice(0, 6)}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: "2026-08-28T02:00:00.000Z",
    admin,
    action,
    note,
  };
}

function ocr(
  template: string,
  status: DocumentOcrResult["status"],
  ringkas: string,
  temuan: OcrFieldCheck[],
): DocumentOcrResult {
  return {
    template,
    status,
    ringkas,
    diperiksaPada: "2026-08-27T09:00:00.000Z",
    temuan,
  };
}

function pdf(judul: string, baris: string[]): string {
  try {
    return buildSamplePdf(judul, baris);
  } catch {
    return "";
  }
}

/* ---------- Dokumen per pengajuan ---------- */

function dokumenKopiMerapi(): DocumentItem[] {
  return [
    {
      id: "doc-nib",
      nama: "Nomor Induk Berusaha (NIB)",
      keterangan: "Diterbitkan lewat OSS.",
      wajib: true,
      status: "diverifikasi",
      namaFile: "NIB-KopiMerapi.pdf",
      tanggal: "2026-08-25",
      fileUrl: pdf("NOMOR INDUK BERUSAHA", [
        "Nama Usaha : Kopi Merapi Nusantara",
        "NIB        : 0812250034567",
        "KBLI       : 10761 - Pengolahan Kopi",
        "Status     : Aktif",
      ]),
      ocr: ocr("Contoh NIB OSS", "cocok", "Semua kolom sesuai dengan data usaha.", [
        { field: "Nama usaha", terbaca: "Kopi Merapi Nusantara", diharapkan: "Kopi Merapi Nusantara", sesuai: true },
        { field: "Nomor NIB", terbaca: "0812250034567", diharapkan: "0812250034567", sesuai: true },
        { field: "Status", terbaca: "Aktif", diharapkan: "Aktif", sesuai: true },
      ]),
    },
    {
      id: "doc-invoice",
      nama: "Commercial Invoice",
      keterangan: "Faktur komersial ke pembeli luar negeri.",
      wajib: true,
      status: "diunggah",
      namaFile: "Invoice-INV-2026-041.pdf",
      tanggal: "2026-08-26",
      fileUrl: pdf("COMMERCIAL INVOICE", [
        "Invoice No : INV-2026-041",
        "Exporter   : Kopi Merapi Nusantara",
        "Consignee  : Bremen Kaffee GmbH",
        "Product    : Roasted Arabica Coffee 250g",
        "Quantity   : 1.200 pcs",
        "Total      : USD 14.800",
        "Incoterm   : FOB Semarang",
      ]),
      ocr: ocr(
        "Template Commercial Invoice ekspor",
        "perlu_perbaikan",
        "Nilai total pada invoice (USD 14.800) berbeda dengan nilai pengajuan (USD 15.000).",
        [
          { field: "Nama eksportir", terbaca: "Kopi Merapi Nusantara", diharapkan: "Kopi Merapi Nusantara", sesuai: true },
          { field: "Consignee", terbaca: "Bremen Kaffee GmbH", diharapkan: "Bremen Kaffee GmbH", sesuai: true },
          {
            field: "Nilai total",
            terbaca: "USD 14.800",
            diharapkan: "USD 15.000",
            sesuai: false,
            catatan: "Samakan nilai invoice dengan nilai pada formulir pengajuan atau perbarui nilai pengajuan.",
          },
          {
            field: "Incoterm",
            terbaca: "FOB Semarang",
            diharapkan: "FOB (pelabuhan muat)",
            sesuai: true,
          },
        ],
      ),
    },
    {
      id: "doc-packing",
      nama: "Packing List",
      keterangan: "Rincian isi setiap kemasan.",
      wajib: true,
      status: "diunggah",
      namaFile: "PackingList-041.pdf",
      tanggal: "2026-08-26",
      fileUrl: pdf("PACKING LIST", [
        "Ref Invoice : INV-2026-041",
        "Total Carton: (tidak terbaca)",
        "Net Weight  : 300 kg",
        "Gross Weight: 330 kg",
      ]),
      ocr: ocr("Template Packing List ekspor", "perlu_perbaikan", "Jumlah karton tidak terbaca pada dokumen.", [
        { field: "Nomor invoice terkait", terbaca: "INV-2026-041", diharapkan: "INV-2026-041", sesuai: true },
        {
          field: "Jumlah karton",
          terbaca: "-",
          diharapkan: "Angka jumlah karton",
          sesuai: false,
          catatan: "Kolom jumlah karton kosong / tidak terbaca. Mohon unggah ulang dengan kolom terisi.",
        },
        { field: "Berat bersih", terbaca: "300 kg", diharapkan: "≈ 300 kg", sesuai: true },
      ]),
    },
    {
      id: "doc-peb",
      nama: "Pemberitahuan Ekspor Barang (PEB)",
      keterangan: "Diajukan lewat CEISA sebelum barang dimuat.",
      wajib: true,
      status: "belum",
    },
  ];
}

function dokumenSederhana(prefix: string, uploaded: number): DocumentItem[] {
  const base: Omit<DocumentItem, "status">[] = [
    { id: "doc-nib", nama: "Nomor Induk Berusaha (NIB)", keterangan: "Diterbitkan lewat OSS.", wajib: true },
    { id: "doc-invoice", nama: "Commercial Invoice", keterangan: "Faktur komersial.", wajib: true },
    { id: "doc-packing", nama: "Packing List", keterangan: "Rincian kemasan.", wajib: true },
    { id: "doc-peb", nama: "Pemberitahuan Ekspor Barang (PEB)", keterangan: "Dokumen pabean.", wajib: true },
  ];

  return base.map((doc, index) => {
    if (index >= uploaded) return { ...doc, status: "belum" as const };
    return {
      ...doc,
      status: "diunggah" as const,
      namaFile: `${prefix}-${doc.id}.pdf`,
      tanggal: "2026-08-27",
      fileUrl: pdf(doc.nama.toUpperCase(), [`Berkas contoh untuk ${doc.nama}`, `Pengajuan: ${prefix}`]),
      ocr:
        doc.id === "doc-invoice"
          ? ocr("Template Commercial Invoice ekspor", "cocok", "Data invoice sesuai template.", [
              { field: "Nama eksportir", terbaca: "sesuai", diharapkan: "sesuai", sesuai: true },
              { field: "Nilai total", terbaca: "sesuai", diharapkan: "sesuai", sesuai: true },
            ])
          : undefined,
    };
  });
}

/* ---------- Daftar pengajuan ---------- */

interface CaseSeed {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  kategori: string;
  nomorNib?: string;
  nomorNpwp?: string;
  status: ReviewStage;
  dataUsaha: ApplicationCase["dataUsaha"];
  dataUsahaCatatan?: string;
  namaProduk: string;
  negaraTujuan: string;
  hsCode: string;
  nilaiEkspor: string;
  submittedAt: string;
  documents: DocumentItem[];
  timeline: TimelineEvent[];
  internalNotes?: string[];
}

function buildCase(seed: CaseSeed): ApplicationCase {
  return {
    id: seed.id,
    businessName: seed.businessName,
    ownerName: seed.ownerName,
    email: seed.email,
    phone: seed.phone,
    city: seed.city,
    province: "Jawa Tengah",
    kategori: seed.kategori,
    status: seed.status,
    submittedAt: seed.submittedAt,
    lastUpdatedAt: seed.timeline.at(-1)?.tanggal ?? seed.submittedAt,
    profile: {
      namaUsaha: seed.businessName,
      kota: seed.city,
      provinsi: "Jawa Tengah",
      tahunBerdiri: "2019",
      kategoriId: seed.kategori,
      nomorNib: seed.nomorNib,
      nomorNpwp: seed.nomorNpwp,
    },
    dataUsaha: seed.dataUsaha,
    dataUsahaCatatan: seed.dataUsahaCatatan,
    namaProduk: seed.namaProduk,
    negaraTujuan: seed.negaraTujuan,
    hsCode: seed.hsCode,
    nilaiEkspor: seed.nilaiEkspor,
    documents: seed.documents,
    timeline: [...seed.timeline].sort((a, b) => +new Date(a.tanggal) - +new Date(b.tanggal)),
    auditTrail: [audit("Pengajuan masuk ke meja admin", PETUGAS[0].nama, `Data dari ${seed.ownerName} diterima.`)],
    internalNotes: seed.internalNotes,
  };
}

export const ADMIN_CASES: ApplicationCase[] = [
  buildCase({
    id: "PE-202608-KOPI",
    businessName: "Kopi Merapi Nusantara",
    ownerName: "Sari Utami",
    email: "sari@kopimerapi.id",
    phone: "0812-3456-7890",
    city: "Boyolali",
    kategori: "kopi",
    nomorNib: "0812250034567",
    nomorNpwp: "987654321098765",
    status: "direview",
    dataUsaha: "disetujui",
    namaProduk: "Roasted Arabica Coffee 250g",
    negaraTujuan: "Jerman",
    hsCode: "0901.21.10",
    nilaiEkspor: "15000",
    submittedAt: "2026-08-26T04:00:00.000Z",
    documents: dokumenKopiMerapi(),
    timeline: [
      {
        id: "tl-kopi-1",
        kind: "asesmen",
        judul: "Pengajuan ekspor dikirim",
        detail: "Pengajuan untuk Roasted Arabica Coffee tujuan Jerman.",
        tanggal: "2026-08-26T04:00:00.000Z",
        aktor: "Sari Utami",
      },
      {
        id: "tl-kopi-2",
        kind: "dokumen",
        judul: "OCR menemukan 2 ketidaksesuaian dokumen",
        detail: "Commercial Invoice dan Packing List perlu diperbaiki.",
        tanggal: "2026-08-27T09:05:00.000Z",
        aktor: "Sistem OCR",
      },
    ],
    internalNotes: ["Buyer menunggu revisi invoice sebelum PO final."],
  }),
  buildCase({
    id: "PE-202608-ROTAN",
    businessName: "Rotan Solo Lestari",
    ownerName: "Budi Hartono",
    email: "budi@rotansolo.id",
    phone: "0812-7788-2200",
    city: "Sukoharjo",
    kategori: "furniture",
    nomorNib: "812250013455",
    nomorNpwp: "12.345.678.9-012.000",
    status: "baru",
    dataUsaha: "menunggu",
    namaProduk: "Kursi Rotan Sintetis",
    negaraTujuan: "Belanda",
    hsCode: "9401.80.00",
    nilaiEkspor: "22000",
    submittedAt: "2026-08-27T02:30:00.000Z",
    documents: dokumenSederhana("Rotan", 2),
    timeline: [
      {
        id: "tl-rotan-1",
        kind: "asesmen",
        judul: "Pengajuan ekspor dikirim",
        detail: "Menunggu verifikasi data usaha dan dokumen.",
        tanggal: "2026-08-27T02:30:00.000Z",
        aktor: "Budi Hartono",
      },
    ],
    internalNotes: ["Perlu konfirmasi SVLK dari pemasok utama."],
  }),
  buildCase({
    id: "PE-202608-PANGAN",
    businessName: "Pangan Mandiri Sejahtera",
    ownerName: "Nina Wulandari",
    email: "nina@panganmandiri.id",
    phone: "0813-4000-9000",
    city: "Klaten",
    kategori: "fnb",
    nomorNib: "812250091144",
    nomorNpwp: "11.222.333.4-555.000",
    status: "disetujui",
    dataUsaha: "disetujui",
    namaProduk: "Keripik Buah Aneka Rasa",
    negaraTujuan: "Singapura",
    hsCode: "2008.99.90",
    nilaiEkspor: "9500",
    submittedAt: "2026-08-25T09:20:00.000Z",
    documents: dokumenSederhana("Pangan", 4),
    timeline: [
      {
        id: "tl-pangan-1",
        kind: "asesmen",
        judul: "Pengajuan ekspor dikirim",
        detail: "Seluruh dokumen wajib terunggah.",
        tanggal: "2026-08-25T09:20:00.000Z",
        aktor: "Nina Wulandari",
      },
      {
        id: "tl-pangan-2",
        kind: "officer",
        judul: "Pengajuan disetujui admin",
        detail: "Dokumen lengkap dan OCR cocok dengan template.",
        tanggal: "2026-08-28T05:10:00.000Z",
        aktor: "Ahmad Fauzi",
      },
    ],
    internalNotes: ["Dokumen inti sudah lengkap, prioritas approval."],
  }),
  buildCase({
    id: "PE-202608-KOSMETIK",
    businessName: "Mulia Beauty Lab",
    ownerName: "Sinta Rahma",
    email: "sinta@muliabeauty.id",
    phone: "0812-9900-4400",
    city: "Surakarta",
    kategori: "kosmetik",
    nomorNib: "812250022900",
    status: "membutuhkan_info",
    dataUsaha: "ditolak",
    dataUsahaCatatan: "NPWP badan usaha belum dilampirkan. Mohon lengkapi sebelum pengajuan dilanjutkan.",
    namaProduk: "Serum Wajah Herbal",
    negaraTujuan: "Malaysia",
    hsCode: "3304.99.90",
    nilaiEkspor: "6000",
    submittedAt: "2026-08-28T03:05:00.000Z",
    documents: dokumenSederhana("Kosmetik", 1),
    timeline: [
      {
        id: "tl-kosmetik-1",
        kind: "asesmen",
        judul: "Pengajuan ekspor dikirim",
        detail: "Data NPWP belum lengkap.",
        tanggal: "2026-08-28T03:05:00.000Z",
        aktor: "Sinta Rahma",
      },
      {
        id: "tl-kosmetik-2",
        kind: "officer",
        judul: "Admin meminta info tambahan",
        detail: "Perlu NPWP badan usaha dan komposisi produk untuk cek Lartas.",
        tanggal: "2026-08-29T01:10:00.000Z",
        aktor: "Retno Wulandari",
      },
    ],
    internalNotes: ["Menunggu NPWP badan dan file komposisi produk."],
  }),
  buildCase({
    id: "PE-202608-HERBAL",
    businessName: "Bumi Herbal Nusantara",
    ownerName: "Agus Prasetyo",
    email: "agus@bumiherbal.id",
    phone: "0813-7070-2201",
    city: "Karanganyar",
    kategori: "herbal",
    nomorNib: "812250090900",
    nomorNpwp: "33.444.555.6-777.000",
    status: "baru",
    dataUsaha: "menunggu",
    namaProduk: "Jamu Instan Temulawak",
    negaraTujuan: "Belanda",
    hsCode: "2106.90.99",
    nilaiEkspor: "8000",
    submittedAt: "2026-08-29T01:05:00.000Z",
    documents: dokumenSederhana("Herbal", 3),
    timeline: [
      {
        id: "tl-herbal-1",
        kind: "asesmen",
        judul: "Pengajuan ekspor dikirim",
        detail: "Menunggu giliran review admin.",
        tanggal: "2026-08-29T01:05:00.000Z",
        aktor: "Agus Prasetyo",
      },
    ],
    internalNotes: ["Menunggu giliran review admin."],
  }),
];

/* ---------- Ringkasan ---------- */

export function summarizeCases(cases: ApplicationCase[]) {
  return {
    total: cases.length,
    baru: cases.filter((item) => item.status === "baru").length,
    direview: cases.filter((item) => item.status === "direview").length,
    disetujui: cases.filter((item) => item.status === "disetujui").length,
    membutuhkanInfo: cases.filter((item) => item.status === "membutuhkan_info").length,
    ditolak: cases.filter((item) => item.status === "ditolak").length,
  };
}

export const STATUS_LABEL: Record<ReviewStage, string> = {
  baru: "Baru",
  direview: "Sedang direview",
  disetujui: "Disetujui",
  membutuhkan_info: "Butuh info tambahan",
  ditolak: "Ditolak",
};

export const DATA_USAHA_LABEL: Record<ApplicationCase["dataUsaha"], string> = {
  menunggu: "Menunggu verifikasi",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

/* ---------- Pantauan performa admin (untuk super admin) ---------- */

export interface AdminPerformanceRow {
  id: string;
  nama: string;
  email: string;
  aktif: boolean;
  lastLoginAt?: string;
  /** Jumlah pengajuan yang pernah disentuh admin ini (muncul di audit trail). */
  ditangani: number;
  disetujui: number;
  ditolak: number;
  mintaInfo: number;
  /** Pertanyaan UMKM yang dibalas admin ini. */
  tiketDijawab: number;
}

/**
 * Rekap kerja tiap admin dari audit trail pengajuan + balasan tiket.
 * Dipakai super admin untuk memantau (baca saja) kinerja admin.
 */
export function summarizeAdminPerformance(
  cases: ApplicationCase[],
  accounts: AdminAccount[],
  tickets: ConsultationTicket[] = [],
): AdminPerformanceRow[] {
  return accounts
    .filter((account) => account.role === "admin")
    .map((account) => {
      const nama = account.nama;
      let ditangani = 0;
      let disetujui = 0;
      let ditolak = 0;
      let mintaInfo = 0;

      for (const item of cases) {
        const mine = item.auditTrail.filter((entry) => entry.admin === nama);
        if (mine.length === 0) continue;
        ditangani += 1;
        for (const entry of mine) {
          if (!entry.action.startsWith("Keputusan:")) continue;
          if (entry.after === "disetujui") disetujui += 1;
          else if (entry.after === "ditolak") ditolak += 1;
          else if (entry.after === "membutuhkan_info") mintaInfo += 1;
        }
      }

      const tiketDijawab = tickets.filter((ticket) =>
        ticket.pesan.some(
          (pesan) => pesan.dari === "petugas" && pesan.aktor.startsWith(nama),
        ),
      ).length;

      return {
        id: account.id,
        nama,
        email: account.email,
        aktif: account.aktif,
        lastLoginAt: account.lastLoginAt,
        ditangani,
        disetujui,
        ditolak,
        mintaInfo,
        tiketDijawab,
      };
    });
}

/** Ringkasan global untuk header dashboard super admin. */
export function summarizeGovernance(cases: ApplicationCase[], accounts: AdminAccount[]) {
  const admins = accounts.filter((account) => account.role === "admin");
  return {
    totalAdmin: admins.length,
    adminAktif: admins.filter((account) => account.aktif).length,
    caseAktif: cases.length,
    terlambat: countOverdue(cases),
  };
}
