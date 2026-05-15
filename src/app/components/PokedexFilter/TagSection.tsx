"use client";

import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { FilterProps } from "./FilterTypes";
import { PokemonFilters } from "@/app/actions/pokedex";

const TAG_TRANSLATIONS: Record<string, { es: string; en: string }> = {
  legendary: { es: "Legendario", en: "Legendary" },
  mythical: { es: "Mítico", en: "Mythical" },
  ultra_beast: { es: "Ultraente", en: "Ultra Beast" },
  paradox: { es: "Paradoja", en: "Paradox" },
  mega: { es: "Mega", en: "Mega" },
  gigantamax: { es: "Gigamax", en: "Gigantamax" },
  fully_evolved: { es: "Evolución Final", en: "Fully Evolved" }
};

const TAGS = [
  { value: "legendary", label: "LEGENDARY" },
  { value: "mythical", label: "MYTHICAL" },
  { value: "ultra_beast", label: "ULTRA BEAST" },
  { value: "paradox", label: "PARADOX" },
  { value: "mega", label: "MEGA" },
  { value: "gigantamax", label: "GMAX" },
  { value: "fully_evolved", label: "FULLY EVOLVED" },
];

export function TagSection({ lang, dictionary, filters, setFilters }: FilterProps) {
  const { activeTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">
        {dictionary.filters?.categories || (lang === "es" ? "CATEGORÍAS" : "CATEGORY")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {TAGS.map(tagItem => {
          const selected = filters.tags?.includes(tagItem.value);
          const label = lang === "es" 
            ? TAG_TRANSLATIONS[tagItem.value]?.es || tagItem.label 
            : TAG_TRANSLATIONS[tagItem.value]?.en || tagItem.label;
            
          return (
            <button 
              key={tagItem.value}
              onClick={() => setFilters((prev: PokemonFilters) => {
                const currentTags = prev.tags || [];
                const newValues = selected ? currentTags.filter(x => x !== tagItem.value) : [...currentTags, tagItem.value];
                return { ...prev, tags: newValues };
              })}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-none ${selected ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : "border-zinc-800 text-zinc-400 hover:border-zinc-500 bg-transparent"}`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  );
}
