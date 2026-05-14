"use client";

import Marquee from "react-fast-marquee";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KineticMarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: "left" | "right";
}

export function KineticMarquee({ children, speed = 80, className, direction = "left" }: KineticMarqueeProps) {
  return (
    <div className={cn("overflow-hidden bg-[#DFE104] text-black font-black uppercase tracking-widest text-xl py-2 border-y-4 border-zinc-950", className)}>
      <Marquee speed={speed} gradient={false} direction={direction} className="overflow-hidden">
        {children}
      </Marquee>
    </div>
  );
}
