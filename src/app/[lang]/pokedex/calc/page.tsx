"use client";

import { useState, useEffect, use, useMemo, useCallback } from "react";
import { calculate, Generations, Pokemon, Move, Field } from "@smogon/calc";
import type { Generation, StatsTable, StatusName, Terrain, Weather, GameType } from "@smogon/calc/dist/data/interface";
import { POKEMON_TYPES, NATURES, getEffectiveness } from "@/lib/pokemon";
import { getAllPokemon, type PokemonSearchResult } from "@/app/actions/pokedex";
import { getAllMoves, type MoveResult, getAllItems, type ItemResult, getAllAbilities, type AbilityResult } from "@/app/actions/encyclopedia";
import { getStandardSet } from "@/app/actions/metagame";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Calculator, Zap, Shield, Swords, Sparkles, Sun, CloudRain, Wind, Snowflake, Target, RefreshCw, ChevronDown, Flame, Droplets, Leaf, Mountain, Star, RotateCcw } from "lucide-react";

// Initialize generation 9
const gen = Generations.get(9);

// Status conditions available
const STATUS_CONDITIONS: StatusName[] = ["Healthy", "Paralysis", "Poison", "Burn", "Sleep", "Freeze"];

// Field weathers
const WEATHERS: (Weather | "")[] = ["", "Sun", "Rain", "Sand", "Snow", "Harsh Sunshine", "Heavy Rain", "Strong Winds"];

// Field terrains
const TERRAINS: (Terrain | "")[] = ["", "Electric", "Grassy", "Psychic", "Misty"];

// Boost stages
const BOOST_STAGES = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];

interface SideState {
  species: string;
  speciesData: PokemonSearchResult | null;
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
  maxHP: number;
  moves: (MoveResult | null)[];
  selectedMoveIndex: number;
  isTransformed: boolean;
  isSaltCure: boolean;
  alliesCollapsed: number;
}

interface FieldSideState {
  spikes: number;
  stealthRock: boolean;
  steelsurge: boolean;
  vineLash: boolean;
  wildfire: boolean;
  cannonade: boolean;
  volcalith: boolean;
  reflect: boolean;
  lightScreen: boolean;
  auroraVeil: boolean;
  tailwind: boolean;
  friendGuard: boolean;
  helpingHand: boolean;
  isBattery: boolean;
  isPowerSpot: boolean;
  isSwitching: "out" | "in" | null;
}

interface FieldState {
  gameType: GameType;
  weather: Weather | "";
  weatherTurns: number;
  terrain: Terrain | "";
  terrainTurns: number;
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

const defaultEVs: StatsTable = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const maxEVs: StatsTable = { hp: 252, atk: 252, def: 0, spa: 0, spd: 0, spe: 4 };
const defaultIVs: StatsTable = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
const defaultBoosts: StatsTable = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

const defaultSideState: FieldSideState = {
  spikes: 0,
  stealthRock: false,
  steelsurge: false,
  vineLash: false,
  wildfire: false,
  cannonade: false,
  volcalith: false,
  reflect: false,
  lightScreen: false,
  auroraVeil: false,
  tailwind: false,
  friendGuard: false,
  helpingHand: false,
  isBattery: false,
  isPowerSpot: false,
  isSwitching: null,
};

const createDefaultSide = (): SideState => ({
  species: "",
  speciesData: null,
  level: 50,
  evs: { ...maxEVs },
  ivs: { ...defaultIVs },
  nature: "Adamant",
  boosts: { ...defaultBoosts },
  teraType: "",
  ability: "",
  item: "",
  status: "Healthy",
  currentHP: 100,
  maxHP: 100,
  moves: [null, null, null, null],
  selectedMoveIndex: 0,
  isTransformed: false,
  isSaltCure: false,
  alliesCollapsed: 0,
});

export default function DamageCalcPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang || "es";
  const { activeTheme } = useTheme();

  const [attacker, setAttacker] = useState<SideState>(createDefaultSide());
  const [defender, setDefender] = useState<SideState>({
    ...createDefaultSide(),
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    nature: "Bold",
  });

  const [field, setField] = useState<FieldState>({
    gameType: "Singles",
    weather: "",
    weatherTurns: 0,
    terrain: "",
    terrainTurns: 0,
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
  const [showFieldOptions, setShowFieldOptions] = useState(false);

  // Calculate damage using @smogon/calc
  const damageResult = useMemo(() => {
    if (!attacker.species || !defender.species) return null;
    
    const selectedMove = attacker.moves[attacker.selectedMoveIndex];
    if (!selectedMove) return null;

    try {
      const attackerPokemon = new Pokemon(gen, attacker.species, {
        level: attacker.level,
        evs: attacker.evs,
        ivs: attacker.ivs,
        nature: attacker.nature,
        boosts: attacker.boosts,
        teraType: attacker.teraType || undefined,
        ability: attacker.ability || undefined,
        item: attacker.item || undefined,
        status: attacker.status === "Healthy" ? undefined : attacker.status.toLowerCase() as any,
        curHP: Math.round((attacker.currentHP / 100) * attacker.maxHP),
      });

      const defenderPokemon = new Pokemon(gen, defender.species, {
        level: defender.level,
        evs: defender.evs,
        ivs: defender.ivs,
        nature: defender.nature,
        boosts: defender.boosts,
        teraType: defender.teraType || undefined,
        ability: defender.ability || undefined,
        item: defender.item || undefined,
        status: defender.status === "Healthy" ? undefined : defender.status.toLowerCase() as any,
        curHP: Math.round((defender.currentHP / 100) * defender.maxHP),
      });

      const move = new Move(gen, selectedMove.nombre, {
        isCrit: crit,
      });

      const calcField = new Field({
        gameType: field.gameType,
        weather: field.weather || undefined,
        terrain: field.terrain || undefined,
        isGravity: field.isGravity,
        isMagicRoom: field.isMagicRoom,
        isWonderRoom: field.isWonderRoom,
        isAuraBreak: field.isAuraBreak,
        isFairyAura: field.isFairyAura,
        isDarkAura: field.isDarkAura,
        isBeadsOfRuin: field.isBeadsOfRuin,
        isTabletsOfRuin: field.isTabletsOfRuin,
        isSwordOfRuin: field.isSwordOfRuin,
        isVesselOfRuin: field.isVesselOfRuin,
        attackerSide: field.attackerSide,
        defenderSide: field.defenderSide,
      });

      const result = calculate(gen, attackerPokemon, defenderPokemon, move, calcField);
      return result;
    } catch (e) {
      console.error("[v0] Calc error:", e);
      return null;
    }
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
        // Multi-hit move
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
    const kochance = damageResult.kpiChance();
    if (kochance) {
      koChance = kochance;
    } else {
      // Manual KO chance calculation
      if (min >= defHP) koChance = "guaranteed OHKO";
      else if (max >= defHP) koChance = "possible OHKO";
      else if (max * 2 >= defHP) koChance = "2HKO";
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
  function PokemonSearch({ side, setSide, label }: { side: SideState; setSide: React.Dispatch<React.SetStateAction<SideState>>; label: string }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PokemonSearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (query.length >= 2) {
        getAllPokemon(1, 8, { searchQuery: query }).then(res => {
          setResults(res.pokemon || []);
          setIsOpen(true);
        });
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, [query]);

    const selectPokemon = async (pokemon: PokemonSearchResult) => {
      const stats = pokemon.stats_base;
      const maxHP = calculateHP(stats.hp || 100, side.evs.hp, side.ivs.hp, side.level);
      
      setSide(prev => ({
        ...prev,
        species: pokemon.nombre,
        speciesData: pokemon,
        ability: pokemon.habilidades[0] || "",
        maxHP,
        currentHP: 100,
      }));
      
      setQuery("");
      setResults([]);
      setIsOpen(false);

      // Try to load Smogon set
      const set = await getStandardSet(pokemon.nombre);
      if (set) {
        const moves: (MoveResult | null)[] = [null, null, null, null];
        for (let i = 0; i < set.moves.length && i < 4; i++) {
          const moveRes = await getAllMoves(1, 1, { searchQuery: set.moves[i], lang });
          if (moveRes.moves[0]) moves[i] = moveRes.moves[0];
        }
        setSide(prev => ({
          ...prev,
          evs: set.evs,
          nature: set.nature,
          ability: set.ability,
          item: set.item,
          moves,
        }));
      }
    };

    return (
      <div className="relative">
        <label className="text-zinc-500 font-black uppercase text-[10px] block mb-2">{label}</label>
        {side.species ? (
          <div className={`flex items-center justify-between p-3 bg-zinc-900 border-2 ${activeTheme.borderClass}`}>
            <div className="flex items-center gap-3">
              {side.speciesData?.sprite_url && (
                <img src={side.speciesData.sprite_url} alt={side.species} className="w-12 h-12 object-contain pixelated" />
              )}
              <div>
                <span className="text-white font-black text-sm uppercase">{side.species}</span>
                {side.speciesData?.tipos && (
                  <div className="flex gap-1 mt-1">
                    {side.speciesData.tipos.map(t => (
                      <span key={t} className={`text-[8px] font-bold px-1 py-0.5 rounded ${getTypeBg(t)}`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setSide(prev => ({ ...prev, species: "", speciesData: null, moves: [null, null, null, null] }))} className="text-red-500 font-bold text-lg hover:text-red-400">x</button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pokemon..."
            className={`w-full bg-zinc-950 border-2 ${activeTheme.borderClass} px-3 py-3 text-white font-bold text-sm focus:outline-none`}
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border-2 border-current max-h-64 overflow-y-auto">
            {results.map(p => (
              <div key={p.id} onClick={() => selectPokemon(p)} className="flex items-center gap-3 p-2 hover:bg-zinc-800 cursor-pointer border-b border-zinc-900">
                <img src={p.sprite_url} alt={p.nombre} className="w-8 h-8 object-contain pixelated" />
                <span className="text-sm font-bold uppercase">{p.nombre}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Move slot component
  function MoveSlot({ index, side, setSide }: { index: number; side: SideState; setSide: React.Dispatch<React.SetStateAction<SideState>> }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MoveResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const move = side.moves[index];
    const isSelected = side.selectedMoveIndex === index;

    useEffect(() => {
      if (query.length >= 2) {
        getAllMoves(1, 6, { searchQuery: query, lang }).then(res => {
          setResults(res.moves || []);
          setIsOpen(true);
        });
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, [query]);

    const selectMove = (m: MoveResult) => {
      setSide(prev => {
        const newMoves = [...prev.moves];
        newMoves[index] = m;
        return { ...prev, moves: newMoves, selectedMoveIndex: index };
      });
      setQuery("");
      setResults([]);
      setIsOpen(false);
    };

    return (
      <div className="relative">
        {move ? (
          <div
            onClick={() => setSide(prev => ({ ...prev, selectedMoveIndex: index }))}
            className={`flex items-center justify-between p-2 border-2 cursor-pointer transition-all ${
              isSelected ? `${activeTheme.borderClass} bg-zinc-800` : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${getTypeBg(move.tipo)}`} />
              <span className="text-xs font-bold uppercase truncate">{move.nombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono opacity-60">{move.potencia || "-"}</span>
              <button onClick={(e) => { e.stopPropagation(); setSide(prev => { const newMoves = [...prev.moves]; newMoves[index] = null; return { ...prev, moves: newMoves }; }); }} className="text-red-500 text-xs">x</button>
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Move ${index + 1}`}
            className="w-full bg-zinc-900 border-2 border-zinc-800 px-2 py-2 text-xs font-bold focus:outline-none focus:border-current"
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border-2 border-current max-h-48 overflow-y-auto">
            {results.map(m => (
              <div key={m.id} onClick={() => selectMove(m)} className="flex items-center justify-between p-2 hover:bg-zinc-800 cursor-pointer border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getTypeBg(m.tipo)}`} />
                  <span className="text-xs font-bold uppercase">{m.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-60">
                  <span>{m.categoria}</span>
                  <span>{m.potencia || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stats panel
  function StatsPanel({ side, setSide }: { side: SideState; setSide: React.Dispatch<React.SetStateAction<SideState>> }) {
    const stats = ["hp", "atk", "def", "spa", "spd", "spe"] as const;
    const statLabels = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
    
    const totalEVs = Object.values(side.evs).reduce((a, b) => a + b, 0);
    const remainingEVs = 508 - totalEVs;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black opacity-50 uppercase">EVs ({totalEVs}/508)</span>
          <span className={`text-[10px] font-bold ${remainingEVs < 0 ? "text-red-500" : "text-green-500"}`}>{remainingEVs} left</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map(stat => (
            <div key={stat} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black opacity-70 uppercase">{statLabels[stat]}</label>
                <span className="text-[9px] font-mono opacity-50">{side.ivs[stat]}</span>
              </div>
              <input
                type="number"
                min={0}
                max={252}
                value={side.evs[stat]}
                onChange={(e) => setSide(prev => ({ ...prev, evs: { ...prev.evs, [stat]: Math.min(252, Math.max(0, +e.target.value)) } }))}
                className="w-full bg-black border border-current/30 px-2 py-1 text-xs font-mono focus:outline-none focus:border-current"
              />
            </div>
          ))}
        </div>
        
        {/* Boosts */}
        <div className="pt-3 border-t border-current/10">
          <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Stat Boosts</span>
          <div className="grid grid-cols-3 gap-2">
            {(["atk", "def", "spa", "spd", "spe"] as const).map(stat => (
              <div key={stat} className="flex flex-col gap-1">
                <label className="text-[9px] font-black opacity-70 uppercase">{statLabels[stat]}</label>
                <select
                  value={side.boosts[stat]}
                  onChange={(e) => setSide(prev => ({ ...prev, boosts: { ...prev.boosts, [stat]: +e.target.value } }))}
                  className="w-full bg-black border border-current/30 px-1 py-1 text-[10px] font-bold focus:outline-none"
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

  // Item search
  function ItemSearch({ side, setSide }: { side: SideState; setSide: React.Dispatch<React.SetStateAction<SideState>> }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ItemResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (query.length >= 2) {
        getAllItems(1, 6, { searchQuery: query, lang }).then(res => {
          setResults(res.items || []);
          setIsOpen(true);
        });
      } else {
        setResults([]);
        setIsOpen(false);
      }
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-black border border-current/30 px-2 py-1 text-xs focus:outline-none"
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border border-current max-h-32 overflow-y-auto">
            {results.map(item => (
              <div key={item.id} onClick={() => { setSide(prev => ({ ...prev, item: item.nombre })); setQuery(""); setIsOpen(false); }} className="px-2 py-1 hover:bg-zinc-800 cursor-pointer text-xs font-bold border-b border-zinc-900">{item.nombre}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Ability search
  function AbilitySearch({ side, setSide }: { side: SideState; setSide: React.Dispatch<React.SetStateAction<SideState>> }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<AbilityResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (query.length >= 2) {
        getAllAbilities(1, 6, { searchQuery: query, lang }).then(res => {
          setResults(res.abilities || []);
          setIsOpen(true);
        });
      } else {
        setResults([]);
        setIsOpen(false);
      }
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-black border border-current/30 px-2 py-1 text-xs focus:outline-none"
          />
        )}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full bg-black border border-current max-h-32 overflow-y-auto">
            {results.map(ab => (
              <div key={ab.id} onClick={() => { setSide(prev => ({ ...prev, ability: ab.nombre })); setQuery(""); setIsOpen(false); }} className="px-2 py-1 hover:bg-zinc-800 cursor-pointer text-xs font-bold border-b border-zinc-900">{ab.nombre}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pokemon panel (combines all controls for one side)
  function PokemonPanel({ side, setSide, label, isAttacker }: { side: SideState; setSide: React.Dispatch<React.SetStateAction<SideState>>; label: string; isAttacker: boolean }) {
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

        {/* Moves (only for attacker) */}
        {isAttacker && (
          <div className="pt-3 border-t border-current/10">
            <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Moves (click to select)</span>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(i => (
                <MoveSlot key={i} index={i} side={side} setSide={setSide} />
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
    return (
      <div className="bg-zinc-900/50 border-2 border-current/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase">Field Options</span>
          <button onClick={() => setShowFieldOptions(!showFieldOptions)} className="text-xs font-bold opacity-60 hover:opacity-100">
            {showFieldOptions ? "Hide" : "Show"} <ChevronDown className={`inline w-4 h-4 transition-transform ${showFieldOptions ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFieldOptions && (
          <div className="space-y-4 pt-2">
            {/* Game Type, Weather, Terrain */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Format</label>
                <select value={field.gameType} onChange={(e) => setField(prev => ({ ...prev, gameType: e.target.value as GameType }))} className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none">
                  <option value="Singles">Singles</option>
                  <option value="Doubles">Doubles</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Weather</label>
                <select value={field.weather} onChange={(e) => setField(prev => ({ ...prev, weather: e.target.value as Weather | "" }))} className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none">
                  {WEATHERS.map(w => <option key={w || "none"} value={w}>{w || "None"}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black opacity-50 uppercase block mb-1">Terrain</label>
                <select value={field.terrain} onChange={(e) => setField(prev => ({ ...prev, terrain: e.target.value as Terrain | "" }))} className="w-full bg-black border border-current/30 px-2 py-1 text-[10px] font-bold focus:outline-none">
                  {TERRAINS.map(t => <option key={t || "none"} value={t}>{t || "None"}</option>)}
                </select>
              </div>
            </div>

            {/* Attacker Side */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Attacker Side</span>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.attackerSide.helpingHand} onChange={(e) => setField(prev => ({ ...prev, attackerSide: { ...prev.attackerSide, helpingHand: e.target.checked } }))} className="w-3 h-3" />
                  Helping Hand
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.attackerSide.tailwind} onChange={(e) => setField(prev => ({ ...prev, attackerSide: { ...prev.attackerSide, tailwind: e.target.checked } }))} className="w-3 h-3" />
                  Tailwind
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.attackerSide.isBattery} onChange={(e) => setField(prev => ({ ...prev, attackerSide: { ...prev.attackerSide, isBattery: e.target.checked } }))} className="w-3 h-3" />
                  Battery
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.attackerSide.isPowerSpot} onChange={(e) => setField(prev => ({ ...prev, attackerSide: { ...prev.attackerSide, isPowerSpot: e.target.checked } }))} className="w-3 h-3" />
                  Power Spot
                </label>
              </div>
            </div>

            {/* Defender Side */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Defender Side</span>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.defenderSide.reflect} onChange={(e) => setField(prev => ({ ...prev, defenderSide: { ...prev.defenderSide, reflect: e.target.checked } }))} className="w-3 h-3" />
                  Reflect
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.defenderSide.lightScreen} onChange={(e) => setField(prev => ({ ...prev, defenderSide: { ...prev.defenderSide, lightScreen: e.target.checked } }))} className="w-3 h-3" />
                  Light Screen
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.defenderSide.auroraVeil} onChange={(e) => setField(prev => ({ ...prev, defenderSide: { ...prev.defenderSide, auroraVeil: e.target.checked } }))} className="w-3 h-3" />
                  Aurora Veil
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.defenderSide.friendGuard} onChange={(e) => setField(prev => ({ ...prev, defenderSide: { ...prev.defenderSide, friendGuard: e.target.checked } }))} className="w-3 h-3" />
                  Friend Guard
                </label>
              </div>
              
              {/* Hazards */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.defenderSide.stealthRock} onChange={(e) => setField(prev => ({ ...prev, defenderSide: { ...prev.defenderSide, stealthRock: e.target.checked } }))} className="w-3 h-3" />
                  Stealth Rock
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold">Spikes:</span>
                  <select value={field.defenderSide.spikes} onChange={(e) => setField(prev => ({ ...prev, defenderSide: { ...prev.defenderSide, spikes: +e.target.value } }))} className="bg-black border border-current/30 px-1 py-0.5 text-[10px]">
                    {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Global effects */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Global Effects</span>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isGravity} onChange={(e) => setField(prev => ({ ...prev, isGravity: e.target.checked }))} className="w-3 h-3" />
                  Gravity
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isMagicRoom} onChange={(e) => setField(prev => ({ ...prev, isMagicRoom: e.target.checked }))} className="w-3 h-3" />
                  Magic Room
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isWonderRoom} onChange={(e) => setField(prev => ({ ...prev, isWonderRoom: e.target.checked }))} className="w-3 h-3" />
                  Wonder Room
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={crit} onChange={(e) => setCrit(e.target.checked)} className="w-3 h-3" />
                  Critical Hit
                </label>
              </div>
            </div>

            {/* Ruin abilities */}
            <div className="border-t border-current/10 pt-3">
              <span className="text-[10px] font-black opacity-50 uppercase block mb-2">Ruin Abilities (Treasures of Ruin)</span>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isBeadsOfRuin} onChange={(e) => setField(prev => ({ ...prev, isBeadsOfRuin: e.target.checked }))} className="w-3 h-3" />
                  Beads of Ruin
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isTabletsOfRuin} onChange={(e) => setField(prev => ({ ...prev, isTabletsOfRuin: e.target.checked }))} className="w-3 h-3" />
                  Tablets of Ruin
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isSwordOfRuin} onChange={(e) => setField(prev => ({ ...prev, isSwordOfRuin: e.target.checked }))} className="w-3 h-3" />
                  Sword of Ruin
                </label>
                <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={field.isVesselOfRuin} onChange={(e) => setField(prev => ({ ...prev, isVesselOfRuin: e.target.checked }))} className="w-3 h-3" />
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
        <button onClick={swapSides} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border-4 ${activeTheme.borderClass} bg-black flex items-center justify-center hover:scale-110 transition-transform hidden lg:flex`}>
          <RotateCcw className={`w-5 h-5 ${activeTheme.accentClass}`} />
        </button>
        
        <PokemonPanel side={defender} setSide={setDefender} label="Defender" isAttacker={false} />
      </div>

      {/* Swap button mobile */}
      <button onClick={swapSides} className={`lg:hidden w-full py-3 border-2 ${activeTheme.borderClass} bg-black font-black uppercase text-sm flex items-center justify-center gap-2`}>
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

// Helper functions
function calculateHP(base: number, ev: number, iv: number, level: number): number {
  if (base === 1) return 1; // Shedinja
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

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
