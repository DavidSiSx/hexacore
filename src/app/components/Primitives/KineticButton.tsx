"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface KineticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
}

export const KineticButton = forwardRef<HTMLButtonElement, KineticButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-black uppercase tracking-tighter text-2xl px-8 py-4 transition-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" && "bg-zinc-100 text-black hover:bg-[#DFE104]",
          variant === "outline" && "border-4 border-zinc-700 text-zinc-100 hover:border-[#DFE104] hover:bg-[#DFE104] hover:text-black",
          variant === "ghost" && "text-zinc-400 hover:text-[#DFE104] hover:bg-zinc-900",
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
