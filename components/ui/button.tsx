import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary-700 text-white hover:bg-primary-800",
        accent: "bg-accent-500 text-primary-900 hover:bg-accent-600 hover:text-white",
        outline:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-400",
        subtle: "bg-primary-50 text-primary-700 hover:bg-primary-100",
        ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        danger: "bg-danger text-white hover:bg-red-700",
        link: "text-primary-600 underline-offset-4 hover:underline",
      },
      size: {
        // Semua ukuran memenuhi target sentuh 44px (blueprint §14)
        sm: "h-11 px-4 text-sm",
        default: "h-12 px-5 text-base",
        lg: "h-14 px-7 text-base",
        icon: "h-11 w-11",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, full, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
