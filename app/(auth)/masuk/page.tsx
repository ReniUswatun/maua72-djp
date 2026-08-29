import type { Metadata } from "next";

import { FormMasuk } from "./FormMasuk";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun SiapEkspor Anda.",
};

export default function MasukPage() {
  return <FormMasuk />;
}
