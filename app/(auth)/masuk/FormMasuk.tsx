"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Building2, PlayCircle, ShieldCheck, Users } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/assessment-store";

type Peran = "umkm" | "officer" | "super_admin";

const PERAN: {
  id: Peran;
  label: string;
  icon: typeof Users;
  deskripsi: string;
}[] = [
  {
    id: "umkm",
    label: "UMKM",
    icon: Building2,
    deskripsi: "Pemilik usaha yang ingin cek kesiapan ekspor dan menerima rekomendasi tervalidasi.",
  },
];

const skema = z.object({
  email: z.string().email("Format email belum benar"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type Nilai = z.infer<typeof skema>;

function parsePeran(value: string | null): Peran {
  return "umkm";
}

export function FormMasuk() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [peran, setPeran] = React.useState<Peran>(() => parsePeran(searchParams.get("peran")));
  const [errorPesan, setErrorPesan] = React.useState<string | null>(null);

  const masuk = useAppStore((s) => s.masuk);
  const muatDemo = useAppStore((s) => s.muatDemo);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Nilai>({ resolver: zodResolver(skema) });

  React.useEffect(() => {
    setErrorPesan(null);
    reset();
  }, [peran, reset]);

  const onSubmit = (nilai: Nilai) => {
    setErrorPesan(null);

    if (peran === "umkm") {
      masuk(nilai.email);
      router.push("/dashboard");
      return;
    }
  };

  const aktif = PERAN.find((p) => p.id === peran)!;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Masuk</h1>
        <p className="mt-2 text-sm text-gray-600">Pilih peran Anda, lalu masuk dengan akun yang sesuai.</p>

        <div
          role="tablist"
          aria-label="Pilih peran"
          className="mt-6 hidden grid-cols-3 gap-1.5 rounded-xl bg-gray-100 p-1.5"
        >
          {PERAN.map((p) => {
            const dipilih = p.id === peran;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={dipilih}
                onClick={() => setPeran(p.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-semibold transition-colors",
                  dipilih
                    ? "bg-white text-primary-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-800",
                )}
              >
                <p.icon className="h-4 w-4" aria-hidden />
                {p.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-gray-500">{aktif.deskripsi}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={peran === "umkm" ? "nama@usaha.id" : "nama@beacukai.go.id"}
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
            Masuk sebagai {aktif.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </form>

        {peran === "umkm" ? (
          <p className="mt-6 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/daftar" className="font-semibold text-primary-700 hover:underline">
              Daftar gratis
            </Link>
          </p>
        ) : null}
      </div>

      {peran === "umkm" ? (
        <Alert tone="primary" judul="Sedang menilai prototipe ini?">
          <p className="mb-3">
            Masuk dengan data demo untuk langsung melihat dashboard berisi hasil asesmen,
            rekomendasi yang sudah divalidasi petugas, dan riwayat konsultasi.
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
      ) : null}
    </div>
  );
}
