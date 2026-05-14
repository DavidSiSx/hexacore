"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllPokemon, type PokemonSearchResult, type PokemonFilters } from "@/app/actions/pokedex";
import { PokemonCard } from "@/app/components/PokemonCard";
import { KineticInput } from "@/app/components/Primitives/KineticInput";
import { BrutalistSkeleton } from "@/app/components/Primitives/BrutalistSkeleton";
import { PokedexFilterSidebar } from "@/app/components/PokedexFilterSidebar";

export default function PokemonGridClient({ lang, dict }: { lang: string; dict: any }) {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<PokemonSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<PokemonFilters>({
    lang: lang,
    showGimmicks: false,
  });

  const loadPokemon = useCallback(async () => {
    setLoading(true);
    const activeFilters = { ...filters, searchQuery: query };
    const data = await getAllPokemon(page, 48, activeFilters);
    setPokemon(data.pokemon); 
    setTotal(data.total);
    setLoading(false);
  }, [query, page, filters]);

  useEffect(() => { loadPokemon(); }, [loadPokemon]);

  function clearFilters() {
    setFilters({ lang: lang, showGimmicks: false });
    setPage(1);
  }

  const hasFilters = Object.keys(filters).some(k => k !== 'lang' && k !== 'showGimmicks' && (filters as any)[k]);

  return (
    <div className="flex w-full min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-7xl">
        
        {/* Search Bar Colosal de 96px */}
        <div className="w-full mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={dict.search?.placeholder || "NAME OR ID..."}
            className="w-full h-24 bg-zinc-950 border-4 border-zinc-700 text-white text-5xl font-black uppercase tracking-tighter px-6 placeholder:text-zinc-800 focus:outline-none focus:border-[#DFE104] focus:text-[#DFE104] transition-colors"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <BrutalistSkeleton key={i} className="w-full h-48" />
            ))}
          </div>
        ) : pokemon.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-4 border-dashed border-zinc-800">
            <h2 className="text-6xl font-black uppercase tracking-tighter text-zinc-800">404</h2>
            <p className="text-xl font-black uppercase tracking-widest text-zinc-600 mt-4">NO POKÉMON FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            {pokemon.map((p, idx) => (
              <PokemonCard key={p.id} pokemon={p} index={(page - 1) * 48 + idx} lang={lang} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 48 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 border-4 border-zinc-700 text-white font-black uppercase hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-none"
            >
              PREV
            </button>
            <span className="text-xl font-black text-zinc-500">
              {page} <span className="text-zinc-700">/</span> {Math.ceil(total / 48)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 48)}
              className="px-6 py-3 border-4 border-zinc-700 text-white font-black uppercase hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-none"
            >
              NEXT
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Sidebar */}
      <PokedexFilterSidebar 
        lang={lang} 
        dict={dict} 
        filters={filters} 
        setFilters={setFilters} 
        clearFilters={clearFilters} 
        hasFilters={hasFilters} 
      />
    </div>
  );
}

