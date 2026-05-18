"use client";

import { useState, useEffect } from "react";
import { calculate, Generations, Pokemon, Move } from "@smogon/calc";
import { PokemonBuild } from "@/lib/schemas/team";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Shield, Sword, AlertCircle } from "lucide-react";

interface DamageCalcPanelProps {
  pokemon: PokemonBuild;
}

const METAGAME_THREATS = [
  {
    name: "Flutter Mane (Specs)",
    species: "Flutter Mane",
    item: "Choice Specs",
    nature: "Timid",
    evs: { spa: 252, spe: 252, hp: 4 },
    move: "Moonblast",
    category: "Special",
    type: "Fairy",
  },
  {
    name: "Calyrex-Shadow (Life Orb)",
    species: "Calyrex-Shadow",
    item: "Life Orb",
    nature: "Timid",
    evs: { spa: 252, spe: 252, hp: 4 },
    move: "Astral Barrage",
    category: "Special",
    type: "Ghost",
  },
  {
    name: "Miraidon (Specs)",
    species: "Miraidon",
    item: "Choice Specs",
    nature: "Timid",
    evs: { spa: 252, spe: 252, hp: 4 },
    move: "Electro Drift",
    category: "Special",
    type: "Electric",
  },
  {
    name: "Urshifu-RS (Mystic Water)",
    species: "Urshifu-Rapid-Strike",
    item: "Mystic Water",
    nature: "Jolly",
    evs: { atk: 252, spe: 252, hp: 4 },
    move: "Surging Strikes",
    category: "Physical",
    type: "Water",
  },
  {
    name: "Koraidon (Band)",
    species: "Koraidon",
    item: "Choice Band",
    nature: "Jolly",
    evs: { atk: 252, spe: 252, hp: 4 },
    move: "Collision Course",
    category: "Physical",
    type: "Fighting",
  }
];

export default function DamageCalcPanel({ pokemon }: DamageCalcPanelProps) {
  const { activeTheme } = useTheme();
  const [calcMode, setCalcMode] = useState<"defense" | "offense">("defense");
  const [results, setResults] = useState<any[]>([]);
  const [selectedOffensiveMove, setSelectedOffensiveMove] = useState<string>(pokemon.moves[0] || "");

  // Cuando cambie el Pokémon (EVs, Naturaleza, Objeto, etc.) o el movimiento seleccionado, recalculamos
  useEffect(() => {
    try {
      const gen = Generations.get(9);

      // Crear defensor (para Defensa) o atacante (para Ataque) a partir del estado de nuestro Pokémon
      const ourEvs = {
        hp: pokemon.evs?.HP || 0,
        atk: pokemon.evs?.Atk || 0,
        def: pokemon.evs?.Def || 0,
        spa: pokemon.evs?.SpA || 0,
        spd: pokemon.evs?.SpD || 0,
        spe: pokemon.evs?.Spe || 0,
      };

      const ourIvs = {
        hp: pokemon.ivs?.HP !== undefined ? pokemon.ivs.HP : 31,
        atk: pokemon.ivs?.Atk !== undefined ? pokemon.ivs.Atk : 31,
        def: pokemon.ivs?.Def !== undefined ? pokemon.ivs.Def : 31,
        spa: pokemon.ivs?.SpA !== undefined ? pokemon.ivs.SpA : 31,
        spd: pokemon.ivs?.SpD !== undefined ? pokemon.ivs.SpD : 31,
        spe: pokemon.ivs?.Spe !== undefined ? pokemon.ivs.Spe : 31,
      };

      // Limpiar nombre de especie para Smogon Calc
      let speciesName = pokemon.species;
      // Normalizaciones básicas
      if (speciesName.toLowerCase() === "urshifu-rs" || speciesName.toLowerCase() === "urshifu rapid strike") {
        speciesName = "Urshifu-Rapid-Strike";
      }

      let ourSmogonPokemon: Pokemon;
      try {
        ourSmogonPokemon = new Pokemon(gen, speciesName, {
          item: pokemon.item,
          nature: pokemon.nature,
          evs: ourEvs,
          ivs: ourIvs,
          teraType: pokemon.teraType as any,
        });
      } catch (err) {
        // Fallback si la especie no existe todavía en calc
        ourSmogonPokemon = new Pokemon(gen, "Pikachu", {
          item: pokemon.item,
          nature: pokemon.nature,
          evs: ourEvs,
          ivs: ourIvs,
        });
      }

      if (calcMode === "defense") {
        // Simular daño recibido de los 5 atacantes del meta
        const tempResults = METAGAME_THREATS.map((threat) => {
          try {
            const attacker = new Pokemon(gen, threat.species, {
              item: threat.item,
              nature: threat.nature,
              evs: threat.evs,
            });
            const move = new Move(gen, threat.move);
            const result = calculate(gen, attacker, ourSmogonPokemon, move);
            
            const damageResult = result.damage;
            const desc = result.desc();
            
            // Calcular porcentajes exactos de daño
            const hpTotal = ourSmogonPokemon.stats.hp;
            let minDamage = 0;
            let maxDamage = 0;

            if (typeof damageResult === "number") {
              minDamage = damageResult;
              maxDamage = damageResult;
            } else if (Array.isArray(damageResult)) {
              // Si es un array de rollouts (daño por golpe)
              const dmgArray = damageResult as any[];
              if (dmgArray.length > 0) {
                // Si es un ataque multi-hit como Surging Strikes
                if (threat.move === "Surging Strikes") {
                  // Surging strikes golpea 3 veces. El cálculo calcula por golpe.
                  const singleHitMin = dmgArray[0];
                  const singleHitMax = dmgArray[dmgArray.length - 1];
                  minDamage = Number(singleHitMin) * 3;
                  maxDamage = Number(singleHitMax) * 3;
                } else {
                  minDamage = Number(dmgArray[0]);
                  maxDamage = Number(dmgArray[dmgArray.length - 1]);
                }
              }
            }

            const minPct = parseFloat(((minDamage / hpTotal) * 100).toFixed(1));
            const maxPct = parseFloat(((maxDamage / hpTotal) * 100).toFixed(1));

            // Estimar chance de KO de forma sencilla
            let koChance = "Sobrevive";
            if (minPct >= 100) {
              koChance = "OHKO Seguro (100%)";
            } else if (maxPct >= 100) {
              koChance = "Probable OHKO";
            } else if (maxPct >= 50) {
              koChance = "2HKO Posible";
            }

            return {
              threatName: threat.name,
              moveName: threat.move,
              minPct,
              maxPct,
              koChance,
              desc,
              valid: true,
            };
          } catch (e) {
            return {
              threatName: threat.name,
              moveName: threat.move,
              minPct: 0,
              maxPct: 0,
              koChance: "Error",
              desc: "Error en el cálculo",
              valid: false,
            };
          }
        });
        setResults(tempResults);
      } else {
        // Simular daño realizado con el ataque seleccionado contra defensores del meta
        // Definimos defensores comunes
        const standardDefenders = [
          { name: "Flutter Mane Standard", species: "Flutter Mane", evs: { hp: 4, def: 4, spd: 4 } },
          { name: "Urshifu-RS Bulky", species: "Urshifu-Rapid-Strike", evs: { hp: 252, def: 4, spd: 4 } },
          { name: "Amoonguss Bulky", species: "Amoonguss", evs: { hp: 252, def: 156, spd: 100 } },
          { name: "Incineroar Standard", species: "Incineroar", evs: { hp: 244, def: 84, spd: 180 } },
        ];

        const tempResults = standardDefenders.map((def) => {
          try {
            const defender = new Pokemon(gen, def.species, {
              evs: def.evs,
            });
            const move = new Move(gen, selectedOffensiveMove || pokemon.moves[0] || "Tackle");
            const result = calculate(gen, ourSmogonPokemon, defender, move);
            
            const damageResult = result.damage;
            const desc = result.desc();
            
            const hpTotal = defender.stats.hp;
            let minDamage = 0;
            let maxDamage = 0;

            if (typeof damageResult === "number") {
              minDamage = damageResult;
              maxDamage = damageResult;
            } else if (Array.isArray(damageResult)) {
              const dmgArray = damageResult as any[];
              if (dmgArray.length > 0) {
                minDamage = Number(dmgArray[0]);
                maxDamage = Number(dmgArray[dmgArray.length - 1]);
              }
            }

            const minPct = parseFloat(((minDamage / hpTotal) * 100).toFixed(1));
            const maxPct = parseFloat(((maxDamage / hpTotal) * 100).toFixed(1));

            let koChance = "Poco Daño";
            if (minPct >= 100) {
              koChance = "OHKO Seguro (100%)";
            } else if (maxPct >= 100) {
              koChance = "OHKO Posible";
            } else if (maxPct >= 50) {
              koChance = "2HKO Posible";
            }

            return {
              threatName: def.name,
              moveName: move.name,
              minPct,
              maxPct,
              koChance,
              desc,
              valid: true,
            };
          } catch (e) {
            return {
              threatName: def.name,
              moveName: selectedOffensiveMove,
              minPct: 0,
              maxPct: 0,
              koChance: "Error",
              desc: "Error en el cálculo",
              valid: false,
            };
          }
        });
        setResults(tempResults);
      }
    } catch (e) {
      console.error("Error global en simulador de cálculo:", e);
    }
  }, [pokemon, calcMode, selectedOffensiveMove]);

  // Sincronizar el movimiento ofensivo seleccionado si cambian los movimientos
  useEffect(() => {
    if (pokemon.moves && !pokemon.moves.includes(selectedOffensiveMove)) {
      setSelectedOffensiveMove(pokemon.moves[0] || "");
    }
  }, [pokemon.moves]);

  return (
    <div className={`mt-4 border-2 border-dashed ${activeTheme.borderClass} p-4 bg-black/20`}>
      {/* Selector de Modo */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setCalcMode("defense")}
          className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1 border-2 
                     flex items-center justify-center gap-1.5 cursor-pointer transition-colors
                     ${calcMode === "defense" 
                       ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]" 
                       : `border-[var(--foreground)]/20 ${activeTheme.textMainClass} hover:bg-white/5`}`}
        >
          <Shield className="w-3.5 h-3.5" />
          Simular Defensa (Sobrevivir)
        </button>
        <button
          type="button"
          onClick={() => setCalcMode("offense")}
          className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1 border-2 
                     flex items-center justify-center gap-1.5 cursor-pointer transition-colors
                     ${calcMode === "offense" 
                       ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]" 
                       : `border-[var(--foreground)]/20 ${activeTheme.textMainClass} hover:bg-white/5`}`}
        >
          <Sword className="w-3.5 h-3.5" />
          Simular Ataque (KOs)
        </button>
      </div>

      {/* Selector de movimiento para Ataque */}
      {calcMode === "offense" && (
        <div className="mb-4">
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1.5`}>
            Selecciona tu Movimiento:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {pokemon.moves.filter(m => m).map((move) => (
              <button
                key={move}
                type="button"
                onClick={() => setSelectedOffensiveMove(move)}
                className={`text-[9px] font-bold uppercase py-1 px-2 border truncate cursor-pointer transition-all
                           ${selectedOffensiveMove === move
                             ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)] font-black"
                             : `border-[var(--foreground)]/10 ${activeTheme.textMainClass} hover:bg-white/5`}`}
              >
                {move}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultados del Cálculo */}
      <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
        {results.map((res, i) => {
          const isDanger = res.maxPct >= 100;
          const isWarning = res.maxPct >= 50 && res.maxPct < 100;
          
          return (
            <div key={i} className="flex flex-col gap-1 border-b border-[var(--foreground)]/5 pb-2.5 last:border-0 last:pb-0">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className={activeTheme.textMainClass}>{res.threatName}</span>
                <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 border
                                ${isDanger 
                                  ? "bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]" 
                                  : isWarning 
                                    ? "bg-amber-500/20 text-amber-500 border-amber-500" 
                                    : "bg-emerald-500/20 text-emerald-500 border-emerald-500"}`}>
                  {res.koChance}
                </span>
              </div>
              
              {/* Barra de Progreso Brutalista de Daño */}
              <div className="h-3 w-full bg-black/40 border border-[var(--foreground)]/10 relative overflow-hidden flex items-center">
                {/* Rango de Daño */}
                <div 
                  className={`absolute h-full transition-all duration-300
                             ${isDanger 
                               ? "bg-[var(--danger)]" 
                               : isWarning 
                                 ? "bg-amber-500" 
                                 : "bg-emerald-500"}`}
                  style={{
                    left: `${Math.min(res.minPct, 100)}%`,
                    width: `${Math.min(res.maxPct - res.minPct, 100 - Math.min(res.minPct, 100))}%`,
                  }}
                />
                
                {/* Texto del Rango */}
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference drop-shadow-md">
                  {res.minPct}% - {res.maxPct}%
                </span>
              </div>

              {/* Descripción Smogon */}
              <span className={`text-[8px] font-bold ${activeTheme.textMutedClass} leading-tight block select-none`}>
                {res.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
