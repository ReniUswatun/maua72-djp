/* ------------------------------------------------------------------ *
 * RBAC — kontrol akses berbasis peran (fitur D6)
 *
 * Sumber kebenaran hak akses ada di sini. `AdminGate` dan `AdminShell`
 * memakai helper `can()` untuk menyembunyikan menu sekaligus memblokir
 * halaman, jadi pembatasan tidak hanya kosmetik di UI.
 * ------------------------------------------------------------------ */

export type AdminRole = "officer" | "super_admin";

export type Permission =
  | "dashboard.view"
  | "case.view"
  | "case.review"
  | "case.decide"
  | "history.view"
  | "report.export"
  | "account.manage"
  | "activity.view"
  | "ai.metrics.view"
  | "rbac.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "case.view",
  "case.review",
  "case.decide",
  "history.view",
  "report.export",
  "account.manage",
  "activity.view",
  "ai.metrics.view",
  "rbac.manage",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard.view": "Lihat dashboard monitoring",
  "case.view": "Lihat daftar & detail pengajuan",
  "case.review": "Sunting draf AI & catatan review",
  "case.decide": "Ambil keputusan (approve / tolak / minta info)",
  "history.view": "Lihat riwayat & audit trail",
  "report.export": "Ekspor laporan (CSV)",
  "account.manage": "Kelola akun admin/officer",
  "activity.view": "Lihat log aktivitas admin",
  "ai.metrics.view": "Lihat metrik akurasi AI",
  "rbac.manage": "Kelola hak akses peran",
};

export const PERMISSION_GROUPS: { judul: string; permissions: Permission[] }[] = [
  {
    judul: "Officer / review pengajuan",
    permissions: [
      "dashboard.view",
      "case.view",
      "case.review",
      "case.decide",
      "history.view",
      "report.export",
    ],
  },
  {
    judul: "Super admin / tata kelola",
    permissions: ["account.manage", "activity.view", "ai.metrics.view", "rbac.manage"],
  },
];

/** Hak akses bawaan tiap peran. Super admin selalu penuh & tidak bisa dikurangi. */
export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  officer: [
    "dashboard.view",
    "case.view",
    "case.review",
    "case.decide",
    "history.view",
    "report.export",
  ],
  super_admin: [...ALL_PERMISSIONS],
};

/** Peran yang tidak boleh diedit lewat matrix (agar super admin tak mengunci diri). */
export const LOCKED_ROLES: AdminRole[] = ["super_admin"];

export type RolePermissionMap = Record<AdminRole, Permission[]>;

export function defaultRolePermissions(): RolePermissionMap {
  return {
    officer: [...DEFAULT_ROLE_PERMISSIONS.officer],
    super_admin: [...DEFAULT_ROLE_PERMISSIONS.super_admin],
  };
}

/** Normalkan map yang tersimpan di localStorage agar tetap valid setelah update kode. */
export function normalizeRolePermissions(
  stored: Partial<RolePermissionMap> | undefined,
): RolePermissionMap {
  const base = defaultRolePermissions();
  if (!stored) return base;

  const clean = (list: unknown): Permission[] =>
    Array.isArray(list)
      ? (list.filter((item): item is Permission =>
          ALL_PERMISSIONS.includes(item as Permission),
        ))
      : [];

  return {
    officer: stored.officer ? clean(stored.officer) : base.officer,
    // Super admin selalu penuh, apa pun isi storage.
    super_admin: [...ALL_PERMISSIONS],
  };
}

export function roleCan(
  map: RolePermissionMap,
  role: AdminRole | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return (map[role] ?? []).includes(permission);
}

export function roleLabel(role: AdminRole): string {
  return role === "super_admin" ? "Super Admin" : "Officer";
}
