"use client";

import { useState, useEffect, useCallback } from "react";
import { searchMoves, getAllMoves, type MoveResult, type MoveFilters } from "@/app/actions/encyclopedia";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { useLang } from "@/lib/lang";
import { POKEMON_TYPES } from "@/lib/pokemon";

const CAT_ICONS: Record<string, string> = { Physical: "💥", Special: "🌀", Status: "📊" };
const CAT_ES: Record<string, string> = { Physical: "Físico", Special: "Especial", Status: "Estado" };
const CATEGORIES = ["Physical", "Special", "Status"];

export default function MovesPage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [moves, setMoves] = useState<MoveResult[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    if (query.trim().length >= 2) {
      const r = await searchMoves(query);
      setMoves(r); setTotal(r.length);
    } else {
      const filters: MoveFilters = {};
      if (filterType) filters.tipo = filterType;
      if (filterCat) filters.categoria = filterCat;
      const r = await getAllMoves(page, 60, filters);
      setMoves(r.moves); setTotal(r.total);
    }
    setLoading(false);
  }, [query, page, filterType, filterCat]);

  useEffect(() => { load(); }, [load]);

  const selectClass = `bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5
                       text-xs text-white outline-none focus:border-[var(--accent-primary)] transition-colors`;
  const totalPages = Math.ceil(total / 60);

  return (
    <div className="flex flex-col px-4 py-6 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4">
        <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          ⚔️ {t("Movimientos", "Moves")}
        </span>
      </h1>

      {/* Search + Filters row */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={t("Buscar movimiento...", "Search move...")}
          className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2
                     text-sm text-white outline-none focus:border-[var(--accent-primary)] transition-colors
                     placeholder:text-[var(--text-muted)] w-full max-w-xs" />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("Tipo", "Type")}</label>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">{t("Todos", "All")}</option>
            {POKEMON_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("Categoría", "Category")}</label>
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">{t("Todas", "All")}</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{t(CAT_ES[c], c)}</option>)}
          </select>
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-muted)] mb-3 uppercase tracking-wider">
        {total.toLocaleString()} {t("resultados", "results")}
      </p>

      {loading ? (
        <div className="flex items-center gap-3 py-16 justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-blue-500 animate-spin-slow" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)] text-xs uppercase border-b border-[var(--border)]">
                <th className="pb-3 pr-4">{t("Nombre", "Name")}</th>
                <th className="pb-3 pr-4">{t("Tipo", "Type")}</th>
                <th className="pb-3 pr-4">Cat.</th>
                <th className="pb-3 pr-4 text-right">{t("Poder", "Power")}</th>
                <th className="pb-3 text-right">{t("Prec.", "Acc.")}</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)] hover:bg-white/[.02] transition-colors">
                  <td className="py-2 pr-4">
                    <Link href={`/pokedex/moves/${encodeURIComponent(m.nombre)}`}
                      className="text-white font-medium hover:text-[var(--accent-primary)] transition-colors">{m.nombre}</Link>
                  </td>
                  <td className="py-2 pr-4"><TypeBadge type={m.tipo} /></td>
                  <td className="py-2 pr-4 text-[var(--text-secondary)] text-xs">
                    {CAT_ICONS[m.categoria] || ""} {t(CAT_ES[m.categoria] || m.categoria, m.categoria)}
                  </td>
                  <td className="py-2 pr-4 text-right text-white font-mono text-xs">{m.potencia || "—"}</td>
                  <td className="py-2 text-right text-[var(--text-secondary)] font-mono text-xs">{m.precision || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
