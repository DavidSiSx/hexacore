"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getAllAbilities, type AbilityResult } from "@/app/actions/encyclopedia";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { BrutalistEntryCard } from "@/app/components/Shared/BrutalistEntryCard";
import { Search, Sparkles } from "lucide-react";

export default function AbilitiesList({ 
  lang, 
  initialData 
}: { 
  lang: string; 
  initialData: { abilities: AbilityResult[]; total: number } 
}) {
  const isEs = lang === "es";
  const [query, setQuery] = useState("");
  const [abilities, setAbilities] = useState<AbilityResult[]>(initialData.abilities);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialData.total);
  const [loading, setLoading] = useState(false);
  const { activeTheme } = useTheme();
  const isFirstMount = useRef(true);

  // Efecto con debounce para evitar race conditions y manejar reset de estado
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    let isMounted = true;

    const handler = setTimeout(async () => {
      const isInitial = page === 1 && query === "";
      if (isInitial) {
        setAbilities(initialData.abilities);
        setTotal(initialData.total);
        setLoading(false);
        return;
      }

      setLoading(true);
      const r = await getAllAbilities(page, 60, { searchQuery: query, lang });
      if (isMounted) {
        setAbilities(r.abilities); 
        setTotal(r.total);
        setLoading(false);
      }
    }, query ? 400 : 0);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [query, page, lang, initialData]);

  const totalPages = Math.ceil(total / 60);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-8 h-8 text-zinc-600" />
        </div>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={isEs ? "BUSCAR HABILIDAD..." : "SEARCH ABILITY..."}
          className={`w-full h-16 md:h-20 pl-16 pr-6 bg-black border-4 ${activeTheme.borderClass} text-white text-lg md:text-2xl font-black uppercase tracking-tighter placeholder:text-zinc-700 focus:outline-none focus:bg-zinc-950 transition-colors`} 
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`h-24 bg-black/40 border-4 ${activeTheme.borderClass} animate-pulse`} />
          ))}
        </div>
      ) : abilities.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 border-4 border-dashed ${activeTheme.borderClass} text-center p-6`}>
          <Sparkles className={`w-12 h-12 mb-4 ${activeTheme.accentClass}`} />
          <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-500">
            {isEs ? "NINGUNA HABILIDAD COINCIDE" : "NO ABILITIES MATCH"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {abilities.map((ability) => {
            const desc = isEs 
              ? ((ability.descripciones as any)?.es || (ability.descripciones as any)?.en || "Sin descripción disponible.")
              : ((ability.descripciones as any)?.en || (ability.descripciones as any)?.es || "No description available.");

            const abilityTitle = isEs && ability.nombres?.es ? ability.nombres.es : ability.nombre;

            return (
              <BrutalistEntryCard
                key={ability.id}
                title={abilityTitle}
                description={desc}
                lang={lang}
                isAbility={true}
                href={`/${lang}/pokedex/abilities/${ability.slug}`}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-4 py-2 border-4 ${activeTheme.borderClass} font-black uppercase disabled:opacity-20`}>
            ← {isEs ? "ANT" : "PREV"}
          </button>
          <span className="font-black">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-4 py-2 border-4 ${activeTheme.borderClass} font-black uppercase disabled:opacity-20`}>
            {isEs ? "SIG" : "NEXT"} →
          </button>
        </div>
      )}
    </div>
  );
}
