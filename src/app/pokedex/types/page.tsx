"use client";

import { useState } from "react";
import { POKEMON_TYPES, getTypeClass } from "@/lib/pokemon";

// Type effectiveness chart: effectiveness[attacking][defending]
// 0 = immune, 0.5 = not very effective, 1 = normal, 2 = super effective
const E: Record<string, Record<string, number>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Grass: 0.5, Electric: 2, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Grass: 2, Electric: 0.5, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Poison: 0.5, Fighting: 2, Dragon: 2, Dark: 2, Steel: 0.5 },
};

function getEffectiveness(atk: string, def: string): number {
  return E[atk]?.[def] ?? 1;
}

function effColor(v: number): string {
  if (v === 0) return "bg-gray-800 text-gray-500";
  if (v === 0.5) return "bg-red-900/40 text-red-400";
  if (v === 2) return "bg-green-900/40 text-green-400";
  return "bg-transparent text-[var(--text-muted)]";
}

export default function TypeChartPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">
        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">🔥 Tabla de Tipos</span>
      </h1>
      <p className="text-[var(--text-muted)] text-xs mb-6">Filas = Atacante → Columnas = Defensor</p>

      {/* Selected Type Info */}
      {selected && (
        <div className="glass-card p-4 mb-6 w-full max-w-lg animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className={`${getTypeClass(selected)} text-white text-xs font-bold uppercase px-3 py-1 rounded-full`}>{selected}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-green-400 font-semibold mb-1">Super Eficaz vs:</p>
              <div className="flex flex-wrap gap-1">
                {POKEMON_TYPES.filter(t => getEffectiveness(selected, t) === 2).map(t => (
                  <span key={t} className={`${getTypeClass(t)} text-white text-[9px] px-1.5 py-0.5 rounded-full`}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-red-400 font-semibold mb-1">Poco Eficaz vs:</p>
              <div className="flex flex-wrap gap-1">
                {POKEMON_TYPES.filter(t => getEffectiveness(selected, t) < 1 && getEffectiveness(selected, t) > 0).map(t => (
                  <span key={t} className={`${getTypeClass(t)} text-white text-[9px] px-1.5 py-0.5 rounded-full`}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Table */}
      <div className="w-full overflow-x-auto">
        <table className="text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-[var(--text-muted)]">ATK↓ / DEF→</th>
              {POKEMON_TYPES.map(t => (
                <th key={t} className="p-1">
                  <button onClick={() => setSelected(selected === t ? null : t)}
                    className={`${getTypeClass(t)} text-white px-1.5 py-0.5 rounded text-[9px] font-bold
                               ${selected === t ? "ring-2 ring-white" : ""} transition-all hover:scale-110`}>
                    {t.slice(0, 3)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POKEMON_TYPES.map(atk => (
              <tr key={atk}>
                <td className="p-1">
                  <button onClick={() => setSelected(selected === atk ? null : atk)}
                    className={`${getTypeClass(atk)} text-white px-1.5 py-0.5 rounded text-[9px] font-bold
                               ${selected === atk ? "ring-2 ring-white" : ""} transition-all hover:scale-110`}>
                    {atk.slice(0, 3)}
                  </button>
                </td>
                {POKEMON_TYPES.map(def => {
                  const v = getEffectiveness(atk, def);
                  return (
                    <td key={def} className={`p-1 text-center font-mono font-bold ${effColor(v)} rounded`}>
                      {v === 1 ? "" : v === 0 ? "0" : v === 0.5 ? "½" : "2"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
