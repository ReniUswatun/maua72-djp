import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark",
  href = "/",
  subtitle,
}: {
  className?: string;
  tone?: "dark" | "light";
  href?: string | null;
  subtitle?: string;
}) {
  const isi = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-700"
      >
        <span className="absolute h-4 w-4 rounded-sm border-2 border-accent-500" />
        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            tone === "dark" ? "text-primary-900" : "text-white",
          )}
        >
          Siap<span className="text-accent-600">Ekspor</span>
        </span>
        {subtitle ? (
          <span
            className={cn(
              "mt-0.5 text-[11px] font-medium",
              tone === "dark" ? "text-gray-500" : "text-primary-100",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );

  if (!href) return isi;
  return (
    <Link href={href} className="rounded-lg" aria-label="SiapEkspor — beranda">
      {isi}
    </Link>
  );
}
