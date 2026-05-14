"use client";

import { useState, useEffect, useCallback } from "react";
import { searchItems, getAllItems, type ItemResult } from "@/app/actions/encyclopedia";
import Link from "next/link";
import { useLang } from "@/lib/lang";

function getItemSpriteUrl(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/ /g, "");
  return `https://play.pokemonshowdown.com/sprites/itemicons/${cleaned}.png`;
}

export default function ItemsPage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ItemResult[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (query.trim().length >= 2) {
      const r = await searchItems(query);
      setItems(r); setTotal(r.length);
    } else {
      const r = await getAllItems(page, 60);
      setItems(r.items); setTotal(r.total);
    }
    setLoading(false);
  }, [query, page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.ceil(total / 60);

  return (
    <div className="flex flex-col px-4 py-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🎒 {t("Objetos", "Items")}
        </span>
      </h1>

      <div className="w-full max-w-xs mb-5">
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={t("Buscar objeto... (ej. Choice Band)", "Search item... (e.g. Choice Band)")}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2
                     text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors
                     placeholder:text-[var(--text-muted)]" />
      </div>

      <p className="text-[10px] text-[var(--text-muted)] mb-3 uppercase tracking-wider">
        {total.toLocaleString()} {t("resultados", "results")}
      </p>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-amber-500 animate-spin-slow" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm py-16 text-center">
          {t("No se encontraron objetos.", "No items found.")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {items.map((item) => (
            <div key={item.id} className="glass-card p-3 flex items-center gap-3 group">
              <img
                src={item.sprite_url || getItemSpriteUrl(item.nombre)}
                alt={item.nombre}
                width={24} height={24}
                className="object-contain shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white truncate">{item.nombre}</h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-1">{item.descripcion}</p>
              </div>
            </div>
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
