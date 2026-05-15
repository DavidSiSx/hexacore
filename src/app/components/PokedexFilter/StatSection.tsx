"use client";

import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { FilterProps } from "./FilterTypes";
import { PokemonFilters } from "@/app/actions/pokedex";

const STATS_LIST = ["hp", "atk", "def", "spa", "spd", "spe", "bst"];

type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe" | "bst";

export function StatSection({ lang, filters, setFilters }: FilterProps) {
  const { activeTheme } = useTheme();

  const updateStat = (stat: string, minMax: 'min' | 'max', value: string) => {
    const numericValue = value ? Number(value) : undefined;
    setFilters((prev: PokemonFilters) => ({
      ...prev,
      stats: { 
        ...prev.stats, 
        [stat]: { 
          ...prev.stats?.[stat as keyof NonNullable<typeof prev.stats>], 
          [minMax]: numericValue 
        } 
      }
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
        {lang === "es" ? "ESTADÍSTICAS" : "STATS"}
      </h3>
      {STATS_LIST.map(statKey => (
        <div key={statKey} className="flex items-center gap-2 p-2 border-2 border-zinc-800/40">
          <span className="w-10 text-xs font-black uppercase text-zinc-400">{statKey}</span>
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.stats?.[statKey as StatKey]?.min || ""}
            onChange={e => updateStat(statKey, 'min', e.target.value)}
            className={`w-16 bg-transparent border-b-2 border-zinc-800 text-center text-xs font-bold ${activeTheme.textMainClass} focus:outline-none focus:border-white transition-none`} 
          />
          <span className="text-zinc-600">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.stats?.[statKey as StatKey]?.max || ""}
            onChange={e => updateStat(statKey, 'max', e.target.value)}
            className={`w-16 bg-transparent border-b-2 border-zinc-800 text-center text-xs font-bold ${activeTheme.textMainClass} focus:outline-none focus:border-white transition-none`} 
          />
        </div>
      ))}
    </div>
  );
}
