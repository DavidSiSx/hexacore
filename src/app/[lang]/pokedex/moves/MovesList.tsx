"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllMoves, type MoveResult } from "@/app/actions/encyclopedia";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { BrutalistEntryCard } from "@/app/components/Shared/BrutalistEntryCard";
import { Search, Sparkles, Swords } from "lucide-react";

export default function MovesList({ 
  lang, 
  initialData 
}: { 
  lang: string; 
  initialData: { moves: MoveResult[]; total: number } 
}) {
  const isEs = lang === "es";
  const [query, setQuery] = useState("");
  const [moves, setMoves] = useState<MoveResult[]>(initialData.moves);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialData.total);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const { activeTheme } = useTheme();

  // Efecto para manejar la carga con debounce y evitar race conditions
  useEffect(() => {
    let isMounted = true;

    const handler = setTimeout(async () => {
      // Estado inicial puro: restaurar de initialData sin disparar petición
      const isInitial = page === 1 && query === "" && !filterType && !filterCategory;
      
      if (isInitial) {
        setMoves(initialData.moves);
        setTotal(initialData.total);
        setLoading(false);
        return;
      }

      setLoading(true);
      const r = await getAllMoves(page, 60, { 
        searchQuery: query, 
        lang,
        tipo: filterType || undefined,
        categoria: filterCategory || undefined
      });

      if (isMounted) {
        setMoves(r.moves); 
        setTotal(r.total);
        setLoading(false);
      }
    }, query ? 400 : 0);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [query, page, lang, filterType, filterCategory, initialData]);

  const totalPages = Math.ceil(total / 60);

  return (
    <div className="flex flex-col gap-8">
      {/* Barra de Búsqueda Colosal */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={isEs ? "BUSCAR MOVIMIENTO... (EJ. EARTHQUAKE, PROTECT)" : "SEARCH MOVE... (E.G. EARTHQUAKE, PROTECT)"}
            className={`w-full h-16 md:h-20 pl-16 pr-6 bg-black border-4 ${activeTheme.borderClass} text-white text-lg md:text-2xl font-black uppercase tracking-tighter placeholder:text-zinc-700 focus:outline-none focus:bg-zinc-950 transition-colors`} 
          />
        </div>

        {/* Filtros Avanzados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
              {isEs ? "FILTRAR POR TIPO" : "FILTER BY TYPE"}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFilterType(""); setPage(1); }}
                className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-all ${!filterType ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : "border-zinc-800 text-zinc-600 hover:border-zinc-700"}`}
              >
                {isEs ? "TODOS" : "ALL"}
              </button>
              {["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"].map(t => {
                const label = isEs ? (
                  t === "Normal" ? "Normal" : 
                  t === "Fire" ? "Fuego" : 
                  t === "Water" ? "Agua" : 
                  t === "Grass" ? "Planta" : 
                  t === "Electric" ? "Eléctrico" : 
                  t === "Ice" ? "Hielo" : 
                  t === "Fighting" ? "Lucha" : 
                  t === "Poison" ? "Veneno" : 
                  t === "Ground" ? "Tierra" : 
                  t === "Flying" ? "Volador" : 
                  t === "Psychic" ? "Psíquico" : 
                  t === "Bug" ? "Bicho" : 
                  t === "Rock" ? "Roca" : 
                  t === "Ghost" ? "Fantasma" : 
                  t === "Dragon" ? "Dragón" : 
                  t === "Dark" ? "Siniestro" : 
                  t === "Steel" ? "Acero" : 
                  t === "Fairy" ? "Hada" : t
                ) : t;
                return (
                  <button
                    key={t}
                    onClick={() => { setFilterType(t); setPage(1); }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-all ${filterType === t ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : "border-zinc-800 text-zinc-600 hover:border-zinc-700"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
              {isEs ? "CATEGORÍA" : "CATEGORY"}
            </label>
            <div className="flex gap-2">
              {["", "Physical", "Special", "Status"].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilterCategory(cat); setPage(1); }}
                  className={`flex-1 px-3 py-2 text-[10px] font-black uppercase border-2 transition-all ${filterCategory === cat ? `${activeTheme.borderClass} ${activeTheme.badgeBgClass}` : "border-zinc-800 text-zinc-600 hover:border-zinc-700"}`}
                >
                  {cat === "" ? (isEs ? "TODAS" : "ALL") : (isEs ? (cat === "Physical" ? "FÍSICO" : cat === "Special" ? "ESPECIAL" : "ESTADO") : cat)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`h-24 bg-black/40 border-4 ${activeTheme.borderClass} animate-pulse`} />
          ))}
        </div>
      ) : moves.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 border-4 border-dashed ${activeTheme.borderClass} text-center p-6`}>
          <Sparkles className={`w-12 h-12 mb-4 ${activeTheme.accentClass}`} />
          <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-500">
            {isEs ? "NINGÚN MOVIMIENTO COINCIDE" : "NO MOVES MATCH YOUR QUERY"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {moves.map((move) => {
            const desc = isEs 
              ? ((move.descripciones as any)?.es || (move.descripciones as any)?.en || "Sin descripción disponible.")
              : ((move.descripciones as any)?.en || (move.descripciones as any)?.es || "No description available.");

            const moveTitle = isEs && move.nombres?.es ? move.nombres.es : move.nombre;

            return (
              <BrutalistEntryCard
                key={move.id}
                title={moveTitle}
                description={desc}
                lang={lang}
                isMove={true}
                type={move.tipo}
                category={move.categoria}
                power={move.potencia}
                accuracy={move.precision}
                href={`/${lang}/pokedex/moves/${move.slug}`}
              />
            );
          })}
        </div>
      )}

      {/* Paginación */}
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
