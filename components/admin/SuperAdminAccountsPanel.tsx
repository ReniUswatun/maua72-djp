"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Ban, Download, KeyRound, PlusCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { downloadCsv, stamp, toCsv } from "@/lib/csv";
import { formatTanggalPendek } from "@/lib/utils";
import { useAdminStore, useCan } from "@/store/admin-store";

const schema = z.object({
  nama: z.string().min(2, "Nama wajib diisi"),
  email: z.string().email("Format email belum benar"),
  role: z.enum(["officer", "super_admin"]),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
});

type FormValue = z.infer<typeof schema>;

export function SuperAdminAccountsPanel() {
  const accounts = useAdminStore((s) => s.accounts);
  const createAccount = useAdminStore((s) => s.createAccount);
  const toggleAccount = useAdminStore((s) => s.toggleAccount);
  const resetAccess = useAdminStore((s) => s.resetAccess);
  const canExport = useCan("report.export");

  const exportCsv = () => {
    const rows = accounts.map((account) => ({
      id: account.id,
      nama: account.nama,
      email: account.email,
      role: account.role,
      jabatan: account.jabatan,
      status: account.aktif ? "aktif" : "nonaktif",
      login_terakhir: account.lastLoginAt ? account.lastLoginAt.slice(0, 10) : "-",
      reset_terakhir: account.passwordResetAt ? account.passwordResetAt.slice(0, 10) : "-",
    }));
    downloadCsv(`akun-admin-${stamp()}`, toCsv(rows));
  };

  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { role: "officer" },
  });

  const onSubmit = async (value: FormValue) => {
    setErrorMessage(null);
    setFeedback(null);

    const duplicate = accounts.some(
      (account) => account.email.toLowerCase() === value.email.toLowerCase(),
    );
    if (duplicate) {
      setErrorMessage("Email akun sudah digunakan.");
      return;
    }

    setIsCreating(true);
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    createAccount(value);
    reset();
    setIsCreating(false);
    setFeedback(`Akun ${value.nama} berhasil ditambahkan.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Tambah Akun</CardTitle>
            <CardDescription>CRUD akun admin/officer tanpa backend, siap diganti API.</CardDescription>
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
                  <option value="officer">Officer</option>
                  <option value="super_admin">Super Admin</option>
                </Select>
                <FieldError>{errors.role?.message}</FieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input id="jabatan" placeholder="Contoh: Pemeriksa Dokumen" {...register("jabatan")} aria-invalid={!!errors.jabatan} />
                <FieldError>{errors.jabatan?.message}</FieldError>
              </div>

              <Button type="submit" full disabled={isSubmitting}>
                <PlusCircle className="h-4 w-4" aria-hidden />
                {isCreating ? "Menyimpan..." : "Tambah Akun"}
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

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle className="text-lg">Daftar Akun</CardTitle>
                <CardDescription>Nonaktifkan, reset akses, dan audit perubahan akun.</CardDescription>
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
                description="Tambahkan akun officer atau super admin lewat formulir di samping."
              />
            ) : null}

            {accounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{account.nama}</p>
                      <Badge tone={account.role === "super_admin" ? "primary" : "neutral"}>{account.role}</Badge>
                      <Badge tone={account.aktif ? "success" : "danger"}>{account.aktif ? "Aktif" : "Nonaktif"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{account.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{account.jabatan}</p>
                    <p className="mt-1 text-xs text-slate-500">Login terakhir: {account.lastLoginAt ? formatTanggalPendek(account.lastLoginAt) : "-"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === account.id}
                      onClick={async () => {
                        if (!window.confirm(`Yakin ingin ${account.aktif ? "menonaktifkan" : "mengaktifkan"} akun ${account.nama}?`)) {
                          return;
                        }
                        setErrorMessage(null);
                        setFeedback(null);
                        setBusyId(account.id);
                        await new Promise((resolve) => window.setTimeout(resolve, 250));
                        toggleAccount(account.id, !account.aktif);
                        setBusyId(null);
                        setFeedback(`Status akun ${account.nama} berhasil diperbarui.`);
                      }}
                    >
                      <Ban className="h-4 w-4" aria-hidden />
                      {busyId === account.id ? "Memproses..." : account.aktif ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                    <Button
                      size="sm"
                      variant="subtle"
                      disabled={busyId === account.id}
                      onClick={async () => {
                        if (!window.confirm(`Reset akses untuk ${account.nama}?`)) {
                          return;
                        }
                        setErrorMessage(null);
                        setFeedback(null);
                        setBusyId(account.id);
                        await new Promise((resolve) => window.setTimeout(resolve, 250));
                        resetAccess(account.id);
                        setBusyId(null);
                        setFeedback(`Akses ${account.nama} berhasil direset.`);
                      }}
                    >
                      <KeyRound className="h-4 w-4" aria-hidden />
                      {busyId === account.id ? "Memproses..." : "Reset Akses"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Alert tone="primary" judul="Catatan super admin">
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          <p>Perubahan akun disimpan di state lokal untuk prototipe. Pada backend, aksi ini akan diganti ke endpoint user management.</p>
          <p>Akses super admin dipisah dari officer agar pengelolaan akun tidak bisa dilakukan oleh reviewer biasa.</p>
        </div>
      </Alert>
    </div>
  );
}
