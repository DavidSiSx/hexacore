"use client";

import { PokemonBuild } from "@/lib/schemas/team";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";

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
  return (
    <div className="glass-card p-5 flex flex-col gap-3 group">
      {/* Header: Sprite + Name + Role */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <SpriteImg
            species={pokemon.species}
            width={64}
            height={64}
            className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
          />
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[var(--accent-primary)]
                          text-[10px] font-bold flex items-center justify-center text-white">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{pokemon.species}</h3>
          <p className="text-xs text-[var(--text-muted)] truncate">{pokemon.role}</p>
        </div>
      </div>

      {/* Tera Type Badge */}
      <div className="flex items-center gap-2">
        <TypeBadge type={pokemon.teraType} />
        <span className="text-[10px] text-[var(--text-muted)]">Tera</span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <div>
          <span className="text-[var(--text-muted)] text-xs">Item</span>
          <p className="text-[var(--text-secondary)] font-medium truncate">{pokemon.item}</p>
        </div>
        <div>
          <span className="text-[var(--text-muted)] text-xs">Ability</span>
          <p className="text-[var(--text-secondary)] font-medium truncate">{pokemon.ability}</p>
        </div>
        <div>
          <span className="text-[var(--text-muted)] text-xs">Nature</span>
          <p className="text-[var(--text-secondary)] font-medium">{pokemon.nature}</p>
        </div>
        <div>
          <span className="text-[var(--text-muted)] text-xs">EVs</span>
          <p className="text-[var(--text-secondary)] font-medium text-xs truncate">{formatEvs(pokemon.evs)}</p>
        </div>
      </div>

      {/* Moves */}
      <div>
        <span className="text-[var(--text-muted)] text-xs block mb-1">Moves</span>
        <div className="grid grid-cols-2 gap-1">
          {pokemon.moves.map((move, i) => (
            <div
              key={i}
              className="bg-[var(--surface-3)] text-[var(--text-secondary)] text-xs 
                         px-2.5 py-1.5 rounded-lg text-center truncate
                         hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
            >
              {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
