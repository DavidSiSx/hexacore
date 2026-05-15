"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { FilterProps } from "./PokedexFilter/FilterTypes";
import { ModeButton } from "./PokedexFilter/ModeButton";
import { SortSection } from "./PokedexFilter/SortSection";
import { TypeSection } from "./PokedexFilter/TypeSection";
import { TierSection } from "./PokedexFilter/TierSection";
import { TagSection } from "./PokedexFilter/TagSection";
import { StatSection } from "./PokedexFilter/StatSection";

/**
 * PokedexFilterSidebar: Orquestador de filtros avanzados.
 * Refactorizado modularmente para cumplir con los estándares de GGA
 * (Responsabilidad Única y desestructuración de props en la firma).
 */
export function PokedexFilterSidebar({ 
  lang, 
  dictionary, 
  hasFilters, 
  clearFilters, 
  ...otherProps 
}: FilterProps) {
  const [mode, setMode] = useState<"normal" | "advanced">("normal");
  const { activeTheme, currentTheme } = useTheme();
  
  // Re-empaquetamos para pasar a los subcomponentes de forma controlada
  const sectionProps = { lang, dictionary, hasFilters, clearFilters, ...otherProps };

  return (
    <aside className={`w-80 shrink-0 border-l-4 ${activeTheme.borderClass} ${activeTheme.bgClass} flex flex-col h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-colors`}>
      {/* Header Tematizado */}
      <div className={`p-6 border-b-4 ${activeTheme.borderClass} flex flex-col gap-4 ${currentTheme === 'quartz' ? 'bg-zinc-200/50' : 'bg-black/40'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-black uppercase tracking-tighter flex items-center gap-2 ${activeTheme.accentClass}`}>
            <Filter strokeWidth={3} className="w-5 h-5" /> {dictionary.filters?.title || (lang === "es" ? "FILTROS" : "FILTERS")}
          </h2>
          {hasFilters && (
            <button onClick={clearFilters} className="text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-xs p-1 px-2 transition-none border-2 border-transparent hover:border-[var(--border)]">
              {lang === "es" ? "LIMPIAR" : "CLEAR"}
            </button>
          )}
        </div>
        
        {/* Mode Toggle Tematizado */}
        <div className={`flex border-2 ${activeTheme.borderClass}`}>
          <ModeButton 
            active={mode === "normal"} 
            onClick={() => setMode("normal")} 
            label="NORMAL" 
          />
          <ModeButton 
            active={mode === "advanced"} 
            onClick={() => setMode("advanced")} 
            label={lang === "es" ? "AVANZADO" : "ADVANCED"} 
            isLast 
          />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8">
        <SortSection {...sectionProps} />
        <TypeSection {...sectionProps} mode={mode} />
        <TierSection {...sectionProps} />
        <TagSection {...sectionProps} />
        {mode === "advanced" && <StatSection {...sectionProps} />}
      </div>
    </aside>
  );
}
