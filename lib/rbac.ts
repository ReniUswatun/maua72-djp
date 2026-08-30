/* ------------------------------------------------------------------ *
 * RBAC — kontrol akses berbasis peran (fitur D6)
 *
 * Sumber kebenaran hak akses ada di sini. `AdminGate` dan `AdminShell`
 * memakai helper `can()` untuk menyembunyikan menu sekaligus memblokir
 * halaman, jadi pembatasan tidak hanya kosmetik di UI.
 *
 * Dua peran:
 * - `admin`       — semua yang berhubungan dengan UMKM/perusahaan:
 *                   review & keputusan pengajuan, persetujuan data usaha,
 *                   dokumen/OCR, CMS panduan, inbox pertanyaan, riwayat.
 * - `super_admin` — hanya soal admin: CRUD akun admin, RBAC, dan
 *                   memantau kinerja + aktivitas admin (baca saja).
 * ------------------------------------------------------------------ */

export type AdminRole = "admin" | "super_admin";

export type Permission =
  | "dashboard.view"
  | "case.view"
  | "case.review"
  | "case.decide"
  | "history.view"
  | "report.export"
  | "panduan.manage"
  | "ticket.view"
  | "ticket.reply"
  | "account.manage"
  | "activity.view"
  | "admin.monitor"
  | "rbac.manage";

export const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "case.view",
  "case.review",
  "case.decide",
  "history.view",
  "report.export",
  "panduan.manage",
  "ticket.view",
  "ticket.reply",
  "account.manage",
  "activity.view",
  "admin.monitor",
  "rbac.manage",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard.view": "Lihat dashboard monitoring",
  "case.view": "Lihat daftar & detail pengajuan",
  "case.review": "Sunting draf & catatan review",
  "case.decide": "Ambil keputusan (approve / tolak / minta info)",
  "history.view": "Lihat riwayat & audit trail",
  "report.export": "Ekspor laporan (CSV)",
  "panduan.manage": "Kelola konten panduan (CMS)",
  "ticket.view": "Lihat pertanyaan / konsultasi UMKM",
  "ticket.reply": "Balas & tutup pertanyaan UMKM",
  "account.manage": "Kelola akun admin",
  "activity.view": "Lihat log aktivitas admin",
  "admin.monitor": "Pantau performa admin",
  "rbac.manage": "Kelola hak akses peran",
};

export const PERMISSION_GROUPS: { judul: string; permissions: Permission[] }[] = [
  {
    judul: "Pengajuan & UMKM",
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
    judul: "Konsultasi UMKM",
    permissions: ["ticket.view", "ticket.reply"],
  },
  {
    judul: "Konten",
    permissions: ["panduan.manage"],
  },
  {
    judul: "Tata kelola (super admin)",
    permissions: ["account.manage", "activity.view", "admin.monitor", "rbac.manage"],
  },
];

/** Hak akses bawaan tiap peran. Super admin punya set tetap & tidak bisa diedit. */
export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  admin: [
    "dashboard.view",
    "case.view",
    "case.review",
    "case.decide",
    "history.view",
    "report.export",
    "panduan.manage",
    "ticket.view",
    "ticket.reply",
  ],
  super_admin: ["account.manage", "activity.view", "admin.monitor", "rbac.manage"],
};

/** Peran yang tidak boleh diedit lewat matrix (agar super admin tak mengunci diri). */
export const LOCKED_ROLES: AdminRole[] = ["super_admin"];

export type RolePermissionMap = Record<AdminRole, Permission[]>;

export function defaultRolePermissions(): RolePermissionMap {
  return {
    admin: [...DEFAULT_ROLE_PERMISSIONS.admin],
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
    admin: stored.admin ? clean(stored.admin) : base.admin,
    // Super admin selalu memakai set tetap, apa pun isi storage.
    super_admin: [...DEFAULT_ROLE_PERMISSIONS.super_admin],
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
  return role === "super_admin" ? "Super Admin" : "Admin";
}
