"use client";

import { POKEMON_TYPES, translateType } from "@/lib/pokemon";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { FilterProps } from "./FilterTypes";
import { PokemonFilters } from "@/app/actions/pokedex";

export function TypeSection({ lang, dictionary, filters, setFilters, mode }: FilterProps) {
  const { activeTheme } = useTheme();
  
  const toggleType = (type: string) => {
    setFilters((prev: PokemonFilters) => {
      const current = prev.types?.values || [];
      const newValues = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
      return { ...prev, types: { logic: prev.types?.logic || "AND", values: newValues } };
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
        {dictionary?.filters?.types || (lang === "es" ? "TIPOS" : "TYPES")}
      </h3>
      {mode === "advanced" && (
        <div className="flex gap-2 mb-2">
          {["AND", "OR"].map(logic => (
            <button 
              key={logic}
              onClick={() => setFilters((prev: PokemonFilters) => ({ ...prev, types: { ...prev.types, logic: logic as "AND" | "OR" } }))}
              className={`px-2 py-1 text-xs font-black border-2 transition-none ${(filters.types?.logic || "AND") === logic ? `${activeTheme.borderClass} ${activeTheme.accentClass}` : "border-zinc-800 text-zinc-600"}`}
            >
              {logic}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {POKEMON_TYPES.map(typeKey => (
          <button 
            key={typeKey}
            onClick={() => toggleType(typeKey)}
            className={`py-2 text-[10px] font-black uppercase tracking-tighter border-2 transition-none truncate px-1 ${filters.types?.values?.includes(typeKey) ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : `border-zinc-800/40 text-zinc-500 hover:border-zinc-500 hover:${activeTheme.textMainClass} bg-transparent`}`}
          >
            {translateType(typeKey, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}
