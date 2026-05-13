"use client";

import { useState, useEffect, useCallback } from "react";
import { searchPokemon, getAllPokemon, type PokemonSearchResult } from "@/app/actions/pokedex";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";

export default function PokemonGrid() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<PokemonSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadPokemon = useCallback(async () => {
    setLoading(true);
    if (query.trim().length >= 2) {
      const results = await searchPokemon(query, 60);
      setPokemon(results);
      setTotal(results.length);
    } else {
      const data = await getAllPokemon(page, 48);
      setPokemon(data.pokemon);
      setTotal(data.total);
    }
    setLoading(false);
  }, [query, page]);

  useEffect(() => { loadPokemon(); }, [loadPokemon]);

  const totalPages = Math.ceil(total / 48);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          🔴 Pokémon
        </span>
      </h1>

      {/* Search */}
      <div className="w-full max-w-md mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Buscar Pokémon... (ej. Charizard, Garchomp)"
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                     text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors
                     placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-[var(--accent-primary)] animate-spin-slow" />
          <span className="text-[var(--text-muted)] text-sm">Cargando...</span>
        </div>
      ) : pokemon.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm py-16">No se encontraron Pokémon.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full stagger-children">
            {pokemon.map((p) => (
              <Link
                key={p.id}
                href={`/pokedex/pokemon/${encodeURIComponent(p.nombre)}`}
                className="glass-card p-3 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <SpriteImg
                  species={p.nombre}
                  width={64}
                  height={64}
                  className="group-hover:scale-110 transition-transform drop-shadow-md"
                />
                <p className="text-xs font-semibold text-white text-center truncate w-full">{p.nombre}</p>
                <div className="flex gap-1 flex-wrap justify-center">
                  {p.tipos.map((t: string) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{p.tier}</span>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {!query && totalPages > 1 && (
            <div className="flex items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                           hover:text-white hover:border-[var(--border-active)] disabled:opacity-30 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                           hover:text-white hover:border-[var(--border-active)] disabled:opacity-30 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
