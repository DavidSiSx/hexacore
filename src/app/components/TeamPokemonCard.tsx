"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PokemonBuild } from "@/lib/schemas/team";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { translations, Locale } from "./TeamBuilder/locales";
import DamageCalcPanel from "@/app/components/DamageCalcPanel";
import AutocompleteSelect from "@/app/components/Shared/AutocompleteSelect";
import { searchPokemonSpecies } from "@/app/actions/pokedex";
import { searchMoves, searchAbilities, searchItems } from "@/app/actions/encyclopedia";
import { Settings, Check, X, ShieldAlert, Zap, SwatchBook, Sparkles, Lock, Unlock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamPokemonCardProps {
  pokemon: PokemonBuild;
  index: number;
  onChange?: (updated: PokemonBuild) => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

const NATURES = [
  "Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", 
  "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", 
  "Mild", "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", 
  "Relaxed", "Sassy", "Serious", "Timid"
];

const POKEMON_TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", 
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Steel", 
  "Dark", "Fairy", "Stellar"
];

function formatEvs(evs?: Record<string, number | undefined>): string {
  if (!evs) return "";
  return Object.entries(evs)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(" / ");
}

export default function TeamPokemonCard({ pokemon, index, onChange, isLocked, onToggleLock }: TeamPokemonCardProps) {
  const { activeTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showDamageCalc, setShowDamageCalc] = useState(false);

  // Estados locales de edición
  const [editedSpecies, setEditedSpecies] = useState(pokemon.species);
  const [editedRole, setEditedRole] = useState(pokemon.role);
  const [editedTeraType, setEditedTeraType] = useState(pokemon.teraType);
  const [editedItem, setEditedItem] = useState(pokemon.item);
  const [editedAbility, setEditedAbility] = useState(pokemon.ability);
  const [editedNature, setEditedNature] = useState(pokemon.nature);
  const [editedEvs, setEditedEvs] = useState({
    HP: pokemon.evs?.HP || 0,
    Atk: pokemon.evs?.Atk || 0,
    Def: pokemon.evs?.Def || 0,
    SpA: pokemon.evs?.SpA || 0,
    SpD: pokemon.evs?.SpD || 0,
    Spe: pokemon.evs?.Spe || 0,
  });
  const [editedIvs, setEditedIvs] = useState({
    HP: pokemon.ivs?.HP !== undefined ? pokemon.ivs.HP : 31,
    Atk: pokemon.ivs?.Atk !== undefined ? pokemon.ivs.Atk : 31,
    Def: pokemon.ivs?.Def !== undefined ? pokemon.ivs.Def : 31,
    SpA: pokemon.ivs?.SpA !== undefined ? pokemon.ivs.SpA : 31,
    SpD: pokemon.ivs?.SpD !== undefined ? pokemon.ivs.SpD : 31,
    Spe: pokemon.ivs?.Spe !== undefined ? pokemon.ivs.Spe : 31,
  });
  const [editedMoves, setEditedMoves] = useState([
    pokemon.moves[0] || "",
    pokemon.moves[1] || "",
    pokemon.moves[2] || "",
    pokemon.moves[3] || "",
  ]);

  // Sincronizar estados locales cuando el prop 'pokemon' cambia
  useEffect(() => {
    setEditedSpecies(pokemon.species);
    setEditedRole(pokemon.role);
    setEditedTeraType(pokemon.teraType);
    setEditedItem(pokemon.item);
    setEditedAbility(pokemon.ability);
    setEditedNature(pokemon.nature);
    setEditedEvs({
      HP: pokemon.evs?.HP || 0,
      Atk: pokemon.evs?.Atk || 0,
      Def: pokemon.evs?.Def || 0,
      SpA: pokemon.evs?.SpA || 0,
      SpD: pokemon.evs?.SpD || 0,
      Spe: pokemon.evs?.Spe || 0,
    });
    setEditedIvs({
      HP: pokemon.ivs?.HP !== undefined ? pokemon.ivs.HP : 31,
      Atk: pokemon.ivs?.Atk !== undefined ? pokemon.ivs.Atk : 31,
      Def: pokemon.ivs?.Def !== undefined ? pokemon.ivs.Def : 31,
      SpA: pokemon.ivs?.SpA !== undefined ? pokemon.ivs.SpA : 31,
      SpD: pokemon.ivs?.SpD !== undefined ? pokemon.ivs.SpD : 31,
      Spe: pokemon.ivs?.Spe !== undefined ? pokemon.ivs.Spe : 31,
    });
    setEditedMoves([
      pokemon.moves[0] || "",
      pokemon.moves[1] || "",
      pokemon.moves[2] || "",
      pokemon.moves[3] || "",
    ]);
  }, [pokemon]);

  // Suma total de EVs editados
  const totalEvs = Object.values(editedEvs).reduce((a, b) => a + b, 0);

  // Manejar cambio de sliders EV con restricción matemática estricta
  function handleEvChange(stat: keyof typeof editedEvs, val: number) {
    const tempEvs = { ...editedEvs };
    const currentSumWithoutThisStat = Object.entries(tempEvs)
      .filter(([k]) => k !== stat)
      .reduce((sum, [, v]) => sum + v, 0);
    
    // Capped by standard rules: max 510 total, max 252 individual
    const allowedMax = Math.min(252, 510 - currentSumWithoutThisStat);
    tempEvs[stat] = Math.min(val, allowedMax);
    setEditedEvs(tempEvs);
  }

  function handleSave() {
    if (onChange) {
      onChange({
        species: editedSpecies,
        role: editedRole,
        teraType: editedTeraType,
        item: editedItem,
        ability: editedAbility,
        nature: editedNature,
        evs: editedEvs,
        ivs: editedIvs,
        moves: editedMoves,
      });
    }
    setIsEditing(false);
  }

  function handleCancel() {
    // Reset local states to original pokemon props
    setEditedSpecies(pokemon.species);
    setEditedRole(pokemon.role);
    setEditedTeraType(pokemon.teraType);
    setEditedItem(pokemon.item);
    setEditedAbility(pokemon.ability);
    setEditedNature(pokemon.nature);
    setEditedEvs({
      HP: pokemon.evs?.HP || 0,
      Atk: pokemon.evs?.Atk || 0,
      Def: pokemon.evs?.Def || 0,
      SpA: pokemon.evs?.SpA || 0,
      SpD: pokemon.evs?.SpD || 0,
      Spe: pokemon.evs?.Spe || 0,
    });
    setEditedIvs({
      HP: pokemon.ivs?.HP !== undefined ? pokemon.ivs.HP : 31,
      Atk: pokemon.ivs?.Atk !== undefined ? pokemon.ivs.Atk : 31,
      Def: pokemon.ivs?.Def !== undefined ? pokemon.ivs.Def : 31,
      SpA: pokemon.ivs?.SpA !== undefined ? pokemon.ivs.SpA : 31,
      SpD: pokemon.ivs?.SpD !== undefined ? pokemon.ivs.SpD : 31,
      Spe: pokemon.ivs?.Spe !== undefined ? pokemon.ivs.Spe : 31,
    });
    setEditedMoves([
      pokemon.moves[0] || "",
      pokemon.moves[1] || "",
      pokemon.moves[2] || "",
      pokemon.moves[3] || "",
    ]);
    setIsEditing(false);
  }

  const params = useParams();
  const locale = ((params?.lang as Locale) || "es") satisfies Locale;
  const t = translations[locale];

  const isEmpty = !pokemon.species || pokemon.species.trim() === "";

  if (isEmpty) {
    return (
      <>
        <div 
          onClick={() => setIsEditing(true)}
          className={`border-4 border-dashed ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-6 flex flex-col items-center justify-center gap-3 h-full min-h-[350px] cursor-pointer group hover:bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-[6px_6px_0px_#000000] hover:scale-[1.01] transition-all duration-300 relative`}
        >
          {/* Slot Number Badge */}
          <span className="absolute top-4 left-4 w-6 h-6 bg-zinc-900 text-zinc-400 text-[10px] font-black flex items-center justify-center border-2 border-zinc-700">
            {index + 1}
          </span>
          
          <div className="w-12 h-12 border-4 border-dashed border-zinc-800 group-hover:border-[var(--border)] group-hover:border-solid flex items-center justify-center transition-all duration-300">
            <span className="text-2xl font-black text-zinc-650 group-hover:text-[var(--accent)] transition-colors">+</span>
          </div>
          
          <div className="text-center">
            <h3 className={`text-sm font-black uppercase tracking-tighter ${activeTheme.textMainClass} group-hover:text-[var(--accent)] transition-colors mb-1`}>
              {t.emptySlot}
            </h3>
            <p className={`text-[9px] font-bold uppercase tracking-widest ${activeTheme.textMutedClass} max-w-[200px] leading-relaxed mx-auto`}>
              {t.emptySlotDesc}
            </p>
          </div>
        </div>

        {/* Render edit modal so that it can be opened directly */}
        <AnimatePresence>
          {isEditing && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancel}
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-pointer"
              />

              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.35 }}
                className="fixed inset-4 md:inset-auto md:w-full md:max-w-5xl md:h-[90vh] z-50 bg-zinc-950 border-4 border-[var(--accent)] shadow-[8px_8px_0px_black] p-6 flex flex-col justify-between overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 text-white"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b-2 border-zinc-800 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-none bg-[var(--accent)] text-black font-black flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
                      Configurar Pokémon <span className="text-[var(--accent)]">{editedSpecies || "VACÍO"}</span>
                    </h3>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pr-1">
                  {/* Columna 1: Info Básica */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-1.5 border-b border-zinc-800 pb-1 shrink-0">
                      <SwatchBook className="w-4 h-4" /> Datos de Identidad
                    </h4>

                    <AutocompleteSelect
                      label="Especie / Pokémon (Lista Verificada)"
                      value={editedSpecies}
                      onChange={setEditedSpecies}
                      placeholder="Busca e.g. Togekiss, Garchomp..."
                      searchAction={searchPokemonSpecies}
                    />

                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
                        Rol Estratégico
                      </label>
                      <input
                        type="text"
                        value={editedRole}
                        onChange={(e) => setEditedRole(e.target.value)}
                        placeholder="e.g. Offensive Pivot, Tailwind Setter"
                        className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-white transition-colors`}
                      />
                    </div>

                    <AutocompleteSelect
                      label="Objeto Equipado (Lista Verificada)"
                      value={editedItem}
                      onChange={setEditedItem}
                      placeholder="Busca e.g. Choice Specs, Leftovers..."
                      searchAction={searchItems}
                    />

                    <AutocompleteSelect
                      label="Habilidad Especial (Lista Verificada)"
                      value={editedAbility}
                      onChange={setEditedAbility}
                      placeholder="Busca e.g. Intimidate, Levitate..."
                      searchAction={searchAbilities}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
                          Tera Type
                        </label>
                        <select
                          value={editedTeraType}
                          onChange={(e) => setEditedTeraType(e.target.value)}
                          className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-white cursor-pointer`}
                        >
                          {POKEMON_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
                          Naturaleza
                        </label>
                        <select
                          value={editedNature}
                          onChange={(e) => setEditedNature(e.target.value)}
                          className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-white cursor-pointer`}
                        >
                          {NATURES.map((nat) => (
                            <option key={nat} value={nat}>{nat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Columna 2: Sliders EV */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" /> Distribución EVs
                      </h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 border ${activeTheme.borderClass}
                                       ${totalEvs > 510 ? "bg-[var(--danger)] text-white" : "bg-[var(--accent)]/10"}`}>
                        {totalEvs} / 510 EVs
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {Object.keys(editedEvs).map((stat) => {
                        const typedStat = stat as keyof typeof editedEvs;
                        const val = editedEvs[typedStat];
                        return (
                          <div key={stat} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                              <span>{stat}</span>
                              <span>{val}</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="252"
                              step="4"
                              value={val}
                              onChange={(e) => handleEvChange(typedStat, parseInt(e.target.value))}
                              className="w-full accent-[var(--accent)] cursor-pointer h-1.5 bg-zinc-800 rounded-none appearance-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Columna 3: Movimientos + IVs */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                      <Zap className="w-4 h-4" /> Movimientos y IVs
                    </h4>

                    {/* Moves Autocompletes */}
                    <div className="flex flex-col gap-3">
                      {editedMoves.map((move, mi) => (
                        <AutocompleteSelect
                          key={mi}
                          label={`Movimiento ${mi + 1}`}
                          value={move}
                          onChange={(val) => {
                            const newMoves = [...editedMoves];
                            newMoves[mi] = val;
                            setEditedMoves(newMoves);
                          }}
                          placeholder={`Busca e.g. Thunderbolt, Spore...`}
                          searchAction={searchMoves}
                        />
                      ))}
                    </div>

                    {/* IVs Row */}
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-800">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass}`}>
                        Valores Individuales (IVs)
                      </span>
                      <div className="grid grid-cols-6 gap-1.5">
                        {Object.keys(editedIvs).map((stat) => {
                          const typedStat = stat as keyof typeof editedIvs;
                          const val = editedIvs[typedStat];
                          return (
                            <div key={stat} className="flex flex-col items-center">
                              <span className="text-[8px] font-black uppercase mb-1">{stat}</span>
                              <input
                                type="number"
                                min="0"
                                max="31"
                                value={val}
                                onChange={(e) => {
                                  const newIvs = { ...editedIvs };
                                  newIvs[typedStat] = Math.max(0, Math.min(31, parseInt(e.target.value) || 0));
                                  setEditedIvs(newIvs);
                                }}
                                className={`w-full text-center bg-[var(--background)] border-2 ${activeTheme.borderClass} py-0.5 text-[10px] font-black focus:outline-none focus:border-white`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t-2 border-zinc-800 flex justify-end gap-3 shrink-0">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 border-2 border-[var(--accent)] bg-[var(--accent)] text-black hover:bg-white hover:border-white hover:text-black text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }



  return (
    <>
      <div className={`border-4 ${isLocked ? "border-amber-500 shadow-[6px_6px_0px_#d97706]" : `${activeTheme.borderClass} shadow-[4px_4px_0px_#000000]`} ${activeTheme.cardBgClass} p-5 flex flex-col gap-4 group 
                       hover:translate-x-1 hover:-translate-y-1 transition-all relative`}>
        
        {/* Header: Sprite + Name + Role */}
        <div className="flex items-center gap-4 border-b-2 pb-4 border-dashed border-zinc-800">
          <div className="relative w-16 h-16 shrink-0">
            <SpriteImg
              species={pokemon.species}
              width={64}
              height={64}
              className="drop-shadow-md group-hover:scale-110 transition-transform"
            />
            <span className={`absolute -top-2 -left-2 w-6 h-6 bg-[var(--accent)] text-[var(--accent-foreground)]
                            text-[10px] font-black flex items-center justify-center border-2 border-[var(--background)]`}>
              {index + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-black uppercase tracking-tighter ${activeTheme.textMainClass} truncate`}>
              {pokemon.species || "VACÍO"}
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTheme.textMutedClass} truncate`}>
              {pokemon.role || "SIN ROL ASIGNADO"}
            </p>
          </div>
        </div>

        {/* Tera Type Badge */}
        <div className="flex items-center gap-2">
          <TypeBadge type={pokemon.teraType} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.textMutedClass}`}>Tera</span>
        </div>

        {/* Details Grid */}
        <div className={`grid grid-cols-2 gap-4 pt-4 border-t-2 ${activeTheme.borderClass}`}>
          <div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>Objeto</span>
            <p className={`${activeTheme.textMainClass} text-xs font-bold uppercase truncate`}>{pokemon.item}</p>
          </div>
          <div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>Habilidad</span>
            <p className={`${activeTheme.textMainClass} text-xs font-bold uppercase truncate`}>{pokemon.ability}</p>
          </div>
          <div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>Naturaleza</span>
            <p className={`${activeTheme.textMainClass} text-xs font-bold uppercase`}>{pokemon.nature}</p>
          </div>
          <div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>EVs</span>
            <p className={`${activeTheme.textMainClass} text-[10px] font-bold uppercase truncate`}>{formatEvs(pokemon.evs)}</p>
          </div>
        </div>

        {/* Moves */}
        <div className={`pt-4 border-t-2 ${activeTheme.borderClass}`}>
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-2`}>Movimientos</span>
          <div className="grid grid-cols-2 gap-2">
            {pokemon.moves.map((move, i) => (
              <div
                key={i}
                className={`border-2 ${activeTheme.borderClass} text-[10px] font-bold uppercase tracking-wide
                           px-2 py-2 text-center truncate ${activeTheme.textMainClass}
                           hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                           transition-colors cursor-default`}
              >
                {move || "---"}
              </div>
            ))}
          </div>
        </div>

        {/* AI Strategic Synergy Reasoning (No more black boxes) */}
        <div className={`mt-1 p-3 bg-zinc-950/60 border-2 border-dashed ${activeTheme.borderClass} rounded-none flex flex-col gap-2`}>
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.accentClass} flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Sinergia del Metagame
            </span>
            <span className="text-[10px] font-black font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 border border-[var(--accent)]/30">
              {pokemon.synergyScore || 85}%
            </span>
          </div>

          {/* Brutalist Progress Bar */}
          <div className="w-full bg-zinc-900 border border-zinc-800 h-2 overflow-hidden flex">
            <div 
              className="bg-[var(--accent)] h-full transition-all duration-1000" 
              style={{ width: `${pokemon.synergyScore || 85}%` }} 
            />
          </div>

          <p className="text-zinc-300 text-[10px] font-medium leading-relaxed">
            <span className="text-[var(--accent)] font-bold block mb-0.5 uppercase tracking-tighter text-[9px]">Justificación Estratégica:</span>
            {pokemon.synergyReason || pokemon.role}
          </p>
          
          {pokemon.synergyReason && (
            <p className="text-zinc-400 text-[9px] font-bold leading-normal italic border-t border-zinc-850/60 pt-1">
              <span className="text-zinc-500 uppercase not-italic block tracking-tighter text-[8px]">Rol Principal:</span>
              {pokemon.role}
            </p>
          )}
        </div>

        {/* Actions Row at the Bottom */}
        <div className={`flex flex-wrap gap-2 items-center justify-between mt-auto pt-3 border-t-2 border-dashed ${activeTheme.borderClass}`}>
          {onToggleLock ? (
            <button
              onClick={onToggleLock}
              className={`p-1.5 border-2 ${
                isLocked 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500" 
                  : `${activeTheme.borderClass} ${activeTheme.cardBgClass} hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/50`
              } text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all`}
              title={isLocked ? "Desbloquear ranura" : "Bloquear ranura para que no sea cambiada por la IA"}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
              {isLocked ? "Bloqueado" : "Bloquear"}
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowDamageCalc(!showDamageCalc)}
              className={`p-1.5 border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                         hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                         text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer`}
            >
              <Zap className="w-3.5 h-3.5" />
              {showDamageCalc ? "Ocultar Daño" : "Simular Daño"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`p-1.5 border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                         hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                         text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer`}
            >
              <Settings className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE SIMULACIÓN DE DAÑO (CÁLCULO DEL META) */}
      <AnimatePresence>
        {showDamageCalc && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDamageCalc(false)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="fixed inset-4 md:inset-auto md:w-full md:max-w-4xl md:h-[90vh] z-50 bg-zinc-950 border-4 border-[var(--accent)] shadow-[8px_8px_0px_black] p-6 flex flex-col justify-between overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 shrink-0">
                    <SpriteImg
                      species={pokemon.species}
                      width={40}
                      height={40}
                      className="drop-shadow-md [image-rendering:pixelated]"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
                      Simulación de Daño vs <span className="text-[var(--accent)]">Metagame</span>
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTheme.textMutedClass}`}>
                      {pokemon.species} &bull; {pokemon.item}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDamageCalc(false)}
                  className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto py-6 pr-1">
                <DamageCalcPanel pokemon={pokemon} />
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t-2 border-zinc-800 flex justify-end shrink-0">
                <button
                  onClick={() => setShowDamageCalc(false)}
                  className="px-6 py-2 border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cerrar Simulación
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE EDICIÓN EXCLUSIVO */}
      <AnimatePresence>
        {isEditing && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="fixed inset-4 md:inset-auto md:w-full md:max-w-5xl md:h-[90vh] z-50 bg-zinc-950 border-4 border-[var(--accent)] shadow-[8px_8px_0px_black] p-6 flex flex-col justify-between overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-none bg-[var(--accent)] text-black font-black flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
                    Configurar Pokémon <span className="text-[var(--accent)]">{editedSpecies || pokemon.species}</span>
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pr-1">
                {/* Columna 1: Info Básica */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-1.5 border-b border-zinc-800 pb-1 shrink-0">
                    <SwatchBook className="w-4 h-4" /> Datos de Identidad
                  </h4>

                  <AutocompleteSelect
                    label="Especie / Pokémon (Lista Verificada)"
                    value={editedSpecies}
                    onChange={setEditedSpecies}
                    placeholder="Busca e.g. Togekiss, Garchomp..."
                    searchAction={searchPokemonSpecies}
                  />

                  <div>
                    <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
                      Rol Estratégico
                    </label>
                    <input
                      type="text"
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value)}
                      placeholder="e.g. Offensive Pivot, Tailwind Setter"
                      className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-white transition-colors`}
                    />
                  </div>

                  <AutocompleteSelect
                    label="Objeto Equipado (Lista Verificada)"
                    value={editedItem}
                    onChange={setEditedItem}
                    placeholder="Busca e.g. Choice Specs, Leftovers..."
                    searchAction={searchItems}
                  />

                  <AutocompleteSelect
                    label="Habilidad Especial (Lista Verificada)"
                    value={editedAbility}
                    onChange={setEditedAbility}
                    placeholder="Busca e.g. Intimidate, Levitate..."
                    searchAction={searchAbilities}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
                        Tera Type
                      </label>
                      <select
                        value={editedTeraType}
                        onChange={(e) => setEditedTeraType(e.target.value)}
                        className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-white cursor-pointer`}
                      >
                        {POKEMON_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass} block mb-1`}>
                        Naturaleza
                      </label>
                      <select
                        value={editedNature}
                        onChange={(e) => setEditedNature(e.target.value)}
                        className={`w-full bg-[var(--background)] border-2 ${activeTheme.borderClass} px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-white cursor-pointer`}
                      >
                        {NATURES.map((nat) => (
                          <option key={nat} value={nat}>{nat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Sliders EV */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Distribución EVs
                    </h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 border ${activeTheme.borderClass}
                                     ${totalEvs > 510 ? "bg-[var(--danger)] text-white" : "bg-[var(--accent)]/10"}`}>
                      {totalEvs} / 510 EVs
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {Object.keys(editedEvs).map((stat) => {
                      const typedStat = stat as keyof typeof editedEvs;
                      const val = editedEvs[typedStat];
                      return (
                        <div key={stat} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                            <span>{stat}</span>
                            <span>{val}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="252"
                            step="4"
                            value={val}
                            onChange={(e) => handleEvChange(typedStat, parseInt(e.target.value))}
                            className="w-full accent-[var(--accent)] cursor-pointer h-1.5 bg-zinc-800 rounded-none appearance-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna 3: Movimientos + IVs */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2 flex items-center gap-1.5 border-b border-zinc-800 pb-1">
                    <Zap className="w-4 h-4" /> Movimientos y IVs
                  </h4>

                  {/* Moves Autocompletes */}
                  <div className="flex flex-col gap-3">
                    {editedMoves.map((move, mi) => (
                      <AutocompleteSelect
                        key={mi}
                        label={`Movimiento ${mi + 1}`}
                        value={move}
                        onChange={(val) => {
                          const newMoves = [...editedMoves];
                          newMoves[mi] = val;
                          setEditedMoves(newMoves);
                        }}
                        placeholder={`Busca e.g. Thunderbolt, Spore...`}
                        searchAction={searchMoves}
                      />
                    ))}
                  </div>

                  {/* IVs Row */}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-800">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${activeTheme.textMutedClass}`}>
                      Valores Individuales (IVs)
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {Object.keys(editedIvs).map((stat) => {
                        const typedStat = stat as keyof typeof editedIvs;
                        const val = editedIvs[typedStat];
                        return (
                          <div key={stat} className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase mb-1">{stat}</span>
                            <input
                              type="number"
                              min="0"
                              max="31"
                              value={val}
                              onChange={(e) => {
                                const newIvs = { ...editedIvs };
                                newIvs[typedStat] = Math.max(0, Math.min(31, parseInt(e.target.value) || 0));
                                setEditedIvs(newIvs);
                              }}
                              className={`w-full text-center bg-[var(--background)] border-2 ${activeTheme.borderClass} py-0.5 text-[10px] font-black focus:outline-none focus:border-white`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t-2 border-zinc-800 flex justify-end gap-3 shrink-0">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 border-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 border-2 border-[var(--accent)] bg-[var(--accent)] text-black hover:bg-white hover:border-white hover:text-black text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

