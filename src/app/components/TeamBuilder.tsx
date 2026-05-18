"use client";

import { useState, useEffect } from "react";
import { buildTeamAction } from "@/app/actions/team";
import { AITeam, PokemonBuild } from "@/lib/schemas/team";
import TeamPokemonCard from "@/app/components/TeamPokemonCard";
import ChatAssistantDrawer from "@/app/components/ChatAssistantDrawer";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { validateTeam, ValidationReport } from "@/lib/pokemon/validator";
import { exportTeamToShowdown, importTeamFromShowdown } from "@/lib/pokemon/showdown";
import { 
  Loader2, Sparkles, AlertTriangle, ShieldCheck, 
  Upload, Download, X, Copy, Check, SlidersHorizontal
} from "lucide-react";

export default function TeamBuilder() {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<AITeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeTheme } = useTheme();

  // Modales
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showdownInput, setShowdownInput] = useState("");
  const [showdownOutput, setShowdownOutput] = useState("");

  // Reporte de Validación Reactivo
  const [validation, setValidation] = useState<ValidationReport | null>(null);

  // Filtros Avanzados del Constructor de IA
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [format, setFormat] = useState("");
  const [archetype, setArchetype] = useState("");
  const [blacklistTypes, setBlacklistTypes] = useState<string[]>([]);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);

  // Cada vez que cambia el equipo o el formato seleccionado, recalculamos la validación
  useEffect(() => {
    if (team && team.members) {
      const report = validateTeam(team.members, format || team.format || undefined);
      setValidation(report);
    } else {
      setValidation(null);
    }
  }, [team, format]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setTeam(null);
    setStreamLogs([]);

    try {
      const response = await fetch("/api/team/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          options: {
            format: format || undefined,
            archetype: archetype || undefined,
            blacklistTypes: blacklistTypes.length > 0 ? blacklistTypes : undefined,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo iniciar la generación de equipos. Revisa tu sesión.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo iniciar el canal de streaming de telemetría.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === "log") {
                setStreamLogs((prev) => [...prev, data.message]);
              } else if (data.type === "result") {
                setTeam(data.team);
              } else if (data.type === "error") {
                setError(data.error);
              }
            } catch (err) {
              console.error("Error al parsear línea de streaming:", err);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al procesar la petición.");
    } finally {
      setLoading(false);
    }
  }

  // Actualizar un Pokémon específico del equipo desde el componente hijo
  function handleUpdateMember(index: number, updatedMember: PokemonBuild) {
    if (!team) return;
    const updatedMembers = [...team.members];
    updatedMembers[index] = updatedMember;
    setTeam({
      ...team,
      members: updatedMembers,
    });
  }

  // Importar equipo Showdown
  function handleImportShowdown() {
    if (!showdownInput.trim()) return;
    const importedMembers = importTeamFromShowdown(showdownInput);
    if (importedMembers.length === 0) {
      alert("No se pudo detectar un equipo Showdown válido. Revisa el formato.");
      return;
    }

    setTeam({
      teamName: "Equipo Importado de Showdown",
      strategy: "Equipo cargado directamente vía Showdown. Puedes editarlo, simular daño de combate o consultar al Coach IA.",
      format: "VGC Regulación H", // Formato por defecto para VGC
      members: importedMembers,
    });

    setShowdownInput("");
    setShowImportModal(false);
  }

  // Abrir modal de exportación
  function openExportModal() {
    if (!team) return;
    const output = exportTeamToShowdown(team.members);
    setShowdownOutput(output);
    setShowExportModal(true);
  }

  // Copiar al portapapeles
  function handleCopyToClipboard() {
    navigator.clipboard.writeText(showdownOutput);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1 items-center w-full relative">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-12 pb-8 px-4 text-center relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Sprites row */}
        <div className="flex items-center gap-4 mb-6 relative">
          <img 
            src="https://play.pokemonshowdown.com/sprites/dex/charizard.png"
            alt="Charizard" 
            className="w-14 h-14 opacity-40 hover:opacity-100 hover:scale-125 transition-transform [image-rendering:pixelated]" 
          />
          <img 
            src="https://play.pokemonshowdown.com/sprites/dex/gengar.png"
            alt="Gengar" 
            className="w-14 h-14 opacity-40 hover:opacity-100 hover:scale-125 transition-transform [image-rendering:pixelated]" 
          />
          <img 
            src="https://play.pokemonshowdown.com/sprites/dex/dragapult.png"
            alt="Dragapult" 
            className="w-14 h-14 opacity-40 hover:opacity-100 hover:scale-125 transition-transform [image-rendering:pixelated]" 
          />
        </div>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-3">
          <span className={activeTheme.accentClass}>Hexacore</span>
        </h1>
        <p className={`${activeTheme.textMutedClass} max-w-lg text-xs font-bold uppercase tracking-widest`}>
          CONSTRUYE EQUIPOS DE CAMPEONATO CON ANÁLISIS ESTRATÉGICO DE IA. POWERED BY RAG &amp; GEMINI.
        </p>
      </section>

      {/* Control Panel (Search & Import) */}
      <div className="w-full max-w-4xl px-4 mb-8 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex-1">
            <div className={`flex items-center gap-4 px-4 py-3 border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass}`}>
              <Sparkles className={`w-5 h-5 ${activeTheme.accentClass} shrink-0`} strokeWidth={2.5} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe tu equipo competitivo ideal (ej: Sol con Venusaur y Torkoal)..."
                className={`flex-1 bg-transparent outline-none text-[var(--foreground)] 
                           placeholder:text-[var(--foreground)]/30 text-xs font-bold py-1`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className={`bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--accent)]
                           font-black uppercase tracking-tighter text-xs px-5 py-1.5
                           hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)]
                           disabled:opacity-30 disabled:pointer-events-none transition-none shrink-0 cursor-pointer`}
              >
                {loading ? "..." : "CONSTRUIR"}
              </button>
            </div>
          </form>

          {/* Import Showdown Trigger */}
          <button
            onClick={() => setShowImportModal(true)}
            className={`px-5 py-3 border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                       hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                       text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0`}
          >
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            Importar Showdown
          </button>
        </div>

        {/* Toggle Button for Advanced Options */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                       hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:border-[var(--foreground)] transition-colors cursor-pointer flex items-center gap-2`}
          >
            {showAdvanced ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Ocultar Filtros</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros Avanzados</span>
              </>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-5 mt-1 transition-all duration-300 animate-fadeIn`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Formato */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">
                  Regulación / Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className={`bg-[var(--background)] border-2 ${activeTheme.borderClass} text-xs font-bold p-2.5 outline-none rounded-none cursor-pointer text-[var(--foreground)]`}
                >
                  <option value="">Por Defecto</option>
                  <option value="regulation-h">VGC Regulación H (No Legendarios / No Paradojas)</option>
                  <option value="regulation-g">VGC Regulación G (1 Legendario Restringido)</option>
                  <option value="regulation-f">VGC Regulación F (Paradojas / Sub-Legendarios)</option>
                  <option value="regulation-e">VGC Regulación E (Kitakami / Ogerpon)</option>
                  <option value="regulation-d">VGC Regulación D (Transferencias HOME)</option>
                  <option value="regulation-c">VGC Regulación C (Tesoros de la Ruina)</option>
                  <option value="championship-series">VGC Championship Series (Formato Oficial de Torneo)</option>
                  <option value="smogon-ou">Smogon Singles OU (Generación 9)</option>
                  <option value="smogon-ubers">Smogon Singles Ubers (Generación 9)</option>
                  <option value="smogon-uu">Smogon Singles UU (Generación 9)</option>
                  <option value="smogon-ru">Smogon Singles RU (Generación 9)</option>
                  <option value="smogon-nu">Smogon Singles NU (Generación 9)</option>
                  <option value="smogon-pu">Smogon Singles PU (Generación 9)</option>
                  <option value="smogon-lc">Smogon Little Cup (Generación 9)</option>
                  <option value="smogon-doubles-ou">Smogon Doubles OU (Generación 9)</option>
                </select>
                <p className="text-[10px] text-[var(--foreground)]/50 font-bold leading-normal">
                  Establece el marco de legalidad y restricciones de la IA para construir el equipo.
                </p>
              </div>

              {/* Arquetipo */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">
                  Arquetipo / Mecánica
                </label>
                <select
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  className={`bg-[var(--background)] border-2 ${activeTheme.borderClass} text-xs font-bold p-2.5 outline-none rounded-none cursor-pointer text-[var(--foreground)]`}
                >
                  <option value="">Cualquiera</option>
                  <option value="rain">Clima Lluvia (Rain Core)</option>
                  <option value="sun">Clima Sol (Sun Core)</option>
                  <option value="sand">Clima Tormenta de Arena (Sand Core)</option>
                  <option value="snow">Clima Nieve (Snow Core)</option>
                  <option value="trick-room">Espacio Raro (Trick Room Setter/Sweeper)</option>
                  <option value="tailwind">Control de Velocidad (Tailwind Core)</option>
                  <option value="hyper-offense">Ofensiva Total (Hyper Offense)</option>
                  <option value="stall">Defensiva de Desgaste (Stall Core)</option>
                  <option value="balance">Core Equilibrado (Balance)</option>
                </select>
                <p className="text-[10px] text-[var(--foreground)]/50 font-bold leading-normal">
                  Fuerza sinergias específicas de clima, control de velocidad o Trick Room.
                </p>
              </div>

              {/* Blacklist */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">
                  Exclusiones de Categoría
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: "legendary", label: "Legendarios Restringidos (Calyrex/Miraidon)" },
                    { key: "sub-legendary", label: "Sub-Legendarios (Urshifu/Ogerpon)" },
                    { key: "paradox", label: "Pokémon Paradoja (Melenaleteo/Ferrosaco)" },
                    { key: "ultra-beast", label: "Ultraentes (Kartana/Nihilego)" },
                    { key: "mythical", label: "Singulares/Míticos (Pecharunt/Mew)" },
                  ].map((item) => {
                    const checked = blacklistTypes.includes(item.key);
                    return (
                      <label key={item.key} className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none text-[var(--foreground)]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setBlacklistTypes(blacklistTypes.filter((t) => t !== item.key));
                            } else {
                              setBlacklistTypes([...blacklistTypes, item.key]);
                            }
                          }}
                          className={`w-4 h-4 rounded-none border-2 ${activeTheme.borderClass} bg-[var(--background)] accent-[var(--accent)] cursor-pointer`}
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Botón Reset de Filtros */}
            <div className="flex justify-end mt-4 pt-3 border-t border-[var(--foreground)]/10">
              <button
                type="button"
                onClick={() => {
                  setFormat("");
                  setArchetype("");
                  setBlacklistTypes([]);
                }}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                           hover:bg-[var(--danger)] hover:text-white hover:border-[var(--danger)] transition-colors cursor-pointer`}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State with Real-Time Telemetry Logs */}
      {loading && (
        <div className="w-full max-w-4xl px-4 py-8">
          <div className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-6 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden`}>
            {/* Glowing Accent Ring */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--accent)] animate-pulse" />
            
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-20 h-20 border-4 border-dashed border-[var(--accent)] flex items-center justify-center rounded-full animate-spin [animation-duration:12s]`}>
                <Sparkles className={`w-8 h-8 ${activeTheme.accentClass} animate-pulse`} strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mt-3 animate-pulse">
                CONSTRUYENDO...
              </span>
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--foreground)]/10 pb-2">
                <h3 className={`text-sm font-black uppercase tracking-tighter ${activeTheme.textMainClass} flex items-center gap-2`}>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" />
                  TELEMETRÍA DE CONSTRUCCIÓN DE IA
                </h3>
                <span className="text-[9px] font-black uppercase bg-[var(--accent)] text-[var(--accent-foreground)] px-2 py-0.5 tracking-widest">
                  LIVE STREAM
                </span>
              </div>

              {/* Terminal-like log window */}
              <div className="bg-zinc-950/90 border-2 border-zinc-800 p-4 font-mono text-[11px] font-bold text-zinc-300 min-h-[140px] flex flex-col gap-2 rounded-sm shadow-inner relative">
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-40">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>

                {streamLogs.map((log, index) => {
                  const isLast = index === streamLogs.length - 1;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start gap-2 ${isLast ? "text-[var(--accent)] animate-pulse" : "text-zinc-400"} transition-all duration-300`}
                    >
                      <span className="text-[var(--accent)] shrink-0 select-none">&gt;&gt;</span>
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  );
                })}

                {streamLogs.length === 0 && (
                  <div className="text-zinc-600 animate-pulse flex items-center gap-2 py-4 justify-center">
                    Iniciando canal de comunicación y resolución de dependencias...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full max-w-4xl px-4 mb-8">
          <div className={`border-4 border-[var(--danger)] bg-[var(--danger)]/10 p-5 flex items-start gap-4`}>
            <AlertTriangle className="w-6 h-6 text-[var(--danger)] shrink-0" strokeWidth={3} />
            <div>
              <p className="text-[var(--danger)] font-black uppercase tracking-tighter text-base mb-1">Error de Generación</p>
              <p className="text-[var(--danger)] text-xs font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Team Result Workbench */}
      {team && (
        <div className="w-full max-w-5xl px-4 pb-16">
          {/* Team Header & Actions */}
          <div className={`border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-6`}>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <span className={`inline-block ${activeTheme.badgeBgClass} font-black uppercase tracking-widest 
                                 text-[9px] px-2.5 py-0.5 border ${activeTheme.borderClass}`}>
                  {team.format}
                </span>
                {team.modelUsed && (
                  <span className="inline-block bg-[var(--accent)]/10 text-[var(--accent)] font-black uppercase tracking-widest 
                                   text-[9px] px-2.5 py-0.5 border border-[var(--accent)]/30 rounded-sm">
                    IA: {team.modelUsed}
                  </span>
                )}
              </div>
              <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${activeTheme.textMainClass} mb-2`}>
                {team.teamName}
              </h2>
              <p className={`${activeTheme.textMutedClass} text-xs font-bold leading-relaxed max-w-xl`}>
                {team.strategy}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={openExportModal}
                className={`px-4 py-2 border-2 ${activeTheme.borderClass} ${activeTheme.cardBgClass}
                           hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent)]
                           text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer`}
              >
                <Download className="w-4 h-4" />
                Exportar Showdown
              </button>
            </div>
          </div>

          {/* live validation panel */}
          {validation && (
            <div className="mb-8 flex flex-col gap-4">
              
              {/* STATUS PERFECT LEGAL */}
              {validation.valid && validation.warnings.length === 0 && (!validation.suggestions || validation.suggestions.length === 0) && (
                <div className="border-4 border-[var(--success)] bg-[var(--success)]/10 p-5 flex items-center gap-4 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300">
                  <div className="w-10 h-10 bg-[var(--success)]/20 border-2 border-[var(--success)] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[var(--success)] animate-pulse" strokeWidth={3} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-[var(--success)] text-white px-2.5 py-0.5 border border-white/20 mr-2">
                      INTEGRITY OK
                    </span>
                    <h4 className="text-[var(--success)] text-sm font-extrabold uppercase tracking-tight mt-1">
                      SISTEMA INTEGRAL LEGAL Y COMPILADO
                    </h4>
                    <p className="text-white/60 text-xs font-bold font-mono mt-0.5">
                      » Tu equipo cumple al 100% las regulaciones de torneo y las sinergias competitivas analizadas.
                    </p>
                  </div>
                </div>
              )}

              {/* CRITICAL ERRORS (NIVEL 1 - ILEGALIDADES) */}
              {validation.errors.length > 0 && (
                <div className="border-4 border-[var(--danger)] bg-[var(--danger)]/5 p-5 flex flex-col gap-4 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[var(--danger)] text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">
                    SYSTEM BREACH
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[var(--danger)]/20 border-2 border-[var(--danger)] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[var(--danger)] animate-bounce" strokeWidth={3} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-[var(--danger)] text-white px-2 py-0.5 mr-2">
                        RULE BREAKS
                      </span>
                      <h4 className="text-[var(--danger)] text-xs font-black uppercase tracking-widest mt-1">
                        🔴 NIVEL 1: ILEGALIDADES CRÍTICAS DETECTADAS
                      </h4>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 border-t border-[var(--danger)]/20 pt-3">
                    {validation.errors.map((err, ei) => (
                      <li key={ei} className="text-white/90 text-xs font-mono font-bold leading-relaxed flex items-start gap-2">
                        <span className="text-[var(--danger)] font-black">»</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* WARNINGS (NIVEL 2 - ANTI-SINERGIAS MECÁNICAS) */}
              {validation.warnings.length > 0 && (
                <div className="border-4 border-orange-500 bg-orange-500/5 p-5 flex flex-col gap-4 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-500 text-black text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">
                    TELEMETRY ALERT
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-5 h-5 text-orange-500" strokeWidth={3} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-orange-500 text-black px-2 py-0.5 mr-2">
                        ANTI-SYNERGIES
                      </span>
                      <h4 className="text-orange-500 text-xs font-black uppercase tracking-widest mt-1">
                        🟠 NIVEL 2: ANOMALÍAS DE SINERGIA MECÁNICA (SABOTAJES)
                      </h4>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 border-t border-orange-500/20 pt-3">
                    {validation.warnings.map((warn, wi) => (
                      <li key={wi} className="text-white/90 text-xs font-mono font-bold leading-relaxed flex items-start gap-2">
                        <span className="text-orange-500 font-black">»</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SUGGESTIONS (NIVEL 3 - VULNERABILIDADES ESTRUCTURALES Y COACHING) */}
              {validation.suggestions && validation.suggestions.length > 0 && (
                <div className="border-4 border-yellow-500 bg-yellow-500/5 p-5 flex flex-col gap-4 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">
                    TACTICAL ANALYTICS
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-yellow-500 text-black px-2 py-0.5 mr-2">
                        COACH ASSIST
                      </span>
                      <h4 className="text-yellow-500 text-xs font-black uppercase tracking-widest mt-1">
                        🟡 NIVEL 3: COHERENCIA ESTRUCTURAL Y COACHING DE IA
                      </h4>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 border-t border-yellow-500/20 pt-3">
                    {validation.suggestions.map((sug, si) => (
                      <li key={si} className="text-white/90 text-xs font-mono font-bold leading-relaxed flex items-start gap-2">
                        <span className="text-yellow-500 font-black">»</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* Pokemon Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.members.map((member, i) => (
              <TeamPokemonCard 
                key={i} 
                pokemon={member} 
                index={i} 
                onChange={(updated) => handleUpdateMember(i, updated)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!team && !loading && !error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center opacity-40">
          <div className={`w-16 h-16 border-4 ${activeTheme.borderClass} flex items-center justify-center`}>
            <Sparkles className={`w-8 h-8 ${activeTheme.accentClass}`} strokeWidth={2} />
          </div>
          <p className={`${activeTheme.textMutedClass} text-xs font-bold uppercase tracking-widest max-w-xs`}>
            Escribe una idea de equipo arriba o presiona <strong className={activeTheme.accentClass}>Importar Showdown</strong> para comenzar.
          </p>
        </div>
      )}

      {/* MODAL: Importar Showdown */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />
          <div className={`relative w-full max-w-2xl bg-[var(--background)] border-8 ${activeTheme.borderClass} p-6 shadow-2xl z-10`}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b-4 ${activeTheme.borderClass}">
              <h3 className={`text-lg font-black uppercase tracking-tighter ${activeTheme.textMainClass}`}>
                Importar Equipo Pokémon Showdown
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className={`p-1 border-2 ${activeTheme.borderClass} hover:bg-[var(--accent)] hover:text-white cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className={`${activeTheme.textMutedClass} text-xs font-bold uppercase mb-4 leading-relaxed`}>
              Pega el export de texto de Pokémon Showdown en el recuadro de abajo. Cada set de Pokémon debe estar separado por una línea en blanco.
            </p>

            <textarea
              value={showdownInput}
              onChange={(e) => setShowdownInput(e.target.value)}
              placeholder={`Gengar @ Choice Specs\nAbility: Cursed Body\nLevel: 50\nTera Type: Ghost\nEVs: 4 HP / 252 SpA / 252 Spe\nTimid Nature\n- Shadow Ball\n- Sludge Bomb\n- Dazzling Gleam\n- Trick`}
              className={`w-full h-64 bg-zinc-900 border-2 ${activeTheme.borderClass} p-3 text-xs font-mono font-bold 
                         text-zinc-100 placeholder:text-zinc-600 outline-none`}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowImportModal(false)}
                className={`px-4 py-2 border-2 ${activeTheme.borderClass} text-xs font-black uppercase hover:bg-zinc-800 cursor-pointer`}
              >
                Cancelar
              </button>
              <button
                onClick={handleImportShowdown}
                disabled={!showdownInput.trim()}
                className={`px-5 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--accent)]
                           text-xs font-black uppercase hover:bg-[var(--foreground)] hover:text-[var(--background)] 
                           hover:border-[var(--foreground)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
              >
                Cargar Equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Exportar Showdown */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className={`relative w-full max-w-2xl bg-[var(--background)] border-8 ${activeTheme.borderClass} p-6 shadow-2xl z-10`}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b-4 ${activeTheme.borderClass}">
              <h3 className={`text-lg font-black uppercase tracking-tighter ${activeTheme.textMainClass}`}>
                Exportar Equipo Pokémon Showdown
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className={`p-1 border-2 ${activeTheme.borderClass} hover:bg-[var(--accent)] hover:text-white cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              value={showdownOutput}
              className={`w-full h-64 bg-zinc-900 border-2 ${activeTheme.borderClass} p-3 text-xs font-mono font-bold 
                         text-zinc-100 outline-none`}
            />

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--accent)]
                           text-xs font-black uppercase flex items-center gap-2 hover:bg-[var(--foreground)] 
                           hover:text-[var(--background)] hover:border-[var(--foreground)] cursor-pointer"
              >
                {showCopySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 animate-scale" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Portapapeles
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className={`px-4 py-2 border-2 ${activeTheme.borderClass} text-xs font-black uppercase hover:bg-zinc-800 cursor-pointer`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Strategic Coach Assistant */}
      <ChatAssistantDrawer currentTeam={team ? team.members : null} activeTheme={activeTheme} />
    </div>
  );
}
