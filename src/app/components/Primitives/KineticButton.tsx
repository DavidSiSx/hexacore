"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface KineticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const KineticButton = forwardRef<HTMLButtonElement, KineticButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "text-xs px-4 py-2",
      md: "text-lg px-6 py-3",
      lg: "text-2xl px-8 py-4",
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-black uppercase tracking-tighter",
          "border-4 transition-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none",
          // Size
          sizeClasses[size],
          // Variants usando variables CSS del tema
          variant === "primary" && [
            "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]",
            "hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)]",
          ],
          variant === "outline" && [
            "bg-transparent text-[var(--foreground)] border-[var(--border)]",
            "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]",
          ],
          variant === "ghost" && [
            "bg-transparent text-[var(--foreground)] border-transparent opacity-60",
            "hover:opacity-100 hover:text-[var(--accent)] hover:border-[var(--accent)]",
          ],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
KineticButton.displayName = "KineticButton";
