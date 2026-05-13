"use client";

import { useState, useEffect, useCallback } from "react";
import { searchMoves, getAllMoves, type MoveResult } from "@/app/actions/encyclopedia";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";

const CAT_ICONS: Record<string, string> = { "Physical": "💥", "Special": "🌀", "Status": "📊" };

export default function MovesPage() {
  const [query, setQuery] = useState("");
  const [moves, setMoves] = useState<MoveResult[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (query.trim().length >= 2) {
      const r = await searchMoves(query);
      setMoves(r); setTotal(r.length);
    } else {
      const r = await getAllMoves(page, 60);
      setMoves(r.moves); setTotal(r.total);
    }
    setLoading(false);
  }, [query, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">⚔️ Movimientos</span>
      </h1>

      <div className="w-full max-w-md mb-8">
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Buscar movimiento... (ej. Earthquake, Protect)"
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5
                     text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-[var(--text-muted)]" />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-blue-500 animate-spin-slow" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase border-b border-[var(--border)]">
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Tipo</th>
                <th className="pb-3 pr-4">Cat.</th>
                <th className="pb-3 pr-4 text-right">Poder</th>
                <th className="pb-3 text-right">Prec.</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)] hover:bg-white/[.02] transition-colors">
                  <td className="py-2.5 pr-4">
                    <Link href={`/pokedex/moves/${encodeURIComponent(m.nombre)}`}
                      className="text-white font-medium hover:text-[var(--accent-primary)] transition-colors">{m.nombre}</Link>
                  </td>
                  <td className="py-2.5 pr-4"><TypeBadge type={m.tipo} /></td>
                  <td className="py-2.5 pr-4 text-[var(--text-secondary)]">
                    {CAT_ICONS[m.categoria] || ""} {m.categoria}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-white font-mono">{m.potencia || "—"}</td>
                  <td className="py-2.5 text-right text-[var(--text-secondary)] font-mono">{m.precision || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!query && Math.ceil(total / 60) > 1 && (
        <div className="flex items-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                       hover:text-white disabled:opacity-30 transition-colors">← Anterior</button>
          <span className="text-xs text-[var(--text-muted)]">{page} / {Math.ceil(total / 60)}</span>
          <button onClick={() => setPage(Math.min(Math.ceil(total / 60), page + 1))} disabled={page === Math.ceil(total / 60)}
            className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                       hover:text-white disabled:opacity-30 transition-colors">Siguiente →</button>
        </div>
      )}
    </div>
  );
}
