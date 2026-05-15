import Link from "next/link";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import { type PokemonSearchResult } from "@/app/actions/pokedex";
import { TYPE_TRANSLATIONS, translateType } from "@/lib/pokemon";

interface PokemonCardProps {
  pokemon: PokemonSearchResult;
  lang: string;
  index?: number;
  activeTier?: string;
}

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  normal: { bg: "bg-[#A8A878]", border: "border-[#8A8A59]" },
  fire: { bg: "bg-[#F08030]", border: "border-[#DD6610]" },
  water: { bg: "bg-[#6890F0]", border: "border-[#386CEB]" },
  grass: { bg: "bg-[#78C850]", border: "border-[#5CA935]" },
  electric: { bg: "bg-[#F8D030]", border: "border-[#E0B10A]" },
  ice: { bg: "bg-[#98D8D8]", border: "border-[#69C6C6]" },
  fighting: { bg: "bg-[#C03028]", border: "border-[#96221B]" },
  poison: { bg: "bg-[#A040A0]", border: "border-[#7C2B7C]" },
  ground: { bg: "bg-[#E0C068]", border: "border-[#CCA134]" },
  flying: { bg: "bg-[#A890F0]", border: "border-[#8463EB]" },
  psychic: { bg: "bg-[#F85888]", border: "border-[#E62860]" },
  bug: { bg: "bg-[#A8B820]", border: "border-[#859214]" },
  rock: { bg: "bg-[#B8A038]", border: "border-[#937F26]" },
  ghost: { bg: "bg-[#705898]", border: "border-[#554274]" },
  dragon: { bg: "bg-[#7038F8]", border: "border-[#4C12DE]" },
  dark: { bg: "bg-[#705848]", border: "border-[#4D3B2F]" },
  steel: { bg: "bg-[#B8B8D0]", border: "border-[#9797BA]" },
  fairy: { bg: "bg-[#EE99AC]", border: "border-[#E0647D]" },
};

export function PokemonCard({ pokemon, lang, index, activeTier }: PokemonCardProps) {
  const isEs = lang === "es";
  const mainType = (pokemon.tipos?.[0] || "Normal").toLowerCase();
  const displayName = isEs && pokemon.nombres?.es ? pokemon.nombres.es : pokemon.nombre;
  const colors = TYPE_COLORS[mainType] || TYPE_COLORS.normal;

  // Resolución del formato/tier activo para el porcentaje de uso
  const formatKey = activeTier || pokemon.tier || "OU";
  const usagePercent = pokemon.usage_stats?.[formatKey];

  return (
    <Link
      href={`/${lang}/pokedex/pokemon/${encodeURIComponent(pokemon.nombre)}`}
      className={`group relative block w-full h-48 border-4 ${colors.border} ${colors.bg} overflow-hidden transition-all hover:border-black hover:translate-x-1 hover:-translate-y-1`}
    >
      {/* Banner Esquinero Brutalista de Uso Empírico Showdown */}
      {usagePercent !== undefined && (
        <div className="absolute top-0 right-0 bg-black text-[#DFE104] font-mono font-black text-[10px] px-2 py-0.5 border-l-2 border-b-2 border-black z-20 shadow-sm">
          {usagePercent.toFixed(1)}% {formatKey}
        </div>
      )}

      {/* Background Number (Colossal) */}
      <div className="absolute -bottom-6 -left-2 text-[7rem] font-black leading-none text-black/15 group-hover:text-black/25 transition-none z-0 pointer-events-none">
        {pokemon.num ? `#${pokemon.num}` : ""}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between h-full p-3 pb-2 pt-4">
        {/* Sprite with Reveal Effect - DEFAULT TO STATIC SPRITE AS REQUESTED */}
        <div className="relative w-24 h-24 flex items-center justify-center -mt-2">
          <SpriteImg
            species={pokemon.nombre}
            width={96}
            height={96}
            animated={false} // DEFAULT STATIC
            className="drop-shadow-md group-hover:scale-125 group-hover:-translate-y-2 transition-transform duration-150"
          />
        </div>

        {/* Text Details con Contraste Absoluto */}
        <div className="flex flex-col items-center gap-1 w-full mt-auto">
          <h3 className="text-[11px] font-black uppercase tracking-tighter text-white truncate w-full text-center bg-black py-1 px-1.5 border-2 border-black group-hover:bg-zinc-900 transition-colors">
            {displayName}
          </h3>
          <div className="flex gap-1 flex-wrap justify-center opacity-95 group-hover:opacity-100 transition-none">
            {(pokemon.tipos || []).map((tp: string) => (
              <span key={tp} className="text-[9px] font-black uppercase tracking-widest text-zinc-300 bg-black/60 px-1 border border-black/40">
                {translateType(tp, lang)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
