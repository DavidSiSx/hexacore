import { getPokemonBySlug } from "@/app/actions/pokedex";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { T } from "@/lib/lang";
import { 
  ArrowLeft, 
  BarChart3, 
  Dna, 
  Info, 
  Layers, 
  Swords, 
  Target, 
  Zap, 
  Scale, 
  Ruler, 
  Trophy 
} from "lucide-react";
import PokemonMedia from "@/app/components/PokemonMedia";

const STAT_LABELS: Record<string, { en: string; es: string; color: string }> = {
  hp:  { en: "HP",  es: "PS",  color: "bg-red-500" },
  atk: { en: "Atk", es: "Atq", color: "bg-orange-500" },
  def: { en: "Def", es: "Def", color: "bg-yellow-500" },
  spa: { en: "SpA", es: "AtE", color: "bg-blue-500" },
  spd: { en: "SpD", es: "DfE", color: "bg-green-500" },
  spe: { en: "Spe", es: "Vel", color: "bg-pink-500" },
};

export default async function PokemonDetail({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const pokemon = await getPokemonBySlug(slug);
  if (!pokemon) notFound();

  const attrs = pokemon as any;
  const bst = Object.values(pokemon.stats_base).reduce((a: number, b: number) => a + b, 0);
  const tags: string[] = attrs.tags || [];
  const eggGroups: string[] = attrs.egg_groups || [];
  const usageStats = attrs.usage_stats || {};

  const isSpanish = lang === "es";
  const nameEs = pokemon.nombres?.es;
  const nameEn = pokemon.nombre;
  const hasDifferentNames = isSpanish && nameEs && nameEs.toLowerCase() !== nameEn.toLowerCase();
  
  const displayName = hasDifferentNames ? `${nameEs} [${nameEn}]` : nameEn;
  const displayCategory = pokemon.categorias?.[lang] || pokemon.categorias?.en || "Unknown Pokémon";
  const displayDesc = pokemon.descripciones?.[lang] || pokemon.descripciones?.en || "No Pokédex entry found.";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full animate-fade-in flex flex-col gap-8">
      <Link href={`/${lang}/pokedex`} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--accent)] inline-flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-3 h-3" /> <T es="VOLVER AL HUB" en="BACK TO HUB" />
      </Link>

      <div className="bg-[var(--background)] border-4 border-[var(--border)] p-4 sm:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        {/* Acento Brutalista Esquinero */}
        <div className="absolute top-0 left-0 w-12 h-12 border-b-2 border-r-2 border-[var(--border)] opacity-20 pointer-events-none" />

        {/* Header Left (Pokémon Identity & Media) */}
        <div className="flex flex-col items-center gap-6 w-full md:w-[400px] shrink-0">
          <PokemonMedia species={pokemon.nombre} />
          
          <div className="text-center w-full">
            {attrs.num && (
              <span className="bg-[var(--accent)] text-black font-black tracking-widest px-3 py-1 mb-4 inline-block text-xs">
                #{attrs.num}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-[var(--foreground)] leading-none truncate w-full" title={displayName}>{displayName}</h1>
            <p className="text-[var(--foreground)] opacity-60 font-bold uppercase text-xs mt-3 flex items-center justify-center gap-1.5">
              <Info className="w-3 h-3" /> {displayCategory}
            </p>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {pokemon.tipos.map((t: string) => <TypeBadge key={t} type={t} size="lg" />)}
          </div>
        </div>

        {/* Info Right */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-black/10 border-2 border-[var(--border)] p-4 text-center group hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors">
              <p className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Scale className="w-3 h-3" /> <T es="PESO" en="WEIGHT" />
              </p>
              <p className="font-black text-xl uppercase tracking-tighter">{attrs.peso ? `${attrs.peso} kg` : "—"}</p>
            </div>
            <div className="bg-black/10 border-2 border-[var(--border)] p-4 text-center group hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors">
              <p className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Ruler className="w-3 h-3" /> <T es="ALTURA" en="HEIGHT" />
              </p>
              <p className="font-black text-xl uppercase tracking-tighter">{attrs.altura ? `${attrs.altura} m` : "—"}</p>
            </div>
            <div className="bg-black/10 border-2 border-[var(--border)] p-4 text-center group hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors">
              <p className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Layers className="w-3 h-3" /> TIER
              </p>
              <p className="font-black text-xl uppercase tracking-tighter">{pokemon.tier}</p>
            </div>
            <div className="bg-black/10 border-2 border-[var(--border)] p-4 text-center flex flex-col items-center justify-center overflow-hidden group hover:bg-[var(--accent)] hover:text-[var(--background)] transition-colors">
              <p className="opacity-60 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                <Dna className="w-3 h-3" /> <T es="HUEVO" en="EGGS" />
              </p>
              <p className="font-black text-[10px] uppercase text-center truncate w-full">{eggGroups.length > 0 ? eggGroups.join(", ") : "—"}</p>
            </div>
          </div>

          {/* Dex Entry Section */}
          <div className="relative">
            <div className="bg-[var(--accent)] p-6 border-4 border-[var(--accent)] relative z-10">
              <h2 className="text-[var(--background)] font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 fill-current" /> POKÉDEX DATA
              </h2>
              <p className="text-[var(--background)] font-bold uppercase leading-tight md:text-xl italic">
                "{displayDesc}"
              </p>
            </div>
            <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-[var(--border)] -z-0" />
          </div>

          {/* TWO COLUMNS: Stats & Competitive Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stats Bar */}
            <div className="bg-black/5 border-2 border-[var(--border)] p-6">
              <h2 className="text-sm font-black uppercase tracking-widest flex justify-between mb-6 border-b-2 border-[var(--border)] pb-2">
                <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> <T es="ESTADÍSTICAS BASE" en="BASE STATS" /></span>
                <span className="text-[var(--accent)]">BST: {bst}</span>
              </h2>
              <div className="flex flex-col gap-4">
                {Object.entries(pokemon.stats_base).map(([key, val]) => {
                  const info = STAT_LABELS[key] || { en: key, es: key, color: "bg-zinc-500" };
                  const pct = Math.min(100, ((val as number) / 255) * 100);
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-[10px] opacity-60 w-8 font-black uppercase tracking-widest">
                        <T es={info.es} en={info.en} />
                      </span>
                      <span className="text-sm font-black w-8 text-right">{val as number}</span>
                      <div className="flex-1 h-4 bg-black/20 border border-[var(--border)]">
                        <div className={`h-full ${info.color} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Competitive Usage (Showdown Metrics) */}
            <div className="bg-black/5 border-2 border-[var(--border)] p-6">
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b-2 border-[var(--border)] pb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> <T es="USO COMPETITIVO" en="COMPETITIVE USAGE" />
              </h2>
              
              {Object.keys(usageStats).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(usageStats).sort((a:any, b:any) => b[1] - a[1]).map(([format, percent]: any) => (
                    <div key={format} className="flex flex-col gap-1">
                      <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider">
                        <span>{format} <span className="opacity-40">SHOWDOWN</span></span>
                        <span className="text-[var(--accent)]">{percent}%</span>
                      </div>
                      <div className="w-full h-5 bg-black/20 border border-[var(--border)] relative overflow-hidden">
                        <div 
                          className="h-full bg-[var(--accent)] transition-all duration-1000 delay-300" 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 opacity-30 italic text-center">
                   <p className="text-xs uppercase font-bold"><T es="No hay datos de uso empírico disponibles" en="No empirical usage data available" /></p>
                </div>
              )}
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-black/5 border-2 border-[var(--border)] p-6">
            <h2 className="text-sm font-black uppercase tracking-widest mb-6 border-b-2 border-[var(--border)] pb-2 flex items-center gap-2">
              <Swords className="w-4 h-4" /> <T es="HABILIDADES" en="ABILITIES" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pokemon.habilidades_detalles || []).map((ab) => {
                const abName = ab.nombres?.[lang] || ab.nombre;
                const abDesc = ab.descripciones?.[lang] || ab.descripciones?.en || "No description.";
                
                return (
                  <Link 
                    key={ab.nombre} 
                    href={`/${lang}/pokedex/abilities/${ab.slug}`}
                    className="bg-[var(--background)] border-2 border-[var(--border)] p-4 flex flex-col gap-2 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-colors">{abName}</h3>
                      <Target className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[10px] font-bold uppercase leading-tight opacity-60 group-hover:opacity-100 line-clamp-3">
                      {abDesc}
                    </p>
                  </Link>
                );
              })}
              {(!pokemon.habilidades_detalles || pokemon.habilidades_detalles.length === 0) && pokemon.habilidades.map(a => (
                <div key={a} className="bg-[var(--background)] border-2 border-[var(--border)] p-4">
                  <h3 className="text-sm font-black uppercase tracking-widest">{a}</h3>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
