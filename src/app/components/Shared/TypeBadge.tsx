"use client";

import { getTypeClass, translateType } from "@/lib/pokemon";
import { useParams } from "next/navigation";

export default function TypeBadge({ type, size = "sm" }: { type: string; size?: "sm" | "md" | "lg" }) {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const sizeClasses = size === "lg" ? "px-4 py-1.5 text-sm" : size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`${getTypeClass(type)} text-white font-black uppercase border-2 border-black/20
                  tracking-widest inline-block ${sizeClasses} transition-transform hover:scale-105`}
    >
      {translateType(type, lang)}
    </span>
  );
}
