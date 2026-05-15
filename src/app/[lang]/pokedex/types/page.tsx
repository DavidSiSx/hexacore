"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { POKEMON_TYPES, translateType } from "@/lib/pokemon";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Flame, Info, RotateCcw } from "lucide-react";

const E: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, poison: 0.5, fighting: 2, dragon: 2, dark: 2, steel: 0.5 },
};

function getEffectiveness(atk: string, def: string): number {
  return E[atk]?.[def] ?? 1;
}

export default function TypeChartPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const isEs = lang === "es";
  const { activeTheme } = useTheme();

  // Estado inicial completamente vacío y limpio por diseño
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  function handleTypeClick(t: string) {
    if (selectedTypes.includes(t)) {
      // Eliminar de forma intuitiva si ya estaba seleccionado
      setSelectedTypes(prev => prev.filter(item => item !== t));
    } else if (selectedTypes.length < 2) {
      // Añadir si hay espacio
      setSelectedTypes(prev => [...prev, t]);
    }
  }

  function handleSlotRemove(index: number) {
    setSelectedTypes(prev => prev.filter((_, i) => i !== index));
  }

  const type1 = selectedTypes[0] || null;
  const type2 = selectedTypes[1] || null;

  // Cálculos Defensivos Combinados
  const defenses = POKEMON_TYPES.reduce((acc, atk) => {
    if (!type1) return acc;
    let eff = getEffectiveness(atk, type1);
    if (type2) eff *= getEffectiveness(atk, type2);
    acc[atk] = eff;
    return acc;
  }, {} as Record<string, number>);

  const weak4x = Object.keys(defenses).filter(k => defenses[k] === 4);
  const weak2x = Object.keys(defenses).filter(k => defenses[k] === 2);
  const resist05x = Object.keys(defenses).filter(k => defenses[k] === 0.5);
  const resist025x = Object.keys(defenses).filter(k => defenses[k] === 0.25);
  const immune0x = Object.keys(defenses).filter(k => defenses[k] === 0);

  // Perfil Ofensivo Individual
  function getOffense(attacker: string) {
    return {
      super: POKEMON_TYPES.filter(def => getEffectiveness(attacker, def) === 2),
      resisted: POKEMON_TYPES.filter(def => getEffectiveness(attacker, def) === 0.5),
      immune: POKEMON_TYPES.filter(def => getEffectiveness(attacker, def) === 0),
    };
  }

  const off1 = type1 ? getOffense(type1) : null;
  const off2 = type2 ? getOffense(type2) : null;

  function TypeBadge({ type, onClick }: { type: string; onClick?: () => void }) {
    const mainType = type.toLowerCase();
    const displayType = translateType(type, lang);
    return (
      <span 
        onClick={onClick}
        className={`px-3 py-1 font-black uppercase tracking-widest text-xs border-2 border-zinc-800 text-white type-${mainType} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} inline-block text-center transition-transform active:scale-95`}
      >
        {displayType}
      </span>
    );
  }

  return (
    <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto w-full gap-8">
      {/* Top Header Brutalista */}
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3">
          <Flame className={`w-10 h-10 ${activeTheme.accentClass} stroke-[2.5]`} />
          <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${activeTheme.textMainClass}`}>
            {isEs ? "CONSTRUCTOR DE TIPOS" : "TYPE BUILDER"}
          </h1>
        </div>
        <p className={`text-xs md:text-sm font-bold uppercase tracking-widest ${activeTheme.textMutedClass}`}>
          {isEs 
            ? "Selecciona libremente hasta dos elementos para analizar sinergias, debilidades y STAB ofensivo." 
            : "Select up to two elements freely to analyze synergy, weaknesses, and offensive STAB."}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Panel Izquierdo: Matriz de Selección Intuitiva */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0">
          <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/40 flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {isEs ? "MATRIZ ACTIVA" : "ACTIVE SLOTS"}
              </h2>
              {selectedTypes.length > 0 && (
                <button 
                  onClick={() => setSelectedTypes([])}
                  className="text-zinc-500 hover:text-red-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                >
                  <RotateCcw className="w-3 h-3" /> {isEs ? "LIMPIAR" : "CLEAR"}
                </button>
              )}
            </div>

            {/* Slots Intuitivos (Permite deselección individual) */}
            <div className="flex gap-2 mb-6">
              {/* Slot 1 */}
              <div 
                onClick={() => type1 && handleSlotRemove(0)}
                className={`flex-1 h-12 bg-zinc-950 border-2 ${type1 ? activeTheme.borderClass : 'border-dashed border-zinc-800'} flex items-center justify-center relative group select-none ${type1 ? 'cursor-pointer' : ''}`}
                title={type1 ? (isEs ? "Clic para remover" : "Click to remove") : ""}
              >
                {type1 ? (
                  <>
                    <TypeBadge type={type1} />
                    <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-white text-[10px]">
                      ✕
                    </div>
                  </>
                ) : (
                  <span className="text-zinc-700 font-black text-xs tracking-widest">???</span>
                )}
                <span className="absolute -top-2 left-2 text-[8px] bg-black px-1 text-zinc-500 font-bold uppercase">
                  {isEs ? "PRIMARIO" : "PRIMARY"}
                </span>
              </div>

              {/* Slot 2 */}
              <div 
                onClick={() => type2 && handleSlotRemove(1)}
                className={`flex-1 h-12 bg-zinc-950 border-2 ${type2 ? activeTheme.borderClass : 'border-dashed border-zinc-800'} flex items-center justify-center relative group select-none ${type2 ? 'cursor-pointer' : ''}`}
                title={type2 ? (isEs ? "Clic para remover" : "Click to remove") : ""}
              >
                {type2 ? (
                  <>
                    <TypeBadge type={type2} />
                    <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-white text-[10px]">
                      ✕
                    </div>
                  </>
                ) : (
                  <span className="text-zinc-700 font-black text-xs tracking-widest">???</span>
                )}
                <span className="absolute -top-2 left-2 text-[8px] bg-black px-1 text-zinc-500 font-bold uppercase">
                  {isEs ? "SECUNDARIO" : "SECONDARY"}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mb-3 text-center">
              {isEs ? "HAZ CLIC EN UN TIPO PARA AÑADIR O REMOVER" : "CLICK A TYPE TO ADD OR REMOVE"}
            </p>

            {/* Grid de 18 Elementos */}
            <div className="grid grid-cols-3 gap-2">
              {POKEMON_TYPES.map(t => {
                const isSelected = selectedTypes.includes(t);
                const displayType = translateType(t, lang);
                const mainType = t.toLowerCase();
                return (
                  <button 
                    key={t}
                    onClick={() => handleTypeClick(t)}
                    className={`py-2 text-[10px] font-black uppercase tracking-tighter border-2 truncate px-1 transition-transform active:scale-95
                      ${isSelected 
                        ? `type-${mainType} border-white text-white scale-[1.02] ring-2 ring-white/20` 
                        : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white"}`}
                  >
                    {displayType}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Perfiles Ofensivos y Defensivos Dinámicos */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {selectedTypes.length === 0 ? (
            <div className={`flex-1 flex flex-col items-center justify-center p-12 border-4 border-dashed ${activeTheme.borderClass} bg-black/20 text-center`}>
              <Info className={`w-12 h-12 mb-4 text-zinc-600 animate-pulse`} />
              <p className="text-lg md:text-xl font-black uppercase tracking-tight text-zinc-500 max-w-md">
                {isEs 
                  ? "LA MATRIZ ESTÁ VACÍA. SELECCIONA AL MENOS UN TIPO EN EL CONSTRUCTOR PARA GENERAR LOS PERFILES DE EFECTIVIDAD." 
                  : "THE MATRIX IS EMPTY. SELECT AT LEAST ONE TYPE IN THE BUILDER TO GENERATE EFFECTIVENESS PROFILES."}
              </p>
            </div>
          ) : (
            <>
              {/* Bloque Defensivo Combinado */}
              <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/60 relative`}>
                <div className={`absolute top-0 right-0 bg-zinc-900 border-l border-b ${activeTheme.borderClass} px-3 py-1 text-[10px] font-black ${activeTheme.accentClass} uppercase`}>
                  {isEs ? "PERFIL DEFENSIVO COMBINADO" : "COMBINED DEFENSIVE PROFILE"}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Vulnerabilidades */}
                  <div className="flex flex-col gap-4">
                    {weak4x.length > 0 && (
                      <div>
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-red-500/20 pb-1">
                          4X {isEs ? "DEBILIDAD CRÍTICA" : "CRITICAL WEAKNESS"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {weak4x.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    )}
                    {weak2x.length > 0 && (
                      <div>
                        <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-orange-400/20 pb-1">
                          2X {isEs ? "DEBILIDAD" : "WEAKNESS"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {weak2x.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    )}
                    {weak4x.length === 0 && weak2x.length === 0 && (
                      <p className="text-zinc-600 font-black uppercase text-xs">
                        {isEs ? "NINGUNA DEBILIDAD" : "NO WEAKNESSES"}
                      </p>
                    )}
                  </div>

                  {/* Resistencias e Inmunidades */}
                  <div className="flex flex-col gap-4">
                    {immune0x.length > 0 && (
                      <div>
                        <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-cyan-400/20 pb-1">
                          0X {isEs ? "INMUNIDAD ABSOLUTA" : "ABSOLUTE IMMUNITY"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {immune0x.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    )}
                    {resist025x.length > 0 && (
                      <div>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-emerald-400/20 pb-1">
                          0.25X {isEs ? "SÚPER RESISTENCIA" : "SUPER RESISTANCE"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {resist025x.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    )}
                    {resist05x.length > 0 && (
                      <div>
                        <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-green-500/20 pb-1">
                          0.5X {isEs ? "RESISTENCIA" : "RESISTANCE"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {resist05x.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    )}
                    {immune0x.length === 0 && resist025x.length === 0 && resist05x.length === 0 && (
                      <p className="text-zinc-600 font-black uppercase text-xs">
                        {isEs ? "NINGUNA RESISTENCIA" : "NO RESISTANCES"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bloques Ofensivos Individuales */}
              <div className="flex flex-col gap-4">
                {/* STAB 1 */}
                {off1 && type1 && (
                  <div className="p-4 bg-black border-2 border-zinc-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">STAB 1:</span>
                      <TypeBadge type={type1} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
                      <div>
                        <span className="text-[8px] font-black text-green-500 block mb-1">2X SÚPER EFICAZ</span>
                        <div className="flex flex-wrap gap-1">
                          {off1.super.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-orange-400 block mb-1">0.5X POCO EFICAZ</span>
                        <div className="flex flex-wrap gap-1">
                          {off1.resisted.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-600 block mb-1">0X SIN EFECTO</span>
                        <div className="flex flex-wrap gap-1">
                          {off1.immune.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAB 2 */}
                {off2 && type2 && (
                  <div className="p-4 bg-black border-2 border-zinc-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">STAB 2:</span>
                      <TypeBadge type={type2} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
                      <div>
                        <span className="text-[8px] font-black text-green-500 block mb-1">2X SÚPER EFICAZ</span>
                        <div className="flex flex-wrap gap-1">
                          {off2.super.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-orange-400 block mb-1">0.5X POCO EFICAZ</span>
                        <div className="flex flex-wrap gap-1">
                          {off2.resisted.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-zinc-600 block mb-1">0X SIN EFECTO</span>
                        <div className="flex flex-wrap gap-1">
                          {off2.immune.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
