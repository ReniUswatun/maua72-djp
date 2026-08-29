"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { buatRekomendasi } from "@/lib/recommendations";
import { hitungHasil } from "@/lib/scoring";
import {
  DEMO_ANSWERS,
  DEMO_PROFILE,
  DEMO_RIWAYAT_ASESMEN,
  DEMO_USER,
  MOCK_DOCUMENTS,
  MOCK_OFFICER_REVIEWS,
  MOCK_TIMELINE,
} from "@/lib/mock-data";
import type {
  Answer,
  AnswerMap,
  AssessmentResult,
  BusinessProfile,
  DocumentItem,
  Recommendation,
  TimelineEvent,
  User,
} from "@/lib/types";

interface AppState {
  /* ---- data ---- */
  user: User | null;
  profile: BusinessProfile | null;
  answers: AnswerMap;
  hasil: AssessmentResult | null;
  riwayat: AssessmentResult[];
  rekomendasi: Recommendation[];
  dokumen: DocumentItem[];
  timeline: TimelineEvent[];
  dikirimKePetugas: boolean;
  modeDemo: boolean;
  hydrated: boolean;

  /* ---- aksi ---- */
  daftar: (u: User) => void;
  masuk: (email: string) => void;
  keluar: () => void;
  simpanProfil: (p: BusinessProfile) => void;
  setJawaban: (questionId: string, jawaban: Answer) => void;
  resetAsesmen: () => void;
  selesaikanAsesmen: () => AssessmentResult;
  kirimKePetugas: () => void;
  tandaiSelesai: (id: string, selesai: boolean) => void;
  mintaBantuan: (id: string) => void;
  unggahDokumen: (id: string, namaFile: string) => void;
  muatDemo: () => void;
  setHydrated: () => void;
}

const stateAwal = {
  user: null,
  profile: null,
  answers: {} as AnswerMap,
  hasil: null,
  riwayat: [] as AssessmentResult[],
  rekomendasi: [] as Recommendation[],
  dokumen: [] as DocumentItem[],
  timeline: [] as TimelineEvent[],
  dikirimKePetugas: false,
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
          // Checklist dokumen disiapkan sejak profil dibuat, statusnya kosong.
          dokumen:
            s.dokumen && s.dokumen.length > 0
              ? s.dokumen
              : MOCK_DOCUMENTS.map((d) => ({
                  ...d,
                  status: "belum" as const,
                  namaFile: undefined,
                  tanggal: undefined,
                  catatanPetugas: undefined,
                })),
        })),

      setJawaban: (questionId, jawaban) =>
        set((s) => ({ answers: { ...s.answers, [questionId]: jawaban } })),

      resetAsesmen: () => set({ answers: {}, hasil: null, dikirimKePetugas: false }),

      selesaikanAsesmen: () => {
        const { answers, profile, hasil: sebelumnya, riwayat } = get();
        const hasil = hitungHasil(answers, profile);
        const rekomendasi = buatRekomendasi(answers, hasil, profile);

        set((s) => ({
          hasil,
          rekomendasi,
          dikirimKePetugas: false,
          riwayat: sebelumnya ? [...riwayat, sebelumnya] : riwayat,
          dokumen: s.dokumen && s.dokumen.length > 0 ? s.dokumen : MOCK_DOCUMENTS.map((d) => ({ ...d, status: "belum", namaFile: undefined, tanggal: undefined, catatanPetugas: undefined })),
          timeline: catat(s.timeline, {
            kind: "asesmen",
            judul: "Pengajuan ekspor diselesaikan",
            detail: `Skor ${hasil.skorTotal} dari 100 — Level ${hasil.level}.`,
            aktor: "Anda",
          }),
        }));

        return hasil;
      },

      kirimKePetugas: () =>
        set((s) => {
          // Simulasi hasil review petugas (blueprint §11 — nanti diganti API).
          const rekomendasi = s.rekomendasi.map((r) => {
            const mock = MOCK_OFFICER_REVIEWS[r.id];
            return mock ? { ...r, review: { ...mock } } : r;
          });

          const jumlahDireview = rekomendasi.filter(
            (r) => r.review.status !== "pending_review",
          ).length;

          return {
            dikirimKePetugas: true,
            rekomendasi,
            timeline: catat(s.timeline, {
              kind: "officer",
              judul: "Rekomendasi divalidasi petugas",
              detail: `${jumlahDireview} rekomendasi telah ditinjau oleh petugas Bea Cukai Surakarta.`,
              aktor: "Klinik Ekspor Surakarta",
            }),
          };
        }),

      tandaiSelesai: (id, selesai) =>
        set((s) => {
          const rec = s.rekomendasi.find((r) => r.id === id);
          return {
            rekomendasi: s.rekomendasi.map((r) =>
              r.id === id ? { ...r, selesai } : r,
            ),
            timeline: rec
              ? catat(s.timeline, {
                  kind: "rekomendasi",
                  judul: selesai
                    ? `Rekomendasi "${rec.judul}" ditandai selesai`
                    : `Rekomendasi "${rec.judul}" dibuka kembali`,
                  detail: selesai
                    ? "Petugas akan meninjau kembali pada pengajuan berikutnya."
                    : "Status dikembalikan menjadi belum selesai.",
                  aktor: "Anda",
                })
              : s.timeline,
          };
        }),

      mintaBantuan: (id) =>
        set((s) => {
          const rec = s.rekomendasi.find((r) => r.id === id);
          if (!rec) return s;
          return {
            timeline: catat(s.timeline, {
              kind: "pesan",
              judul: "Permintaan bantuan dikirim",
              detail: `Anda meminta pendampingan petugas untuk "${rec.judul}". Petugas akan menghubungi lewat WhatsApp dalam 1–2 hari kerja.`,
              aktor: "Anda",
            }),
          };
        }),

      unggahDokumen: (id, namaFile) =>
        set((s) => {
          const doc = s.dokumen.find((d) => d.id === id);
          return {
            dokumen: s.dokumen.map((d) =>
              d.id === id
                ? {
                    ...d,
                    status: "diunggah" as const,
                    namaFile,
                    tanggal: new Date().toISOString(),
                    catatanPetugas: undefined,
                  }
                : d,
            ),
            timeline: doc
              ? catat(s.timeline, {
                  kind: "dokumen",
                  judul: `Dokumen "${doc.nama}" diunggah`,
                  detail: "Menunggu verifikasi petugas Bea Cukai.",
                  aktor: "Anda",
                })
              : s.timeline,
          };
        }),

      muatDemo: () => {
        const hasil = hitungHasil(DEMO_ANSWERS, DEMO_PROFILE, "2026-08-26T04:00:00.000Z");
        const rekomendasi = buatRekomendasi(DEMO_ANSWERS, hasil, DEMO_PROFILE).map((r) => {
          const mock = MOCK_OFFICER_REVIEWS[r.id];
          return mock ? { ...r, review: { ...mock } } : r;
        });
        rekomendasi.forEach((r) => {
          if (r.id === "urus-nib") r.selesai = true;
        });

        set({
          user: DEMO_USER,
          profile: DEMO_PROFILE,
          answers: { ...DEMO_ANSWERS },
          hasil,
          riwayat: [...DEMO_RIWAYAT_ASESMEN],
          rekomendasi,
          dokumen: MOCK_DOCUMENTS.map((d) => ({ ...d })),
          timeline: [...MOCK_TIMELINE].sort(
            (a, b) => +new Date(b.tanggal) - +new Date(a.tanggal),
          ),
          dikirimKePetugas: true,
          modeDemo: true,
        });
      },
    }),
    {
      name: "siapekspor-state",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/* Selector bantu */
export const useSudahLogin = () => useAppStore((s) => s.user !== null);
