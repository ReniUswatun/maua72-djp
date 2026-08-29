"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEMO_PROFILE, DEMO_USER, MOCK_TIMELINE } from "@/lib/mock-data";
import type {
  BusinessProfile,
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
  modeDemo: boolean;
  hydrated: boolean;

  /* ---- aksi ---- */
  daftar: (u: User) => void;
  masuk: (email: string) => void;
  keluar: () => void;
  simpanProfil: (p: BusinessProfile) => void;
  
  // Pengajuan actions
  buatPengajuan: (data: Omit<PengajuanEkspor, "id" | "status" | "dokumen" | "tanggal">) => string;
  unggahDokumenPengajuan: (pengajuanId: string, docId: string, namaFile: string) => void;
  kirimPengajuan: (pengajuanId: string) => void;

  muatDemo: () => void;
  setHydrated: () => void;
}

const stateAwal = {
  user: null,
  profile: null,
  pengajuan: [] as PengajuanEkspor[],
  timeline: [] as TimelineEvent[],
  modeDemo: false,
};

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

      unggahDokumenPengajuan: (pengajuanId, docId, namaFile) =>
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
          const pengajuanList = s.pengajuan.map((p) =>
            p.id === pengajuanId ? { ...p, status: "review" as const } : p
          );

          return {
            pengajuan: pengajuanList,
            timeline: catat(s.timeline, {
              kind: "officer",
              judul: `Pengajuan dikirim (${pengajuanId})`,
              detail: `Pengajuan berhasil dikirim dan sedang menunggu review petugas.`,
              aktor: "Sistem",
            }),
          };
        }),

      muatDemo: () => {
        const dummyPengajuan: PengajuanEkspor = {
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
          })),
        };

        set({
          user: DEMO_USER,
          profile: { ...DEMO_PROFILE, nomorNib: "1234567890123", nomorNpwp: "987654321" },
          pengajuan: [dummyPengajuan],
          timeline: [...MOCK_TIMELINE].sort(
            (a, b) => +new Date(b.tanggal) - +new Date(a.tanggal),
          ),
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
