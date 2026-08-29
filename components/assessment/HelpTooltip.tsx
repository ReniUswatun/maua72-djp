"use client";

import * as React from "react";
import { HelpCircle, X } from "lucide-react";

import { lookupGlossary } from "@/lib/glossary";
import { cn } from "@/lib/utils";

/**
 * Tooltip glosarium (blueprint §10 no.5 — komponen pembeda).
 * Dibuat click-based, bukan hover-only, supaya tetap bisa dipakai di HP.
 */
export function HelpTooltip({
  istilah,
  children,
  className,
}: {
  istilah: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [buka, setBuka] = React.useState(false);
  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const entry = lookupGlossary(istilah);

  React.useEffect(() => {
    if (!buka) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setBuka(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [buka]);

  if (!entry) return <>{children ?? istilah}</>;

  return (
    <span ref={wrapRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        aria-label={`Penjelasan istilah ${entry.istilah}`}
        className="inline-flex items-baseline gap-0.5 rounded font-semibold text-primary-600 decoration-dotted decoration-2 underline-offset-4 hover:underline"
      >
        {children ?? entry.istilah}
        <HelpCircle className="h-3.5 w-3.5 shrink-0 self-center" aria-hidden />
      </button>

      {buka ? (
        <span
          role="dialog"
          aria-label={entry.istilah}
          className="absolute left-0 top-full z-40 mt-2 block w-[min(20rem,calc(100vw-3rem))] animate-fade-in rounded-xl border border-gray-200 bg-white p-4 text-left shadow-lift"
        >
          <span className="mb-1 flex items-start justify-between gap-3">
            <span className="block">
              <span className="block text-sm font-bold text-gray-900">
                {entry.istilah}
              </span>
              {entry.kepanjangan ? (
                <span className="block text-xs text-gray-500">
                  {entry.kepanjangan}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={() => setBuka(false)}
              aria-label="Tutup penjelasan"
              className="-mr-1 -mt-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
          <span className="block text-sm font-normal leading-relaxed text-gray-700">
            {entry.penjelasan}
          </span>
        </span>
      ) : null}
    </span>
  );
}

/**
 * Merender teks dan otomatis membungkus istilah yang ada di glosarium
 * dengan <HelpTooltip>. Dipakai pada teks pertanyaan asesmen.
 */
export function TeksBerGlosarium({
  teks,
  istilah = [],
}: {
  teks: string;
  istilah?: string[];
}) {
  if (istilah.length === 0) return <>{teks}</>;

  // Istilah terpanjang dicocokkan lebih dulu agar "NIK Kepabeanan" tidak
  // keburu tercocok oleh potongan yang lebih pendek.
  const urut = [...istilah].sort((a, b) => b.length - a.length);
  const pola = new RegExp(
    `(${urut.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );

  const bagian = teks.split(pola);

  return (
    <>
      {bagian.map((bag, i) => {
        const cocok = urut.find((t) => t.toLowerCase() === bag.toLowerCase());
        if (!cocok) return <React.Fragment key={i}>{bag}</React.Fragment>;
        return (
          <HelpTooltip key={i} istilah={cocok}>
            {bag}
          </HelpTooltip>
        );
      })}
    </>
  );
}
