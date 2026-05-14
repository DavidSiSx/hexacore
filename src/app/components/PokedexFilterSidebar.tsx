"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { KineticInput } from "@/app/components/Primitives/KineticInput";
import { KineticButton } from "@/app/components/Primitives/KineticButton";
import { POKEMON_TYPES } from "@/lib/pokemon";

interface FilterProps {
  lang: string;
  dict: any;
  filters: any;
  setFilters: (fn: (prev: any) => any) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  Normal: "Normal", Fire: "Fuego", Water: "Agua", Grass: "Planta", Electric: "Eléctrico",
  Ice: "Hielo", Fighting: "Lucha", Poison: "Veneno", Ground: "Tierra", Flying: "Volador",
  Psychic: "Psíquico", Bug: "Bicho", Rock: "Roca", Ghost: "Fantasma", Dragon: "Dragón",
  Dark: "Siniestro", Steel: "Acero", Fairy: "Hada"
};

const TAG_TRANSLATIONS: Record<string, string> = {
  legendary: "Legendario", mythical: "Mítico", ultra_beast: "Ultraente",
  paradox: "Paradoja", mega: "Mega", gigantamax: "Gigamax", fully_evolved: "Evolución Final"
};

export function PokedexFilterSidebar({ lang, dict, filters, setFilters, clearFilters, hasFilters }: FilterProps) {
  const [mode, setMode] = useState<"normal" | "advanced">("normal");

  const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const TAGS = [
    { value: "legendary",   label: "LEGENDARY" },
    { value: "mythical",    label: "MYTHICAL" },
    { value: "ultra_beast", label: "ULTRA BEAST" },
    { value: "paradox",     label: "PARADOX" },
    { value: "mega",        label: "MEGA" },
    { value: "gigantamax",  label: "GMAX" },
    { value: "fully_evolved", label: "FULLY EVOLVED" },
  ];
  const STATS = ["hp", "atk", "def", "spa", "spd", "spe", "bst"];

  function updateFilter(key: string, value: any) {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  }

  function updateStatFilter(stat: string, minMax: 'min' | 'max', value: string) {
    const val = value ? Number(value) : undefined;
    setFilters((prev: any) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: { ...prev.stats?.[stat], [minMax]: val }
      }
    }));
  }

  function toggleType(type: string) {
    setFilters((prev: any) => {
      const current = prev.types?.values || [];
      const isSelected = current.includes(type);
      const newValues = isSelected ? current.filter((t: string) => t !== type) : [...current, type];
      return { ...prev, types: { logic: prev.types?.logic || "AND", values: newValues } };
    });
  }

  return (
    <aside className="w-80 shrink-0 border-l-4 border-zinc-700 bg-zinc-950 flex flex-col h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b-4 border-zinc-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            <Filter strokeWidth={3} /> {dict.filters?.title || (lang === "es" ? "FILTROS" : "FILTERS")}
          </h2>
          {hasFilters && (
            <button onClick={clearFilters} className="text-red-500 hover:bg-red-500 hover:text-black font-black uppercase text-xs p-1 px-2 transition-none border-2 border-transparent hover:border-black">
              {lang === "es" ? "LIMPIAR" : "CLEAR"}
            </button>
          )}
        </div>
        
        {/* Mode Toggle */}
        <div className="flex border-2 border-zinc-700">
          <button 
            onClick={() => setMode("normal")}
            className={`flex-1 py-2 text-xs font-black uppercase transition-none ${mode === "normal" ? "bg-[#DFE104] text-black" : "text-zinc-500 hover:text-white"}`}
          >
            NORMAL
          </button>
          <button 
            onClick={() => setMode("advanced")}
            className={`flex-1 py-2 text-xs font-black uppercase transition-none border-l-2 border-zinc-700 ${mode === "advanced" ? "bg-[#DFE104] text-black" : "text-zinc-500 hover:text-white"}`}
          >
            {lang === "es" ? "AVANZADO" : "ADVANCED"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8">
        
        {/* NORMAL MODE: Types & Basics */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">{dict.filters?.types || (lang === "es" ? "TIPOS" : "TYPES")}</h3>
          
          {mode === "advanced" && (
             <div className="flex gap-2 mb-2">
                <button onClick={() => updateFilter("types", { ...filters.types, logic: "AND" })} className={`px-2 py-1 text-xs font-black border-2 transition-none ${filters.types?.logic === "AND" || !filters.types?.logic ? "border-[#DFE104] text-[#DFE104]" : "border-zinc-700 text-zinc-500"}`}>AND</button>
                <button onClick={() => updateFilter("types", { ...filters.types, logic: "OR" })} className={`px-2 py-1 text-xs font-black border-2 transition-none ${filters.types?.logic === "OR" ? "border-[#DFE104] text-[#DFE104]" : "border-zinc-700 text-zinc-500"}`}>OR</button>
             </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {POKEMON_TYPES.map(t => {
              const selected = filters.types?.values?.includes(t);
              const displayType = lang === "es" ? TYPE_TRANSLATIONS[t] || t : t;
              return (
                <button 
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`py-2 text-[10px] font-black uppercase tracking-tighter border-2 transition-none truncate px-1 ${selected ? "border-[#DFE104] bg-[#DFE104] text-black" : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"}`}
                >
                  {displayType}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">{dict.filters?.categories || (lang === "es" ? "CATEGORÍAS" : "CATEGORY")}</h3>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => {
              const selected = filters.tags?.includes(t.value);
              const displayTag = lang === "es" ? TAG_TRANSLATIONS[t.value] || t.label : t.label;
              return (
                <button 
                  key={t.value}
                  onClick={() => {
                    const current = filters.tags || [];
                    const newValues = selected ? current.filter((x: string) => x !== t.value) : [...current, t.value];
                    updateFilter("tags", newValues);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-none ${selected ? "border-white bg-white text-black" : "border-zinc-800 text-zinc-400 hover:border-zinc-500"}`}
                >
                  {displayTag}
                </button>
              )
            })}
          </div>
        </div>

        {/* ADVANCED MODE ONLY */}
        {mode === "advanced" && (
          <>
            {/* Stats */}
            <div className="flex flex-col gap-4">
               <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">{lang === "es" ? "ESTADÍSTICAS" : "STAT THRESHOLDS"}</h3>
              {STATS.map(stat => {
                const minVal = filters.stats?.[stat]?.min || "";
                const maxVal = filters.stats?.[stat]?.max || "";
                const isSpeHighlighted = stat === "spe" && Number(minVal) > 100;
                return (
                  <div key={stat} className={`flex items-center gap-2 p-2 border-2 ${isSpeHighlighted ? 'border-[#DFE104] bg-[#DFE104]/10' : 'border-zinc-800'}`}>
                    <span className={`w-10 text-xs font-black uppercase ${isSpeHighlighted ? 'text-[#DFE104]' : 'text-zinc-400'}`}>{stat}</span>
                    <input 
                      type="number" placeholder="Min" value={minVal}
                      onChange={e => updateStatFilter(stat, 'min', e.target.value)}
                      className={`w-16 bg-transparent border-b-2 text-center text-xs font-bold focus:outline-none transition-none ${isSpeHighlighted ? 'border-[#DFE104] text-[#DFE104]' : 'border-zinc-700 text-white focus:border-white'}`} 
                    />
                    <span className="text-zinc-600">-</span>
                    <input 
                      type="number" placeholder="Max" value={maxVal}
                      onChange={e => updateStatFilter(stat, 'max', e.target.value)}
                      className="w-16 bg-transparent border-b-2 border-zinc-700 text-center text-xs font-bold text-white focus:outline-none focus:border-white transition-none" 
                    />
                  </div>
                )
              })}
            </div>

            {/* Competitive Logic */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">{lang === "es" ? "FORMATO Y ORIGEN" : "FORMAT & ORIGIN"}</h3>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 flex items-center justify-center border-2 transition-none ${filters.showGimmicks ? 'border-[#DFE104] bg-[#DFE104]' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                  {filters.showGimmicks && <div className="w-2.5 h-2.5 bg-black" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">
                  {lang === "es" ? "MOSTRAR GIMMICKS (MEGAS/GMAX)" : "SHOW GIMMICKS (MEGAS)"}
                </span>
              </label>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
