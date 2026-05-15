"use client";

import { useState, useEffect } from "react";
import { POKEMON_TYPES, NATURES, getEffectiveness } from "@/lib/pokemon";
import { getAllPokemon, type PokemonSearchResult } from "@/app/actions/pokedex";
import { getAllMoves, type MoveResult } from "@/app/actions/encyclopedia";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Calculator, Zap, Shield, Swords, Sparkles } from "lucide-react";

const NATURE_MODS: Record<string, [string, string] | null> = {
  Hardy: null, Docile: null, Serious: null, Bashful: null, Quirky: null,
  Lonely: ["Atk","Def"], Brave: ["Atk","Spe"], Adamant: ["Atk","SpA"], Naughty: ["Atk","SpD"],
  Bold: ["Def","Atk"], Relaxed: ["Def","Spe"], Impish: ["Def","SpA"], Lax: ["Def","SpD"],
  Timid: ["Spe","Atk"], Hasty: ["Spe","Def"], Jolly: ["Spe","SpA"], Naive: ["Spe","SpD"],
  Modest: ["SpA","Atk"], Mild: ["SpA","Def"], Quiet: ["SpA","Spe"], Rash: ["SpA","SpD"],
  Calm: ["SpD","Atk"], Gentle: ["SpD","Def"], Sassy: ["SpD","Spe"], Careful: ["SpD","SpA"],
};

function calcStat(base: number, ev: number, iv: number, level: number, nature: string, stat: string): number {
  if (!base || isNaN(base)) return 10;
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

  if (effDef === 0) return [0, 0];

  const baseDmg = Math.floor(Math.floor((Math.floor((2 * level) / 5 + 2) * power * effAtk) / effDef) / 50 + 2);
  const stabMod = stab ? 1.5 : 1;

  const minRoll = Math.floor(Math.floor(Math.floor(baseDmg * 0.85) * stabMod) * effectiveness);
  const maxRoll = Math.floor(Math.floor(baseDmg * stabMod) * effectiveness);

  return [Math.max(1, minRoll), Math.max(1, maxRoll)];
}

interface SideState {
  species: PokemonSearchResult | null;
  move: MoveResult | null;
  evs: Record<string, number>;
  ivs: Record<string, number>;
  nature: string;
  boosts: Record<string, number>;
}

import { use } from "react";

export default function DamageCalcPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang || "es";
  const isEs = lang === "es";
  const { activeTheme } = useTheme();

  // Configuración Global del Ataque
  const [level, setLevel] = useState(50);
  const [power, setPower] = useState(80);
  const [category, setCategory] = useState<"Physical" | "Special">("Physical");
  const [stab, setStab] = useState(true);
  const [crit, setCrit] = useState(false);
  const [effectiveness, setEffectiveness] = useState(1);

  // Estados Completos de Atacante y Defensor (Sincronizados al estilo Smogon Showdown)
  const [attacker, setAttacker] = useState<SideState>({
    species: null,
    move: null,
    evs: { hp: 0, atk: 252, def: 0, spa: 252, spd: 0, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: "Adamant",
    boosts: { atk: 0, spa: 0 },
  });

  const [defender, setDefender] = useState<SideState>({
    species: null,
    move: null,
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: "Hardy",
    boosts: { def: 0, spd: 0 },
  });

  // Extracción Dinámica de Estadísticas Base (Fallback robusto a Garchomp vs Sylveon promedios si está vacío)
  const baseAtk = attacker.species ? Number(attacker.species.stats_base?.[category === "Physical" ? "atk" : "spa"]) || 100 : (category === "Physical" ? 130 : 100);
  const baseDef = defender.species ? Number(defender.species.stats_base?.[category === "Physical" ? "def" : "spd"]) || 80 : (category === "Physical" ? 80 : 85);
  const baseHP = defender.species ? Number(defender.species.stats_base?.["hp"]) || 80 : 95;

  // Cómputo de Atributos Finales
  const activeAtkStat = calcStat(
    baseAtk, 
    attacker.evs[category === "Physical" ? "atk" : "spa"] || 0, 
    attacker.ivs[category === "Physical" ? "atk" : "spa"] ?? 31, 
    level, 
    attacker.nature, 
    category === "Physical" ? "Atk" : "SpA"
  );

  const activeDefStat = calcStat(
    baseDef, 
    defender.evs[category === "Physical" ? "def" : "spd"] || 0, 
    defender.ivs[category === "Physical" ? "def" : "spd"] ?? 31, 
    level, 
    defender.nature, 
    category === "Physical" ? "Def" : "SpD"
  );

  const finalHPStat = calcStat(baseHP, defender.evs.hp || 0, defender.ivs.hp ?? 31, level, "Hardy", "HP");

  // Efectividad automática
  useEffect(() => {
    if (attacker.move && defender.species) {
      const eff = getEffectiveness(attacker.move.tipo, defender.species.tipos);
      setEffectiveness(eff);
    }
  }, [attacker.move, defender.species]);

  // Rango de Daño
  const activeAtkBoost = attacker.boosts[category === "Physical" ? "atk" : "spa"] || 0;
  const activeDefBoost = defender.boosts[category === "Physical" ? "def" : "spd"] || 0;

  const [minDmg, maxDmg] = calcDamage(
    level, power, activeAtkStat, activeDefStat, stab, effectiveness, crit, activeAtkBoost, activeDefBoost
  );

  const minPct = ((minDmg / finalHPStat) * 100).toFixed(1);
  const maxPct = ((maxDmg / finalHPStat) * 100).toFixed(1);

  const hits = minDmg >= finalHPStat ? "OHKO!" : (maxDmg * 2 >= finalHPStat ? "2HKO" : (maxDmg * 3 >= finalHPStat ? "3HKO" : "4HKO+"));

  // Componente Interno de Búsqueda de Especies
  function SpeciesSearchSlot({ label, sideState, setSideState }: { label: string; sideState: SideState; setSideState: React.Dispatch<React.SetStateAction<SideState>> }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PokemonSearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      if (query.trim().length > 2) {
        setSearching(true);
        getAllPokemon(1, 6, { searchQuery: query }).then(res => {
          setResults(res.pokemon || []);
          setSearching(false);
        });
      } else {
        setResults([]);
        setSearching(false);
      }
    }, [query]);

    function selectSpecies(p: PokemonSearchResult) {
      setSideState(prev => ({
        ...prev,
        species: p,
      }));
      setQuery("");
      setResults([]);
    }

    const currentSpecies = sideState.species;
    const displayName = currentSpecies ? (isEs && currentSpecies.nombres?.es ? currentSpecies.nombres.es : currentSpecies.nombre) : null;

    return (
      <div className="relative w-full mb-6 z-20">
        <label className="text-zinc-500 font-black uppercase text-[10px] tracking-widest block mb-2">{label}</label>
        
        {/* Banner de Especie Seleccionada */}
        {currentSpecies ? (
          <div className={`flex items-center justify-between p-3 bg-black border-2 ${activeTheme.borderClass} mb-3`}>
            <div className="flex items-center gap-3">
              {currentSpecies.sprite_url && (
                <img src={currentSpecies.sprite_url} alt={currentSpecies.nombre} className="w-12 h-12 object-contain rendering-pixelated" />
              )}
              <div>
                <span className="text-white font-black text-sm block uppercase tracking-tighter">{displayName}</span>
                <div className="flex gap-1 mt-0.5">
                  {(currentSpecies.tipos || []).map(t => (
                    <span key={t} className={`text-[8px] font-black uppercase px-1 text-white type-${t.toLowerCase()}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSideState(prev => ({ ...prev, species: null }))}
              className="text-xs font-black px-2 py-1 bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : null}

        {/* Input de Búsqueda Dinámica */}
        <div className="relative">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            placeholder={isEs ? "BUSCAR POKÉMON PARA INYECTAR..." : "SEARCH POKÉMON TO INJECT..."}
            className={`w-full bg-zinc-950 border-2 ${activeTheme.borderClass} px-3 py-2 text-white font-black uppercase text-xs focus:bg-black focus:outline-none placeholder:text-zinc-700`}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full text-zinc-500" />
          )}
        </div>

        {/* Dropdown de Resultados */}
        {results.length > 0 && (
          <div className={`absolute top-full left-0 w-full bg-black border-2 ${activeTheme.borderClass} mt-1 max-h-48 overflow-y-auto z-30 divide-y divide-zinc-900`}>
            {results.map(p => {
              const name = isEs && p.nombres?.es ? p.nombres.es : p.nombre;
              return (
                <div 
                  key={p.id} 
                  onClick={() => selectSpecies(p)}
                  className={`flex items-center justify-between p-2 hover:${activeTheme.badgeBgClass} cursor-pointer group`}
                >
                  <span className="font-black text-xs text-white group-hover:text-current uppercase tracking-tight">{name}</span>
                  <div className="flex gap-1">
                    {(p.tipos || []).map(t => (
                      <span key={t} className={`text-[8px] font-black px-1 text-white type-${t.toLowerCase()}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Componente Interno de Búsqueda de Movimientos
  function MoveSearchSlot({ sideState, setSideState }: { sideState: SideState; setSideState: React.Dispatch<React.SetStateAction<SideState>> }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MoveResult[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
      if (query.trim().length > 2) {
        setSearching(true);
        getAllMoves(1, 6, { searchQuery: query, lang }).then(res => {
          setResults(res.moves || []);
          setSearching(false);
        });
      } else {
        setResults([]);
        setSearching(false);
      }
    }, [query]);

    function selectMove(m: MoveResult) {
      setSideState(prev => ({ ...prev, move: m }));
      setPower(m.potencia || 0);
      setCategory(m.categoria as any || "Physical");
      // Intento de STAB automático
      if (sideState.species && sideState.species.tipos.includes(m.tipo)) {
        setStab(true);
      } else {
        setStab(false);
      }
      setQuery("");
      setResults([]);
    }

    const currentMove = sideState.move;
    const displayName = currentMove ? (isEs && currentMove.nombres?.es ? currentMove.nombres.es : currentMove.nombre) : null;

    return (
      <div className="relative w-full mb-6 z-10">
        <label className="text-zinc-500 font-black uppercase text-[10px] tracking-widest block mb-2">{isEs ? "INYECTAR MOVIMIENTO" : "INJECT MOVE"}</label>
        
        {currentMove ? (
          <div className={`flex items-center justify-between p-3 bg-zinc-900 border-2 ${activeTheme.borderClass} mb-3`}>
            <div className="flex items-center gap-3">
              <Swords className={`w-6 h-6 ${activeTheme.accentClass}`} />
              <div>
                <span className="text-white font-black text-sm block uppercase tracking-tighter">{displayName}</span>
                <span className={`text-[8px] font-black uppercase px-1 text-white type-${currentMove.tipo.toLowerCase()}`}>
                  {currentMove.tipo}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSideState(prev => ({ ...prev, move: null }))}
              className="text-xs font-black px-2 py-1 bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : null}

        <div className="relative">
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            placeholder={isEs ? "BUSCAR MOVIMIENTO... (EJ. CLOSE COMBAT)" : "SEARCH MOVE... (E.G. CLOSE COMBAT)"}
            className={`w-full bg-zinc-950 border-2 ${activeTheme.borderClass} px-3 py-2 text-white font-black uppercase text-xs focus:bg-black focus:outline-none placeholder:text-zinc-700`}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-current border-t-transparent animate-spin rounded-full text-zinc-500" />
          )}
        </div>

        {results.length > 0 && (
          <div className={`absolute top-full left-0 w-full bg-black border-2 ${activeTheme.borderClass} mt-1 max-h-48 overflow-y-auto z-30 divide-y divide-zinc-900`}>
            {results.map(m => {
              const name = isEs && m.nombres?.es ? m.nombres.es : m.nombre;
              return (
                <div 
                  key={m.id} 
                  onClick={() => selectMove(m)}
                  className={`flex items-center justify-between p-2 hover:${activeTheme.badgeBgClass} cursor-pointer group`}
                >
                  <span className="font-black text-xs text-white group-hover:text-current uppercase tracking-tight">{name}</span>
                  <span className={`text-[8px] font-black px-1 text-white type-${m.tipo.toLowerCase()}`}>
                    {m.tipo}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto w-full gap-8">
      {/* Top Header Brutalista */}
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3">
          <Calculator className={`w-10 h-10 ${activeTheme.accentClass} stroke-[2.5]`} />
          <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${activeTheme.textMainClass}`}>
            {isEs ? "CALCULADORA DE DAÑO" : "DAMAGE CALCULATOR"}
          </h1>
        </div>
        <p className={`text-xs md:text-sm font-bold uppercase tracking-widest ${activeTheme.textMutedClass}`}>
          {isEs 
            ? "Simulador cinético Showdown para analizar rangos de KOs en la Generación 9." 
            : "Kinetic Showdown simulator to analyze KO ranges in Generation 9."}
        </p>
      </div>

      {/* Controles de Movimiento y Entorno */}
      <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/40 flex flex-col gap-4`}>
        <h3 className={`text-xs font-black uppercase tracking-widest ${activeTheme.accentClass} flex items-center gap-2`}>
          <Sparkles className="w-4 h-4" /> {isEs ? "ENTORNO Y MOVIMIENTO" : "ENVIRONMENT AND MOVE"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MoveSearchSlot sideState={attacker} setSideState={setAttacker} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Poder Base */}
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-1">
              {isEs ? "PODER BASE" : "BASE POWER"}
            </label>
            <input 
              type="number" 
              value={power} 
              onChange={e => setPower(Math.max(0, +e.target.value))}
              className={`w-full bg-black border-2 ${activeTheme.borderClass} px-3 py-1.5 text-white font-mono font-bold text-lg focus:outline-none`} 
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-1">
              {isEs ? "CATEGORÍA" : "CATEGORY"}
            </label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as any)}
              className={`w-full bg-black border-2 ${activeTheme.borderClass} px-2 py-1.5 text-white font-black uppercase text-xs focus:outline-none`}
            >
              <option value="Physical">FÍSICO (ATK)</option>
              <option value="Special">ESPECIAL (SPA)</option>
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-1">
              NIVEL / LEVEL
            </label>
            <input 
              type="number" 
              value={level} 
              onChange={e => setLevel(Math.max(1, Math.min(100, +e.target.value)))}
              className={`w-full bg-black border-2 ${activeTheme.borderClass} px-3 py-1.5 text-white font-mono font-bold text-lg focus:outline-none`} 
            />
          </div>

          {/* Multiplicador de Tipo */}
          <div>
            <label className="text-zinc-500 font-black uppercase text-[10px] block mb-1">
              {isEs ? "EFICACIA (TIPO)" : "EFFECTIVENESS"}
            </label>
            <select 
              value={effectiveness} 
              onChange={e => setEffectiveness(+e.target.value)}
              className={`w-full bg-black border-2 ${activeTheme.borderClass} px-2 py-1.5 ${activeTheme.accentClass} font-mono font-bold text-xs focus:outline-none`}
            >
              <option value={0}>x0 (INMUNE)</option>
              <option value={0.25}>x0.25</option>
              <option value={0.5}>x0.5</option>
              <option value={1}>x1 (NORMAL)</option>
              <option value={2}>x2 (SÚPER)</option>
              <option value={4}>x4 (ULTRA)</option>
            </select>
          </div>

          {/* Banderas STAB y CRIT */}
          <div className="col-span-2 flex items-center gap-4 pt-4 justify-around border-l-2 border-zinc-900 pl-4">
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div className={`w-5 h-5 border-2 flex items-center justify-center ${stab ? activeTheme.badgeBgClass : 'border-zinc-700 bg-black'}`}>
                {stab && <span className="text-[10px] font-black">✓</span>}
              </div>
              <span className={`font-black uppercase text-xs tracking-widest ${stab ? 'text-white' : 'text-zinc-600'}`}>STAB</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div className={`w-5 h-5 border-2 flex items-center justify-center ${crit ? 'border-red-500 bg-red-500 text-white' : 'border-zinc-700 bg-black'}`}>
                {crit && <span className="text-[10px] font-black">✓</span>}
              </div>
              <span className={`font-black uppercase text-xs tracking-widest ${crit ? 'text-red-500' : 'text-zinc-600'}`}>CRIT</span>
            </label>
          </div>
        </div>
      </div>

      {/* Paneles de Atacante y Defensor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        
        {/* Panel Atacante */}
        <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/60 flex flex-col relative`}>
          <div className={`absolute top-0 right-0 bg-zinc-900 border-l border-b ${activeTheme.borderClass} px-3 py-1 text-[10px] font-black ${activeTheme.accentClass} uppercase flex items-center gap-1`}>
            <Zap className="w-3 h-3" /> {isEs ? "ATACANTE" : "ATTACKER"}
          </div>

          <SpeciesSearchSlot label={isEs ? "SELECCIONAR ATACANTE" : "SELECT ATTACKER"} sideState={attacker} setSideState={setAttacker} />

          <div className="grid grid-cols-4 gap-3 text-xs mt-auto pt-4 border-t border-zinc-900">
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">BASE {category === "Physical" ? "ATK" : "SPA"}</label>
              <div className={`px-2 py-1.5 bg-black border-2 ${activeTheme.borderClass} font-mono font-bold text-white text-center`}>
                {baseAtk}
              </div>
            </div>
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">EVs</label>
              <input 
                type="number" 
                value={attacker.evs[category === "Physical" ? "atk" : "spa"] ?? 252} 
                max={252}
                onChange={e => {
                  const val = Math.min(252, Math.max(0, +e.target.value));
                  setAttacker(prev => ({ ...prev, evs: { ...prev.evs, [category === "Physical" ? "atk" : "spa"]: val } }));
                }}
                className={`w-full bg-black border-2 ${activeTheme.borderClass} px-1.5 py-1 text-white font-mono font-bold text-center focus:outline-none`} 
              />
            </div>
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">IVs</label>
              <input 
                type="number" 
                value={attacker.ivs[category === "Physical" ? "atk" : "spa"] ?? 31} 
                max={31}
                onChange={e => {
                  const val = Math.min(31, Math.max(0, +e.target.value));
                  setAttacker(prev => ({ ...prev, ivs: { ...prev.ivs, [category === "Physical" ? "atk" : "spa"]: val } }));
                }}
                className={`w-full bg-black border-2 ${activeTheme.borderClass} px-1.5 py-1 text-white font-mono font-bold text-center focus:outline-none`} 
              />
            </div>
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">BOOST</label>
              <select 
                value={attacker.boosts[category === "Physical" ? "atk" : "spa"] ?? 0}
                onChange={e => {
                  const val = +e.target.value;
                  setAttacker(prev => ({ ...prev, boosts: { ...prev.boosts, [category === "Physical" ? "atk" : "spa"]: val } }));
                }}
                className={`w-full bg-black border-2 ${activeTheme.borderClass} px-1 py-1 text-white font-mono font-bold text-center focus:outline-none`}
              >
                {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(b => <option key={b} value={b}>{b >= 0 ? `+${b}` : b}</option>)}
              </select>
            </div>
            <div className="col-span-4 flex items-center justify-between pt-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase">NATURALEZA / NATURE:</span>
              <select 
                value={attacker.nature} 
                onChange={e => setAttacker(prev => ({ ...prev, nature: e.target.value }))}
                className={`bg-black border-2 ${activeTheme.borderClass} px-2 py-0.5 text-white font-black text-[10px] uppercase focus:outline-none`}
              >
                {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className={`col-span-4 mt-2 pt-3 border-t border-zinc-900 flex justify-between items-end`}>
              <span className="text-[10px] font-black text-zinc-500 uppercase">ESTADÍSTICA TOTAL ATK:</span>
              <span className={`text-2xl font-black ${activeTheme.accentClass} font-mono`}>{activeAtkStat}</span>
            </div>
          </div>
        </div>

        {/* Panel Defensor */}
        <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/60 flex flex-col relative`}>
          <div className={`absolute top-0 right-0 bg-zinc-900 border-l border-b ${activeTheme.borderClass} px-3 py-1 text-[10px] font-black ${activeTheme.accentClass} uppercase flex items-center gap-1`}>
            <Shield className="w-3 h-3" /> {isEs ? "DEFENSOR" : "DEFENDER"}
          </div>

          <SpeciesSearchSlot label={isEs ? "SELECCIONAR DEFENSOR" : "SELECT DEFENDER"} sideState={defender} setSideState={setDefender} />

          {/* Sub-Bloque HP */}
          <div className="grid grid-cols-3 gap-2 bg-black p-3 border-2 border-zinc-900 mb-3 text-xs">
            <div>
              <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">BASE HP</span>
              <div className="font-mono font-bold text-white text-center py-0.5">{baseHP}</div>
            </div>
            <div>
              <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">HP EVs</span>
              <input 
                type="number" 
                value={defender.evs.hp ?? 252} 
                max={252}
                onChange={e => {
                  const val = Math.min(252, Math.max(0, +e.target.value));
                  setDefender(prev => ({ ...prev, evs: { ...prev.evs, hp: val } }));
                }}
                className={`w-full bg-zinc-950 border ${activeTheme.borderClass} px-1 py-0.5 text-white font-mono font-bold text-center text-xs focus:outline-none`} 
              />
            </div>
            <div>
              <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">TOTAL HP</span>
              <div className={`font-mono font-black ${activeTheme.accentClass} text-center py-0.5 text-sm`}>{finalHPStat}</div>
            </div>
          </div>

          {/* Sub-Bloque Def/SpD */}
          <div className="grid grid-cols-4 gap-3 text-xs mt-auto pt-2">
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">BASE {category === "Physical" ? "DEF" : "SPD"}</label>
              <div className={`px-2 py-1.5 bg-black border-2 ${activeTheme.borderClass} font-mono font-bold text-white text-center`}>
                {baseDef}
              </div>
            </div>
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">EVs</label>
              <input 
                type="number" 
                value={defender.evs[category === "Physical" ? "def" : "spd"] ?? 0} 
                max={252}
                onChange={e => {
                  const val = Math.min(252, Math.max(0, +e.target.value));
                  setDefender(prev => ({ ...prev, evs: { ...prev.evs, [category === "Physical" ? "def" : "spd"]: val } }));
                }}
                className={`w-full bg-black border-2 ${activeTheme.borderClass} px-1.5 py-1 text-white font-mono font-bold text-center focus:outline-none`} 
              />
            </div>
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">IVs</label>
              <input 
                type="number" 
                value={defender.ivs[category === "Physical" ? "def" : "spd"] ?? 31} 
                max={31}
                onChange={e => {
                  const val = Math.min(31, Math.max(0, +e.target.value));
                  setDefender(prev => ({ ...prev, ivs: { ...prev.ivs, [category === "Physical" ? "def" : "spd"]: val } }));
                }}
                className={`w-full bg-black border-2 ${activeTheme.borderClass} px-1.5 py-1 text-white font-mono font-bold text-center focus:outline-none`} 
              />
            </div>
            <div>
              <label className="text-zinc-500 font-black uppercase block mb-1">BOOST</label>
              <select 
                value={defender.boosts[category === "Physical" ? "def" : "spd"] ?? 0}
                onChange={e => {
                  const val = +e.target.value;
                  setDefender(prev => ({ ...prev, boosts: { ...prev.boosts, [category === "Physical" ? "def" : "spd"]: val } }));
                }}
                className={`w-full bg-black border-2 ${activeTheme.borderClass} px-1 py-1 text-white font-mono font-bold text-center focus:outline-none`}
              >
                {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(b => <option key={b} value={b}>{b >= 0 ? `+${b}` : b}</option>)}
              </select>
            </div>
            <div className="col-span-4 flex items-center justify-between pt-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase">NATURALEZA / NATURE:</span>
              <select 
                value={defender.nature} 
                onChange={e => setDefender(prev => ({ ...prev, nature: e.target.value }))}
                className={`bg-black border-2 ${activeTheme.borderClass} px-2 py-0.5 text-white font-black text-[10px] uppercase focus:outline-none`}
              >
                {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className={`col-span-4 mt-2 pt-3 border-t border-zinc-900 flex justify-between items-end`}>
              <span className="text-[10px] font-black text-zinc-500 uppercase">ESTADÍSTICA TOTAL DEF:</span>
              <span className={`text-2xl font-black ${activeTheme.accentClass} font-mono`}>{activeDefStat}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Resultado de Daño Masivo */}
      <div className={`border-8 ${hits.includes("OHKO") ? 'border-red-500 bg-red-500/10' : `${activeTheme.borderClass} bg-black`} p-8 md:p-12 text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-pulse" />
        
        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 block mb-3">
          {isEs ? "PREDICCIÓN DE DAÑO DEFINITIVA" : "DEFINITIVE DAMAGE PREDICTION"}
        </span>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4">
          <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-white">
            {minDmg} <span className="text-zinc-700">/</span> {maxDmg}
            <span className="text-xs font-sans text-zinc-500 block text-center mt-1">DMG ROLLS</span>
          </div>

          <div className={`text-4xl md:text-6xl font-black font-mono tracking-tighter ${hits.includes("OHKO") ? 'text-red-500' : activeTheme.accentClass}`}>
            {minPct}% — {maxPct}%
            <span className="text-xs font-sans text-zinc-500 block text-center mt-1">PORCENTAJE DE HP</span>
          </div>
        </div>

        <div className={`inline-block border-4 px-6 py-2 text-xl md:text-3xl font-black tracking-widest uppercase mt-2
          ${hits.includes("OHKO") ? 'border-red-500 bg-red-500 text-white animate-bounce' : `${activeTheme.borderClass} ${activeTheme.badgeBgClass}`}`}
        >
          {hits}
        </div>
      </div>
    </div>
  );
}
