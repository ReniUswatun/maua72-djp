"use client";

import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SEED_PANDUAN } from "@/lib/panduan";
import type { PanduanEntry, PanduanStatus, PanduanTipe } from "@/lib/types";

export interface PanduanEntryInput {
  tipe: PanduanTipe;
  judul: string;
  ringkas: string;
  deskripsi: string;
  poin: string[];
  langkah: { judul: string; detail: string }[];
  tautan: { teks: string; url: string }[];
  dibuatSendiri: boolean;
  status: PanduanStatus;
}

interface PanduanState {
  hydrated: boolean;
  entries: PanduanEntry[];

  setHydrated: () => void;
  tambahEntry: (input: PanduanEntryInput) => string;
  ubahEntry: (id: string, patch: Partial<PanduanEntryInput>) => void;
  hapusEntry: (id: string) => { ok: boolean; message?: string };
  pindah: (id: string, arah: "naik" | "turun") => void;
  setStatus: (id: string, status: PanduanStatus) => void;
  resetPanduan: () => void;
}

function clone(entries: PanduanEntry[]): PanduanEntry[] {
  return entries.map((entry) => ({
    ...entry,
    poin: [...entry.poin],
    langkah: entry.langkah.map((l) => ({ ...l })),
    tautan: entry.tautan.map((t) => ({ ...t })),
  }));
}

/** Urutkan lalu rapikan nomor urut jadi kelipatan 10. */
function renumber(entries: PanduanEntry[]): PanduanEntry[] {
  return [...entries]
    .sort((a, b) => a.urutan - b.urutan)
    .map((entry, index) => ({ ...entry, urutan: (index + 1) * 10 }));
}

function newId() {
  return `pd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const usePanduanStore = create<PanduanState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      entries: renumber(clone(SEED_PANDUAN)),

      setHydrated: () => set({ hydrated: true }),

      tambahEntry: (input) => {
        const id = newId();
        set((state) => {
          const maxUrutan = state.entries.reduce((max, e) => Math.max(max, e.urutan), 0);
          return {
            entries: [
              ...state.entries,
              {
                id,
                ...input,
                judul: input.judul.trim(),
                ringkas: input.ringkas.trim(),
                urutan: maxUrutan + 10,
                terkunci: false,
              },
            ],
          };
        });
        return id;
      },

      ubahEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...patch,
                  judul: (patch.judul ?? entry.judul).trim(),
                  ringkas: (patch.ringkas ?? entry.ringkas).trim(),
                }
              : entry,
          ),
        })),

      hapusEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return { ok: false, message: "Entri tidak ditemukan." };
        if (entry.terkunci) {
          return { ok: false, message: "Entri inti tidak bisa dihapus. Sembunyikan saja (jadikan draf)." };
        }
        set((state) => ({ entries: renumber(state.entries.filter((e) => e.id !== id)) }));
        return { ok: true };
      },

      pindah: (id, arah) =>
        set((state) => {
          const sorted = [...state.entries].sort((a, b) => a.urutan - b.urutan);
          const index = sorted.findIndex((e) => e.id === id);
          if (index === -1) return state;
          const swapWith = arah === "naik" ? index - 1 : index + 1;
          if (swapWith < 0 || swapWith >= sorted.length) return state;
          const a = sorted[index];
          const b = sorted[swapWith];
          return {
            entries: state.entries.map((entry) => {
              if (entry.id === a.id) return { ...entry, urutan: b.urutan };
              if (entry.id === b.id) return { ...entry, urutan: a.urutan };
              return entry;
            }),
          };
        }),

      setStatus: (id, status) =>
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
        })),

      resetPanduan: () => set({ entries: renumber(clone(SEED_PANDUAN)) }),
    }),
    {
      name: "siapekspor-panduan",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Entri yang tampil untuk UMKM: hanya "terbit", terurut. */
export function usePublishedPanduan() {
  const entries = usePanduanStore((s) => s.entries);
  return React.useMemo(
    () =>
      entries
        .filter((entry) => entry.status === "terbit")
        .sort((a, b) => a.urutan - b.urutan),
    [entries],
  );
}

export function usePanduanSorted() {
  const entries = usePanduanStore((s) => s.entries);
  return React.useMemo(() => [...entries].sort((a, b) => a.urutan - b.urutan), [entries]);
}
