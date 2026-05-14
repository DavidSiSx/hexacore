"use client";

import Link from "next/link";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import { type PokemonSearchResult } from "@/app/actions/pokedex";

interface PokemonCardProps {
  pokemon: PokemonSearchResult;
  lang: string;
  index?: number;
}

export function PokemonCard({ pokemon, lang, index }: PokemonCardProps) {
  const mainType = pokemon.tipos[0].toLowerCase();
  const displayName = lang === "es" && pokemon.nombres?.es ? pokemon.nombres.es : pokemon.nombre;
  
  return (
    <Link
      href={`/${lang}/pokedex/pokemon/${encodeURIComponent(pokemon.nombre)}`}
      className={`group relative block w-full h-48 border-4 border-zinc-800 bg-zinc-950 overflow-hidden transition-none hover:border-[#DFE104] type-${mainType} active:scale-95`}
    >
      {/* Background Number (Colossal) */}
      <div className="absolute -bottom-6 -right-4 text-[8rem] font-black leading-none text-zinc-900 group-hover:text-black/10 transition-none z-0 pointer-events-none">
        {pokemon.num ? `#${pokemon.num}` : ""}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 gap-2">
        {/* Sprite with Reveal Effect */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <SpriteImg
            species={pokemon.nombre}
            width={96}
            height={96}
            className="grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 transition-none drop-shadow-md group-hover:scale-125 group-hover:-translate-y-2"
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center gap-1 w-full mt-2">
          <h3 className="text-sm font-black uppercase tracking-tighter text-zinc-400 group-hover:text-black transition-none truncate w-full text-center">
            {displayName}
          </h3>
          <div className="flex gap-1 flex-wrap justify-center opacity-0 group-hover:opacity-100 transition-none">
            {pokemon.tipos.map((tp: string) => (
              <span key={tp} className="text-[10px] font-black uppercase tracking-widest text-black bg-black/10 px-1 border border-black/20">
                {tp}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
