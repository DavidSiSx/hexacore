"use client";

import { useState } from "react";
import { buildTeamAction } from "@/app/actions/team";
import { Team } from "@/lib/schemas/team";
import PokemonCard from "@/app/components/PokemonCard";

export default function TeamBuilder() {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setTeam(null);

    const result = await buildTeamAction(query);
    
    if (result.success) {
      setTeam(result.team);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col flex-1 items-center w-full">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-16 pb-10 px-4 text-center relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                        bg-gradient-to-b from-[var(--accent-primary)]/10 to-transparent
                        rounded-full blur-3xl pointer-events-none" />

        {/* Sprites row */}
        <div className="flex items-center gap-2 mb-6 relative">
          <img src="https://play.pokemonshowdown.com/sprites/gen5/charizard.png"
               alt="Charizard" className="w-14 h-14 opacity-60 hover:opacity-100 hover:scale-125 transition-all" />
          <img src="https://play.pokemonshowdown.com/sprites/gen5/gengar.png"
               alt="Gengar" className="w-14 h-14 opacity-60 hover:opacity-100 hover:scale-125 transition-all" />
          <img src="https://play.pokemonshowdown.com/sprites/gen5/dragapult.png"
               alt="Dragapult" className="w-14 h-14 opacity-60 hover:opacity-100 hover:scale-125 transition-all" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                          bg-clip-text text-transparent">
            ⬡ Hexacore
          </span>
        </h1>
        <p className="text-[var(--text-muted)] max-w-lg text-base">
          Build championship-level teams with AI strategic analysis. Powered by RAG &amp; Gemini.
        </p>
      </section>

      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl px-4 mb-8"
      >
        <div className="glass-card flex items-center gap-3 px-5 py-3 animate-pulse-glow">
          {/* Pokeball icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               className="text-[var(--accent-primary)] flex-shrink-0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="var(--surface-2)"/>
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe tu equipo ideal... (ej. 'Equipo de lluvia con Archaludon para VGC')"
            className="flex-1 bg-transparent outline-none text-white placeholder:text-[var(--text-muted)]
                       text-sm py-1"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                       disabled:opacity-30 disabled:cursor-not-allowed
                       text-white text-sm font-semibold px-5 py-2 rounded-xl
                       transition-all duration-200 flex-shrink-0"
          >
            {loading ? "Analizando..." : "Construir"}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-16 animate-fade-in">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--surface-3)]
                          border-t-[var(--accent-primary)] animate-spin-slow" />
          <div className="text-center">
            <p className="text-[var(--text-secondary)] font-medium">Consultando la Bóveda...</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Buscando estrategias RAG y generando con Gemini 2.5
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full max-w-2xl px-4 mb-8 animate-fade-in">
          <div className="glass-card p-4 border-[var(--danger)]/30">
            <p className="text-[var(--danger)] text-sm font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Team Result */}
      {team && (
        <div className="w-full max-w-5xl px-4 pb-16 animate-fade-in">
          {/* Team Header */}
          <div className="glass-card p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">
              {team.teamName}
            </h2>
            <span className="inline-block bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]
                             text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider mb-3">
              {team.format}
            </span>
            <p className="text-[var(--text-secondary)] text-sm max-w-2xl mx-auto leading-relaxed">
              {team.strategy}
            </p>
          </div>

          {/* Pokemon Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {team.members.map((member, i) => (
              <PokemonCard key={i} pokemon={member} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State (no team, no loading, no error) */}
      {!team && !loading && !error && (
        <div className="flex flex-col items-center gap-3 py-12 text-center opacity-40">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)]">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <p className="text-[var(--text-muted)] text-sm">
            Escribe una idea de equipo arriba y presiona <strong>Construir</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
