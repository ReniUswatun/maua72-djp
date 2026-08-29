"use client";

import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { summarizeCases } from "@/lib/admin-data";
import {
  loadAdminSnapshot,
  validateAdminCredential,
} from "@/lib/admin-api";
import {
  defaultRolePermissions,
  normalizeRolePermissions,
  roleCan,
  type Permission,
  type RolePermissionMap,
} from "@/lib/rbac";
import { useAppStore } from "@/store/assessment-store";
import type {
  AdminAccount,
  ApplicationCase,
  AuditLogEntry,
  DocumentPrecheckFinding,
  Recommendation,
  ReviewDimension,
  ReviewStage,
  TimelineEvent,
} from "@/lib/types";

type AdminRole = "officer" | "super_admin";

export interface AdminSession {
  id: string;
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
  setRolePermission: (
    role: "officer" | "super_admin",
    permission: Permission,
    enabled: boolean,
  ) => void;
  resetRolePermissions: () => void;
  saveWaDraft: (caseId: string, text: string) => void;
  login: (
    email: string,
    password: string,
    role: AdminRole,
  ) => { ok: boolean; message?: string };
  logout: () => void;
  createAccount: (input: {
    nama: string;
    email: string;
    role: AdminRole;
    jabatan: string;
  }) => void;
  toggleAccount: (id: string, aktif: boolean) => void;
  resetAccess: (id: string) => void;
  updateDimension: (
    caseId: string,
    dimensionId: string,
    patch: Partial<
      Pick<
        ReviewDimension,
        "officerScore" | "officerDraft" | "status" | "officerNote" | "decisionReason"
      >
    >,
  ) => void;
  addCaseNote: (caseId: string, note: string) => void;
  setCaseDecision: (
    caseId: string,
    decision: ReviewStage,
    reason: string,
    channel?: "approve" | "reject" | "request_info",
  ) => void;
  submitReview: (caseId: string) => void;
  addAudit: (
    caseId: string,
    entry: Omit<AuditLogEntry, "id" | "timestamp">,
  ) => void;
  setPrecheckFindings: (caseId: string, findings: DocumentPrecheckFinding[]) => void;
}

function now() {
  return new Date().toISOString();
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function appendAudit(
  logs: AuditLogEntry[],
  entry: Omit<AuditLogEntry, "id" | "timestamp">,
): AuditLogEntry[] {
  return [
    {
      id: nextId("audit"),
      timestamp: now(),
      ...entry,
    },
    ...logs,
  ];
}

function applyCaseUpdate(
  cases: ApplicationCase[],
  caseId: string,
  updater: (current: ApplicationCase) => ApplicationCase,
) {
  return cases.map((current) => (current.id === caseId ? updater(current) : current));
}

function matchesCurrentUserCase(caseItem: ApplicationCase) {
  const appState = useAppStore.getState();
  return Boolean(
    appState.user &&
      (appState.user.email === caseItem.email ||
        appState.profile?.namaUsaha === caseItem.businessName),
  );
}

function syncUserWorkspace(
  caseItem: ApplicationCase,
  decision: ReviewStage | null,
  officerName: string,
  reason?: string,
) {
  if (!matchesCurrentUserCase(caseItem)) return;

  useAppStore.setState((state) => {
    const nextTimeline: TimelineEvent = {
      id: nextId("tl-admin"),
      kind: "officer",
      judul:
        decision === "disetujui"
          ? "Pengajuan disetujui officer"
          : decision === "membutuhkan_info"
            ? "Officer meminta info tambahan"
            : decision === "ditolak"
              ? "Pengajuan ditolak officer"
              : "Review officer diperbarui",
      detail: reason ?? caseItem.aiSummary,
      tanggal: now(),
      aktor: officerName,
    };

    const rekomendasi = state.rekomendasi.map((rec) => {
      const dimension = caseItem.dimensions.find((item) => item.pillarId === rec.pillarId);
      if (!dimension) return rec;

      const isEdited =
        dimension.aiScore !== dimension.officerScore ||
        dimension.aiDraft !== dimension.officerDraft ||
        Boolean(dimension.officerNote) ||
        Boolean(dimension.decisionReason);

      const nextReview: Recommendation["review"] = {
        ...rec.review,
        namaPetugas: officerName,
        tanggal: now(),
        catatan: dimension.decisionReason ?? dimension.officerNote ?? reason ?? rec.review.catatan,
      };

      if (decision === "disetujui") {
        nextReview.status = isEdited ? "edited" : "approved";
      } else if (decision === "membutuhkan_info" || decision === "ditolak") {
        nextReview.status = "needs_more_info";
      } else if (dimension.status === "disetujui") {
        nextReview.status = isEdited ? "edited" : "approved";
      } else if (dimension.status === "membutuhkan_info" || dimension.status === "ditolak") {
        nextReview.status = "needs_more_info";
      } else if (isEdited) {
        nextReview.status = "edited";
      } else {
        nextReview.status = "pending_review";
      }

      if (isEdited) {
        nextReview.versiAsliAI = dimension.aiDraft;
        nextReview.versiPetugas = dimension.officerDraft;
      }

      return {
        ...rec,
        review: nextReview,
      };
    });

    return {
      ...state,
      dikirimKePetugas: true,
      rekomendasi,
      timeline: [nextTimeline, ...state.timeline],
    };
  });
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      hydrated: false,
      session: null,
      rolePermissions: defaultRolePermissions(),
      ...loadAdminSnapshot(),

      setHydrated: () => set({ hydrated: true }),

      setRolePermission: (role, permission, enabled) =>
        set((state) => {
          if (role === "super_admin") return state; // super admin terkunci penuh
          const current = new Set(state.rolePermissions[role] ?? []);
          if (enabled) current.add(permission);
          else current.delete(permission);
          return {
            rolePermissions: {
              ...state.rolePermissions,
              [role]: [...current],
            },
          };
        }),

      resetRolePermissions: () => set({ rolePermissions: defaultRolePermissions() }),

      saveWaDraft: (caseId, text) =>
        set((state) => ({
          cases: applyCaseUpdate(state.cases, caseId, (current) => ({
            ...current,
            waDraft: text,
          })),
        })),

      login: (email, password, role) => {
        const matched = validateAdminCredential({ email, password, role });

        if (!matched) {
          return { ok: false, message: "Email, password, atau role tidak cocok." };
        }

        set((state) => ({
          session: {
            id: matched.id,
            nama: matched.nama,
            email: matched.email,
            role: matched.role,
          },
          accounts: state.accounts.map((account) =>
            account.id === matched.id ? { ...account, lastLoginAt: now() } : account,
          ),
        }));

        return { ok: true };
      },

      logout: () => set({ session: null }),

      createAccount: ({ nama, email, role, jabatan }) =>
        set((state) => ({
          accounts: [
            {
              id: nextId("acct"),
              nama,
              email,
              role,
              jabatan,
              aktif: true,
              lastLoginAt: undefined,
              passwordResetAt: now(),
            },
            ...state.accounts,
          ],
        })),

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

      updateDimension: (caseId, dimensionId, patch) =>
        set((state) => {
          const nextCases = applyCaseUpdate(state.cases, caseId, (current) => {
            const officer = state.session?.nama ?? "Officer";
            const dimensions = current.dimensions.map((dimension) => {
              if (dimension.id !== dimensionId) return dimension;
              return { ...dimension, ...patch, editedAt: now() };
            });

            const currentDimension = current.dimensions.find((item) => item.id === dimensionId);
            const nextDimension = dimensions.find((item) => item.id === dimensionId);

            const audit =
              currentDimension && nextDimension
                ? appendAudit(current.auditTrail, {
                    officer,
                    action: `Dimensi ${currentDimension.label} diperbarui`,
                    field: currentDimension.label,
                    before: JSON.stringify({
                      officerScore: currentDimension.officerScore,
                      officerDraft: currentDimension.officerDraft,
                      status: currentDimension.status,
                      officerNote: currentDimension.officerNote,
                      decisionReason: currentDimension.decisionReason,
                    }),
                    after: JSON.stringify({
                      officerScore: nextDimension.officerScore,
                      officerDraft: nextDimension.officerDraft,
                      status: nextDimension.status,
                      officerNote: nextDimension.officerNote,
                      decisionReason: nextDimension.decisionReason,
                    }),
                  })
                : current.auditTrail;

            return {
              ...current,
              dimensions,
              auditTrail: audit,
              lastUpdatedAt: now(),
            };
          });

          return { cases: nextCases };
        }),

      addCaseNote: (caseId, note) =>
        set((state) => ({
          cases: applyCaseUpdate(state.cases, caseId, (current) => ({
            ...current,
            internalNotes: [note, ...(current.internalNotes ?? [])],
            auditTrail: appendAudit(current.auditTrail, {
              officer: state.session?.nama ?? "Officer",
              action: "Catatan officer ditambahkan",
              note,
            }),
            lastUpdatedAt: now(),
          })),
        })),

      setCaseDecision: (caseId, decision, reason, channel = "approve") =>
        set((state) => {
          const officerName = state.session?.nama ?? "Officer";
          const nextCases = applyCaseUpdate(state.cases, caseId, (current) => ({
            ...current,
            status: decision,
            lastUpdatedAt: now(),
            auditTrail: appendAudit(current.auditTrail, {
              officer: officerName,
              action:
                channel === "approve"
                  ? "Pengajuan disetujui"
                  : channel === "reject"
                    ? "Pengajuan ditolak"
                    : "Diminta info tambahan",
              field: "status",
              before: current.status,
              after: decision,
              note: reason,
            }),
            timeline: [
              {
                id: nextId("tl"),
                kind: "officer",
                judul:
                  channel === "approve"
                    ? "Pengajuan disetujui officer"
                    : channel === "reject"
                      ? "Pengajuan ditolak officer"
                      : "Officer meminta info tambahan",
                detail: reason,
                tanggal: now(),
                aktor: state.session?.nama ?? "Officer",
              },
              ...current.timeline,
            ],
          }));

          const syncedCase = nextCases.find((item) => item.id === caseId) ?? null;
          if (syncedCase) {
            syncUserWorkspace(syncedCase, decision, officerName, reason);
          }

          return { cases: nextCases };
        }),

      submitReview: (caseId) =>
        set((state) => {
          const officerName = state.session?.nama ?? "Officer";
          const nextCases = applyCaseUpdate(state.cases, caseId, (current) => ({
            ...current,
            status: "direview",
            lastUpdatedAt: now(),
            auditTrail: appendAudit(current.auditTrail, {
              officer: officerName,
              action: "Review officer dimulai",
              note: "Kartu pengajuan dibuka pada workspace review.",
            }),
          }));

          return { cases: nextCases };
        }),

      addAudit: (caseId, entry) =>
        set((state) => ({
          cases: applyCaseUpdate(state.cases, caseId, (current) => ({
            ...current,
            auditTrail: appendAudit(current.auditTrail, entry),
          })),
        })),

      setPrecheckFindings: (caseId, findings) =>
        set((state) => ({
          cases: applyCaseUpdate(state.cases, caseId, (current) => ({
            ...current,
            precheckFindings: findings,
            lastUpdatedAt: now(),
          })),
        })),
    }),
    {
      name: "siapekspor-admin-state",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ hydrated, ...rest }) => rest,
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
  return useAdminStore((state) =>
    roleCan(state.rolePermissions, state.session?.role, permission),
  );
}

export function useAdminSummary() {
  const cases = useAdminStore((state) => state.cases);

  return React.useMemo(() => summarizeCases(cases), [cases]);
}
