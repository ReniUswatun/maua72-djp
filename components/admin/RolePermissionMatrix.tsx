"use client";

import * as React from "react";
import { RotateCcw, ShieldHalf } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LOCKED_ROLES,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  roleCan,
  type AdminRole,
  type Permission,
} from "@/lib/rbac";
import { useAdminStore } from "@/store/admin-store";

const ROLES: AdminRole[] = ["officer", "super_admin"];

export function RolePermissionMatrix() {
  const rolePermissions = useAdminStore((s) => s.rolePermissions);
  const setRolePermission = useAdminStore((s) => s.setRolePermission);
  const resetRolePermissions = useAdminStore((s) => s.resetRolePermissions);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <Badge tone="primary" className="w-fit">
            <ShieldHalf className="h-3.5 w-3.5" aria-hidden />
            RBAC
          </Badge>
          <CardTitle className="text-2xl">Hak Akses per Peran</CardTitle>
          <CardDescription>
            Centang izin yang dimiliki tiap peran. Perubahan langsung berlaku: menu
            disembunyikan sekaligus halaman terkait diblokir untuk peran tanpa izin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert tone="neutral">
            Peran <span className="font-semibold">Super Admin</span> selalu memiliki akses penuh
            dan tidak dapat dikurangi, agar tidak ada yang mengunci diri dari sistem.
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetRolePermissions();
              setFeedback("Hak akses dikembalikan ke bawaan.");
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Kembalikan ke bawaan
          </Button>
          {feedback ? (
            <Alert tone="success" judul="Tersimpan">
              {feedback}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {PERMISSION_GROUPS.map((group) => (
        <Card key={group.judul} className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">{group.judul}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-3 py-3 text-left">Izin</th>
                  {ROLES.map((role) => (
                    <th key={role} className="px-3 py-3 text-center">
                      {role === "super_admin" ? "Super Admin" : "Officer"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {group.permissions.map((permission: Permission) => (
                  <tr key={permission}>
                    <td className="px-3 py-3 text-slate-700">
                      <p className="font-medium text-slate-900">{PERMISSION_LABELS[permission]}</p>
                      <p className="text-xs text-slate-400">{permission}</p>
                    </td>
                    {ROLES.map((role) => {
                      const checked = roleCan(rolePermissions, role, permission);
                      const locked = LOCKED_ROLES.includes(role);
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-slate-300 text-primary-700 focus:ring-primary-500 disabled:opacity-50"
                            checked={checked}
                            disabled={locked}
                            aria-label={`${PERMISSION_LABELS[permission]} untuk ${role}`}
                            onChange={(event) => {
                              setRolePermission(role, permission, event.target.checked);
                              setFeedback(
                                `${PERMISSION_LABELS[permission]} ${
                                  event.target.checked ? "diaktifkan" : "dinonaktifkan"
                                } untuk ${role === "super_admin" ? "Super Admin" : "Officer"}.`,
                              );
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
