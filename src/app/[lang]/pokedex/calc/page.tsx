"use client";

import { useState, useEffect, use } from "react";
import { POKEMON_TYPES, NATURES, getEffectiveness } from "@/lib/pokemon";
import { getAllPokemon, type PokemonSearchResult } from "@/app/actions/pokedex";
import { getAllMoves, type MoveResult } from "@/app/actions/encyclopedia";
import { getStandardSet } from "@/app/actions/metagame";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Calculator, Zap, Shield, Swords, Sparkles, Sun, CloudRain, Wind, Snowflake, Target } from "lucide-react";

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
    if (base === 1) return 1;
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
  stab: number, effectiveness: number, isCrit: boolean, 
  boostAtk: number, boostDef: number,
  weather: string, moveType: string,
  isBurned: boolean, isReflect: boolean, isLightScreen: boolean, category: string
): [number, number] {
  if (power === 0 || effectiveness === 0) return [0, 0];

  const atkMod = boostAtk >= 0 ? (2 + boostAtk) / 2 : 2 / (2 - boostAtk);
  const defMod = boostDef >= 0 ? (2 + boostDef) / 2 : 2 / (2 - boostDef);
  
  const effAtk = Math.floor(atk * atkMod);
  const effDef = Math.floor(def * (isCrit && boostDef > 0 ? 1 : defMod));

  if (effDef === 0) return [0, 0];

  let dmg = Math.floor(Math.floor((Math.floor((2 * level) / 5 + 2) * power * effAtk) / effDef) / 50 + 2);

  if (isBurned && category === "Physical") dmg = Math.floor(dmg * 0.5);
  if (category === "Physical" && isReflect) dmg = Math.floor(dmg * 0.5);
  if (category === "Special" && isLightScreen) dmg = Math.floor(dmg * 0.5);

  if (weather === "Sun" && moveType === "Fire") dmg = Math.floor(dmg * 1.5);
  if (weather === "Sun" && moveType === "Water") dmg = Math.floor(dmg * 0.5);
  if (weather === "Rain" && moveType === "Water") dmg = Math.floor(dmg * 1.5);
  if (weather === "Rain" && moveType === "Fire") dmg = Math.floor(dmg * 0.5);

  if (isCrit) dmg = Math.floor(dmg * 1.5);

  const applyFinalMods = (base: number) => {
    let final = Math.floor(base * stab);
    final = Math.floor(final * effectiveness);
    return Math.max(1, final);
  };

  return [applyFinalMods(Math.floor(dmg * 0.85)), applyFinalMods(dmg)];
}

interface SideState {
  species: PokemonSearchResult | null;
  move: MoveResult | null;
  evs: Record<string, number>;
  ivs: Record<string, number>;
  nature: string;
  boosts: Record<string, number>;
  teraType: string;
  ability: string;
  item: string;
  isBurned: boolean;
}

export default function DamageCalcPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang || "es";
  const isEs = lang === "es";
  const { activeTheme } = useTheme();

  const [level, setLevel] = useState(50);
  const [power, setPower] = useState(80);
  const [category, setCategory] = useState<"Physical" | "Special">("Physical");
  const [crit, setCrit] = useState(false);
  const [effectiveness, setEffectiveness] = useState(1);
  const [weather, setWeather] = useState("None");
  const [isReflect, setIsReflect] = useState(false);
  const [isLightScreen, setIsLightScreen] = useState(false);

  const [attacker, setAttacker] = useState<SideState>({
    species: null, move: null,
    evs: { hp: 0, atk: 252, def: 0, spa: 252, spd: 0, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: "Adamant", boosts: { atk: 0, spa: 0 },
    teraType: "None", ability: "None", item: "None", isBurned: false
  });

  const [defender, setDefender] = useState<SideState>({
    species: null, move: null,
    evs: { hp: 252, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: "Hardy", boosts: { def: 0, spd: 0 },
    teraType: "None", ability: "None", item: "None", isBurned: false
  });

  const baseAtk = attacker.species ? Number(attacker.species.stats_base?.[category === "Physical" ? "atk" : "spa"]) || 100 : 100;
  const baseDef = defender.species ? Number(defender.species.stats_base?.[category === "Physical" ? "def" : "spd"]) || 80 : 80;
  const baseHP = defender.species ? Number(defender.species.stats_base?.["hp"]) || 80 : 80;

  const activeAtkStat = calcStat(baseAtk, attacker.evs[category === "Physical" ? "atk" : "spa"] || 0, 31, level, attacker.nature, category === "Physical" ? "Atk" : "SpA");
  const activeDefStat = calcStat(baseDef, defender.evs[category === "Physical" ? "def" : "spd"] || 0, 31, level, defender.nature, category === "Physical" ? "Def" : "SpD");
  const finalHPStat = calcStat(baseHP, defender.evs.hp || 0, 31, level, "Hardy", "HP");

  useEffect(() => {
    if (attacker.move && defender.species) {
      const eff = getEffectiveness(attacker.move.tipo, defender.teraType !== "None" ? [defender.teraType] : defender.species.tipos);
      setEffectiveness(eff);
    }
  }, [attacker.move, defender.species, defender.teraType]);

  const calculateStab = () => {
    if (!attacker.move || !attacker.species) return 1;
    const isTera = attacker.teraType !== "None";
    const moveType = attacker.move.tipo;
    const originalTypes = attacker.species.tipos;
    if (isTera) {
      if (attacker.teraType === moveType) return originalTypes.includes(moveType) ? 2 : 1.5;
      return originalTypes.includes(moveType) ? 1.5 : 1;
    }
    return originalTypes.includes(moveType) ? 1.5 : 1;
  };

  const [minDmg, maxDmg] = calcDamage(
    level, power, activeAtkStat, activeDefStat, calculateStab(), effectiveness, crit,
    attacker.boosts[category === "Physical" ? "atk" : "spa"] || 0,
    defender.boosts[category === "Physical" ? "def" : "spd"] || 0,
    weather, attacker.move?.tipo || "Normal", attacker.isBurned, isReflect, isLightScreen, category
  );

  const minPct = ((minDmg / finalHPStat) * 100).toFixed(1);
  const maxPct = ((maxDmg / finalHPStat) * 100).toFixed(1);
  const hits = minDmg >= finalHPStat ? "OHKO!" : (maxDmg * 2 >= finalHPStat ? "2HKO" : (maxDmg * 3 >= finalHPStat ? "3HKO" : "4HKO+"));

  const loadSmogonSet = async (isAttacker: boolean) => {
    const side = isAttacker ? attacker : defender;
    if (!side.species) return;
    const set = await getStandardSet(side.species.nombre);
    if (set) {
      const update = (prev: SideState) => ({ ...prev, evs: set.evs, nature: set.nature, ability: set.ability, item: set.item });
      if (isAttacker) {
        setAttacker(update);
        if (set.moves.length > 0) {
          getAllMoves(1, 1, { searchQuery: set.moves[0], lang }).then(res => {
            if (res.moves[0]) {
              setAttacker(prev => ({ ...prev, move: res.moves[0] }));
              setPower(res.moves[0].potencia || 0);
              setCategory(res.moves[0].categoria as any || "Physical");
            }
          });
        }
      } else setDefender(update);
    }
  };

  function SpeciesSearchSlot({ label, sideState, setSideState, isAttacker }: { label: string; sideState: SideState; setSideState: React.Dispatch<React.SetStateAction<SideState>>, isAttacker: boolean }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PokemonSearchResult[]>([]);
    useEffect(() => {
      if (query.length > 2) getAllPokemon(1, 6, { searchQuery: query }).then(res => setResults(res.pokemon || []));
      else setResults([]);
    }, [query]);
    return (
      <div className="relative w-full">
        <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2">{label}</label>
        {sideState.species ? (
          <div className={`flex items-center justify-between p-3 bg-zinc-900 border-2 ${activeTheme.borderClass} mb-3`}>
            <div className="flex items-center gap-3">
              <img src={sideState.species.sprite_url} className="w-10 h-10 object-contain pixelated" />
              <div>
                <span className="text-white font-black text-xs uppercase">{sideState.species.nombre}</span>
                <button onClick={() => loadSmogonSet(isAttacker)} className={`block text-[8px] font-black uppercase mt-1 px-1 ${activeTheme.badgeBgClass} border border-current hover:bg-white hover:text-black`}>LOAD SMOGON SET</button>
              </div>
            </div>
            <button onClick={() => setSideState(prev => ({ ...prev, species: null }))} className="text-xs font-bold text-red-500">✕</button>
          </div>
        ) : (
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="..." className={`w-full bg-zinc-950 border-2 ${activeTheme.borderClass} px-3 py-2 text-white font-black uppercase text-xs focus:outline-none`} />
        )}
        {results.length > 0 && (
          <div className="absolute top-full w-full bg-black border-2 border-current z-50 divide-y divide-zinc-900">
            {results.map(p => (
              <div key={p.id} onClick={() => { setSideState(prev => ({ ...prev, species: p })); setQuery(""); setResults([]); }} className="p-2 hover:bg-zinc-800 cursor-pointer text-xs font-black uppercase">{p.nombre}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function MoveSearchSlot({ sideState, setSideState }: { sideState: SideState; setSideState: React.Dispatch<React.SetStateAction<SideState>> }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MoveResult[]>([]);
    useEffect(() => {
      if (query.length > 2) getAllMoves(1, 6, { searchQuery: query, lang }).then(res => setResults(res.moves || []));
      else setResults([]);
    }, [query]);
    return (
      <div className="relative w-full">
        <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2">MOVIMIENTO / MOVE</label>
        {sideState.move ? (
          <div className={`flex items-center justify-between p-3 bg-zinc-900 border-2 ${activeTheme.borderClass} mb-3`}>
             <div className="flex items-center gap-3"><Swords className={`w-5 h-5 ${activeTheme.accentClass}`} />
               <span className="text-white font-black text-xs uppercase">{sideState.move.nombre}</span>
             </div>
             <button onClick={() => setSideState(prev => ({ ...prev, move: null }))} className="text-xs font-bold text-red-500">✕</button>
          </div>
        ) : (
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="..." className={`w-full bg-zinc-950 border-2 ${activeTheme.borderClass} px-3 py-2 text-white font-black uppercase text-xs focus:outline-none`} />
        )}
        {results.length > 0 && (
          <div className="absolute top-full w-full bg-black border-2 border-current z-50 divide-y divide-zinc-900">
            {results.map(m => (
              <div key={m.id} onClick={() => { setSideState(prev => ({ ...prev, move: m })); setPower(m.potencia || 0); setCategory(m.categoria as any || "Physical"); setQuery(""); setResults([]); }} className="p-2 hover:bg-zinc-800 cursor-pointer text-xs font-black uppercase flex justify-between">
                <span>{m.nombre}</span><span className="opacity-50">{m.tipo}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 py-8 max-w-7xl mx-auto w-full gap-8 pb-32">
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3 text-4xl md:text-6xl font-black uppercase tracking-tighter">
          <Calculator className={activeTheme.accentClass} /> CALCULADORA <span className={activeTheme.accentClass}>SHOWDOWN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/30 p-6 border-4 border-current">
        <div className="flex flex-col gap-4">
           <MoveSearchSlot sideState={attacker} setSideState={setAttacker} />
           <div className="grid grid-cols-3 gap-4">
             <div className="flex flex-col"><label className="text-[10px] font-black opacity-50 uppercase">Base Power</label><input type="number" value={power} onChange={e => setPower(+e.target.value)} className="bg-black border-2 border-current p-2 text-xs font-mono font-bold outline-none" /></div>
             <div className="flex flex-col"><label className="text-[10px] font-black opacity-50 uppercase">Category</label><select value={category} onChange={e => setCategory(e.target.value as any)} className="bg-black border-2 border-current p-2 text-[10px] font-black outline-none"><option value="Physical">Physical</option><option value="Special">Special</option></select></div>
             <div className="flex flex-col"><label className="text-[10px] font-black opacity-50 uppercase">Weather</label><select value={weather} onChange={e => setWeather(e.target.value)} className="bg-black border-2 border-current p-2 text-[10px] font-black outline-none"><option value="None">None</option><option value="Sun">Sun</option><option value="Rain">Rain</option></select></div>
           </div>
        </div>
        <div className="flex flex-col gap-4">
           <div className="grid grid-cols-2 gap-4 h-full">
             <div className="flex flex-col justify-center gap-3 border-r-2 border-current/10 pr-4">
               <label className="flex items-center gap-2 cursor-pointer select-none">
                 <input type="checkbox" checked={crit} onChange={e => setCrit(e.target.checked)} className="hidden" /><div className={`w-5 h-5 border-2 border-current flex items-center justify-center ${crit ? 'bg-red-500 border-red-500' : ''}`}>{crit && <span className="text-[10px] text-white font-black">✓</span>}</div><span className="text-xs font-black uppercase">Critical Hit</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer select-none">
                 <input type="checkbox" checked={isReflect} onChange={e => setIsReflect(e.target.checked)} className="hidden" /><div className={`w-5 h-5 border-2 border-current flex items-center justify-center ${isReflect ? 'bg-current text-black' : ''}`}>{isReflect && <span className="text-[10px] font-black">✓</span>}</div><span className="text-xs font-black uppercase">Reflect</span>
               </label>
             </div>
             <div className="flex flex-col justify-center gap-3">
               <label className="flex items-center gap-2 cursor-pointer select-none">
                 <input type="checkbox" checked={attacker.isBurned} onChange={e => setAttacker(prev => ({ ...prev, isBurned: e.target.checked }))} className="hidden" /><div className={`w-5 h-5 border-2 border-current flex items-center justify-center ${attacker.isBurned ? 'bg-orange-500 border-orange-500' : ''}`}>{attacker.isBurned && <span className="text-[10px] text-white font-black">✓</span>}</div><span className="text-xs font-black uppercase">Burned</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer select-none">
                 <input type="checkbox" checked={isLightScreen} onChange={e => setIsLightScreen(e.target.checked)} className="hidden" /><div className={`w-5 h-5 border-2 border-current flex items-center justify-center ${isLightScreen ? 'bg-current text-black' : ''}`}>{isLightScreen && <span className="text-[10px] font-black">✓</span>}</div><span className="text-xs font-black uppercase">L.Screen</span>
               </label>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/40 flex flex-col gap-6`}>
           <SpeciesSearchSlot label="Atacante / Attacker" sideState={attacker} setSideState={setAttacker} isAttacker={true} />
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[9px] font-black opacity-50 uppercase">Tera Type</label><select value={attacker.teraType} onChange={e => setAttacker(prev => ({ ...prev, teraType: e.target.value }))} className="bg-black border-2 border-current p-1 text-[10px] font-black uppercase outline-none"><option value="None">None</option>{POKEMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
             <div className="flex flex-col gap-1"><label className="text-[9px] font-black opacity-50 uppercase">Item</label><input type="text" value={attacker.item} onChange={e => setAttacker(prev => ({ ...prev, item: e.target.value }))} className="bg-black border-2 border-current p-1 text-[10px] font-black uppercase outline-none" /></div>
           </div>
           <div className="grid grid-cols-3 gap-2 pt-4 border-t border-current/10">
              {["HP", "Atk", "Def", "SpA", "SpD", "Spe"].map(s => (
                <div key={s} className="flex flex-col"><label className="text-[8px] font-black opacity-50 uppercase">{s} EVs</label><input type="number" value={attacker.evs[s.toLowerCase()] || 0} onChange={e => setAttacker(prev => ({ ...prev, evs: { ...prev.evs, [s.toLowerCase()]: +e.target.value } }))} className="bg-black border-2 border-current p-1 text-xs font-mono font-bold outline-none" /></div>
              ))}
           </div>
           <div className="mt-auto pt-4 flex justify-between items-end border-t border-current/20">
              <span className="text-[10px] font-black opacity-50 uppercase">Final Atk/SpA:</span>
              <span className={`text-4xl font-black font-mono ${activeTheme.accentClass}`}>{activeAtkStat}</span>
           </div>
        </div>

        <div className={`p-6 border-4 ${activeTheme.borderClass} bg-black/40 flex flex-col gap-6`}>
           <SpeciesSearchSlot label="Defensor / Defender" sideState={defender} setSideState={setDefender} isAttacker={false} />
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1"><label className="text-[9px] font-black opacity-50 uppercase">Tera Type</label><select value={defender.teraType} onChange={e => setDefender(prev => ({ ...prev, teraType: e.target.value }))} className="bg-black border-2 border-current p-1 text-[10px] font-black uppercase outline-none"><option value="None">None</option>{POKEMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
             <div className="flex flex-col gap-1"><label className="text-[9px] font-black opacity-50 uppercase">Ability</label><input type="text" value={defender.ability} onChange={e => setDefender(prev => ({ ...prev, ability: e.target.value }))} className="bg-black border-2 border-current p-1 text-[10px] font-black uppercase outline-none" /></div>
           </div>
           <div className="grid grid-cols-3 gap-2 pt-4 border-t border-current/10">
              {["HP", "Atk", "Def", "SpA", "SpD", "Spe"].map(s => (
                <div key={s} className="flex flex-col"><label className="text-[8px] font-black opacity-50 uppercase">{s} EVs</label><input type="number" value={defender.evs[s.toLowerCase()] || 0} onChange={e => setDefender(prev => ({ ...prev, evs: { ...prev.evs, [s.toLowerCase()]: +e.target.value } }))} className="bg-black border-2 border-current p-1 text-xs font-mono font-bold outline-none" /></div>
              ))}
           </div>
           <div className="mt-auto pt-4 flex justify-between items-end border-t border-current/20">
              <span className="text-[10px] font-black opacity-50 uppercase">Final HP:</span>
              <span className="text-4xl font-black font-mono text-red-500">{finalHPStat}</span>
           </div>
        </div>
      </div>

      <div className={`border-8 ${hits.includes("OHKO") ? 'border-red-500 bg-red-500/10' : 'border-current bg-black'} p-12 text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-current opacity-20 animate-pulse" />
        <div className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-white mb-2">{minPct}% - {maxPct}%</div>
        <div className={`text-4xl md:text-6xl font-black uppercase italic tracking-widest ${hits.includes("OHKO") ? 'text-red-500' : activeTheme.accentClass}`}>{hits}</div>
        <p className="mt-6 text-xs font-bold opacity-40 uppercase tracking-widest">{attacker.species?.nombre || "?"} ({attacker.move?.nombre || "Attack"}) vs {defender.species?.nombre || "?"}</p>
      </div>
    </div>
  );
}
