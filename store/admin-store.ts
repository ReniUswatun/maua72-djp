"use client";

import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STATUS_LABEL, summarizeCases } from "@/lib/admin-data";
import { loadAdminSnapshot, resolveAdminLogin } from "@/lib/admin-api";
import {
  defaultRolePermissions,
  normalizeRolePermissions,
  roleCan,
  type Permission,
  type RolePermissionMap,
} from "@/lib/rbac";
import type {
  AdminAccount,
  AdminRole,
  ApplicationCase,
  AuditLogEntry,
  BusinessApprovalStatus,
  DocStatus,
  ReviewStage,
} from "@/lib/types";

export interface AdminSession {
  id: string;
  nama: string;
  email: string;
  role: AdminRole;
}

interface AccountInput {
  nama: string;
  email: string;
  role: AdminRole;
}

interface AdminState {
  hydrated: boolean;
  session: AdminSession | null;
  accounts: AdminAccount[];
  cases: ApplicationCase[];
  rolePermissions: RolePermissionMap;

  setHydrated: () => void;

  login: (email: string, password: string) => { ok: boolean; role?: AdminRole; message?: string };
  logout: () => void;

  createAccount: (input: AccountInput) => { ok: boolean; message?: string };
  updateAccount: (id: string, input: AccountInput) => { ok: boolean; message?: string };
  deleteAccount: (id: string) => void;
  toggleAccount: (id: string, aktif: boolean) => void;
  resetAccess: (id: string) => void;

  setRolePermission: (role: AdminRole, permission: Permission, enabled: boolean) => void;
  resetRolePermissions: () => void;

  setDocStatus: (caseId: string, docId: string, status: DocStatus, catatan?: string) => void;
  setDataUsaha: (caseId: string, status: BusinessApprovalStatus, catatan: string) => void;
  setCaseDecision: (caseId: string, decision: ReviewStage, reason: string) => void;
  submitReview: (caseId: string) => void;
  addCaseNote: (caseId: string, note: string) => void;
  saveWaDraft: (caseId: string, text: string) => void;
}

function now() {
  return new Date().toISOString();
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function appendAudit(
  logs: AuditLogEntry[],
  officer: string,
  entry: Omit<AuditLogEntry, "id" | "timestamp" | "officer">,
): AuditLogEntry[] {
  return [{ id: nextId("audit"), timestamp: now(), officer, ...entry }, ...logs];
}

function updateCase(
  cases: ApplicationCase[],
  caseId: string,
  updater: (current: ApplicationCase) => ApplicationCase,
) {
  return cases.map((current) => (current.id === caseId ? updater(current) : current));
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      session: null,
      rolePermissions: defaultRolePermissions(),
      ...loadAdminSnapshot(),

      setHydrated: () => set({ hydrated: true }),

      login: (email, password) => {
        const matched = resolveAdminLogin(email, password);
        if (!matched) {
          return { ok: false, message: "Email atau kata sandi tidak cocok." };
        }
        set((state) => ({
          session: { id: matched.id, nama: matched.nama, email: matched.email, role: matched.role },
          accounts: state.accounts.map((account) =>
            account.id === matched.id ? { ...account, lastLoginAt: now() } : account,
          ),
        }));
        return { ok: true, role: matched.role };
      },

      logout: () => set({ session: null }),

      createAccount: ({ nama, email, role }) => {
        const exists = get().accounts.some(
          (account) => account.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (exists) return { ok: false, message: "Email akun sudah digunakan." };
        set((state) => ({
          accounts: [
            {
              id: nextId("acct"),
              nama: nama.trim(),
              email: email.trim(),
              role,
              aktif: true,
              passwordResetAt: now(),
            },
            ...state.accounts,
          ],
        }));
        return { ok: true };
      },

      updateAccount: (id, { nama, email, role }) => {
        const clash = get().accounts.some(
          (account) =>
            account.id !== id && account.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (clash) return { ok: false, message: "Email akun sudah dipakai akun lain." };
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id
              ? { ...account, nama: nama.trim(), email: email.trim(), role }
              : account,
          ),
        }));
        return { ok: true };
      },

      deleteAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((account) => account.id !== id) })),

      toggleAccount: (id, aktif) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, aktif } : account,
          ),
        })),

      resetAccess: (id) =>
        set((state) => ({
          accounts: state.accounts.map((account) =>
            account.id === id ? { ...account, passwordResetAt: now() } : account,
          ),
        })),

      setRolePermission: (role, permission, enabled) =>
        set((state) => {
          if (role === "super_admin") return state;
          const current = new Set(state.rolePermissions[role] ?? []);
          if (enabled) current.add(permission);
          else current.delete(permission);
          return {
            rolePermissions: { ...state.rolePermissions, [role]: [...current] },
          };
        }),

      resetRolePermissions: () => set({ rolePermissions: defaultRolePermissions() }),

      setDocStatus: (caseId, docId, status, catatan) =>
        set((state) => {
          const officer = state.session?.nama ?? "Officer";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              lastUpdatedAt: now(),
              documents: current.documents.map((doc) =>
                doc.id === docId
                  ? { ...doc, status, catatanPetugas: catatan ?? doc.catatanPetugas }
                  : doc,
              ),
              auditTrail: appendAudit(current.auditTrail, officer, {
                action: `Status dokumen diperbarui`,
                field: docId,
                after: status,
                note: catatan,
              }),
            })),
          };
        }),

      setDataUsaha: (caseId, status, catatan) =>
        set((state) => {
          const officer = state.session?.nama ?? "Officer";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              dataUsaha: status,
              dataUsahaCatatan: catatan || undefined,
              lastUpdatedAt: now(),
              auditTrail: appendAudit(current.auditTrail, officer, {
                action:
                  status === "disetujui"
                    ? "Data usaha disetujui"
                    : status === "ditolak"
                      ? "Data usaha ditolak"
                      : "Data usaha ditandai menunggu",
                field: "dataUsaha",
                after: status,
                note: catatan,
              }),
              timeline: [
                {
                  id: nextId("tl"),
                  kind: "officer" as const,
                  judul:
                    status === "disetujui"
                      ? "Data usaha disetujui officer"
                      : status === "ditolak"
                        ? "Data usaha ditolak officer"
                        : "Data usaha ditinjau ulang",
                  detail: catatan || "Tidak ada catatan tambahan.",
                  tanggal: now(),
                  aktor: officer,
                },
                ...current.timeline,
              ],
            })),
          };
        }),

      setCaseDecision: (caseId, decision, reason) =>
        set((state) => {
          const officer = state.session?.nama ?? "Officer";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              status: decision,
              lastUpdatedAt: now(),
              auditTrail: appendAudit(current.auditTrail, officer, {
                action: `Keputusan: ${STATUS_LABEL[decision]}`,
                field: "status",
                before: current.status,
                after: decision,
                note: reason,
              }),
              timeline: [
                {
                  id: nextId("tl"),
                  kind: "officer" as const,
                  judul:
                    decision === "disetujui"
                      ? "Pengajuan disetujui officer"
                      : decision === "ditolak"
                        ? "Pengajuan ditolak officer"
                        : decision === "membutuhkan_info"
                          ? "Officer meminta info tambahan"
                          : "Status pengajuan diperbarui",
                  detail: reason || "Tidak ada catatan tambahan.",
                  tanggal: now(),
                  aktor: officer,
                },
                ...current.timeline,
              ],
            })),
          };
        }),

      submitReview: (caseId) =>
        set((state) => {
          const officer = state.session?.nama ?? "Officer";
          return {
            cases: updateCase(state.cases, caseId, (current) =>
              current.status === "baru"
                ? {
                    ...current,
                    status: "direview",
                    lastUpdatedAt: now(),
                    auditTrail: appendAudit(current.auditTrail, officer, {
                      action: "Review dimulai",
                    }),
                  }
                : current,
            ),
          };
        }),

      addCaseNote: (caseId, note) =>
        set((state) => {
          const officer = state.session?.nama ?? "Officer";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              internalNotes: [note, ...(current.internalNotes ?? [])],
              lastUpdatedAt: now(),
              auditTrail: appendAudit(current.auditTrail, officer, {
                action: "Catatan internal ditambahkan",
                note,
              }),
            })),
          };
        }),

      saveWaDraft: (caseId, text) =>
        set((state) => ({
          cases: updateCase(state.cases, caseId, (current) => ({ ...current, waDraft: text })),
        })),
    }),
    {
      name: "siapekspor-admin-state",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      // Naikkan versi ketika daftar permission bawaan berubah; buang
      // rolePermissions lama supaya peran mendapat default terbaru.
      migrate: (persisted) => {
        if (persisted && typeof persisted === "object") {
          const { rolePermissions: _drop, ...rest } = persisted as Record<string, unknown>;
          return rest as never;
        }
        return persisted as never;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.rolePermissions = normalizeRolePermissions(state.rolePermissions);
        state.setHydrated();
      },
    },
  ),
);

/** Hook: apakah sesi admin aktif punya permission tertentu. */
export function useCan(permission: Permission): boolean {
  return useAdminStore((state) => roleCan(state.rolePermissions, state.session?.role, permission));
}

export function useAdminSummary() {
  const cases = useAdminStore((state) => state.cases);
  return React.useMemo(() => summarizeCases(cases), [cases]);
}
