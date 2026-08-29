"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAppStore } from "@/store/assessment-store";

const skema = z.object({
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email belum benar"),
  hp: z
    .string()
    .min(9, "Nomor HP minimal 9 digit")
    .regex(/^[0-9+\-\s]+$/, "Nomor HP hanya boleh berisi angka"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  setuju: z.literal(true, {
    errorMap: () => ({ message: "Anda perlu menyetujui syarat dan kebijakan" }),
  }),
});

type Nilai = z.infer<typeof skema>;

export function FormDaftar() {
  const router = useRouter();
  const daftar = useAppStore((s) => s.daftar);
  const [lihatSandi, setLihatSandi] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Nilai>({ resolver: zodResolver(skema) });

  const onSubmit = async (nilai: Nilai) => {
    daftar({ nama: nilai.nama, email: nilai.email, hp: nilai.hp });
    router.push("/dashboard");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-card">
      <h1 className="text-2xl font-bold tracking-tight">Daftar Gratis</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Cukup empat isian. Data usaha yang lebih rinci akan diminta pada langkah
        berikutnya.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input
            id="nama"
            autoComplete="name"
            placeholder="Sari Utami"
            aria-invalid={!!errors.nama}
            {...register("nama")}
          />
          <FieldError>{errors.nama?.message}</FieldError>
        </div>

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
          <Label htmlFor="hp">Nomor HP (WhatsApp)</Label>
          <Input
            id="hp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            aria-describedby="hp-bantuan"
            aria-invalid={!!errors.hp}
            {...register("hp")}
          />
          <p id="hp-bantuan" className="text-xs text-gray-500">
            Petugas Bea Cukai menghubungi Anda lewat WhatsApp untuk hasil
            validasi rekomendasi.
          </p>
          <FieldError>{errors.hp?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Kata Sandi</Label>
          <div className="relative">
            <Input
              id="password"
              type={lihatSandi ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className="pr-12"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setLihatSandi((v) => !v)}
              aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-1 top-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              {lihatSandi ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
              {...register("setuju")}
            />
            <span>
              Saya setuju dengan{" "}
              <span className="font-semibold text-primary-700">
                Syarat &amp; Kebijakan Privasi
              </span>
              , termasuk pembagian hasil asesmen kepada petugas Bea dan Cukai
              untuk keperluan validasi.
            </span>
          </label>
          <FieldError>{errors.setuju?.message}</FieldError>
        </div>

        <Button type="submit" full size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : null}
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-primary-700 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
