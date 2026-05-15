"use client";

import { useState, useEffect, use } from "react";
import { getAllFakemons, type PokemonSearchResult } from "@/app/actions/pokedex";
import { PokemonCard } from "@/app/components/PokemonCard";
import { useLang, T } from "@/lib/lang";

export default function FakemonsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const { t } = useLang();
  const [fakemons, setFakemons] = useState<PokemonSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllFakemons().then(f => { setFakemons(f); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col px-6 py-12 max-w-7xl mx-auto w-full">
      <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
        <span className="text-[#DFE104]">FAKEMONS</span> / CAP
      </h1>
      <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-8 border-b-4 border-zinc-800 pb-4">
        {t(
          "Pokémon creados por la comunidad (Create-A-Pokémon de Showdown).",
          "Community-created Pokémon (Showdown's Create-A-Pokémon)."
        )}
      </p>

      {loading ? (
        <div className="flex items-center gap-3 py-24 justify-center">
          <div className="w-12 h-12 border-8 border-zinc-800 border-t-[#DFE104] animate-spin-slow" />
        </div>
      ) : fakemons.length === 0 ? (
        <div className="bg-zinc-950 border-4 border-zinc-800 p-16 text-center max-w-2xl mx-auto animate-fade-in flex flex-col items-center">
          <div className="text-7xl mb-6">🥚</div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">{t("No hay Fakemons", "No Fakemons")}</h2>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            {t(
              "No se encontraron Fakemons en la base de datos. Ejecuta el seed con las CAPs de Showdown.",
              "No Fakemons found in the database. Run the seed with Showdown CAPs."
            )}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-400 font-black uppercase tracking-widest mb-6">
            {fakemons.length} {t("RESULTADOS", "RESULTS")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
            {fakemons.map((f, idx) => (
              <PokemonCard key={f.id} pokemon={f} lang={lang} index={idx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
