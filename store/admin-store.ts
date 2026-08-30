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
  ActivityEntry,
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
  activityLog: ActivityEntry[];

  setHydrated: () => void;

  /** Catat aktivitas admin lintas modul (dipantau super admin). */
  logActivity: (kategori: string, action: string, detail?: string) => void;
  /** Upsert case dari pengajuan UMKM (jembatan store, dipanggil komponen). */
  upsertCaseFromPengajuan: (caseData: ApplicationCase) => void;

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
  receiveCaseFromUMKM: (newCase: ApplicationCase) => void;
}

function now() {
  return new Date().toISOString();
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function appendAudit(
  logs: AuditLogEntry[],
  admin: string,
  entry: Omit<AuditLogEntry, "id" | "timestamp" | "admin">,
): AuditLogEntry[] {
  return [{ id: nextId("audit"), timestamp: now(), admin, ...entry }, ...logs];
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
      activityLog: [],
      ...loadAdminSnapshot(),

      setHydrated: () => set({ hydrated: true }),

      logActivity: (kategori, action, detail) =>
        set((state) => ({
          activityLog: [
            {
              id: nextId("act"),
              timestamp: now(),
              admin: state.session?.nama ?? "Admin",
              kategori,
              action,
              detail,
            },
            ...state.activityLog,
          ].slice(0, 200),
        })),

      upsertCaseFromPengajuan: (caseData) =>
        set((state) => {
          const exists = state.cases.some((c) => c.id === caseData.id);
          return {
            cases: exists
              ? state.cases.map((c) => (c.id === caseData.id ? caseData : c))
              : [caseData, ...state.cases],
          };
        }),

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
          const admin = state.session?.nama ?? "Admin";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              lastUpdatedAt: now(),
              documents: current.documents.map((doc) =>
                doc.id === docId
                  ? { ...doc, status, catatanPetugas: catatan ?? doc.catatanPetugas }
                  : doc,
              ),
              auditTrail: appendAudit(current.auditTrail, admin, {
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
          const admin = state.session?.nama ?? "Admin";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              dataUsaha: status,
              dataUsahaCatatan: catatan || undefined,
              lastUpdatedAt: now(),
              auditTrail: appendAudit(current.auditTrail, admin, {
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
                      ? "Data usaha disetujui admin"
                      : status === "ditolak"
                        ? "Data usaha ditolak admin"
                        : "Data usaha ditinjau ulang",
                  detail: catatan || "Tidak ada catatan tambahan.",
                  tanggal: now(),
                  aktor: admin,
                },
                ...current.timeline,
              ],
            })),
          };
        }),

      setCaseDecision: (caseId, decision, reason) =>
        set((state) => {
          const admin = state.session?.nama ?? "Admin";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              status: decision,
              lastUpdatedAt: now(),
              auditTrail: appendAudit(current.auditTrail, admin, {
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
                      ? "Pengajuan disetujui admin"
                      : decision === "ditolak"
                        ? "Pengajuan ditolak admin"
                        : decision === "membutuhkan_info"
                          ? "Admin meminta info tambahan"
                          : "Status pengajuan diperbarui",
                  detail: reason || "Tidak ada catatan tambahan.",
                  tanggal: now(),
                  aktor: admin,
                },
                ...current.timeline,
              ],
            })),
          };
        }),

      submitReview: (caseId) =>
        set((state) => {
          const admin = state.session?.nama ?? "Admin";
          return {
            cases: updateCase(state.cases, caseId, (current) =>
              current.status === "baru"
                ? {
                    ...current,
                    status: "direview",
                    lastUpdatedAt: now(),
                    auditTrail: appendAudit(current.auditTrail, admin, {
                      action: "Review dimulai",
                    }),
                  }
                : current,
            ),
          };
        }),

      addCaseNote: (caseId, note) =>
        set((state) => {
          const admin = state.session?.nama ?? "Admin";
          return {
            cases: updateCase(state.cases, caseId, (current) => ({
              ...current,
              internalNotes: [note, ...(current.internalNotes ?? [])],
              lastUpdatedAt: now(),
              auditTrail: appendAudit(current.auditTrail, admin, {
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

      receiveCaseFromUMKM: (newCase: ApplicationCase) => {
        set((state) => {
          const exists = state.cases.some((c) => c.id === newCase.id);
          if (exists) {
            return {
              cases: state.cases.map((c) => (c.id === newCase.id ? { ...newCase, timeline: c.timeline, auditTrail: c.auditTrail } : c)),
            };
          }
          return {
            cases: [newCase, ...state.cases],
          };
        });
      },
    }),
    {
      name: "siapekspor-admin-state",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      // Naikkan versi ketika seed data / daftar permission bawaan berubah.
      // v4: buang cases + accounts + rolePermissions lama supaya seed baru
      // (dokumen ber-PDF, akun peran "admin") termuat ulang.
      migrate: (persisted) => {
        if (persisted && typeof persisted === "object") {
          const {
            rolePermissions: _dropPerms,
            cases: _dropCases,
            accounts: _dropAccounts,
            ...rest
          } = persisted as Record<string, unknown>;
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
