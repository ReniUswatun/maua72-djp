import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva("rounded-xl border p-4 text-sm leading-relaxed", {
  variants: {
    tone: {
      neutral: "border-gray-200 bg-gray-50 text-gray-700",
      info: "border-sky-200 bg-sky-50 text-sky-900",
      primary: "border-primary-100 bg-primary-50 text-primary-900",
      accent: "border-accent-100 bg-accent-50 text-accent-700",
      success: "border-green-200 bg-green-50 text-green-900",
      warning: "border-amber-200 bg-amber-50 text-amber-900",
      danger: "border-red-200 bg-red-50 text-red-900",
    },
  },
  defaultVariants: { tone: "neutral" },
});

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  judul?: string;
}

export function Alert({
  className,
  tone,
  icon,
  judul,
  children,
  ...props
}: AlertProps) {
  return (
    <div className={cn(alertVariants({ tone }), className)} {...props}>
      <div className="flex gap-3">
        {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
        <div className="min-w-0 space-y-1">
          {judul ? <p className="font-semibold">{judul}</p> : null}
          <div className="[&_a]:font-medium [&_a]:underline">{children}</div>
        </div>
      </div>
    </div>
  );
}
