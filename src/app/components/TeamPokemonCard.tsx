"use client";

import { PokemonBuild } from "@/lib/schemas/team";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

function formatEvs(evs: Record<string, number | undefined>): string {
  return Object.entries(evs)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(" / ");
}

export default function TeamPokemonCard({
  pokemon,
  index,
}: {
  pokemon: PokemonBuild;
  index: number;
}) {
  const { activeTheme } = useTheme();

  return (
    <div className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-6 flex flex-col gap-4 group
                     hover:translate-x-1 hover:-translate-y-1 transition-transform`}>
      {/* Header: Sprite + Name + Role */}
      <div className="flex items-center gap-4">
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
            {pokemon.species}
          </h3>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTheme.textMutedClass} truncate`}>
            {pokemon.role}
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
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>Item</span>
          <p className={`${activeTheme.textMainClass} text-xs font-bold uppercase truncate`}>{pokemon.item}</p>
        </div>
        <div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>Ability</span>
          <p className={`${activeTheme.textMainClass} text-xs font-bold uppercase truncate`}>{pokemon.ability}</p>
        </div>
        <div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>Nature</span>
          <p className={`${activeTheme.textMainClass} text-xs font-bold uppercase`}>{pokemon.nature}</p>
        </div>
        <div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-1`}>EVs</span>
          <p className={`${activeTheme.textMainClass} text-[10px] font-bold uppercase truncate`}>{formatEvs(pokemon.evs)}</p>
        </div>
      </div>

      {/* Moves */}
      <div className={`pt-4 border-t-2 ${activeTheme.borderClass}`}>
        <span className={`text-[9px] font-black uppercase tracking-widest ${activeTheme.textMutedClass} block mb-2`}>Moves</span>
        <div className="grid grid-cols-2 gap-2">
          {pokemon.moves.map((move, i) => (
            <div
              key={i}
              className={`border-2 ${activeTheme.borderClass} text-[10px] font-bold uppercase tracking-wide
                         px-2 py-2 text-center truncate ${activeTheme.textMainClass}
                         hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                         transition-colors cursor-default`}
            >
              {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
