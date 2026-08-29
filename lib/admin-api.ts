import { ADMIN_ACCOUNTS, ADMIN_CASES } from "./admin-data";
import type {
  AdminAccount,
  ApplicationCase,
  AuditLogEntry,
  ReviewDimension,
  ReviewStage,
} from "./types";

export type AdminRole = "officer" | "super_admin";

export interface AdminCredential {
  email: string;
  password: string;
  role: AdminRole;
}

export interface AdminSnapshot {
  accounts: AdminAccount[];
  cases: ApplicationCase[];
}

export interface AdminDecisionInput {
  caseId: string;
  decision: ReviewStage;
  reason: string;
  officerName: string;
  channel?: "approve" | "reject" | "request_info";
  dimensions?: ReviewDimension[];
}

export function loadAdminSnapshot(): AdminSnapshot {
  return {
    accounts: ADMIN_ACCOUNTS,
    cases: ADMIN_CASES,
  };
}

export function validateAdminCredential(credential: AdminCredential): AdminAccount | null {
  const matched = ADMIN_ACCOUNTS.find(
    (account) =>
      account.email.toLowerCase() === credential.email.toLowerCase() &&
      account.role === credential.role &&
      account.aktif,
  );

  if (!matched) return null;

  const validPassword =
    credential.role === "officer"
      ? credential.password === "admin123"
      : credential.password === "super123";

  return validPassword ? matched : null;
}

export function buildAuditEntry(params: Omit<AuditLogEntry, "id" | "timestamp">): Omit<AuditLogEntry, "id" | "timestamp"> {
  return params;
}

export function isAdminCaseResolved(decision: ReviewStage) {
  return decision === "disetujui" || decision === "membutuhkan_info" || decision === "ditolak";
}
