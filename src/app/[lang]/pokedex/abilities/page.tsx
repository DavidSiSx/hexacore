"use client";

import { useState, useEffect, useCallback } from "react";
import { searchAbilities, getAllAbilities, type AbilityResult } from "@/app/actions/encyclopedia";
import Link from "next/link";
import { useLang } from "@/lib/lang";

export default function AbilitiesPage() {
  const { t } = useLang();
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
  const totalPages = Math.ceil(total / 60);

  return (
    <div className="flex flex-col px-4 py-6 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          ✨ {t("Habilidades", "Abilities")}
        </span>
      </h1>

      <div className="w-full max-w-xs mb-5">
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={t("Buscar habilidad... (ej. Intimidate)", "Search ability... (e.g. Intimidate)")}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2
                     text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors
                     placeholder:text-[var(--text-muted)]" />
      </div>

      <p className="text-[10px] text-[var(--text-muted)] mb-3 uppercase tracking-wider">
        {total.toLocaleString()} {t("resultados", "results")}
      </p>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-purple-500 animate-spin-slow" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {abilities.map((a) => (
            <Link key={a.id} href={`/pokedex/abilities/${encodeURIComponent(a.nombre)}`}
              className="glass-card p-3.5 group">
              <h3 className="text-sm font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors mb-0.5">
                {a.nombre}
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{a.descripcion}</p>
            </Link>
          ))}
        </div>
      )}

      {!query && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                       hover:text-white disabled:opacity-30 transition-colors">← {t("Anterior", "Prev")}</button>
          <span className="text-xs text-[var(--text-muted)]">{page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                       hover:text-white disabled:opacity-30 transition-colors">{t("Siguiente", "Next")} →</button>
        </div>
      )}
    </div>
  );
}
