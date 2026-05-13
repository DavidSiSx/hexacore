"use client";

import { useState } from "react";
import { POKEMON_TYPES, NATURES } from "@/lib/pokemon";

// Nature modifiers: [stat_boosted, stat_lowered] or null for neutral
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

// Gen 9 damage formula (simplified, no abilities/items yet)
function calcDamage(
  level: number, power: number, atk: number, def: number,
  stab: boolean, effectiveness: number, isCrit: boolean, boostAtk: number, boostDef: number
): [number, number] {
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
  const [level, setLevel] = useState(50);
  const [power, setPower] = useState(80);
  const [moveType, setMoveType] = useState("Normal");
  const [category, setCategory] = useState<"Physical" | "Special">("Physical");
  const [stab, setStab] = useState(false);
  const [crit, setCrit] = useState(false);
  const [effectiveness, setEffectiveness] = useState(1);

  const [atk, setAtk] = useState<PanelState>({ baseStat: 100, ev: 252, iv: 31, nature: "Adamant", boost: 0 });
  const [def, setDef] = useState<PanelState>({ baseStat: 100, ev: 0, iv: 31, nature: "Bold", boost: 0 });
  const [defHP, setDefHP] = useState({ baseStat: 100, ev: 252, iv: 31 });

  const atkStat = calcStat(atk.baseStat, atk.ev, atk.iv, level, atk.nature, category === "Physical" ? "Atk" : "SpA");
  const defStat = calcStat(def.baseStat, def.ev, def.iv, level, def.nature, category === "Physical" ? "Def" : "SpD");
  const hpStat = calcStat(defHP.baseStat, defHP.ev, defHP.iv, level, "Hardy", "HP");

  const [minDmg, maxDmg] = calcDamage(level, power, atkStat, defStat, stab, effectiveness, crit, atk.boost, def.boost);
  const minPct = ((minDmg / hpStat) * 100).toFixed(1);
  const maxPct = ((maxDmg / hpStat) * 100).toFixed(1);

  const hits = minDmg >= hpStat ? "OHKO!" : maxDmg * 2 >= hpStat ? "2HKO" : maxDmg * 3 >= hpStat ? "3HKO" : "4HKO+";

  function StatPanel({ label, state, setState, statLabel }: {
    label: string; state: PanelState; setState: (s: PanelState) => void; statLabel: string;
  }) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{label}</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Base {statLabel}</label>
            <input type="number" value={state.baseStat} onChange={e => setState({ ...state, baseStat: +e.target.value })}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">EVs</label>
            <input type="number" value={state.ev} max={252} onChange={e => setState({ ...state, ev: Math.min(252, +e.target.value) })}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">IVs</label>
            <input type="number" value={state.iv} max={31} onChange={e => setState({ ...state, iv: Math.min(31, +e.target.value) })}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Boost</label>
            <select value={state.boost} onChange={e => setState({ ...state, boost: +e.target.value })}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none">
              {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map(b => <option key={b} value={b}>{b >= 0 ? `+${b}` : b}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[var(--text-muted)] block mb-1">Nature</label>
            <select value={state.nature} onChange={e => setState({ ...state, nature: e.target.value })}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none">
              {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-[var(--accent-primary)] mt-2 font-mono">Stat Final: {label === "Atacante" ? atkStat : defStat}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">🧮 Calculadora de Daño</span>
      </h1>

      {/* Move Settings */}
      <div className="glass-card p-4 mb-4 w-full max-w-2xl">
        <h3 className="text-sm font-semibold text-white mb-3">Movimiento</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Poder</label>
            <input type="number" value={power} onChange={e => setPower(+e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value as any)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none">
              <option value="Physical">Físico</option>
              <option value="Special">Especial</option>
            </select>
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Nivel</label>
            <input type="number" value={level} onChange={e => setLevel(+e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
          </div>
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Eficacia</label>
            <select value={effectiveness} onChange={e => setEffectiveness(+e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none">
              <option value={0}>x0 (Inmune)</option>
              <option value={0.25}>x0.25</option>
              <option value={0.5}>x0.5</option>
              <option value={1}>x1 (Normal)</option>
              <option value={2}>x2</option>
              <option value={4}>x4</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={stab} onChange={e => setStab(e.target.checked)}
              className="accent-[var(--accent-primary)]" /> STAB
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input type="checkbox" checked={crit} onChange={e => setCrit(e.target.checked)}
              className="accent-[var(--accent-primary)]" /> Crítico
          </label>
        </div>
      </div>

      {/* Attacker + Defender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-4">
        <StatPanel label="Atacante" state={atk} setState={setAtk} statLabel={category === "Physical" ? "Atk" : "SpA"} />
        <div>
          <StatPanel label="Defensor" state={def} setState={setDef} statLabel={category === "Physical" ? "Def" : "SpD"} />
          <div className="glass-card p-3 mt-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[var(--text-muted)] block mb-1">Base HP</label>
                <input type="number" value={defHP.baseStat} onChange={e => setDefHP({ ...defHP, baseStat: +e.target.value })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
              </div>
              <div>
                <label className="text-[var(--text-muted)] block mb-1">HP EVs</label>
                <input type="number" value={defHP.ev} max={252} onChange={e => setDefHP({ ...defHP, ev: Math.min(252, +e.target.value) })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
              </div>
              <div>
                <label className="text-[var(--text-muted)] block mb-1">HP IVs</label>
                <input type="number" value={defHP.iv} max={31} onChange={e => setDefHP({ ...defHP, iv: Math.min(31, +e.target.value) })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-white outline-none" />
              </div>
            </div>
            <p className="text-xs text-[var(--accent-primary)] mt-2 font-mono">HP Total: {hpStat}</p>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="glass-card p-6 w-full max-w-2xl text-center animate-pulse-glow">
        <p className="text-sm text-[var(--text-muted)] mb-1">Resultado</p>
        <p className="text-3xl font-bold text-white mb-1">
          {minDmg} — {maxDmg} <span className="text-lg text-[var(--text-muted)]">HP</span>
        </p>
        <p className="text-lg text-[var(--accent-primary)] font-semibold">
          {minPct}% — {maxPct}%
        </p>
        <p className={`text-sm font-bold mt-2 ${hits === "OHKO!" ? "text-red-400" : "text-yellow-400"}`}>
          {hits}
        </p>
      </div>
    </div>
  );
}
