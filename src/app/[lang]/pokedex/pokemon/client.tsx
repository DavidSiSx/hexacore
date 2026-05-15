"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllPokemon, type PokemonSearchResult, type PokemonFilters } from "@/app/actions/pokedex";
import { PokemonCard } from "@/app/components/PokemonCard";
import { BrutalistSkeleton } from "@/app/components/Primitives/BrutalistSkeleton";
import { PokedexFilterSidebar } from "@/app/components/PokedexFilterSidebar";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

export default function PokemonGridClient({ 
  lang, 
  dict, 
  initialData 
}: { 
  lang: string; 
  dict: any; 
  initialData: { pokemon: PokemonSearchResult[]; total: number } 
}) {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<PokemonSearchResult[]>(initialData.pokemon);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { activeTheme } = useTheme();

  // Estados avanzados de ordenamiento (Soporta al menos 6 formas de ordenar)
  const [sortBy, setSortBy] = useState<string>("num");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFiltersState] = useState<PokemonFilters>({
    lang: lang,
  });

  // Interceptor inteligente de filtros para resetear siempre la paginación a la página 1 cuando cambian
  const setFilters = useCallback((updater: any) => {
    setFiltersState(prev => {
      const updated = typeof updater === "function" ? updater(prev) : updater;
      return updated;
    });
    setPage(1); // Regresar a la página 1 garantizado al aplicar cualquier filtro
  }, []);
  const hasFilters = Object.keys(filters).some(k => k !== 'lang' && (filters as any)[k]);

  // Efecto para manejar la carga de datos con debounce y protección contra race conditions
  useEffect(() => {
    let isMounted = true;
    
    const handler = setTimeout(async () => {
      // Si volvemos al estado inicial puro, restauramos los datos de SSR sin disparar otra petición
      const isInitial = page === 1 && query === "" && !hasFilters && sortBy === "num" && sortOrder === "asc";
      
      if (isInitial) {
        setPokemon(initialData.pokemon);
        setTotal(initialData.total);
        setLoading(false);
        return;
      }

      setLoading(true);
      const activeFilters = { ...filters, searchQuery: query };
      const data = await getAllPokemon(page, 48, activeFilters, sortBy, sortOrder);
      
      if (isMounted) {
        setPokemon(data.pokemon); 
        setTotal(data.total);
        setLoading(false);
      }
    }, query ? 400 : 0); // Debounce de 400ms solo si hay búsqueda activa

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [query, page, filters, sortBy, sortOrder, hasFilters, initialData]);

  function clearFilters() {
    setFiltersState({ lang: lang });
    setPage(1);
  }


  return (
    <div className="flex w-full min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-7xl min-w-0">
        
        {/* Search Bar Colosal Tematizada */}
        <div className="w-full mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={dict.search?.placeholder || "NAME OR ID..."}
            className={`w-full h-16 sm:h-20 md:h-24 ${activeTheme.cardBgClass} border-4 ${activeTheme.borderClass} ${activeTheme.textMainClass} text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter px-4 sm:px-6 placeholder:${activeTheme.textMutedClass} focus:outline-none focus:bg-[var(--accent)] focus:text-[var(--background)] transition-colors`}
          />
        </div>

        {/* Grid Adaptable Premium */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <BrutalistSkeleton key={i} className={`w-full h-48 border-4 ${activeTheme.borderClass}`} />
            ))}
          </div>
        ) : pokemon.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 border-4 border-dashed ${activeTheme.borderClass} text-center px-4 bg-black/40`}>
            <h2 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter ${activeTheme.accentClass}`}>404</h2>
            <p className="text-base sm:text-xl font-black uppercase tracking-widest text-zinc-500 mt-4">NO POKÉMON FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
            {(pokemon || []).map((p, idx) => (
              <PokemonCard key={p.id} pokemon={p} index={(page - 1) * 48 + idx} lang={lang} activeTier={filters.tiers?.[0]} />
            ))}
          </div>
        )}

        {/* Paginación Cinética Tematizada */}
        {total > 48 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-6 py-3 border-4 ${activeTheme.borderClass} font-black uppercase hover:bg-[var(--accent)] hover:text-[var(--background)] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[var(--foreground)] transition-none`}
            >
              {dict.pagination?.prev || "PREV"}
            </button>
            <span className={`text-xl font-black ${activeTheme.textMutedClass}`}>
              {page} <span className="text-zinc-700">/</span> {Math.ceil(total / 48)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 48)}
              className={`px-6 py-3 border-4 ${activeTheme.borderClass} font-black uppercase hover:bg-[var(--accent)] hover:text-[var(--background)] disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-[var(--foreground)] transition-none`}
            >
              {dict.pagination?.next || "NEXT"}
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Sidebar Tematizado */}
      <PokedexFilterSidebar 
        lang={lang} 
        dictionary={dict} 
        filters={filters} 
        setFilters={setFilters} 
        clearFilters={clearFilters} 
        hasFilters={hasFilters}
        sortBy={sortBy}
        setSortBy={(s) => { setSortBy(s); setPage(1); }}
        sortOrder={sortOrder}
        setSortOrder={(o) => { setSortOrder(o); setPage(1); }}
      />
    </div>
  );
}
