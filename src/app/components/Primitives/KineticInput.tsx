"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface KineticInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "hero" | "standard";
}

export const KineticInput = forwardRef<HTMLInputElement, KineticInputProps>(
  ({ className, variant = "standard", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Base styles - usando variables CSS del tema
          "w-full bg-transparent text-[var(--foreground)] font-black uppercase tracking-tighter",
          "placeholder:text-[var(--foreground)]/30 focus:outline-none transition-none",
          // Variants
          variant === "hero" && [
            "h-24 border-0 border-b-4 border-[var(--border)] text-5xl",
            "focus:border-[var(--accent)]",
          ],
          variant === "standard" && [
            "h-14 border-4 border-[var(--border)] px-4 text-lg",
            "focus:border-[var(--accent)]",
          ],
          className
        )}
        {...props}
      />
    );
  }
);
KineticInput.displayName = "KineticInput";
