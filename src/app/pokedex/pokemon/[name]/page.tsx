import { getPokemonByName } from "@/app/actions/pokedex";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";

const STAT_LABELS: Record<string, { en: string; es: string; color: string }> = {
  hp:  { en: "HP",  es: "PS",  color: "bg-red-500" },
  atk: { en: "Atk", es: "Atq", color: "bg-orange-500" },
  def: { en: "Def", es: "Def", color: "bg-yellow-500" },
  spa: { en: "SpA", es: "AtE", color: "bg-blue-500" },
  spd: { en: "SpD", es: "DfE", color: "bg-green-500" },
  spe: { en: "Spe", es: "Vel", color: "bg-pink-500" },
};

const TAG_LABELS: Record<string, { en: string; es: string; color: string }> = {
  legendary:      { en: "Legendary",       es: "Legendario",       color: "bg-yellow-600" },
  mythical:       { en: "Mythical",        es: "Mítico",           color: "bg-pink-600" },
  ultra_beast:    { en: "Ultra Beast",     es: "Ultraente",        color: "bg-indigo-600" },
  paradox:        { en: "Paradox",         es: "Paradoja",         color: "bg-violet-600" },
  mega:           { en: "Mega Evolution",  es: "Megaevolución",    color: "bg-red-600" },
  primal:         { en: "Primal Reversion",es: "Reversión Primigenia", color: "bg-red-700" },
  gigantamax:     { en: "Gigantamax",      es: "Gigamax",          color: "bg-rose-600" },
  alolan:         { en: "Alolan Form",     es: "Forma de Alola",   color: "bg-teal-600" },
  galarian:       { en: "Galarian Form",   es: "Forma de Galar",   color: "bg-purple-600" },
  hisuian:        { en: "Hisuian Form",    es: "Forma de Hisui",   color: "bg-amber-700" },
  paldean:        { en: "Paldean Form",    es: "Forma de Paldea",  color: "bg-orange-600" },
  alternate_form: { en: "Alternate Form",  es: "Forma Alterna",    color: "bg-gray-600" },
  single_stage:   { en: "Single Stage",    es: "Sin Evolución",    color: "bg-slate-600" },
  basic:          { en: "Basic",           es: "Básico",           color: "bg-green-700" },
  stage_1:        { en: "Stage 1",         es: "Etapa 1",          color: "bg-blue-700" },
  fully_evolved:  { en: "Fully Evolved",   es: "Evolución Final",  color: "bg-emerald-600" },
};

export default async function PokemonDetail({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const pokemon = await getPokemonByName(decodeURIComponent(name));
  if (!pokemon) notFound();

  const attrs = pokemon as any;
  const bst = Object.values(pokemon.stats_base).reduce((a: number, b: number) => a + b, 0);
  const tags: string[] = attrs.tags || [];
  const weaknesses: string[] = attrs.weaknesses || [];
  const resistances: string[] = attrs.resistances || [];
  const immunities: string[] = attrs.immunities || [];
  const evoChain: string[] = attrs.evolution_chain || [];
  const learnset: string[] = attrs.learnset || [];
  const peso = attrs.peso;
  const altura = attrs.altura;
  const eggGroups: string[] = attrs.egg_groups || [];
  const gen = attrs.generacion;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <Link href="/pokedex/pokemon" className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] mb-4 inline-block">
        ← Back to list / Volver al listado
      </Link>

      <div className="glass-card p-6 md:p-8 mb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <SpriteImg species={pokemon.nombre} width={120} height={120} className="drop-shadow-xl" />
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mb-1">
              {attrs.num && <span className="text-xs text-[var(--text-muted)] font-mono">#{attrs.num}</span>}
              <h1 className="text-3xl font-bold text-white">{pokemon.nombre}</h1>
            </div>
            <div className="flex gap-2 justify-center sm:justify-start mb-2">
              {pokemon.tipos.map((t: string) => <TypeBadge key={t} type={t} size="md" />)}
            </div>
            <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start">
              {tags.filter(t => !t.startsWith("gen_")).map(t => {
                const info = TAG_LABELS[t];
                return info ? (
                  <span key={t} className={`${info.color} text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider`}>
                    {info.es} / {info.en}
                  </span>
                ) : null;
              })}
              {gen && <span className="bg-[var(--surface-3)] text-[var(--text-muted)] text-[9px] px-2 py-0.5 rounded-full">Gen {gen}</span>}
            </div>
          </div>
        </div>

        {/* Quick Info / Info Rápida */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[var(--surface-2)] rounded-xl p-3 text-center">
            <p className="text-[var(--text-muted)] text-[10px] mb-0.5">Weight / Peso</p>
            <p className="text-white font-semibold text-sm">{peso ? `${peso} kg` : "—"}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-xl p-3 text-center">
            <p className="text-[var(--text-muted)] text-[10px] mb-0.5">Height / Altura</p>
            <p className="text-white font-semibold text-sm">{altura ? `${altura} m` : "—"}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-xl p-3 text-center">
            <p className="text-[var(--text-muted)] text-[10px] mb-0.5">Tier</p>
            <p className="text-white font-semibold text-sm">{pokemon.tier}</p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-xl p-3 text-center">
            <p className="text-[var(--text-muted)] text-[10px] mb-0.5">Egg Groups</p>
            <p className="text-white font-semibold text-sm truncate">{eggGroups.length > 0 ? eggGroups.join(", ") : "—"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Base Stats / Estadísticas Base <span className="text-[var(--text-muted)]">(BST: {bst})</span></h2>
          <div className="flex flex-col gap-2">
            {Object.entries(pokemon.stats_base).map(([key, val]) => {
              const info = STAT_LABELS[key] || { en: key, es: key, color: "bg-gray-500" };
              const pct = Math.min(100, ((val as number) / 255) * 100);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)] w-8 text-right" title={info.en}>{info.es}</span>
                  <span className="text-xs text-white w-8 text-right font-mono">{val as number}</span>
                  <div className="flex-1 h-2.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <div className={`h-full ${info.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weaknesses & Resistances / Debilidades y Resistencias */}
        {(weaknesses.length > 0 || resistances.length > 0 || immunities.length > 0) && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">Weaknesses & Resistances / Debilidades y Resistencias</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-red-400 text-xs font-semibold mb-1.5">Weak to / Débil a</p>
                  <div className="flex flex-wrap gap-1">{weaknesses.map(t => <TypeBadge key={t} type={t} />)}</div>
                </div>
              )}
              {resistances.length > 0 && (
                <div>
                  <p className="text-green-400 text-xs font-semibold mb-1.5">Resists / Resiste</p>
                  <div className="flex flex-wrap gap-1">{resistances.map(t => <TypeBadge key={t} type={t} />)}</div>
                </div>
              )}
              {immunities.length > 0 && (
                <div>
                  <p className="text-blue-400 text-xs font-semibold mb-1.5">Immune to / Inmune a</p>
                  <div className="flex flex-wrap gap-1">{immunities.map(t => <TypeBadge key={t} type={t} />)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evolution Chain / Cadena Evolutiva */}
        {evoChain.length > 1 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">Evolution Chain / Cadena Evolutiva</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {evoChain.map((evo, i) => (
                <div key={evo} className="flex items-center gap-2">
                  <Link href={`/pokedex/pokemon/${encodeURIComponent(evo)}`}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:bg-white/5
                               ${evo === pokemon.nombre ? "ring-1 ring-[var(--accent-primary)]" : ""}`}>
                    <SpriteImg species={evo} width={48} height={48} className="drop-shadow-md" />
                    <span className="text-[10px] text-[var(--text-secondary)]">{evo}</span>
                  </Link>
                  {i < evoChain.length - 1 && <span className="text-[var(--text-muted)]">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Abilities / Habilidades */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Abilities / Habilidades</h2>
          <div className="flex flex-wrap gap-2">
            {pokemon.habilidades.map((a: string) => (
              <Link key={a} href={`/pokedex/abilities/${encodeURIComponent(a)}`}
                className="bg-[var(--surface-3)] text-[var(--text-secondary)] text-xs px-3 py-1.5 rounded-lg
                           hover:bg-[var(--accent-primary)] hover:text-white transition-colors">
                {a}
              </Link>
            ))}
          </div>
        </div>

        {/* Learnset / Movimientos */}
        {learnset.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">
              Learnset / Movimientos Aprendibles
              <span className="text-[var(--text-muted)] font-normal ml-2">({learnset.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 max-h-64 overflow-y-auto pr-1">
              {learnset.map((m: string) => (
                <Link key={m} href={`/pokedex/moves/${encodeURIComponent(m)}`}
                  className="text-xs text-[var(--text-secondary)] px-2 py-1 rounded hover:bg-[var(--surface-3)] hover:text-white transition-colors truncate">
                  {m}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pokédex Entry */}
        {pokemon.pokedex_entry && pokemon.pokedex_entry !== "Sin entrada de Pokédex." && (
          <div>
            <h2 className="text-sm font-semibold text-white mb-2">Pokédex Entry / Entrada Pokédex</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
              &ldquo;{pokemon.pokedex_entry}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
