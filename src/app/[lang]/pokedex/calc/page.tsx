"use client";

import { useState, useEffect } from "react";
import { POKEMON_TYPES, NATURES } from "@/lib/pokemon";
import { useLang, T } from "@/lib/lang";
import { getAllPokemon, type PokemonSearchResult } from "@/app/actions/pokedex";

const NATURE_MODS: Record<string, [string, string] | null> = {
  Hardy: null, Docile: null, Serious: null, Bashful: null, Quirky: null,
  Lonely: ["Atk","Def"], Brave: ["Atk","Spe"], Adamant: ["Atk","SpA"], Naughty: ["Atk","SpD"],
  Bold: ["Def","Atk"], Relaxed: ["Def","Spe"], Impish: ["Def","SpA"], Lax: ["Def","SpD"],
  Timid: ["Spe","Atk"], Hasty: ["Spe","Def"], Jolly: ["Spe","SpA"], Naive: ["Spe","SpD"],
  Modest: ["SpA","Atk"], Mild: ["SpA","Def"], Quiet: ["SpA","Spe"], Rash: ["SpA","SpD"],
  Calm: ["SpD","Atk"], Gentle: ["SpD","Def"], Sassy: ["SpD","Spe"], Careful: ["SpD","SpA"],
};

function calcStat(base: number, ev: number, iv: number, level: number, nature: string, stat: string): number {
  if (stat === "HP") {
    if (base === 1) return 1; // Shedinja
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const nm = NATURE_MODS[nature];
  let mod = 1;
  if (nm) {
    if (nm[0] === stat) mod = 1.1;
    if (nm[1] === stat) mod = 0.9;
  }
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * mod);
}

function calcDamage(
  level: number, power: number, atk: number, def: number,
  stab: boolean, effectiveness: number, isCrit: boolean, boostAtk: number, boostDef: number
): [number, number] {
  if (power === 0 || effectiveness === 0) return [0, 0];
  const atkMod = boostAtk >= 0 ? (2 + boostAtk) / 2 : 2 / (2 - boostAtk);
  const defMod = boostDef >= 0 ? (2 + boostDef) / 2 : 2 / (2 - boostDef);
  const effAtk = Math.floor(atk * atkMod);
  const effDef = Math.floor(def * (isCrit && boostDef > 0 ? 1 : defMod));

  const baseDmg = Math.floor(Math.floor((Math.floor((2 * level) / 5 + 2) * power * effAtk) / effDef) / 50 + 2);
  const stabMod = stab ? 1.5 : 1;

  const minRoll = Math.floor(Math.floor(Math.floor(baseDmg * 0.85) * stabMod) * effectiveness);
  const maxRoll = Math.floor(Math.floor(baseDmg * stabMod) * effectiveness);

  return [Math.max(1, minRoll), Math.max(1, maxRoll)];
}

interface PanelState {
  baseStat: number; ev: number; iv: number; nature: string; boost: number;
}

export default function DamageCalcPage() {
  const { t } = useLang();
  const [level, setLevel] = useState(50);
  const [power, setPower] = useState(80);
  const [category, setCategory] = useState<"Physical" | "Special">("Physical");
  const [stab, setStab] = useState(true);
  const [crit, setCrit] = useState(false);
  const [effectiveness, setEffectiveness] = useState(1);

  const [atk, setAtk] = useState<PanelState>({ baseStat: 130, ev: 252, iv: 31, nature: "Adamant", boost: 0 });
  const [def, setDef] = useState<PanelState>({ baseStat: 80, ev: 0, iv: 31, nature: "Hardy", boost: 0 });
  const [defHP, setDefHP] = useState({ baseStat: 80, ev: 4, iv: 31 });

  const atkStat = calcStat(atk.baseStat, atk.ev, atk.iv, level, atk.nature, category === "Physical" ? "Atk" : "SpA");
  const defStat = calcStat(def.baseStat, def.ev, def.iv, level, def.nature, category === "Physical" ? "Def" : "SpD");
  const hpStat = calcStat(defHP.baseStat, defHP.ev, defHP.iv, level, "Hardy", "HP");

  const [minDmg, maxDmg] = calcDamage(level, power, atkStat, defStat, stab, effectiveness, crit, atk.boost, def.boost);
  const minPct = ((minDmg / hpStat) * 100).toFixed(1);
  const maxPct = ((maxDmg / hpStat) * 100).toFixed(1);

  const hits = minDmg >= hpStat ? "OHKO!" : maxDmg * 2 >= hpStat ? "2HKO" : maxDmg * 3 >= hpStat ? "3HKO" : "4HKO+";

  function PokemonSearch({ label, onSelect }: { label: string, onSelect: (p: PokemonSearchResult) => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PokemonSearchResult[]>([]);

    useEffect(() => {
      if (query.length > 2) {
        getAllPokemon(1, 5, { searchQuery: query }).then(res => setResults(res.pokemon));
      } else {
        setResults([]);
      }
    }, [query]);

    return (
      <div className="relative w-full mb-4 z-10">
        <label className="text-zinc-500 font-black uppercase text-[10px] tracking-widest block mb-2">{label}</label>
        <input 
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={t("Buscar Pokémon...", "Search Pokémon...")}
          className="w-full bg-zinc-900 border-2 border-zinc-700 p-2 text-white font-black uppercase focus:border-[#DFE104] focus:outline-none transition-none"
        />
        {results.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-zinc-900 border-2 border-zinc-700 mt-1 max-h-48 overflow-y-auto z-20">
            {results.map(p => (
              <div 
                key={p.id} onClick={() => { onSelect(p); setQuery(p.nombre); setResults([]); }}
                className="p-2 border-b border-zinc-800 hover:bg-[#DFE104] hover:text-black cursor-pointer font-black text-xs uppercase"
              >
                {p.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function StatPanel({ label, state, setState, statLabel, onSearchSelect }: {
    label: string; state: PanelState; setState: (s: PanelState) => void; statLabel: string; onSearchSelect: (p: PokemonSearchResult) => void;
  }) {
    return (
      <div className="bg-zinc-950 border-4 border-zinc-800 p-6 flex flex-col relative h-full">
        <div className="absolute top-0 right-0 bg-zinc-800 text-white font-black uppercase px-3 py-1 text-[10px]">
          {label}
        </div>
        <PokemonSearch label={t("INYECTAR POKÉMON", "INJECT POKÉMON")} onSelect={onSearchSelect} />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mt-2">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-zinc-500 font-black uppercase block mb-1">BASE {statLabel}</label>
            <input type="number" value={state.baseStat} onChange={e => setState({ ...state, baseStat: +e.target.value })}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-zinc-500 font-black uppercase block mb-1">EVs</label>
            <input type="number" value={state.ev} max={252} onChange={e => setState({ ...state, ev: Math.min(252, +e.target.value) })}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-zinc-500 font-black uppercase block mb-1">IVs</label>
            <input type="number" value={state.iv} max={31} onChange={e => setState({ ...state, iv: Math.min(31, +e.target.value) })}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-zinc-500 font-black uppercase block mb-1">BOOST</label>
            <select value={state.boost} onChange={e => setState({ ...state, boost: +e.target.value })}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none">
              {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(b => <option key={b} value={b}>{b >= 0 ? `+${b}` : b}</option>)}
            </select>
          </div>
          <div className="col-span-4">
            <label className="text-zinc-500 font-black uppercase block mb-1"><T es="NATURALEZA" en="NATURE" /></label>
            <select value={state.nature} onChange={e => setState({ ...state, nature: e.target.value })}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-black uppercase focus:border-[#DFE104] outline-none">
              {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-auto pt-6 border-t-2 border-zinc-800 flex justify-between items-end">
           <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]"><T es="ESTADÍSTICA FINAL" en="FINAL STAT" /></span>
           <span className="text-3xl font-black text-[#DFE104]">{label.includes("ATACANTE") || label.includes("ATTACKER") ? atkStat : defStat}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 py-12 max-w-7xl mx-auto w-full animate-fade-in">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
        <span className="text-[#DFE104]"><T es="SIMULADOR" en="SIMULATOR" /></span> / CALC
      </h1>
      <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-8 border-b-4 border-zinc-800 pb-4">
        <T es="CALCULADORA DE DAÑO COMPETITIVA VGC / OU." en="COMPETITIVE VGC / OU DAMAGE CALCULATOR." />
      </p>

      {/* Move Settings */}
      <div className="bg-zinc-950 border-4 border-zinc-800 p-6 mb-8 w-full">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-4"><T es="PARÁMETROS DEL ATAQUE" en="ATTACK PARAMETERS" /></h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2"><T es="PODER BASE" en="BASE POWER" /></label>
            <input type="number" value={power} onChange={e => setPower(+e.target.value)}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-2 text-white font-mono text-xl focus:border-[#DFE104] outline-none" />
          </div>
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2"><T es="CATEGORÍA" en="CATEGORY" /></label>
            <select value={category} onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-2 text-white font-black uppercase focus:border-[#DFE104] outline-none">
              <option value="Physical">PHYSICAL (ATK)</option>
              <option value="Special">SPECIAL (SPA)</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2">NIVEL / LEVEL</label>
            <input type="number" value={level} onChange={e => setLevel(+e.target.value)}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-2 text-white font-mono text-xl focus:border-[#DFE104] outline-none" />
          </div>
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2"><T es="EFICACIA (TIPO)" en="EFFECTIVENESS" /></label>
            <select value={effectiveness} onChange={e => setEffectiveness(+e.target.value)}
              className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-2 text-[#DFE104] font-mono font-bold focus:border-[#DFE104] outline-none">
              <option value={0}>x0 (IMMUNE)</option>
              <option value={0.25}>x0.25</option>
              <option value={0.5}>x0.5</option>
              <option value={1}>x1 (NORMAL)</option>
              <option value={2}>x2 (SUPER)</option>
              <option value={4}>x4 (ULTRA)</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center gap-6 pt-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-6 h-6 border-2 flex items-center justify-center transition-none ${stab ? 'border-[#DFE104] bg-[#DFE104]' : 'border-zinc-700'}`}>
                {stab && <div className="w-3 h-3 bg-black" />}
              </div>
              <span className={`font-black uppercase tracking-widest ${stab ? 'text-white' : 'text-zinc-600'}`}>STAB (x1.5)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-6 h-6 border-2 flex items-center justify-center transition-none ${crit ? 'border-red-500 bg-red-500' : 'border-zinc-700'}`}>
                {crit && <div className="w-3 h-3 bg-black" />}
              </div>
              <span className={`font-black uppercase tracking-widest ${crit ? 'text-red-500' : 'text-zinc-600'}`}>CRIT (x1.5)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Attacker vs Defender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-8">
        <StatPanel 
          label={t("ATACANTE", "ATTACKER")} 
          state={atk} setState={setAtk} 
          statLabel={category === "Physical" ? "Atk" : "SpA"} 
          onSearchSelect={(p) => setAtk(prev => ({ ...prev, baseStat: Number(p.stats_base[category === "Physical" ? "atk" : "spa"]) }))}
        />
        
        <div className="flex flex-col gap-4">
          <StatPanel 
            label={t("DEFENSOR", "DEFENDER")} 
            state={def} setState={setDef} 
            statLabel={category === "Physical" ? "Def" : "SpD"} 
            onSearchSelect={(p) => {
              setDef(prev => ({ ...prev, baseStat: Number(p.stats_base[category === "Physical" ? "def" : "spd"]) }));
              setDefHP(prev => ({ ...prev, baseStat: Number(p.stats_base["hp"]) }));
            }}
          />
          
          <div className="bg-zinc-950 border-4 border-zinc-800 p-6 flex flex-col relative">
            <div className="absolute top-0 right-0 bg-zinc-800 text-white font-black uppercase px-3 py-1 text-[10px]">
              DEFENDER HP
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs mt-2">
              <div>
                <label className="text-zinc-500 font-black uppercase block mb-1">BASE HP</label>
                <input type="number" value={defHP.baseStat} onChange={e => setDefHP({ ...defHP, baseStat: +e.target.value })}
                  className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none" />
              </div>
              <div>
                <label className="text-zinc-500 font-black uppercase block mb-1">EVs</label>
                <input type="number" value={defHP.ev} max={252} onChange={e => setDefHP({ ...defHP, ev: Math.min(252, +e.target.value) })}
                  className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none" />
              </div>
              <div>
                <label className="text-zinc-500 font-black uppercase block mb-1">IVs</label>
                <input type="number" value={defHP.iv} max={31} onChange={e => setDefHP({ ...defHP, iv: Math.min(31, +e.target.value) })}
                  className="w-full bg-zinc-900 border-b-2 border-zinc-700 px-2 py-1.5 text-white font-mono font-bold focus:border-[#DFE104] outline-none" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t-2 border-zinc-800 flex justify-between items-end">
               <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">TOTAL HP</span>
               <span className="text-3xl font-black text-white">{hpStat}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Card Masivo */}
      <div className={`border-8 p-12 text-center animate-pulse-glow ${hits === "OHKO!" ? "bg-red-500/10 border-red-500" : "bg-[#DFE104]/5 border-[#DFE104]"}`}>
        <p className="text-sm font-black uppercase tracking-widest text-white mb-4">
          <T es="CÁLCULO DE DAÑO" en="DAMAGE CALCULATION" />
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
          <p className="text-6xl md:text-8xl font-black text-white font-mono tracking-tighter">
            {minDmg}<span className="text-zinc-600">/</span>{maxDmg}
          </p>
          <div className="flex flex-col text-left">
             <span className="text-zinc-500 font-black uppercase">DMG</span>
             <span className="text-zinc-500 font-black uppercase">ROLLS</span>
          </div>
        </div>
        <p className={`text-4xl md:text-5xl font-black font-mono tracking-tighter mb-4 ${hits === "OHKO!" ? "text-red-500" : "text-[#DFE104]"}`}>
          {minPct}% — {maxPct}%
        </p>
        <div className={`inline-block border-4 px-8 py-2 text-2xl font-black tracking-widest ${hits === "OHKO!" ? "border-red-500 text-red-500" : "border-[#DFE104] text-[#DFE104]"}`}>
          {hits}
        </div>
      </div>

    </div>
  );
}
