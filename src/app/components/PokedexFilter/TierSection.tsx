"use client";

import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { FilterProps } from "./FilterTypes";
import { PokemonFilters } from "@/app/actions/pokedex";

const TIERS_LIST = ["OU", "UU", "RU", "NU", "PU", "Uber", "LC", "Cap"];

export function TierSection({ lang, filters, setFilters }: FilterProps) {
  const { activeTheme } = useTheme();

  const toggleTier = (tier: string) => {
    setFilters((prev: PokemonFilters) => {
      const current = prev.tiers || [];
      const newValues = current.includes(tier) ? current.filter(t => t !== tier) : [...current, tier];
      return { ...prev, tiers: newValues };
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
        {lang === "es" ? "TIERS SHOWDOWN" : "SHOWDOWN TIERS"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {TIERS_LIST.map(tier => (
          <button
            key={tier}
            onClick={() => toggleTier(tier)}
            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border-2 transition-none ${filters.tiers?.includes(tier) ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : `border-zinc-800/40 text-zinc-500 hover:border-zinc-500 hover:${activeTheme.textMainClass} bg-transparent`}`}
          >
            {tier}
          </button>
        ))}
      </div>
    </div>
  );
}
