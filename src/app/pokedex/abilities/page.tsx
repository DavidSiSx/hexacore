"use client";

import { useState, useEffect, useCallback } from "react";
import { searchAbilities, getAllAbilities, type AbilityResult } from "@/app/actions/encyclopedia";
import Link from "next/link";

export default function AbilitiesPage() {
  const [query, setQuery] = useState("");
  const [abilities, setAbilities] = useState<AbilityResult[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (query.trim().length >= 2) {
      const r = await searchAbilities(query);
      setAbilities(r); setTotal(r.length);
    } else {
      const r = await getAllAbilities(page, 60);
      setAbilities(r.abilities); setTotal(r.total);
    }
    setLoading(false);
  }, [query, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">✨ Habilidades</span>
      </h1>

      <div className="w-full max-w-md mb-8">
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Buscar habilidad... (ej. Intimidate, Levitate)"
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                     text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-[var(--text-muted)]" />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-purple-500 animate-spin-slow" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full stagger-children">
          {abilities.map((a) => (
            <Link key={a.id} href={`/pokedex/abilities/${encodeURIComponent(a.nombre)}`}
              className="glass-card p-4 group">
              <h3 className="text-sm font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors mb-1">
                {a.nombre}
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{a.descripcion}</p>
            </Link>
          ))}
        </div>
      )}

      {!query && Math.ceil(total / 60) > 1 && (
        <div className="flex items-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-white disabled:opacity-30 transition-colors">← Anterior</button>
          <span className="text-xs text-[var(--text-muted)]">{page} / {Math.ceil(total / 60)}</span>
          <button onClick={() => setPage(Math.min(Math.ceil(total / 60), page + 1))} disabled={page === Math.ceil(total / 60)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-white disabled:opacity-30 transition-colors">Siguiente →</button>
        </div>
      )}
    </div>
  );
}
