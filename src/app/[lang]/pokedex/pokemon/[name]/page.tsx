import { getPokemonByName } from "@/app/actions/pokedex";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { T } from "@/lib/lang";

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

export default async function PokemonDetail({ params }: { params: Promise<{ lang: string; name: string }> }) {
  const { lang, name } = await params;
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

  const displayName = lang === "es" && pokemon.nombres?.es ? `${pokemon.nombres.es} [${pokemon.nombre}]` : pokemon.nombre;
  const displayCategory = pokemon.categorias?.[lang] || pokemon.categorias?.en || "Unknown Pokémon";
  const displayDesc = pokemon.descripciones?.[lang] || pokemon.descripciones?.en || "No Pokédex entry found.";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full animate-fade-in flex flex-col gap-8">
      <Link href={`/${lang}/pokedex`} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-[#DFE104] inline-flex items-center transition-colors">
        ← <T es="VOLVER" en="BACK" />
      </Link>

      <div className="bg-zinc-950 border-4 border-zinc-700 p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Header Left (Sprite & Name) */}
        <div className="flex flex-col items-center gap-4 bg-zinc-900 border-2 border-zinc-800 p-6 w-full md:w-1/3">
          <SpriteImg species={pokemon.nombre} width={180} height={180} className="drop-shadow-2xl scale-125" />
          <div className="text-center w-full mt-4">
            {attrs.num && <span className="text-[#DFE104] font-black tracking-widest block mb-2 text-sm">#{attrs.num}</span>}
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white leading-none break-words w-full">{displayName}</h1>
            <p className="text-zinc-500 font-bold uppercase text-xs mt-2">{displayCategory}</p>
          </div>
          <div className="flex gap-2 justify-center mt-2 flex-wrap">
            {pokemon.tipos.map((t: string) => <TypeBadge key={t} type={t} size="lg" />)}
          </div>
        </div>

        {/* Info Right */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border-2 border-zinc-800 p-4 text-center">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1"><T es="PESO" en="WEIGHT" /></p>
              <p className="text-white font-black text-lg uppercase">{peso ? `${peso} kg` : "—"}</p>
            </div>
            <div className="bg-zinc-900 border-2 border-zinc-800 p-4 text-center">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1"><T es="ALTURA" en="HEIGHT" /></p>
              <p className="text-white font-black text-lg uppercase">{altura ? `${altura} m` : "—"}</p>
            </div>
            <div className="bg-zinc-900 border-2 border-zinc-800 p-4 text-center">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">TIER</p>
              <p className="text-[#DFE104] font-black text-lg uppercase">{pokemon.tier}</p>
            </div>
            <div className="bg-zinc-900 border-2 border-zinc-800 p-4 text-center flex flex-col items-center justify-center overflow-hidden">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1"><T es="HUEVO" en="EGGS" /></p>
              <p className="text-white font-black text-xs uppercase text-center truncate w-full">{eggGroups.length > 0 ? eggGroups.join(", ") : "—"}</p>
            </div>
          </div>

          {/* Dex Entry */}
          <div className="bg-[#DFE104] p-6 border-4 border-[#DFE104]">
             <h2 className="text-black font-black uppercase tracking-widest text-xs mb-2">POKÉDEX DATA</h2>
             <p className="text-black font-bold uppercase leading-tight md:text-lg">
                "{displayDesc}"
             </p>
          </div>

          {/* Stats Bar */}
          <div className="bg-zinc-900 border-2 border-zinc-800 p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex justify-between mb-6 border-b-2 border-zinc-800 pb-2">
              <span><T es="ESTADÍSTICAS BASE" en="BASE STATS" /></span>
              <span className="text-[#DFE104]">BST: {bst}</span>
            </h2>
            <div className="flex flex-col gap-4">
              {Object.entries(pokemon.stats_base).map(([key, val]) => {
                const info = STAT_LABELS[key] || { en: key, es: key, color: "bg-zinc-500" };
                const pct = Math.min(100, ((val as number) / 255) * 100);
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500 w-8 font-black uppercase tracking-widest">
                      <T es={info.es} en={info.en} />
                    </span>
                    <span className="text-sm text-white w-8 text-right font-black">{val as number}</span>
                    <div className="flex-1 h-3 bg-black border border-zinc-800">
                      <div className={`h-full ${info.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-zinc-900 border-2 border-zinc-800 p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4"><T es="HABILIDADES" en="ABILITIES" /></h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.habilidades.map((a: string) => (
                <Link key={a} href={`/${lang}/pokedex/abilities/${encodeURIComponent(a)}`}
                  className="bg-black border-2 border-zinc-700 text-white text-xs font-black uppercase tracking-widest px-4 py-2 hover:border-[#DFE104] hover:text-[#DFE104] transition-none">
                  {a}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
