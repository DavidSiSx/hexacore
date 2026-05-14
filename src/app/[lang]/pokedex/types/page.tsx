"use client";

import { useState } from "react";
import { POKEMON_TYPES } from "@/lib/pokemon";
import { useLang, T } from "@/lib/lang";

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

const TYPE_TRANSLATIONS: Record<string, string> = {
  Normal: "Normal", Fire: "Fuego", Water: "Agua", Grass: "Planta", Electric: "Eléctrico",
  Ice: "Hielo", Fighting: "Lucha", Poison: "Veneno", Ground: "Tierra", Flying: "Volador",
  Psychic: "Psíquico", Bug: "Bicho", Rock: "Roca", Ghost: "Fantasma", Dragon: "Dragón",
  Dark: "Siniestro", Steel: "Acero", Fairy: "Hada"
};

export default function TypeChartPage({ params }: { params: { lang: string } }) {
  const { lang } = params;
  const { t } = useLang();
  
  const [type1, setType1] = useState<string>("Normal");
  const [type2, setType2] = useState<string | null>(null);

  // Offensive Profile (Type 1)
  const off1Super = POKEMON_TYPES.filter(def => getEffectiveness(type1, def) === 2);
  const off1Resisted = POKEMON_TYPES.filter(def => getEffectiveness(type1, def) === 0.5);
  const off1Immune = POKEMON_TYPES.filter(def => getEffectiveness(type1, def) === 0);

  // Offensive Profile (Type 2)
  const off2Super = type2 ? POKEMON_TYPES.filter(def => getEffectiveness(type2, def) === 2) : [];
  const off2Resisted = type2 ? POKEMON_TYPES.filter(def => getEffectiveness(type2, def) === 0.5) : [];
  const off2Immune = type2 ? POKEMON_TYPES.filter(def => getEffectiveness(type2, def) === 0) : [];

  // Defensive Profile (Combined)
  const defenses = POKEMON_TYPES.reduce((acc, atk) => {
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

  function toggleType(tType: string) {
    if (type1 === tType) {
      if (type2) {
        setType1(type2);
        setType2(null);
      }
    } else if (type2 === tType) {
      setType2(null);
    } else if (!type2) {
      setType2(tType);
    } else {
      setType2(tType); // Replace secondary
    }
  }

  function TypeLabel({ type }: { type: string }) {
    const mainType = type.toLowerCase();
    const displayType = lang === "es" ? TYPE_TRANSLATIONS[type] || type : type;
    return (
      <span className={`px-3 py-1 font-black uppercase tracking-widest text-xs border-2 border-zinc-800 text-white type-${mainType}`}>
        {displayType}
      </span>
    );
  }

  return (
    <div className="flex flex-col px-6 py-12 max-w-7xl mx-auto w-full animate-fade-in">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
        <T es="ANÁLISIS DE TIPOS" en="TYPE ANALYSIS" />
      </h1>
      <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-8 border-b-4 border-zinc-800 pb-4">
        <T es="SELECCIONA TUS TIPOS PARA CALCULAR LA SINERGIA." en="SELECT YOUR TYPES TO CALCULATE SYNERGY." />
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Selector Grid */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="bg-zinc-950 border-4 border-zinc-800 p-6">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4">
              <T es="CONSTRUCTOR" en="BUILDER" />
            </h2>
            <div className="flex gap-2 mb-6 h-12">
              <div className="flex-1 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center cursor-pointer" onClick={() => setType1("Normal")}>
                {type1 ? <TypeLabel type={type1} /> : <span className="text-zinc-600 font-black">TYPE 1</span>}
              </div>
              <div className="flex-1 bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center cursor-pointer" onClick={() => setType2(null)}>
                {type2 ? <TypeLabel type={type2} /> : <span className="text-zinc-600 font-black">+ TYPE 2</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {POKEMON_TYPES.map(t => {
                const isSelected = type1 === t || type2 === t;
                const displayType = lang === "es" ? TYPE_TRANSLATIONS[t] || t : t;
                const mainType = t.toLowerCase();
                return (
                  <button 
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`py-2 text-[10px] font-black uppercase tracking-tighter border-2 transition-none truncate px-1 
                      ${isSelected ? `type-${mainType} border-white text-white` : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-white"}`}
                  >
                    {displayType}
                  </button>
                )
              })}
            </div>
            
            <button 
              onClick={() => { setType1("Normal"); setType2(null); }}
              className="mt-4 w-full py-2 bg-zinc-900 border-2 border-zinc-700 text-zinc-500 font-black uppercase text-xs hover:border-red-500 hover:text-red-500 transition-colors"
            >
              <T es="RESETEAR" en="RESET" />
            </button>
          </div>
        </div>

        {/* Results Panels */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Defensive Profile */}
          <div className="bg-zinc-950 border-4 border-[#DFE104] p-6 relative">
            <div className="absolute top-0 right-0 bg-[#DFE104] text-black font-black uppercase px-4 py-1 text-xs">
              <T es="PERFIL DEFENSIVO" en="DEFENSIVE PROFILE" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Weaknesses */}
              <div className="flex flex-col gap-4">
                {weak4x.length > 0 && (
                  <div>
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-red-500/30 pb-1">4X <T es="DEBILIDAD" en="WEAKNESS" /> (CRÍTICO)</p>
                    <div className="flex flex-wrap gap-2">
                      {weak4x.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                )}
                {weak2x.length > 0 && (
                  <div>
                    <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-orange-400/30 pb-1">2X <T es="DEBILIDAD" en="WEAKNESS" /></p>
                    <div className="flex flex-wrap gap-2">
                      {weak2x.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                )}
                {weak4x.length === 0 && weak2x.length === 0 && (
                   <p className="text-zinc-600 font-black uppercase text-xs">NO WEAKNESSES</p>
                )}
              </div>

              {/* Resistances & Immunities */}
              <div className="flex flex-col gap-4">
                {immune0x.length > 0 && (
                  <div>
                    <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-cyan-400/30 pb-1">0X <T es="INMUNIDAD" en="IMMUNITY" /></p>
                    <div className="flex flex-wrap gap-2">
                      {immune0x.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                )}
                {resist025x.length > 0 && (
                  <div>
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-emerald-400/30 pb-1">0.25X <T es="RESISTENCIA" en="RESISTANCE" /></p>
                    <div className="flex flex-wrap gap-2">
                      {resist025x.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                )}
                {resist05x.length > 0 && (
                  <div>
                    <p className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-2 border-b-2 border-green-500/30 pb-1">0.5X <T es="RESISTENCIA" en="RESISTANCE" /></p>
                    <div className="flex flex-wrap gap-2">
                      {resist05x.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Offensive Profile */}
          <div className="bg-zinc-950 border-4 border-zinc-800 p-6 relative">
            <div className="absolute top-0 right-0 bg-zinc-800 text-white font-black uppercase px-4 py-1 text-xs">
              <T es="PERFIL OFENSIVO (STAB)" en="OFFENSIVE PROFILE (STAB)" />
            </div>

            <div className="flex flex-col gap-6 mt-4">
              {/* Type 1 Offense */}
              <div>
                <h3 className="text-white font-black uppercase text-xs mb-3 flex items-center gap-2">
                  <TypeLabel type={type1} /> <T es="ATAQUES" en="ATTACKS" />
                </h3>
                <div className="grid grid-cols-3 gap-4 bg-zinc-900 p-4 border-2 border-zinc-800">
                  <div>
                    <p className="text-green-400 text-[9px] font-black uppercase tracking-widest mb-2">2X (SUPER)</p>
                    <div className="flex flex-wrap gap-1">
                      {off1Super.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest mb-2">0.5X (RESISTED)</p>
                    <div className="flex flex-wrap gap-1">
                      {off1Resisted.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-2">0X (IMMUNE)</p>
                    <div className="flex flex-wrap gap-1">
                      {off1Immune.map(t => <TypeLabel key={t} type={t} />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Type 2 Offense */}
              {type2 && (
                <div>
                  <h3 className="text-white font-black uppercase text-xs mb-3 flex items-center gap-2">
                    <TypeLabel type={type2} /> <T es="ATAQUES" en="ATTACKS" />
                  </h3>
                  <div className="grid grid-cols-3 gap-4 bg-zinc-900 p-4 border-2 border-zinc-800">
                    <div>
                      <p className="text-green-400 text-[9px] font-black uppercase tracking-widest mb-2">2X (SUPER)</p>
                      <div className="flex flex-wrap gap-1">
                        {off2Super.map(t => <TypeLabel key={t} type={t} />)}
                      </div>
                    </div>
                    <div>
                      <p className="text-orange-400 text-[9px] font-black uppercase tracking-widest mb-2">0.5X (RESISTED)</p>
                      <div className="flex flex-wrap gap-1">
                        {off2Resisted.map(t => <TypeLabel key={t} type={t} />)}
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-2">0X (IMMUNE)</p>
                      <div className="flex flex-wrap gap-1">
                        {off2Immune.map(t => <TypeLabel key={t} type={t} />)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
