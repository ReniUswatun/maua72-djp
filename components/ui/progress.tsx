import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0 – 100 */
  value: number;
  tone?: "accent" | "primary" | "success";
  ukuran?: "sm" | "default";
  label?: string;
}

export function Progress({
  value,
  tone = "accent",
  ukuran = "default",
  label,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const warna = {
    accent: "bg-accent-500",
    primary: "bg-primary-600",
    success: "bg-success",
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "w-full overflow-hidden rounded-full bg-gray-200",
        ukuran === "sm" ? "h-1.5" : "h-2.5",
        className,
      )}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", warna)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
