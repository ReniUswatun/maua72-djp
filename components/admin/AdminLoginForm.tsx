"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";
import { useAdminStore } from "@/store/admin-store";

const schema = z.object({
  role: z.enum(["officer", "super_admin"]),
  email: z.string().email("Format email belum benar"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type FormValue = z.infer<typeof schema>;

export function AdminLoginForm({
  title,
  description,
  defaultRole,
  successHref,
}: {
  title: string;
  description: string;
  defaultRole: "officer" | "super_admin";
  successHref: Record<"officer" | "super_admin", string>;
}) {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const onSubmit = (value: FormValue) => {
    const result = login(value.email, value.password, value.role);
    if (!result.ok) {
      setErrorMessage(result.message ?? "Login gagal.");
      return;
    }

    setErrorMessage(null);
    router.push(successHref[value.role]);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <Badge tone="primary">Akses Admin</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" {...register("role")}> 
              <option value="officer">Officer</option>
              <option value="super_admin">Super Admin</option>
            </Select>
            <FieldError>{errors.role?.message}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="nama@beacukai.go.id" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          {errorMessage ? (
            <Alert tone="danger" judul="Login gagal">
              {errorMessage}
            </Alert>
          ) : null}

          <Button type="submit" full size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </form>
      </div>

      <Alert tone="primary" judul="Akun demo tersedia">
        <p className="text-sm leading-relaxed text-slate-700">
          Officer: <span className="font-semibold">ahmad.fauzi@beacukai.go.id</span> / <span className="font-semibold">admin123</span>. Super admin: <span className="font-semibold">dewi.lestari@beacukai.go.id</span> / <span className="font-semibold">super123</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="subtle" size="sm">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </Alert>
    </div>
  );
}
