"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEMO_PROFILE, DEMO_USER, MOCK_TIMELINE } from "@/lib/mock-data";
import { buildSamplePdf } from "@/lib/sample-doc";
import type {
  BusinessProfile,
  ConsultationTicket,
  DocumentItem,
  PengajuanEkspor,
  TimelineEvent,
  User,
} from "@/lib/types";

// Default transactional documents for a submission
const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-invoice",
    nama: "Commercial Invoice",
    keterangan: "Faktur komersial yang diterbitkan oleh Anda untuk pembeli di luar negeri.",
    wajib: true,
    status: "belum",
  },
  {
    id: "doc-packing",
    nama: "Packing List",
    keterangan: "Rincian spesifikasi barang dan kemasan.",
    wajib: true,
    status: "belum",
  },
  {
    id: "doc-peb",
    nama: "Pemberitahuan Ekspor Barang (PEB)",
    keterangan: "Dokumen pabean yang disetujui Bea Cukai (NPE).",
    wajib: true,
    status: "belum",
  },
  {
    id: "doc-ska",
    nama: "Sertifikat Keterangan Asal (SKA)",
    keterangan: "Certificate of Origin (Optional).",
    wajib: false,
    status: "belum",
  },
];

interface AppState {
  /* ---- data ---- */
  user: User | null;
  profile: BusinessProfile | null;
  pengajuan: PengajuanEkspor[];
  timeline: TimelineEvent[];
  tickets: ConsultationTicket[];
  modeDemo: boolean;
  hydrated: boolean;

  /* ---- aksi ---- */
  daftar: (u: User) => void;
  masuk: (email: string) => void;
  keluar: () => void;
  simpanProfil: (p: BusinessProfile) => void;
  simpanBerkasUsaha: (jenis: "nib" | "npwp", fileUrl: string | null) => void;

  // Pengajuan actions
  buatPengajuan: (data: Omit<PengajuanEkspor, "id" | "status" | "dokumen" | "tanggal">) => string;
  unggahDokumenPengajuan: (pengajuanId: string, docId: string, namaFile: string, fileUrl?: string) => void;
  kirimPengajuan: (pengajuanId: string) => void;
  tarikPengajuan: (pengajuanId: string) => void;

  // Konsultasi (ticketing)
  buatTiket: (judul: string, kategori: string, pesan: string) => string;
  balasTiket: (ticketId: string, pesan: string) => void;
  tutupTiket: (ticketId: string) => void;

  muatDemo: () => void;
  setHydrated: () => void;
}

const stateAwal = {
  user: null,
  profile: null,
  pengajuan: [] as PengajuanEkspor[],
  timeline: [] as TimelineEvent[],
  tickets: [] as ConsultationTicket[],
  modeDemo: false,
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function catat(
  timeline: TimelineEvent[],
  event: Omit<TimelineEvent, "id" | "tanggal"> & { tanggal?: string },
): TimelineEvent[] {
  return [
    {
      id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tanggal: event.tanggal ?? new Date().toISOString(),
      ...event,
    },
    ...timeline,
  ];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...stateAwal,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      daftar: (u) =>
        set((s) => ({
          user: u,
          timeline: catat(s.timeline, {
            kind: "pesan",
            judul: "Akun dibuat",
            detail: `Selamat datang, ${u.nama}. Lengkapi profil usaha untuk mulai pengajuan ekspor.`,
            aktor: "Sistem",
          }),
        })),

      masuk: (email) =>
        set((s) => ({
          user: s.user ?? { nama: email.split("@")[0], email, hp: "" },
        })),

      keluar: () => set({ ...stateAwal, hydrated: true }),

      simpanProfil: (p) =>
        set((s) => ({
          profile: p,
          timeline: catat(s.timeline, {
            kind: "pesan",
            judul: "Profil diperbarui",
            detail: "Profil perusahaan berhasil disimpan.",
            aktor: "Anda",
          }),
        })),

      simpanBerkasUsaha: (jenis, fileUrl) =>
        set((s) => {
          if (!s.profile) return s;
          const key = jenis === "nib" ? "fileNib" : "fileNpwp";
          return {
            profile: { ...s.profile, [key]: fileUrl },
            timeline: catat(s.timeline, {
              kind: "dokumen",
              judul: fileUrl
                ? `Dokumen ${jenis.toUpperCase()} diunggah`
                : `Dokumen ${jenis.toUpperCase()} dihapus`,
              detail: fileUrl
                ? `Berkas ${jenis.toUpperCase()} usaha berhasil disimpan di profil.`
                : `Berkas ${jenis.toUpperCase()} usaha dihapus dari profil.`,
              aktor: "Anda",
            }),
          };
        }),

      buatPengajuan: (data) => {
        const id = `PE-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const p: PengajuanEkspor = {
          ...data,
          id,
          tanggal: new Date().toISOString(),
          status: "draft",
          dokumen: JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS)), // Deep copy default docs
        };

        set((s) => ({
          pengajuan: [p, ...s.pengajuan],
          timeline: catat(s.timeline, {
            kind: "asesmen",
            judul: `Pengajuan baru dibuat (${id})`,
            detail: `Pengajuan untuk produk ${p.namaProduk} tujuan ${p.negaraTujuan}.`,
            aktor: "Anda",
          }),
        }));
        return id;
      },

      unggahDokumenPengajuan: (pengajuanId, docId, namaFile, fileUrl) =>
        set((s) => {
          const pengajuanList = s.pengajuan.map((p) => {
            if (p.id !== pengajuanId) return p;
            return {
              ...p,
              dokumen: p.dokumen.map((d) =>
                d.id === docId
                  ? {
                      ...d,
                      status: "diunggah" as const,
                      namaFile,
                      fileUrl: fileUrl ?? d.fileUrl,
                      tanggal: new Date().toISOString(),
                      catatanPetugas: undefined,
                    }
                  : d
              ),
            };
          });

          return {
            pengajuan: pengajuanList,
            timeline: catat(s.timeline, {
              kind: "dokumen",
              judul: `Dokumen diunggah (${pengajuanId})`,
              detail: `Satu dokumen baru telah diunggah untuk pengajuan ${pengajuanId}.`,
              aktor: "Anda",
            }),
          };
        }),

      kirimPengajuan: (pengajuanId) =>
        set((s) => {
          const target = s.pengajuan.find((p) => p.id === pengajuanId);
          const dikirimUlang = target ? target.status === "revisi" || target.status === "ditolak" : false;
          const pengajuanList = s.pengajuan.map((p) =>
            p.id === pengajuanId
              ? { ...p, status: "review" as const, catatanReview: undefined }
              : p,
          );

          return {
            pengajuan: pengajuanList,
            timeline: catat(s.timeline, {
              kind: "officer",
              judul: dikirimUlang
                ? `Pengajuan diperbaiki & dikirim ulang (${pengajuanId})`
                : `Pengajuan dikirim (${pengajuanId})`,
              detail: "Pengajuan berhasil dikirim dan sedang menunggu review petugas.",
              aktor: "Sistem",
            }),
          };
        }),

      tarikPengajuan: (pengajuanId) =>
        set((s) => ({
          pengajuan: s.pengajuan.map((p) =>
            p.id === pengajuanId && p.status === "review"
              ? { ...p, status: "revisi" as const }
              : p,
          ),
          timeline: catat(s.timeline, {
            kind: "asesmen",
            judul: `Pengajuan ditarik untuk diperbaiki (${pengajuanId})`,
            detail: "Anda menarik pengajuan dari antrean review untuk memperbaiki dokumen.",
            aktor: "Anda",
          }),
        })),

      buatTiket: (judul, kategori, pesan) => {
        const id = newId("TK");
        const now = new Date().toISOString();
        const nama = get().user?.nama ?? "Anda";
        set((s) => ({
          tickets: [
            {
              id,
              judul,
              kategori,
              status: "menunggu" as const,
              dibuat: now,
              diperbarui: now,
              pesan: [{ id: newId("m"), dari: "umkm" as const, aktor: nama, pesan, tanggal: now }],
            },
            ...s.tickets,
          ],
          timeline: catat(s.timeline, {
            kind: "pesan",
            judul: `Pertanyaan baru dikirim ke petugas`,
            detail: judul,
            aktor: "Anda",
          }),
        }));
        return id;
      },

      balasTiket: (ticketId, pesan) =>
        set((s) => {
          const now = new Date().toISOString();
          const nama = s.user?.nama ?? "Anda";
          return {
            tickets: s.tickets.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    status: "menunggu" as const,
                    diperbarui: now,
                    pesan: [
                      ...t.pesan,
                      { id: newId("m"), dari: "umkm" as const, aktor: nama, pesan, tanggal: now },
                    ],
                  }
                : t,
            ),
          };
        }),

      tutupTiket: (ticketId) =>
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === ticketId ? { ...t, status: "selesai" as const, diperbarui: new Date().toISOString() } : t,
          ),
        })),

      muatDemo: () => {
        const contohBerkas = (nama: string, id: string) =>
          buildSamplePdf(nama.toUpperCase(), [
            `Berkas contoh untuk ${nama}`,
            `Pengajuan: ${id}`,
          ]);

        const pengajuanReview: PengajuanEkspor = {
          id: "PE-202608-ABCD",
          tanggal: "2026-08-25T10:00:00.000Z",
          namaProduk: "Kerajinan Rotan Sintetis",
          negaraTujuan: "Jerman",
          hsCode: "4602.19.00",
          nilaiEkspor: "15000",
          pembeli: "GmbH Retailers",
          tanggalKirim: "2026-09-15",
          status: "review",
          dokumen: DEFAULT_DOCUMENTS.map((d) => ({
            ...d,
            status: "diunggah",
            namaFile: `${d.id}-terbaru.pdf`,
            tanggal: "2026-08-25T10:00:00.000Z",
            fileUrl: contohBerkas(d.nama, "PE-202608-ABCD"),
          })),
        };

        const pengajuanDitolak: PengajuanEkspor = {
          id: "PE-202607-KOPI",
          tanggal: "2026-07-18T09:00:00.000Z",
          namaProduk: "Kopi Arabika Roasted 250g",
          negaraTujuan: "Belanda",
          hsCode: "0901.21.10",
          nilaiEkspor: "8000",
          pembeli: "Amsterdam Coffee BV",
          tanggalKirim: "2026-08-10",
          status: "ditolak",
          catatanReview:
            "Nilai pada Commercial Invoice belum sama dengan nilai pengajuan, dan Packing List belum mencantumkan jumlah karton. Perbaiki kedua dokumen lalu kirim ulang.",
          dokumen: DEFAULT_DOCUMENTS.map((d) => {
            if (d.id === "doc-invoice") {
              return {
                ...d,
                status: "revisi" as const,
                namaFile: "Invoice-INV-2026-041.pdf",
                tanggal: "2026-07-18T09:00:00.000Z",
                fileUrl: contohBerkas(d.nama, "PE-202607-KOPI"),
                catatanPetugas: "Nilai total USD 7.800 tidak sama dengan nilai pengajuan USD 8.000.",
              };
            }
            if (d.id === "doc-packing") {
              return {
                ...d,
                status: "revisi" as const,
                namaFile: "PackingList-041.pdf",
                tanggal: "2026-07-18T09:00:00.000Z",
                fileUrl: contohBerkas(d.nama, "PE-202607-KOPI"),
                catatanPetugas: "Kolom jumlah karton kosong. Mohon unggah ulang dengan kolom terisi.",
              };
            }
            return {
              ...d,
              status: "diunggah" as const,
              namaFile: `${d.id}-kopi.pdf`,
              tanggal: "2026-07-18T09:00:00.000Z",
              fileUrl: contohBerkas(d.nama, "PE-202607-KOPI"),
            };
          }),
        };

        const demoTickets: ConsultationTicket[] = [
          {
            id: "TK-DEMO-1",
            judul: "Apakah produk kopi saya termasuk Lartas?",
            kategori: "HS Code & Lartas",
            status: "dijawab",
            dibuat: "2026-08-20T02:00:00.000Z",
            diperbarui: "2026-08-21T04:30:00.000Z",
            pesan: [
              {
                id: "m-1",
                dari: "umkm",
                aktor: DEMO_USER.nama,
                pesan: "Halo, saya mau ekspor kopi arabika roasted ke Belanda. Apakah perlu izin khusus atau termasuk barang Lartas?",
                tanggal: "2026-08-20T02:00:00.000Z",
              },
              {
                id: "m-2",
                dari: "petugas",
                aktor: "Retno Wulandari — Klinik Ekspor",
                pesan: "Kopi biji sangrai (HS 0901.21) tidak termasuk Lartas ekspor. Yang perlu disiapkan: PEB, Invoice, Packing List, dan bila pembeli minta tarif preferensi, SKA Form yang sesuai. Pastikan juga kemasan mencantumkan negara asal.",
                tanggal: "2026-08-21T04:30:00.000Z",
              },
            ],
          },
          {
            id: "TK-DEMO-2",
            judul: "Cara mengisi nilai FOB di PEB",
            kategori: "Dokumen (Invoice, Packing, PEB)",
            status: "menunggu",
            dibuat: "2026-08-28T07:15:00.000Z",
            diperbarui: "2026-08-28T07:15:00.000Z",
            pesan: [
              {
                id: "m-3",
                dari: "umkm",
                aktor: DEMO_USER.nama,
                pesan: "Di formulir PEB ada kolom nilai FOB. Apakah ini nilai barang saja atau sudah termasuk ongkos kirim ke pelabuhan?",
                tanggal: "2026-08-28T07:15:00.000Z",
              },
            ],
          },
        ];

        set({
          user: DEMO_USER,
          profile: { ...DEMO_PROFILE, nomorNib: "1234567890123", nomorNpwp: "987654321" },
          pengajuan: [pengajuanReview, pengajuanDitolak],
          timeline: [...MOCK_TIMELINE].sort(
            (a, b) => +new Date(b.tanggal) - +new Date(a.tanggal),
          ),
          tickets: demoTickets,
          modeDemo: true,
        });
      },
    }),
    {
      name: "siapekspor-state",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

/* Selector bantu */
export const useSudahLogin = () => useAppStore((s) => s.user !== null);
