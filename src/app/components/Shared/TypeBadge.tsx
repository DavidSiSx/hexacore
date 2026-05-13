"use client";

import { getTypeClass } from "@/lib/pokemon";

export default function TypeBadge({ type, size = "sm" }: { type: string; size?: "sm" | "md" }) {
  const sizeClasses = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`${getTypeClass(type)} text-white font-bold uppercase 
                  rounded-full tracking-wider inline-block ${sizeClasses}`}
    >
      {type}
    </span>
  );
}
