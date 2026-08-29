"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function OptionRadio({
  name,
  value,
  label,
  checked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-lg border p-4 text-base leading-snug transition-colors",
        checked
          ? "border-primary-500 bg-primary-50 font-semibold text-primary-900 ring-1 ring-primary-500"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-primary-600 bg-primary-600" : "border-gray-300 bg-white",
        )}
      >
        {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <span className="min-w-0">{label}</span>
      {checked ? (
        <Check className="ml-auto h-5 w-5 shrink-0 text-primary-600" aria-hidden />
      ) : null}
    </label>
  );
}
