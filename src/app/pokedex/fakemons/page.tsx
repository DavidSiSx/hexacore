"use client";

import { useState, useEffect } from "react";
import { searchPokemon, type PokemonSearchResult } from "@/app/actions/pokedex";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import TypeBadge from "@/app/components/Shared/TypeBadge";

export default function FakemonsPage() {
  const [fakemons, setFakemons] = useState<PokemonSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: When fakemons exist, create a dedicated server action.
    // For now, show empty state.
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">🎨 Fakemons</span>
      </h1>

      {loading ? (
        <div className="flex items-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--surface-3)] border-t-green-500 animate-spin-slow" />
        </div>
      ) : fakemons.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-md animate-fade-in">
          <div className="text-5xl mb-4">🥚</div>
          <h2 className="text-xl font-bold text-white mb-2">Aún no hay Fakemons</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Esta sección mostrará las creaciones de la comunidad. ¡Pronto podrás crear y compartir tus propios Pokémon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full stagger-children">
          {fakemons.map((f) => (
            <div key={f.id} className="glass-card p-4 flex flex-col items-center gap-2">
              <SpriteImg species={f.nombre} width={64} height={64} />
              <p className="text-xs font-semibold text-white text-center">{f.nombre}</p>
              <div className="flex gap-1">
                {f.tipos.map((t: string) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
