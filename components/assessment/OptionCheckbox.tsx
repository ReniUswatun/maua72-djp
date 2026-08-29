"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function OptionCheckbox({
  value,
  label,
  checked,
  onToggle,
}: {
  value: string;
  label: string;
  checked: boolean;
  onToggle: (value: string) => void;
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
        type="checkbox"
        value={value}
        checked={checked}
        onChange={() => onToggle(value)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked ? "border-primary-600 bg-primary-600" : "border-gray-300 bg-white",
        )}
      >
        {checked ? <Check className="h-3.5 w-3.5 text-white" /> : null}
      </span>
      <span className="min-w-0">{label}</span>
    </label>
  );
}
