"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const KineticInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-24 bg-transparent border-0 border-b-4 border-zinc-700 text-5xl font-black uppercase tracking-tighter text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#DFE104] transition-none rounded-none",
          className
        )}
        {...props}
      />
    );
  }
);
KineticInput.displayName = "KineticInput";
