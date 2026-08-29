import * as React from "react";

import { cn } from "@/lib/utils";

const baseField =
  "flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-400 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input ref={ref} type={type} className={cn(baseField, className)} {...props} />
));
Input.displayName = "Input";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(baseField, "appearance-none bg-no-repeat pr-10", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      backgroundPosition: "right 0.75rem center",
    }}
    {...props}
  />
));
Select.displayName = "Select";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, "h-auto min-h-[7rem] py-3 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("block text-sm font-semibold text-gray-900", className)}
    {...props}
  />
));
Label.displayName = "Label";

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-sm font-medium text-danger">{children}</p>;
}

export { Input, Select, Textarea, Label, FieldError };
