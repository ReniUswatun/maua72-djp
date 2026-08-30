"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { DEMO_USER } from "@/lib/mock-data";
import { useAppStore } from "@/store/assessment-store";
import { useAdminStore } from "@/store/admin-store";

/** Akun UMKM uji coba — memuat data demo "Kopi Merapi Nusantara". */
const DEMO_UMKM = { email: DEMO_USER.email, password: "umkm123" };

const skema = z.object({
  email: z.string().email("Format email belum benar"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type Nilai = z.infer<typeof skema>;

export function FormMasuk() {
  const router = useRouter();
  const [errorPesan, setErrorPesan] = React.useState<string | null>(null);

  const masuk = useAppStore((s) => s.masuk);
  const muatDemo = useAppStore((s) => s.muatDemo);
  const adminLogin = useAdminStore((s) => s.login);
  const adminAccounts = useAdminStore((s) => s.accounts);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Nilai>({ resolver: zodResolver(skema) });

  const onSubmit = (nilai: Nilai) => {
    setErrorPesan(null);

    // Email + kata sandi sudah menentukan peran. Coba akun admin/super admin dulu.
    const asAdmin = adminLogin(nilai.email, nilai.password);
    if (asAdmin.ok) {
      router.push(asAdmin.role === "super_admin" ? "/super-admin" : "/admin");
      return;
    }

    // Email terdaftar sebagai akun admin/super admin tapi kata sandi salah.
    const isAdminEmail = adminAccounts.some(
      (account) => account.email.toLowerCase() === nilai.email.trim().toLowerCase(),
    );
    if (isAdminEmail) {
      setErrorPesan(asAdmin.message ?? "Email atau kata sandi tidak cocok.");
      return;
    }

    // Akun UMKM uji coba — muat data demo yang sudah terisi.
    if (
      nilai.email.trim().toLowerCase() === DEMO_UMKM.email.toLowerCase() &&
      nilai.password === DEMO_UMKM.password
    ) {
      muatDemo();
      router.push("/dashboard");
      return;
    }

    // Akun UMKM lain — prototipe menerima email apa pun (belum ada backend auth).
    masuk(nilai.email);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
        <p className="mt-2 text-sm text-gray-600">
          Masuk dengan email dan kata sandi Anda. Sistem otomatis mengarahkan ke ruang
          kerja sesuai peran akun.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nama@usaha.id"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          {errorPesan ? (
            <Alert tone="danger" judul="Login gagal">
              {errorPesan}
            </Alert>
          ) : null}

          <Button type="submit" full size="lg" disabled={isSubmitting}>
            Masuk
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-primary-700 hover:underline">
            Daftar gratis
          </Link>
        </p>

        <details className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-gray-700">
            Akun uji coba
          </summary>
          <ul className="mt-3 space-y-1.5 text-gray-600">
            <li>
              UMKM — <code>{DEMO_UMKM.email}</code> / <code>{DEMO_UMKM.password}</code>
            </li>
            <li>
              Admin — <code>ahmad.fauzi@beacukai.go.id</code> / <code>admin123</code>
            </li>
            <li>
              Super Admin — <code>dewi.lestari@beacukai.go.id</code> / <code>superadmin123</code>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Akun UMKM lain: masukkan email apa pun dengan kata sandi bebas — prototipe belum
            memakai autentikasi backend.
          </p>
        </details>
      </div>

      <Alert tone="primary" judul="Sedang menilai prototipe ini?">
        <p className="mb-3">
          Masuk dengan data demo untuk langsung melihat dashboard berisi contoh pengajuan
          ekspor, dokumen yang sudah ditinjau petugas, dan riwayat konsultasi.
        </p>
        <Button
          variant="subtle"
          size="sm"
          onClick={() => {
            muatDemo();
            router.push("/dashboard");
          }}
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          Masuk sebagai akun demo
        </Button>
      </Alert>
    </div>
  );
}
