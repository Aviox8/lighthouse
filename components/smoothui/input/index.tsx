"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<"input">
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-none border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
