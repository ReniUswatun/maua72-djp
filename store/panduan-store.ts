"use client";

import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SEED_PANDUAN, slugify } from "@/lib/panduan";
import type { PanduanBlok, PanduanEntry, PanduanStatus } from "@/lib/types";

export interface PanduanEntryInput {
  judul: string;
  ringkas: string;
  gambarSampul?: string;
  blok: PanduanBlok[];
  status: PanduanStatus;
}

interface PanduanState {
  hydrated: boolean;
  entries: PanduanEntry[];

  setHydrated: () => void;
  tambahEntry: (input: PanduanEntryInput, oleh?: string) => string;
  ubahEntry: (id: string, patch: Partial<PanduanEntryInput>, oleh?: string) => void;
  hapusEntry: (id: string) => { ok: boolean; message?: string };
  pindah: (id: string, arah: "naik" | "turun") => void;
  setStatus: (id: string, status: PanduanStatus) => void;
  resetPanduan: () => void;
}

function cloneBlok(blok: PanduanBlok[]): PanduanBlok[] {
  return blok.map((b) => {
    switch (b.tipe) {
      case "poin":
        return { tipe: "poin", items: [...b.items] };
      case "langkah":
        return { tipe: "langkah", items: b.items.map((i) => ({ ...i })) };
      case "tautan":
        return { tipe: "tautan", items: b.items.map((i) => ({ ...i })) };
      default:
        return { ...b };
    }
  });
}

function clone(entries: PanduanEntry[]): PanduanEntry[] {
  return entries.map((entry) => ({ ...entry, blok: cloneBlok(entry.blok) }));
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

function uniqueSlug(base: string, entries: PanduanEntry[], selfId?: string): string {
  const root = slugify(base) || "langkah";
  let slug = root;
  let n = 2;
  while (entries.some((e) => e.slug === slug && e.id !== selfId)) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export const usePanduanStore = create<PanduanState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      entries: renumber(clone(SEED_PANDUAN)),

      setHydrated: () => set({ hydrated: true }),

      tambahEntry: (input, oleh) => {
        const id = newId();
        set((state) => {
          const maxUrutan = state.entries.reduce((max, e) => Math.max(max, e.urutan), 0);
          return {
            entries: [
              ...state.entries,
              {
                id,
                slug: uniqueSlug(input.judul, state.entries),
                judul: input.judul.trim(),
                ringkas: input.ringkas.trim(),
                gambarSampul: input.gambarSampul,
                blok: cloneBlok(input.blok),
                urutan: maxUrutan + 10,
                status: input.status,
                terkunci: false,
                diperbaruiPada: new Date().toISOString(),
                diperbaruiOleh: oleh,
              },
            ],
          };
        });
        return id;
      },

      ubahEntry: (id, patch, oleh) =>
        set((state) => ({
          entries: state.entries.map((entry) => {
            if (entry.id !== id) return entry;
            const judul = (patch.judul ?? entry.judul).trim();
            return {
              ...entry,
              ...patch,
              judul,
              ringkas: (patch.ringkas ?? entry.ringkas).trim(),
              blok: patch.blok ? cloneBlok(patch.blok) : entry.blok,
              slug:
                patch.judul && patch.judul.trim() !== entry.judul
                  ? uniqueSlug(judul, state.entries, id)
                  : entry.slug,
              diperbaruiPada: new Date().toISOString(),
              diperbaruiOleh: oleh ?? entry.diperbaruiOleh,
            };
          }),
        })),

      hapusEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return { ok: false, message: "Langkah tidak ditemukan." };
        if (entry.terkunci) {
          return { ok: false, message: "Langkah inti tidak bisa dihapus. Sembunyikan saja (jadikan draf)." };
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      // v2: model konten berubah ke blok — buang entri lama, seed ulang.
      migrate: () => ({ entries: renumber(clone(SEED_PANDUAN)) }) as never,
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
