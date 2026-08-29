"use client";

import * as React from "react";
import { Check, Pencil, Sparkles } from "lucide-react";

import { HelpTooltip } from "@/components/assessment/HelpTooltip";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  BUSINESS_CATEGORIES,
  PROVINSI,
  categoryLabel,
  getCategory,
} from "@/lib/business-categories";
import { conditionalQuestionCount } from "@/lib/assessment-config";
import type { BusinessProfile } from "@/lib/types";
import { useAppStore } from "@/store/assessment-store";



export default function ProfilPage() {
  const user = useAppStore((s) => s.user);
  const profile = useAppStore((s) => s.profile);
  const simpanProfil = useAppStore((s) => s.simpanProfil);

  const [edit, setEdit] = React.useState(!profile);
  const [draf, setDraf] = React.useState<BusinessProfile>(
    profile || {
      namaUsaha: "",
      kota: "",
      provinsi: "Jawa Tengah",
      tahunBerdiri: "",
      kategoriId: "",
      kategoriLainnya: "",
      nomorNib: "",
      nomorNpwp: "",
    }
  );
  const [tersimpan, setTersimpan] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setDraf(profile);
    }
  }, [profile]);

  const ubah = <K extends keyof BusinessProfile>(
    kunci: K,
    nilai: BusinessProfile[K],
  ) => setDraf({ ...draf, [kunci]: nilai });

  const simpan = () => {
    simpanProfil(draf);
    setEdit(false);
    setTersimpan(true);
    window.setTimeout(() => setTersimpan(false), 4000);
  };

  const traits = getCategory(profile?.kategoriId || draf.kategoriId)?.traits ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Profil</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Profil Usaha
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">
            Data ini menentukan pertanyaan tambahan yang muncul pada asesmen.
            Perbarui bila ada perubahan status legalitas.
          </p>
        </div>
        {!edit ? (
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil className="h-4 w-4" aria-hidden />
            Ubah
          </Button>
        ) : null}
      </div>

      {tersimpan ? (
        <Alert tone="success" judul="Profil diperbarui">
          Perubahan tersimpan. Jalankan asesmen ulang bila perubahan menyangkut
          legalitas atau kategori usaha.
        </Alert>
      ) : null}

      {/* Akun */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Akun</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            { k: "Nama", v: user?.nama },
            { k: "Email", v: user?.email },
            { k: "Nomor WhatsApp", v: user?.hp || "—" },
          ].map((f) => (
            <div key={f.k}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {f.k}
              </dt>
              <dd className="mt-1.5 break-all font-medium text-gray-900">
                {f.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Usaha */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Data Usaha</h2>

        {edit ? (
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="namaUsaha">Nama Usaha</Label>
              <Input
                id="namaUsaha"
                value={draf.namaUsaha}
                onChange={(e) => ubah("namaUsaha", e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kota">Kota / Kabupaten</Label>
                <Input
                  id="kota"
                  value={draf.kota}
                  onChange={(e) => ubah("kota", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provinsi">Provinsi</Label>
                <Select
                  id="provinsi"
                  value={draf.provinsi}
                  onChange={(e) => ubah("provinsi", e.target.value)}
                >
                  {PROVINSI.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun Berdiri</Label>
                <Input
                  id="tahun"
                  inputMode="numeric"
                  maxLength={4}
                  value={draf.tahunBerdiri}
                  onChange={(e) => ubah("tahunBerdiri", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori Usaha</Label>
                <Select
                  id="kategori"
                  value={draf.kategoriId}
                  onChange={(e) => ubah("kategoriId", e.target.value)}
                >
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nib">Nomor NIB</Label>
                <Input
                  id="nib"
                  placeholder="Kosongkan jika belum punya"
                  value={draf.nomorNib || ""}
                  onChange={(e) => ubah("nomorNib", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npwp">Nomor NPWP</Label>
                <Input
                  id="npwp"
                  placeholder="Kosongkan jika belum punya"
                  value={draf.nomorNpwp || ""}
                  onChange={(e) => ubah("nomorNpwp", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button onClick={simpan}>
                <Check className="h-4 w-4" aria-hidden />
                Simpan Perubahan
              </Button>
              {profile ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDraf(profile);
                    setEdit(false);
                  }}
                >
                  Batal
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            {[
              { k: "Nama Usaha", v: (profile || draf).namaUsaha },
              { k: "Lokasi", v: `${(profile || draf).kota}, ${(profile || draf).provinsi}` },
              { k: "Tahun Berdiri", v: (profile || draf).tahunBerdiri },
              {
                k: "Kategori Usaha",
                v: categoryLabel((profile || draf).kategoriId, (profile || draf).kategoriLainnya),
              },
              {
                k: "Nomor NIB",
                v: (profile || draf).nomorNib || "Belum punya",
                istilah: "NIB",
              },
              {
                k: "Nomor NPWP",
                v: (profile || draf).nomorNpwp || "Belum punya",
                istilah: "NPWP",
              },
            ].map((f) => (
              <div key={f.k}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {f.istilah ? (
                    <span className="inline-flex items-center gap-1">
                      {f.k} <HelpTooltip istilah={f.istilah} />
                    </span>
                  ) : (
                    f.k
                  )}
                </dt>
                <dd className="mt-1.5 font-medium text-gray-900">{f.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <Alert
        tone="accent"
        icon={<Sparkles className="h-5 w-5 text-accent-600" aria-hidden />}
        judul="Bagaimana kategori memengaruhi asesmen Anda"
      >
        Kategori{" "}
        <strong>
          {categoryLabel((profile || draf).kategoriId, (profile || draf).kategoriLainnya)}
        </strong>{" "}
        memunculkan {conditionalQuestionCount(profile || draf)} pertanyaan tambahan yang
        tidak ditanyakan ke kategori lain
        {traits.length > 0
          ? ` — antara lain menyangkut ${traits
              .map(
                (t) =>
                  ({
                    pangan: "izin edar dan sertifikat halal",
                    kosmetik: "izin edar BPOM",
                    herbal: "izin obat tradisional",
                    hayati: "sertifikat karantina",
                    kayu: "legalitas kayu (SVLK)",
                    tekstil: "standar mutu tekstil",
                    digital: "kekayaan intelektual",
                  })[t],
              )
              .join(", ")}`
          : ""}
        .
      </Alert>
    </div>
  );
}
