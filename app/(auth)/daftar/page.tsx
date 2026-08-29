import type { Metadata } from "next";

import { FormDaftar } from "./FormDaftar";

export const metadata: Metadata = {
  title: "Daftar Gratis",
  description:
    "Buat akun SiapEkspor untuk memulai asesmen kesiapan ekspor usaha Anda.",
};

export default function DaftarPage() {
  return <FormDaftar />;
}
