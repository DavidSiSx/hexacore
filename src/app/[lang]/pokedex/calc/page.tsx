"use client";

import { useState, useMemo, use } from "react";
import { calculate, Generations, Pokemon, Move, Field } from "@smogon/calc";
import type { StatsTable, StatusName, Terrain, Weather, GameType } from "@smogon/calc/dist/data/interface";
import { Dex } from "@pkmn/dex";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Calculator, RotateCcw, ChevronDown, Swords, Shield, Zap, Sun, Cloud, Snowflake, Wind } from "lucide-react";

// Initialize generation 9 for @smogon/calc
const gen = Generations.get(9);

// Get all Pokemon from @pkmn/dex
const allPokemon = Array.from(Dex.species.all())
  .filter(p => p.exists && !p.isNonstandard && p.num > 0)
  .sort((a, b) => a.num - b.num);

// Get all moves from @pkmn/dex
const allMoves = Array.from(Dex.moves.all())
  .filter(m => m.exists && !m.isNonstandard && m.basePower >= 0)
  .sort((a, b) => a.name.localeCompare(b.name));

// Get all items from @pkmn/dex
const allItems = Array.from(Dex.items.all())
  .filter(i => i.exists && !i.isNonstandard)
  .sort((a, b) => a.name.localeCompare(b.name));

// Get all abilities from @pkmn/dex
const allAbilities = Array.from(Dex.abilities.all())
  .filter(a => a.exists && !a.isNonstandard)
  .sort((a, b) => a.name.localeCompare(b.name));

// Status conditions available
const STATUS_CONDITIONS: StatusName[] = ["Healthy", "Paralysis", "Poison", "Burn", "Sleep", "Freeze"];

// Field weathers
const WEATHERS: (Weather | "")[] = ["", "Sun", "Rain", "Sand", "Snow", "Harsh Sunshine", "Heavy Rain", "Strong Winds"];

// Field terrains
const TERRAINS: (Terrain | "")[] = ["", "Electric", "Grassy", "Psychic", "Misty"];

// Natures
const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky"
];

// Pokemon types
const POKEMON_TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

// Boost stages
const BOOST_STAGES = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

interface PokemonData {
  name: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: string[];
  sprite: string;
}

interface MoveData {
  name: string;
  type: string;
  category: string;
  basePower: number;
  accuracy: number;
}

interface SideState {
  species: string;
  speciesData: PokemonData | null;
  level: number;
  evs: StatsTable;
  ivs: StatsTable;
  nature: string;
  boosts: StatsTable;
  teraType: string;
  ability: string;
  item: string;
  status: StatusName;
  currentHP: number;
  moves: MoveData[];
  selectedMoveIndex: number;
}

interface FieldSideState {
  spikes: number;
  stealthRock: boolean;
  steelsurge: boolean;
  reflect: boolean;
  lightScreen: boolean;
  auroraVeil: boolean;
  tailwind: boolean;
  friendGuard: boolean;
  helpingHand: boolean;
  isBattery: boolean;
  isPowerSpot: boolean;
  vineLash: boolean;
  wildfire: boolean;
  cannonade: boolean;
  volcalith: boolean;
  isSeeded: boolean;
  isSaltCure: boolean;
  isForesight: boolean;
  isFlowerGift: boolean;
  isSwitching: "out" | "in" | null;
}

interface FieldState {
  gameType: GameType;
  weather: Weather | "";
  terrain: Terrain | "";
  isGravity: boolean;
  isMagicRoom: boolean;
  isWonderRoom: boolean;
  isAuraBreak: boolean;
  isFairyAura: boolean;
  isDarkAura: boolean;
  isBeadsOfRuin: boolean;
  isTabletsOfRuin: boolean;
  isSwordOfRuin: boolean;
  isVesselOfRuin: boolean;
  attackerSide: FieldSideState;
  defenderSide: FieldSideState;
}

const defaultSideState: FieldSideState = {
  spikes: 0,
  stealthRock: false,
  steelsurge: false,
  reflect: false,
  lightScreen: false,
  auroraVeil: false,
  tailwind: false,
  friendGuard: false,
  helpingHand: false,
  isBattery: false,
  isPowerSpot: false,
  vineLash: false,
  wildfire: false,
  cannonade: false,
  volcalith: false,
  isSeeded: false,
  isSaltCure: false,
  isForesight: false,
  isFlowerGift: false,
  isSwitching: null,
};

const createDefaultSide = (nature: string = "Adamant", evs?: Partial<StatsTable>): SideState => ({
  species: "",
  speciesData: null,
  level: 50,
  evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 4, ...evs },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  nature,
  boosts: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  teraType: "",
  ability: "",
  item: "",
  status: "Healthy",
  currentHP: 100,
  moves: [],
  selectedMoveIndex: 0,
});

// Convert @pkmn/dex Pokemon to our format
function dexToPokemonData(species: typeof allPokemon[0]): PokemonData {
  return {
    name: species.name,
    types: species.types,
    baseStats: {
      hp: species.baseStats.hp,
      atk: species.baseStats.atk,
      def: species.baseStats.def,
      spa: species.baseStats.spa,
      spd: species.baseStats.spd,
      spe: species.baseStats.spe,
    },
    abilities: Object.values(species.abilities).filter(Boolean) as string[],
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${species.num}.png`,
  };
}

// Convert @pkmn/dex Move to our format
function dexToMoveData(move: typeof allMoves[0]): MoveData {
  return {
    name: move.name,
    type: move.type,
    category: move.category,
    basePower: move.basePower,
    accuracy: move.accuracy === true ? 100 : (move.accuracy || 0),
  };
}

export default function DamageCalcPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const { activeTheme } = useTheme();

  const [attacker, setAttacker] = useState<SideState>(createDefaultSide("Adamant"));
  const [defender, setDefender] = useState<SideState>(
    createDefaultSide("Bold", { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 })
  );

  const [field, setField] = useState<FieldState>({
    gameType: "Singles",
    weather: "",
    terrain: "",
    isGravity: false,
    isMagicRoom: false,
    isWonderRoom: false,
    isAuraBreak: false,
    isFairyAura: false,
    isDarkAura: false,
    isBeadsOfRuin: false,
    isTabletsOfRuin: false,
    isSwordOfRuin: false,
    isVesselOfRuin: false,
    attackerSide: { ...defaultSideState },
    defenderSide: { ...defaultSideState },
  });

  const [crit, setCrit] = useState(false);
  const [showFieldOptions, setShowFieldOptions] = useState(true);

  // Calculate damage for a specific move
  const calculateMoveResult = (moveData: MoveData | undefined, attackerState: SideState, defenderState: SideState, fieldState: FieldState, isCrit: boolean) => {
    if (!attackerState.species || !defenderState.species || !moveData) return null;

    try {
      const attackerPokemon = new Pokemon(gen, attackerState.species, {
        level: attackerState.level,
        evs: attackerState.evs,
        ivs: attackerState.ivs,
        nature: attackerState.nature,
        boosts: attackerState.boosts,
        teraType: attackerState.teraType || undefined,
        ability: attackerState.ability || undefined,
        item: attackerState.item || undefined,
        status: attackerState.status === "Healthy" ? undefined : attackerState.status.toLowerCase() as any,
      });

      // Create defender Pokemon first without curHP to get maxHP
      const defenderPokemon = new Pokemon(gen, defenderState.species, {
        level: defenderState.level,
        evs: defenderState.evs,
        ivs: defenderState.ivs,
        nature: defenderState.nature,
        boosts: defenderState.boosts,
        teraType: defenderState.teraType || undefined,
        ability: defenderState.ability || undefined,
        item: defenderState.item || undefined,
        status: defenderState.status === "Healthy" ? undefined : defenderState.status.toLowerCase() as any,
      });
      
      // Now set current HP based on percentage
      if (defenderState.currentHP < 100) {
        defenderPokemon.curHP = Math.round((defenderState.currentHP / 100) * defenderPokemon.maxHP());
      }

      const move = new Move(gen, moveData.name, {
        isCrit: isCrit,
      });

      const calcField = new Field({
        gameType: fieldState.gameType,
        weather: fieldState.weather || undefined,
        terrain: fieldState.terrain || undefined,
        isGravity: fieldState.isGravity,
        isMagicRoom: fieldState.isMagicRoom,
        isWonderRoom: fieldState.isWonderRoom,
        isAuraBreak: fieldState.isAuraBreak,
        isFairyAura: fieldState.isFairyAura,
        isDarkAura: fieldState.isDarkAura,
        isBeadsOfRuin: fieldState.isBeadsOfRuin,
        isTabletsOfRuin: fieldState.isTabletsOfRuin,
        isSwordOfRuin: fieldState.isSwordOfRuin,
        isVesselOfRuin: fieldState.isVesselOfRuin,
        attackerSide: fieldState.attackerSide,
        defenderSide: fieldState.defenderSide,
      });

      return calculate(gen, attackerPokemon, defenderPokemon, move, calcField);
    } catch (e) {
      console.error("[v0] Calc error:", e);
      return null;
    }
  };

  // Calculate damage for selected move
  const damageResult = useMemo(() => {
    const selectedMove = attacker.moves[attacker.selectedMoveIndex];
    return calculateMoveResult(selectedMove, attacker, defender, field, crit);
  }, [attacker, defender, field, crit]);

  // Calculate damage for all moves
  const allMoveResults = useMemo(() => {
    return attacker.moves.map((move, index) => {
      if (!move) return null;
      const result = calculateMoveResult(move, attacker, defender, field, crit);
      if (!result) return null;

      const damage = result.damage;
      let min = 0, max = 0;
      
      if (typeof damage === "number") {
        min = max = damage;
      } else if (Array.isArray(damage)) {
        if (Array.isArray(damage[0])) {
          const flatDamage = (damage as number[][]).flat();
          min = Math.min(...flatDamage);
          max = Math.max(...flatDamage);
        } else {
          min = Math.min(...(damage as number[]));
          max = Math.max(...(damage as number[]));
        }
      }

      const defHP = result.defender.maxHP();
      const minPct = ((min / defHP) * 100).toFixed(1);
      const maxPct = ((max / defHP) * 100).toFixed(1);

      let koChance = "";
      try {
        // Try to get KO chance text
        const koResult = result.kpiChance?.();
        if (koResult) koChance = koResult;
      } catch {}
      
      if (!koChance) {
        if (min >= defHP) koChance = "OHKO";
        else if (max >= defHP) koChance = "~OHKO";
        else if (min * 2 >= defHP) koChance = "2HKO";
        else if (max * 2 >= defHP) koChance = "~2HKO";
        else if (max * 3 >= defHP) koChance = "3HKO";
        else koChance = "4HKO+";
      }

      return {
        move,
        index,
        min,
        max,
        minPct,
        maxPct,
        koChance,
        desc: result.fullDesc(),
      };
    }).filter(Boolean);
  }, [attacker, defender, field, crit]);

  // Extract damage range from result
  const damageRange = useMemo(() => {
    if (!damageResult) return { min: 0, max: 0, minPct: "0", maxPct: "0", desc: "", koChance: "" };
    
    const damage = damageResult.damage;
    let min = 0, max = 0;
    
    if (typeof damage === "number") {
      min = max = damage;
    } else if (Array.isArray(damage)) {
      if (Array.isArray(damage[0])) {
        const flatDamage = (damage as number[][]).flat();
        min = Math.min(...flatDamage);
        max = Math.max(...flatDamage);
      } else {
        min = Math.min(...(damage as number[]));
        max = Math.max(...(damage as number[]));
      }
    }

    const defHP = damageResult.defender.maxHP();
    const minPct = ((min / defHP) * 100).toFixed(1);
    const maxPct = ((max / defHP) * 100).toFixed(1);

    let koChance = "";
    try {
      const koResult = (damageResult as any).kpiChance?.();
      if (koResult) koChance = koResult;
    } catch {}
    
    if (!koChance) {
      if (min >= defHP) koChance = "guaranteed OHKO";
      else if (max >= defHP) koChance = "possible OHKO";
      else if (min * 2 >= defHP) koChance = "guaranteed 2HKO";
      else if (max * 2 >= defHP) koChance = "possible 2HKO";
      else if (max * 3 >= defHP) koChance = "3HKO";
      else koChance = "4HKO+";
    }

    return {
      min,
      max,
      minPct,
      maxPct,
      desc: damageResult.fullDesc(),
      koChance,
    };
  }, [damageResult]);

  // Pokemon search component
  function PokemonSearch({ side, setSide, label }: { 
    side: SideState; 
    setSide: React.Dispatch<React.SetStateAction<SideState>>; 
    label: string 
  }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const results = useMemo(() => {
      if (query.length < 2) return [];
      const q = query.toLowerCase();
      return allPokemon
        .filter(p => p.name.toLowerCase().includes(q))
        .slice(0, 10)
        .map(dexToPokemonData);
    }, [query]);

    const selectPokemon = (pokemon: PokemonData) => {
      const species = Dex.species.get(pokemon.name);
      
      setSide(prev => ({
        ...prev,
        species: pokemon.name,
        speciesData: pokemon,
        ability: pokemon.abilities[0] || "",
        moves: [],
      }));
      
      setQuery("");
      setIsOpen(false);
    };

    return (
      <div className="relative">
        <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2">{label}</label>
        {side.species ? (
          <div className={`flex items-center justify-between p-3 bg-zinc-900 border-2 ${activeTheme.borderClass}`}>
            <div className="flex items-center gap-3">
              {side.speciesData?.sprite && (
                <img src={side.speciesData.sprite} alt={side.species} className="w-12 h-12 object-contain pixelated" />
              )}
              <div>
                <span className="text-white font-black text-sm uppercase">{side.species}</span>
                {side.speciesData?.types && (
                  <div className="flex gap-1 mt-1">
                    {side.speciesData.types.map(t => (
                      <span key={t} className={`text-[8px] font-bold px-1 py-0.5 rounded text-white ${getTypeBg(t)}`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setSide(prev => ({ ...prev, species: "", speciesData: null, moves: [] }))} 
              className="text-red-500 font-bold text-lg hover:text-red-400"
            >
              x
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search Pokemon..."
            className={`w-full bg-zinc-950 border-2 ${activeTheme.borderClass} px-3 py-3 text-white font-bold text-sm focus:outline-none`}
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border-2 border-current max-h-64 overflow-y-auto">
            {results.map(p => (
              <div 
                key={p.name} 
                onClick={() => selectPokemon(p)} 
                className="flex items-center gap-3 p-2 hover:bg-zinc-800 cursor-pointer border-b border-zinc-900"
              >
                <img src={p.sprite} alt={p.name} className="w-8 h-8 object-contain pixelated" />
                <span className="text-sm font-bold uppercase">{p.name}</span>
                <div className="flex gap-1 ml-auto">
                  {p.types.map(t => (
                    <span key={t} className={`text-[8px] font-bold px-1 py-0.5 rounded text-white ${getTypeBg(t)}`}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Move search component with damage display
  function MoveSearch({ index, side, setSide, showDamage = false }: { 
    index: number; 
    side: SideState; 
    setSide: React.Dispatch<React.SetStateAction<SideState>>;
    showDamage?: boolean;
  }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const move = side.moves[index];
    const isSelected = side.selectedMoveIndex === index;
    
    // Get damage result for this move
    const moveResult = allMoveResults.find(r => r?.index === index);

    const results = useMemo(() => {
      if (query.length < 2) return [];
      const q = query.toLowerCase();
      return allMoves
        .filter(m => m.name.toLowerCase().includes(q) && m.basePower > 0)
        .slice(0, 8)
        .map(dexToMoveData);
    }, [query]);

    const selectMove = (m: MoveData) => {
      setSide(prev => {
        const newMoves = [...prev.moves];
        newMoves[index] = m;
        return { ...prev, moves: newMoves, selectedMoveIndex: index };
      });
      setQuery("");
      setIsOpen(false);
    };

    return (
      <div className="relative">
        {move ? (
          <div
            onClick={() => setSide(prev => ({ ...prev, selectedMoveIndex: index }))}
            className={`flex flex-col p-2 border-2 cursor-pointer transition-all ${
              isSelected ? `${activeTheme.borderClass} bg-zinc-800` : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getTypeBg(move.type)}`} />
                <span className="text-xs font-bold uppercase truncate">{move.name}</span>
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSide(prev => { 
                    const newMoves = [...prev.moves]; 
                    newMoves[index] = undefined as any; 
                    return { ...prev, moves: newMoves.filter(Boolean) }; 
                  }); 
                }} 
                className="text-red-500 text-xs hover:text-red-400"
              >
                x
              </button>
            </div>
            {showDamage && moveResult && (
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-700">
                <span className={`text-[10px] font-mono font-bold ${
                  moveResult.koChance.includes("OHKO") ? "text-red-400" : 
                  moveResult.koChance.includes("2HKO") ? "text-orange-400" : 
                  "text-zinc-400"
                }`}>
                  {moveResult.minPct}% - {moveResult.maxPct}%
                </span>
                <span className={`text-[9px] font-bold ${
                  moveResult.koChance.includes("OHKO") ? "text-red-500" : 
                  moveResult.koChance.includes("2HKO") ? "text-orange-500" : 
                  "text-zinc-500"
                }`}>
                  {moveResult.koChance}
                </span>
              </div>
            )}
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={`Move ${index + 1}`}
            className="w-full bg-zinc-900 border-2 border-zinc-800 px-2 py-2 text-xs font-bold focus:outline-none focus:border-current"
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border-2 border-current max-h-48 overflow-y-auto">
            {results.map(m => (
              <div 
                key={m.name} 
                onClick={() => selectMove(m)} 
                className="flex items-center justify-between p-2 hover:bg-zinc-800 cursor-pointer border-b border-zinc-900"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getTypeBg(m.type)}`} />
                  <span className="text-xs font-bold uppercase">{m.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-60">
                  <span>{m.category}</span>
                  <span>{m.basePower || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Item search component
  function ItemSearch({ side, setSide }: { 
    side: SideState; 
    setSide: React.Dispatch<React.SetStateAction<SideState>> 
  }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const results = useMemo(() => {
      if (query.length < 2) return [];
      const q = query.toLowerCase();
      return allItems
        .filter(i => i.name.toLowerCase().includes(q))
        .slice(0, 8);
    }, [query]);

    return (
      <div className="relative">
        <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Item</label>
        {side.item ? (
          <div className="flex items-center justify-between bg-zinc-900 border border-current/30 px-2 py-1">
            <span className="text-xs font-bold truncate">{side.item}</span>
            <button onClick={() => setSide(prev => ({ ...prev, item: "" }))} className="text-red-500 text-xs">x</button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search..."
            className="w-full bg-black border border-current/30 px-2 py-1 text-xs focus:outline-none"
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border border-current max-h-32 overflow-y-auto">
            {results.map(item => (
              <div 
                key={item.name} 
                onClick={() => { setSide(prev => ({ ...prev, item: item.name })); setQuery(""); setIsOpen(false); }} 
                className="px-2 py-1 hover:bg-zinc-800 cursor-pointer text-xs font-bold border-b border-zinc-900"
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Ability search component
  function AbilitySearch({ side, setSide }: { 
    side: SideState; 
    setSide: React.Dispatch<React.SetStateAction<SideState>> 
  }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const results = useMemo(() => {
      if (query.length < 2) return [];
      const q = query.toLowerCase();
      return allAbilities
        .filter(a => a.name.toLowerCase().includes(q))
        .slice(0, 8);
    }, [query]);

    return (
      <div className="relative">
        <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Ability</label>
        {side.ability ? (
          <div className="flex items-center justify-between bg-zinc-900 border border-current/30 px-2 py-1">
            <span className="text-xs font-bold truncate">{side.ability}</span>
            <button onClick={() => setSide(prev => ({ ...prev, ability: "" }))} className="text-red-500 text-xs">x</button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search..."
            className="w-full bg-black border border-current/30 px-2 py-1 text-xs focus:outline-none"
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border border-current max-h-32 overflow-y-auto">
            {results.map(ab => (
              <div 
                key={ab.name} 
                onClick={() => { setSide(prev => ({ ...prev, ability: ab.name })); setQuery(""); setIsOpen(false); }} 
                className="px-2 py-1 hover:bg-zinc-800 cursor-pointer text-xs font-bold border-b border-zinc-900"
              >
                {ab.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stats panel
  function StatsPanel({ side, setSide }: { 
    side: SideState; 
    setSide: React.Dispatch<React.SetStateAction<SideState>> 
  }) {
    const stats = ["hp", "atk", "def", "spa", "spd", "spe"] as const;
    const statLabels = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" };
    
    const totalEVs = Object.values(side.evs).reduce((a, b) => a + b, 0);
    const remainingEVs = 508 - totalEVs;
    const [showIVs, setShowIVs] = useState(false);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black opacity-50 uppercase">EVs ({totalEVs}/508)</span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${remainingEVs < 0 ? "text-red-500" : "text-green-500"}`}>{remainingEVs} left</span>
            <button 
              onClick={() => setShowIVs(!showIVs)} 
              className="text-[9px] font-bold px-1 py-0.5 bg-zinc-800 hover:bg-zinc-700 rounded"
            >
              {showIVs ? "Hide IVs" : "Edit IVs"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map(stat => (
            <div key={stat} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black opacity-70 uppercase">{statLabels[stat]}</label>
                {!showIVs && <span className="text-[9px] font-mono opacity-50">IV:{side.ivs[stat]}</span>}
              </div>
              <input
                type="number"
                min={0}
                max={252}
                value={side.evs[stat]}
                onChange={(e) => setSide(prev => ({ 
                  ...prev, 
                  evs: { ...prev.evs, [stat]: Math.min(252, Math.max(0, +e.target.value)) } 
                }))}
                className="w-full bg-black border border-current/30 px-2 py-1 text-xs font-mono focus:outline-none focus:border-current"
              />
            </div>
          ))}
        </div>
        
        {/* IVs */}
        {showIVs && (
          <div className="pt-3 border-t border-current/10">
            <span className="text-[10px] font-black opacity-50 uppercase block mb-2">IVs (0-31)</span>
            <div className="grid grid-cols-6 gap-2">
              {stats.map(stat => (
                <div key={stat} className="flex flex-col gap-1">
                  <label className="text-[9px] font-black opacity-70 uppercase text-center">{statLabels[stat]}</label>
                  <input
                    type="number"
                    min={0}
                    max={31}
                    value={side.ivs[stat]}
                    onChange={(e) => setSide(prev => ({ 
                      ...prev, 
                      ivs: { ...prev.ivs, [stat]: Math.min(31, Math.max(0, +e.target.value)) } 
                    }))}
                    className="w-full bg-zinc-900 border border-current/30 px-1 py-1 text-[10px] font-mono focus:outline-none focus:border-current text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Boosts */}
        <div className="pt-3 border-t border-current/10">
          <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Stat Boosts</span>
          <div className="grid grid-cols-5 gap-2">
            {(["atk", "def", "spa", "spd", "spe"] as const).map(stat => (
              <div key={stat} className="flex flex-col gap-1">
                <label className="text-[9px] font-black opacity-70 uppercase text-center">{statLabels[stat]}</label>
                <select
                  value={side.boosts[stat]}
                  onChange={(e) => setSide(prev => ({ 
                    ...prev, 
                    boosts: { ...prev.boosts, [stat]: +e.target.value } 
                  }))}
                  className="w-full bg-black border border-current/30 px-1 py-1 text-[10px] font-bold focus:outline-none text-center"
                >
                  {BOOST_STAGES.map(s => (
                    <option key={s} value={s}>{s > 0 ? `+${s}` : s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pokemon panel
  function PokemonPanel({ side, setSide, label, isAttacker }: { 
    side: SideState; 
    setSide: React.Dispatch<React.SetStateAction<SideState>>; 
    label: string; 
    isAttacker: boolean 
  }) {
    return (
      <div className={`p-4 md:p-6 border-4 ${activeTheme.borderClass} bg-black/40 flex flex-col gap-4`}>
        <PokemonSearch side={side} setSide={setSide} label={label} />
        
        {/* Level and Nature */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Level</label>
            <input
              type="number"
              min={1}
              max={100}
              value={side.level}
              onChange={(e) => setSide(prev => ({ ...prev, level: Math.min(100, Math.max(1, +e.target.value)) }))}
              className="w-full bg-black border border-current/30 px-2 py-1 text-xs font-mono focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Nature</label>
            <select
              value={side.nature}
              onChange={(e) => setSide(prev => ({ ...prev, nature: e.target.value }))}
              className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none"
            >
              {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Tera Type */}
        <div>
          <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Tera Type</label>
          <select
            value={side.teraType}
            onChange={(e) => setSide(prev => ({ ...prev, teraType: e.target.value }))}
            className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none"
          >
            <option value="">None</option>
            {POKEMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            <option value="Stellar">Stellar</option>
          </select>
        </div>

        {/* Ability and Item */}
        <div className="grid grid-cols-2 gap-3">
          <AbilitySearch side={side} setSide={setSide} />
          <ItemSearch side={side} setSide={setSide} />
        </div>

        {/* Status and HP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Status</label>
            <select
              value={side.status}
              onChange={(e) => setSide(prev => ({ ...prev, status: e.target.value as StatusName }))}
              className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none"
            >
              {STATUS_CONDITIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Current HP %</label>
            <input
              type="number"
              min={1}
              max={100}
              value={side.currentHP}
              onChange={(e) => setSide(prev => ({ ...prev, currentHP: Math.min(100, Math.max(1, +e.target.value)) }))}
              className="w-full bg-black border border-current/30 px-2 py-1 text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Moves */}
        {isAttacker && (
          <div className="pt-3 border-t border-current/10">
            <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Moves (click to select for details)</span>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(i => (
                <MoveSearch key={i} index={i} side={side} setSide={setSide} showDamage={!!defender.species} />
              ))}
            </div>
          </div>
        )}

        {/* EVs/IVs/Boosts */}
        <StatsPanel side={side} setSide={setSide} />
      </div>
    );
  }

  // Field options panel
  function FieldOptionsPanel() {
    const weatherIcon = (w: Weather | "") => {
      switch(w) {
        case "Sun": case "Harsh Sunshine": return <Sun className="w-3 h-3 text-orange-400" />;
        case "Rain": case "Heavy Rain": return <Cloud className="w-3 h-3 text-blue-400" />;
        case "Sand": return <Wind className="w-3 h-3 text-amber-400" />;
        case "Snow": return <Snowflake className="w-3 h-3 text-cyan-300" />;
        default: return null;
      }
    };

    return (
      <div className="bg-zinc-900/50 border-2 border-current/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black uppercase">Field Options</span>
            {field.weather && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold">
                {weatherIcon(field.weather)}
                <span>{field.weather}</span>
              </div>
            )}
            {field.terrain && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-bold">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>{field.terrain}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowFieldOptions(!showFieldOptions)} 
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            {showFieldOptions ? "Hide" : "Show"} 
            <ChevronDown className={`inline w-4 h-4 transition-transform ${showFieldOptions ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFieldOptions && (
          <div className="space-y-4 pt-2">
            {/* Game Type, Weather, Terrain */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Format</label>
                <select 
                  value={field.gameType} 
                  onChange={(e) => setField(prev => ({ ...prev, gameType: e.target.value as GameType }))} 
                  className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none"
                >
                  <option value="Singles">Singles</option>
                  <option value="Doubles">Doubles</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Weather</label>
                <select 
                  value={field.weather} 
                  onChange={(e) => setField(prev => ({ ...prev, weather: e.target.value as Weather | "" }))} 
                  className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none"
                >
                  {WEATHERS.map(w => <option key={w || "none"} value={w}>{w || "None"}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Terrain</label>
                <select 
                  value={field.terrain} 
                  onChange={(e) => setField(prev => ({ ...prev, terrain: e.target.value as Terrain | "" }))} 
                  className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none"
                >
                  {TERRAINS.map(t => <option key={t || "none"} value={t}>{t || "None"}</option>)}
                </select>
              </div>
            </div>

            {/* Two-column layout for Attacker and Defender sides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attacker Side */}
              <div className="border border-red-500/30 bg-red-950/20 p-3 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <Swords className="w-4 h-4 text-red-500" />
                  <span className="text-[11px] font-black text-red-400 uppercase">Attacker Side</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.attackerSide.helpingHand} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        attackerSide: { ...prev.attackerSide, helpingHand: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-red-500" 
                    />
                    Helping Hand
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.attackerSide.tailwind} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        attackerSide: { ...prev.attackerSide, tailwind: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-red-500" 
                    />
                    Tailwind
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.attackerSide.isBattery} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        attackerSide: { ...prev.attackerSide, isBattery: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-red-500" 
                    />
                    Battery
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.attackerSide.isPowerSpot} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        attackerSide: { ...prev.attackerSide, isPowerSpot: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-red-500" 
                    />
                    Power Spot
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.attackerSide.isFlowerGift} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        attackerSide: { ...prev.attackerSide, isFlowerGift: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-red-500" 
                    />
                    Flower Gift
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.attackerSide.stealthRock} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        attackerSide: { ...prev.attackerSide, stealthRock: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-red-500" 
                    />
                    Stealth Rock
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold opacity-70">Spikes:</span>
                  <select 
                    value={field.attackerSide.spikes} 
                    onChange={(e) => setField(prev => ({ 
                      ...prev, 
                      attackerSide: { ...prev.attackerSide, spikes: +e.target.value } 
                    }))} 
                    className="bg-black border border-red-500/30 px-1 py-0.5 text-[10px] rounded"
                  >
                    {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {/* Defender Side */}
              <div className="border border-blue-500/30 bg-blue-950/20 p-3 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] font-black text-blue-400 uppercase">Defender Side</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.reflect} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, reflect: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Reflect
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.lightScreen} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, lightScreen: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Light Screen
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.auroraVeil} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, auroraVeil: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Aurora Veil
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.friendGuard} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, friendGuard: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Friend Guard
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.isSeeded} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, isSeeded: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Leech Seed
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.isSaltCure} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, isSaltCure: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Salt Cure
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.isForesight} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, isForesight: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Foresight
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                    <input 
                      type="checkbox" 
                      checked={field.defenderSide.tailwind} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, tailwind: e.target.checked } 
                      }))} 
                      className="w-3 h-3 accent-blue-500" 
                    />
                    Tailwind
                  </label>
                </div>
                
                {/* Hazards */}
                <div className="mt-3 pt-2 border-t border-blue-500/20">
                  <span className="text-[9px] font-black text-blue-400/70 uppercase block mb-2">Entry Hazards</span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={field.defenderSide.stealthRock} 
                        onChange={(e) => setField(prev => ({ 
                          ...prev, 
                          defenderSide: { ...prev.defenderSide, stealthRock: e.target.checked } 
                        }))} 
                        className="w-3 h-3 accent-blue-500" 
                      />
                      Stealth Rock
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={field.defenderSide.steelsurge} 
                        onChange={(e) => setField(prev => ({ 
                          ...prev, 
                          defenderSide: { ...prev.defenderSide, steelsurge: e.target.checked } 
                        }))} 
                        className="w-3 h-3 accent-blue-500" 
                      />
                      Steelsurge
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold opacity-70">Spikes:</span>
                    <select 
                      value={field.defenderSide.spikes} 
                      onChange={(e) => setField(prev => ({ 
                        ...prev, 
                        defenderSide: { ...prev.defenderSide, spikes: +e.target.value } 
                      }))} 
                      className="bg-black border border-blue-500/30 px-1 py-0.5 text-[10px] rounded"
                    >
                      {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                {/* G-Max Hazards */}
                <div className="mt-3 pt-2 border-t border-blue-500/20">
                  <span className="text-[9px] font-black text-blue-400/70 uppercase block mb-2">G-Max Hazards</span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={field.defenderSide.vineLash} 
                        onChange={(e) => setField(prev => ({ 
                          ...prev, 
                          defenderSide: { ...prev.defenderSide, vineLash: e.target.checked } 
                        }))} 
                        className="w-3 h-3 accent-green-500" 
                      />
                      Vine Lash
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={field.defenderSide.wildfire} 
                        onChange={(e) => setField(prev => ({ 
                          ...prev, 
                          defenderSide: { ...prev.defenderSide, wildfire: e.target.checked } 
                        }))} 
                        className="w-3 h-3 accent-orange-500" 
                      />
                      Wildfire
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={field.defenderSide.cannonade} 
                        onChange={(e) => setField(prev => ({ 
                          ...prev, 
                          defenderSide: { ...prev.defenderSide, cannonade: e.target.checked } 
                        }))} 
                        className="w-3 h-3 accent-blue-500" 
                      />
                      Cannonade
                    </label>
                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer hover:bg-zinc-800/50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={field.defenderSide.volcalith} 
                        onChange={(e) => setField(prev => ({ 
                          ...prev, 
                          defenderSide: { ...prev.defenderSide, volcalith: e.target.checked } 
                        }))} 
                        className="w-3 h-3 accent-amber-500" 
                      />
                      Volcalith
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Global effects */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Global Effects</span>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isGravity} 
                    onChange={(e) => setField(prev => ({ ...prev, isGravity: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Gravity
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isMagicRoom} 
                    onChange={(e) => setField(prev => ({ ...prev, isMagicRoom: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Magic Room
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isWonderRoom} 
                    onChange={(e) => setField(prev => ({ ...prev, isWonderRoom: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Wonder Room
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={crit} 
                    onChange={(e) => setCrit(e.target.checked)} 
                    className="w-3 h-3" 
                  />
                  Critical Hit
                </label>
              </div>
            </div>

            {/* Aura Effects */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Aura Effects</span>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isFairyAura} 
                    onChange={(e) => setField(prev => ({ ...prev, isFairyAura: e.target.checked }))} 
                    className="w-3 h-3 accent-pink-400" 
                  />
                  <span className="text-pink-400">Fairy Aura</span>
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isDarkAura} 
                    onChange={(e) => setField(prev => ({ ...prev, isDarkAura: e.target.checked }))} 
                    className="w-3 h-3 accent-gray-400" 
                  />
                  <span className="text-gray-400">Dark Aura</span>
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isAuraBreak} 
                    onChange={(e) => setField(prev => ({ ...prev, isAuraBreak: e.target.checked }))} 
                    className="w-3 h-3 accent-red-400" 
                  />
                  <span className="text-red-400">Aura Break</span>
                </label>
              </div>
            </div>

            {/* Ruin abilities */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Ruin Abilities</span>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isBeadsOfRuin} 
                    onChange={(e) => setField(prev => ({ ...prev, isBeadsOfRuin: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Beads of Ruin
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isTabletsOfRuin} 
                    onChange={(e) => setField(prev => ({ ...prev, isTabletsOfRuin: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Tablets of Ruin
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isSwordOfRuin} 
                    onChange={(e) => setField(prev => ({ ...prev, isSwordOfRuin: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Sword of Ruin
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.isVesselOfRuin} 
                    onChange={(e) => setField(prev => ({ ...prev, isVesselOfRuin: e.target.checked }))} 
                    className="w-3 h-3" 
                  />
                  Vessel of Ruin
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Swap attacker and defender
  const swapSides = () => {
    setAttacker(defender);
    setDefender(attacker);
    setField(prev => ({
      ...prev,
      attackerSide: prev.defenderSide,
      defenderSide: prev.attackerSide,
    }));
  };

  const isOHKO = damageRange.koChance.toLowerCase().includes("ohko");

  return (
    <div className="flex flex-col px-4 md:px-6 py-8 max-w-7xl mx-auto w-full gap-6 pb-32">
      {/* Header */}
      <div className="flex flex-col border-b-4 border-current pb-6 gap-2">
        <div className="flex items-center gap-3 text-3xl md:text-5xl font-black uppercase tracking-tighter">
          <Calculator className={activeTheme.accentClass} />
          <span>Damage</span>
          <span className={activeTheme.accentClass}>Calculator</span>
        </div>
        <p className="text-sm opacity-60 font-bold">Powered by @smogon/calc - Generation 9</p>
      </div>

      {/* Field Options */}
      <FieldOptionsPanel />

      {/* Pokemon Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        <PokemonPanel side={attacker} setSide={setAttacker} label="Attacker" isAttacker={true} />
        
        {/* Swap button */}
        <button 
          onClick={swapSides} 
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border-4 ${activeTheme.borderClass} bg-black flex items-center justify-center hover:scale-110 transition-transform hidden lg:flex`}
        >
          <RotateCcw className={`w-5 h-5 ${activeTheme.accentClass}`} />
        </button>
        
        <PokemonPanel side={defender} setSide={setDefender} label="Defender" isAttacker={false} />
      </div>

      {/* Swap button mobile */}
      <button 
        onClick={swapSides} 
        className={`lg:hidden w-full py-3 border-2 ${activeTheme.borderClass} bg-black font-black uppercase text-sm flex items-center justify-center gap-2`}
      >
        <RotateCcw className={`w-4 h-4 ${activeTheme.accentClass}`} />
        Swap Attacker / Defender
      </button>

      {/* Results Panel */}
      <div className={`border-8 ${isOHKO ? "border-red-500 bg-red-500/10" : `${activeTheme.borderClass} bg-black`} p-8 md:p-12 text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-current opacity-20 animate-pulse" />
        
        {damageResult ? (
          <>
            <div className="text-5xl md:text-8xl font-black font-mono tracking-tighter text-white mb-2">
              {damageRange.minPct}% - {damageRange.maxPct}%
            </div>
            <div className={`text-2xl md:text-4xl font-black uppercase italic tracking-widest ${isOHKO ? "text-red-500" : activeTheme.accentClass}`}>
              {damageRange.koChance}
            </div>
            <p className="mt-4 text-[10px] md:text-xs font-bold opacity-40 uppercase tracking-wide max-w-3xl mx-auto">
              {damageRange.desc}
            </p>
            <p className="mt-2 text-[10px] font-mono opacity-30">
              ({damageRange.min} - {damageRange.max} damage)
            </p>
          </>
        ) : (
          <div className="text-2xl md:text-4xl font-black uppercase opacity-30">
            Select Pokemon and Move
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get type background color
function getTypeBg(type: string): string {
  const colors: Record<string, string> = {
    Normal: "bg-gray-400",
    Fire: "bg-orange-500",
    Water: "bg-blue-500",
    Grass: "bg-green-500",
    Electric: "bg-yellow-400",
    Ice: "bg-cyan-300",
    Fighting: "bg-red-700",
    Poison: "bg-purple-500",
    Ground: "bg-amber-600",
    Flying: "bg-indigo-300",
    Psychic: "bg-pink-500",
    Bug: "bg-lime-500",
    Rock: "bg-amber-700",
    Ghost: "bg-purple-700",
    Dragon: "bg-indigo-600",
    Dark: "bg-gray-700",
    Steel: "bg-gray-400",
    Fairy: "bg-pink-300",
  };
  return colors[type] || "bg-gray-500";
}
