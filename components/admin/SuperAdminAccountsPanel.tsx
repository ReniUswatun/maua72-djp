"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Ban, Download, KeyRound, Pencil, PlusCircle, Trash2, X } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { roleLabel } from "@/lib/rbac";
import { downloadCsv, stamp, toCsv } from "@/lib/csv";
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";

const schema = z.object({
  nama: z.string().min(2, "Nama wajib diisi"),
  email: z.string().email("Format email belum benar"),
  role: z.enum(["admin", "super_admin"]),
});

type FormValue = z.infer<typeof schema>;

export function SuperAdminAccountsPanel() {
  const accounts = useAdminStore((s) => s.accounts);
  const session = useAdminStore((s) => s.session);
  const createAccount = useAdminStore((s) => s.createAccount);
  const updateAccount = useAdminStore((s) => s.updateAccount);
  const deleteAccount = useAdminStore((s) => s.deleteAccount);
  const toggleAccount = useAdminStore((s) => s.toggleAccount);
  const resetAccess = useAdminStore((s) => s.resetAccess);
  const canExport = useCan("report.export");

  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { nama: "", email: "", role: "admin" },
  });

  const editing = accounts.find((account) => account.id === editingId) ?? null;

  const startEdit = (id: string) => {
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    setEditingId(id);
    setErrorMessage(null);
    setFeedback(null);
    reset({ nama: account.nama, email: account.email, role: account.role });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ nama: "", email: "", role: "admin" });
  };

  const onSubmit = (value: FormValue) => {
    setErrorMessage(null);
    setFeedback(null);

    const result = editingId
      ? updateAccount(editingId, value)
      : createAccount(value);

    if (!result.ok) {
      setErrorMessage(result.message ?? "Gagal menyimpan akun.");
      return;
    }

    setFeedback(
      editingId
        ? `Akun ${value.nama} berhasil diperbarui.`
        : `Akun ${value.nama} berhasil ditambahkan.`,
    );
    cancelEdit();
  };

  const exportCsv = () => {
    const rows = accounts.map((account) => ({
      id: account.id,
      nama: account.nama,
      email: account.email,
      role: account.role,
      status: account.aktif ? "aktif" : "nonaktif",
      login_terakhir: account.lastLoginAt ? account.lastLoginAt.slice(0, 10) : "-",
      reset_terakhir: account.passwordResetAt ? account.passwordResetAt.slice(0, 10) : "-",
    }));
    downloadCsv(`akun-admin-${stamp()}`, toCsv(rows));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Super Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Kelola akun</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
          Tambah, sunting, nonaktifkan, atau hapus akun admin dan super admin.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle className="text-lg">{editing ? "Ubah Akun" : "Tambah Akun"}</CardTitle>
                <CardDescription>
                  {editing
                    ? `Menyunting ${editing.nama}. Ubah nama, email, atau role.`
                    : "Isi nama, email, dan role akun admin atau super admin."}
                </CardDescription>
              </div>
              {editing ? (
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="h-4 w-4" aria-hidden />
                  Batal
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" placeholder="Nama lengkap" {...register("nama")} aria-invalid={!!errors.nama} />
                <FieldError>{errors.nama?.message}</FieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nama@beacukai.go.id" {...register("email")} aria-invalid={!!errors.email} />
                <FieldError>{errors.email?.message}</FieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" {...register("role")}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </Select>
                <FieldError>{errors.role?.message}</FieldError>
              </div>

              <Button type="submit" full disabled={isSubmitting}>
                <PlusCircle className="h-4 w-4" aria-hidden />
                {editing ? "Simpan Perubahan" : "Tambah Akun"}
              </Button>
            </form>

            {errorMessage ? (
              <Alert tone="danger" judul="Gagal" className="mt-4">
                {errorMessage}
              </Alert>
            ) : null}

            {feedback ? (
              <Alert tone="success" judul="Sukses" className="mt-4">
                {feedback}
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle className="text-lg">Daftar Akun</CardTitle>
                <CardDescription>Ubah, hapus, nonaktifkan, atau reset akses akun.</CardDescription>
              </div>
              {canExport ? (
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={accounts.length === 0}>
                  <Download className="h-4 w-4" aria-hidden />
                  Export CSV
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.length === 0 ? (
              <EmptyState
                title="Belum ada akun admin"
                description="Tambahkan akun admin atau super admin lewat formulir di samping."
              />
            ) : null}

            {accounts.map((account) => {
              const isSelf = session?.id === account.id;
              return (
                <div key={account.id} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900">{account.nama}</p>
                        <Badge tone={account.role === "super_admin" ? "primary" : "neutral"}>
                          {roleLabel(account.role)}
                        </Badge>
                        <Badge tone={account.aktif ? "success" : "danger"}>
                          {account.aktif ? "Aktif" : "Nonaktif"}
                        </Badge>
                        {isSelf ? <Badge tone="info">Akun Anda</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{account.email}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Login terakhir: {account.lastLoginAt ? formatTanggalPendek(account.lastLoginAt) : "-"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(account.id)}>
                        <Pencil className="h-4 w-4" aria-hidden />
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                       
                        onClick={() => {
                          if (!window.confirm(`Yakin ingin ${account.aktif ? "menonaktifkan" : "mengaktifkan"} akun ${account.nama}?`)) {
                            return;
                          }
                          toggleAccount(account.id, !account.aktif);
                          setFeedback(`Status akun ${account.nama} berhasil diperbarui.`);
                        }}
                      >
                        <Ban className="h-4 w-4" aria-hidden />
                        {account.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        size="sm"
                        variant="subtle"
                       
                        onClick={() => {
                          if (!window.confirm(`Reset akses untuk ${account.nama}?`)) return;
                          resetAccess(account.id);
                          setFeedback(`Akses ${account.nama} berhasil direset.`);
                        }}
                      >
                        <KeyRound className="h-4 w-4" aria-hidden />
                        Reset Akses
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isSelf}
                        onClick={() => {
                          if (!window.confirm(`Hapus permanen akun ${account.nama}? Tindakan ini tidak bisa dibatalkan.`)) {
                            return;
                          }
                          if (editingId === account.id) cancelEdit();
                          deleteAccount(account.id);
                          setFeedback(`Akun ${account.nama} berhasil dihapus.`);
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Alert tone="primary" judul="Catatan super admin">
        <div className="space-y-2 text-sm leading-relaxed text-gray-700">
          <p>Perubahan akun disimpan di state lokal untuk prototipe. Pada backend, aksi ini akan diganti ke endpoint user management.</p>
          <p>Akun sendiri tidak bisa dihapus agar tidak ada super admin yang mengunci dirinya keluar dari sistem.</p>
        </div>
      </Alert>
    </div>
  );
}
