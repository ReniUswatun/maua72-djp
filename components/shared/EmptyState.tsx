import * as React from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Empty state konsisten untuk seluruh area admin (fitur D1).
 * Bukan sekadar layar kosong — selalu menjelaskan kenapa kosong dan
 * langkah berikutnya bila ada.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  tone = "neutral",
}: {
  icon?: typeof Inbox;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center",
        tone === "danger"
          ? "border-red-300 bg-red-50/60"
          : "border-slate-300 bg-slate-50/60",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          tone === "danger" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-4 text-base font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
