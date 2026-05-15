"use client";

import { ArrowUpDown } from "lucide-react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { FilterProps } from "./FilterTypes";

const SORT_OPTIONS = [
  { value: "num", labelEn: "Pokedex ID", labelEs: "ID Pokedex" },
  { value: "nombre", labelEn: "Name (A-Z)", labelEs: "Nombre (A-Z)" },
  { value: "bst", labelEn: "Base Stat Total", labelEs: "Total Base (BST)" },
  { value: "atk", labelEn: "Attack Stat", labelEs: "Ataque Base" },
  { value: "spa", labelEn: "Sp. Attack", labelEs: "Atq. Especial" },
  { value: "spe", labelEn: "Speed Stat", labelEs: "Velocidad Base" },
  { value: "hp", labelEn: "HP Stat", labelEs: "Salud (PS)" },
  { value: "def", labelEn: "Defense Stat", labelEs: "Defensa Base" },
];

export function SortSection({ lang, sortBy, setSortBy, sortOrder, setSortOrder }: FilterProps) {
  const { activeTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4" /> {lang === "es" ? "ORDENAR POR" : "SORT BY"}
        </h3>
        <button 
          onClick={() => setSortOrder?.(sortOrder === "asc" ? "desc" : "asc")}
          className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 ${activeTheme.borderClass} ${activeTheme.accentClass} hover:bg-[var(--accent)] hover:text-[var(--background)] transition-none`}
        >
          {(sortOrder || "asc").toUpperCase()}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SORT_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setSortBy?.(option.value)}
            className={`py-2 text-[10px] font-black uppercase tracking-tighter border-2 transition-none truncate px-1 text-center ${sortBy === option.value ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : `border-zinc-800/40 text-zinc-500 hover:border-zinc-500 hover:${activeTheme.textMainClass} bg-transparent`}`}
          >
            {lang === "es" ? option.labelEs : option.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
}
