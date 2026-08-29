import { ADMIN_ACCOUNTS, ADMIN_CASES, ADMIN_CREDENTIALS } from "./admin-data";
import type { AdminAccount, ApplicationCase } from "./types";

export type AdminRole = AdminAccount["role"];

export interface AdminSnapshot {
  accounts: AdminAccount[];
  cases: ApplicationCase[];
}

export function loadAdminSnapshot(): AdminSnapshot {
  return {
    accounts: ADMIN_ACCOUNTS.map((account) => ({ ...account })),
    cases: ADMIN_CASES.map((item) => ({ ...item })),
  };
}

/**
 * Cek kredensial login. Email + password sudah menentukan peran,
 * jadi tidak ada pemilih peran di form login.
 */
export function resolveAdminLogin(
  email: string,
  password: string,
): AdminAccount | null {
  const credential = ADMIN_CREDENTIALS.find(
    (item) =>
      item.email.toLowerCase() === email.trim().toLowerCase() &&
      item.password === password,
  );
  if (!credential) return null;

  return (
    ADMIN_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === credential.email.toLowerCase() && account.aktif,
    ) ?? null
  );
}
