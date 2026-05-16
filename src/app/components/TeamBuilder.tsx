"use client";

import { useState } from "react";
import { buildTeamAction } from "@/app/actions/team";
import { Team } from "@/lib/schemas/team";
import TeamPokemonCard from "@/app/components/TeamPokemonCard";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";

export default function TeamBuilder() {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeTheme } = useTheme();

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
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Sprites row */}
        <div className="flex items-center gap-4 mb-8 relative">
          <img 
            src="https://play.pokemonshowdown.com/sprites/dex/charizard.png"
            alt="Charizard" 
            className="w-16 h-16 opacity-40 hover:opacity-100 hover:scale-125 transition-transform [image-rendering:pixelated]" 
          />
          <img 
            src="https://play.pokemonshowdown.com/sprites/dex/gengar.png"
            alt="Gengar" 
            className="w-16 h-16 opacity-40 hover:opacity-100 hover:scale-125 transition-transform [image-rendering:pixelated]" 
          />
          <img 
            src="https://play.pokemonshowdown.com/sprites/dex/dragapult.png"
            alt="Dragapult" 
            className="w-16 h-16 opacity-40 hover:opacity-100 hover:scale-125 transition-transform [image-rendering:pixelated]" 
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">
          <span className={activeTheme.accentClass}>Hexacore</span>
        </h1>
        <p className={`${activeTheme.textMutedClass} max-w-lg text-sm font-bold uppercase tracking-widest`}>
          Construye equipos de campeonato con analisis estrategico de IA. Powered by RAG &amp; Gemini.
        </p>
      </section>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4 mb-8">
        <div className={`flex items-center gap-4 px-6 py-4 border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass}`}>
          {/* Pokeball icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`${activeTheme.accentClass} shrink-0`}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2.5"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.5" fill="var(--muted)"/>
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe tu equipo ideal..."
            className={`flex-1 bg-transparent outline-none text-[var(--foreground)] 
                       placeholder:text-[var(--foreground)]/30 text-sm font-bold py-2`}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--accent)]
                       font-black uppercase tracking-tighter text-sm px-6 py-2
                       hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)]
                       disabled:opacity-30 disabled:pointer-events-none
                       active:scale-95 transition-none shrink-0`}
          >
            {loading ? "..." : "Construir"}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center gap-6 py-16">
          <div className={`w-16 h-16 border-4 ${activeTheme.borderClass} flex items-center justify-center`}>
            <Loader2 className={`w-8 h-8 ${activeTheme.accentClass} animate-spin`} strokeWidth={3} />
          </div>
          <div className="text-center">
            <p className={`${activeTheme.textMainClass} font-black uppercase tracking-tighter text-xl mb-2`}>
              Consultando la Boveda...
            </p>
            <p className={`${activeTheme.textMutedClass} text-xs font-bold uppercase tracking-widest`}>
              Buscando estrategias RAG y generando con Gemini 2.5
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full max-w-2xl px-4 mb-8">
          <div className={`border-4 border-[var(--danger)] bg-[var(--danger)]/10 p-6 flex items-start gap-4`}>
            <AlertTriangle className="w-6 h-6 text-[var(--danger)] shrink-0" strokeWidth={3} />
            <div>
              <p className="text-[var(--danger)] font-black uppercase tracking-tighter text-lg mb-1">Error</p>
              <p className="text-[var(--danger)] text-sm font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Result */}
      {team && (
        <div className="w-full max-w-5xl px-4 pb-16">
          {/* Team Header */}
          <div className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-8 mb-8 text-center`}>
            <span className={`inline-block ${activeTheme.badgeBgClass} font-black uppercase tracking-widest 
                             text-[10px] px-3 py-1 border ${activeTheme.borderClass} mb-4`}>
              {team.format}
            </span>
            <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${activeTheme.textMainClass} mb-4`}>
              {team.teamName}
            </h2>
            <p className={`${activeTheme.textMutedClass} text-sm font-bold uppercase tracking-wide max-w-2xl mx-auto leading-relaxed`}>
              {team.strategy}
            </p>
          </div>

          {/* Pokemon Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.members.map((member, i) => (
              <TeamPokemonCard key={i} pokemon={member} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State (no team, no loading, no error) */}
      {!team && !loading && !error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center opacity-40">
          <div className={`w-16 h-16 border-4 ${activeTheme.borderClass} flex items-center justify-center`}>
            <Sparkles className={`w-8 h-8 ${activeTheme.accentClass}`} strokeWidth={2} />
          </div>
          <p className={`${activeTheme.textMutedClass} text-xs font-bold uppercase tracking-widest max-w-xs`}>
            Escribe una idea de equipo arriba y presiona <strong className={activeTheme.accentClass}>Construir</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
