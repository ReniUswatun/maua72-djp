"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlayCircle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAppStore } from "@/store/assessment-store";

const skema = z.object({
  email: z.string().email("Format email belum benar"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type Nilai = z.infer<typeof skema>;

export function FormMasuk() {
  const router = useRouter();
  const masuk = useAppStore((s) => s.masuk);
  const muatDemo = useAppStore((s) => s.muatDemo);
  const profile = useAppStore((s) => s.profile);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Nilai>({ resolver: zodResolver(skema) });

  const onSubmit = (nilai: Nilai) => {
    masuk(nilai.email);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
        <p className="mt-2 text-sm text-gray-600">
          Lanjutkan asesmen atau lihat perkembangan kesiapan usaha Anda.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
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

          <Button type="submit" full size="lg">
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold text-primary-700 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>

      <Alert tone="primary" judul="Sedang menilai prototipe ini?">
        <p className="mb-3">
          Masuk dengan data demo untuk langsung melihat dashboard berisi hasil
          asesmen, rekomendasi yang sudah divalidasi petugas, dan riwayat
          konsultasi.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
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
          <Link href="/admin/masuk">
            <Button variant="outline" size="sm" full>
              Masuk Officer
            </Button>
          </Link>
          <Link href="/super-admin/masuk">
            <Button variant="ghost" size="sm" full>
              Masuk Super Admin
            </Button>
          </Link>
        </div>
      </Alert>
    </div>
  );
}
