"use client";

import { useState, useEffect, useCallback } from "react";
import { searchItems, getAllItems, type ItemResult } from "@/app/actions/encyclopedia";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { BrutalistEntryCard } from "@/app/components/Shared/BrutalistEntryCard";
import { Search, Sparkles } from "lucide-react";

function getItemSpriteUrl(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://play.pokemonshowdown.com/sprites/itemicons/${cleaned}.png`;
}

export default function ItemsList({ 
  lang, 
  initialData 
}: { 
  lang: string; 
  initialData: { items: ItemResult[]; total: number } 
}) {
  const isEs = lang === "es";
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ItemResult[]>(initialData.items);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialData.total);
  const [loading, setLoading] = useState(false);
  const { activeTheme } = useTheme();

  // Efecto con debounce y protección contra race conditions
  useEffect(() => {
    let isMounted = true;

    const handler = setTimeout(async () => {
      const isInitial = page === 1 && query === "";
      if (isInitial) {
        setItems(initialData.items);
        setTotal(initialData.total);
        setLoading(false);
        return;
      }

      setLoading(true);
      const r = await getAllItems(page, 60, { searchQuery: query, lang });
      if (isMounted) {
        setItems(r.items); 
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
      {/* Barra de Búsqueda Colosal Dinámica */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-8 h-8 text-zinc-600" />
        </div>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={isEs ? "BUSCAR OBJETO... (EJ. LEFTOVERS, CHOICE BAND)" : "SEARCH ITEM... (E.G. LEFTOVERS, CHOICE BAND)"}
          className={`w-full h-16 md:h-20 pl-16 pr-6 bg-black border-4 ${activeTheme.borderClass} text-white text-lg md:text-2xl font-black uppercase tracking-tighter placeholder:text-zinc-700 focus:outline-none focus:bg-zinc-950 transition-colors`} 
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <span className={`text-[10px] font-black px-2 py-1 bg-zinc-900 border ${activeTheme.borderClass} ${activeTheme.accentClass}`}>
            {total.toLocaleString()} {isEs ? "RESULTADOS" : "FOUND"}
          </span>
        </div>
      </div>

      {/* Grid Brutalista Unificado Consistente */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`h-24 bg-black/40 border-4 ${activeTheme.borderClass} animate-pulse`} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 border-4 border-dashed ${activeTheme.borderClass} text-center p-6`}>
          <Sparkles className={`w-12 h-12 mb-4 ${activeTheme.accentClass}`} />
          <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-500">
            {isEs ? "NINGÚN OBJETO COINCIDE CON LA BÚSQUEDA" : "NO ITEMS MATCH YOUR QUERY"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {items.map((item) => {
            const desc = isEs 
              ? ((item.descripciones as any)?.es || (item.descripciones as any)?.en || "Sin descripción disponible.")
              : ((item.descripciones as any)?.en || (item.descripciones as any)?.es || "No description available.");

            const sprite = item.sprite_url || getItemSpriteUrl(item.nombre);
            const itemTitle = isEs && item.nombres?.es ? item.nombres.es : item.nombre;

            return (
              <BrutalistEntryCard
                key={item.id}
                title={itemTitle}
                description={desc}
                lang={lang}
                isItem={true}
                spriteUrl={sprite}
                href={`/${lang}/pokedex/items/${item.slug}`}
              />
            );
          })}
        </div>
      )}

      {/* Paginación Cinética */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className={`px-4 py-2 border-4 ${activeTheme.borderClass} font-black text-xs uppercase disabled:opacity-20 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-none`}
          >
            ← {isEs ? "ANT" : "PREV"}
          </button>
          <span className={`text-sm font-black ${activeTheme.textMutedClass}`}>
            {page} / {totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            className={`px-4 py-2 border-4 ${activeTheme.borderClass} font-black text-xs uppercase disabled:opacity-20 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-none`}
          >
            {isEs ? "SIG" : "NEXT"} →
          </button>
        </div>
      )}
    </div>
  );
}
