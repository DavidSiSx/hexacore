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
  Upload, Download, X, Copy, Check, SlidersHorizontal, Globe
} from "lucide-react";

// ============================================
// NEO-BRUTALIST TEAM BUILDER - i18n DICTIONARY
// ============================================
const translations = {
  es: {
    // Header
    title: "HEXACORE",
    subtitle: "CONSTRUYE EQUIPOS DE CAMPEONATO CON ANÁLISIS ESTRATÉGICO DE IA. POWERED BY RAG & GEMINI.",
    
    // Search & Actions
    searchPlaceholder: "Describe tu equipo competitivo ideal (ej: Sol con Venusaur y Torkoal)...",
    buildButton: "CONSTRUIR",
    buildingButton: "...",
    importShowdown: "Importar Showdown",
    exportShowdown: "Exportar Showdown",
    
    // Advanced Filters
    hideFilters: "Ocultar Filtros",
    advancedFilters: "Filtros Avanzados",
    formatLabel: "Regulación / Formato",
    formatDefault: "Por Defecto",
    formatHelp: "Establece el marco de legalidad y restricciones de la IA para construir el equipo.",
    archetypeLabel: "Arquetipo / Mecánica",
    archetypeDefault: "Cualquiera",
    archetypeHelp: "Fuerza sinergias específicas de clima, control de velocidad o Trick Room.",
    blacklistLabel: "Exclusiones de Categoría",
    clearFilters: "Limpiar Filtros",
    
    // Formats
    formats: {
      "regulation-h": "VGC Regulación H (No Legendarios / No Paradojas)",
      "regulation-g": "VGC Regulación G (1 Legendario Restringido)",
      "regulation-f": "VGC Regulación F (Paradojas / Sub-Legendarios)",
      "regulation-e": "VGC Regulación E (Kitakami / Ogerpon)",
      "regulation-d": "VGC Regulación D (Transferencias HOME)",
      "regulation-c": "VGC Regulación C (Tesoros de la Ruina)",
      "championship-series": "VGC Championship Series (Formato Oficial de Torneo)",
      "smogon-ou": "Smogon Singles OU (Generación 9)",
      "smogon-ubers": "Smogon Singles Ubers (Generación 9)",
      "smogon-uu": "Smogon Singles UU (Generación 9)",
      "smogon-ru": "Smogon Singles RU (Generación 9)",
      "smogon-nu": "Smogon Singles NU (Generación 9)",
      "smogon-pu": "Smogon Singles PU (Generación 9)",
      "smogon-lc": "Smogon Little Cup (Generación 9)",
      "smogon-doubles-ou": "Smogon Doubles OU (Generación 9)",
    },
    
    // Archetypes
    archetypes: {
      "rain": "Clima Lluvia (Rain Core)",
      "sun": "Clima Sol (Sun Core)",
      "sand": "Clima Tormenta de Arena (Sand Core)",
      "snow": "Clima Nieve (Snow Core)",
      "trick-room": "Espacio Raro (Trick Room Setter/Sweeper)",
      "tailwind": "Control de Velocidad (Tailwind Core)",
      "hyper-offense": "Ofensiva Total (Hyper Offense)",
      "stall": "Defensiva de Desgaste (Stall Core)",
      "balance": "Core Equilibrado (Balance)",
    },
    
    // Blacklist
    blacklist: {
      "legendary": "Legendarios Restringidos (Calyrex/Miraidon)",
      "sub-legendary": "Sub-Legendarios (Urshifu/Ogerpon)",
      "paradox": "Pokémon Paradoja (Melenaleteo/Ferrosaco)",
      "ultra-beast": "Ultraentes (Kartana/Nihilego)",
      "mythical": "Singulares/Míticos (Pecharunt/Mew)",
    },
    
    // Telemetry
    telemetryTitle: "TELEMETRÍA DE CONSTRUCCIÓN DE IA",
    liveStream: "LIVE STREAM",
    building: "CONSTRUYENDO...",
    telemetryInit: "Iniciando canal de comunicación y resolución de dependencias...",
    
    // Error
    errorTitle: "Error de Generación",
    
    // Validation
    validationLegal: "SISTEMA INTEGRAL LEGAL Y COMPILADO",
    validationLegalDesc: "Tu equipo cumple al 100% las regulaciones de torneo y las sinergias competitivas analizadas.",
    validationErrors: "NIVEL 1: ILEGALIDADES CRÍTICAS DETECTADAS",
    validationWarnings: "NIVEL 2: ANOMALÍAS DE SINERGIA MECÁNICA (SABOTAJES)",
    validationSuggestions: "NIVEL 3: COHERENCIA ESTRUCTURAL Y COACHING DE IA",
    
    // Empty State
    emptyTitle: "Escribe una idea de equipo arriba o presiona",
    emptyAction: "Importar Showdown",
    emptyEnd: "para comenzar.",
    
    // Import Modal
    importTitle: "Importar Equipo Pokémon Showdown",
    importDesc: "Pega el export de texto de Pokémon Showdown en el recuadro de abajo. Cada set de Pokémon debe estar separado por una línea en blanco.",
    importCancel: "Cancelar",
    importLoad: "Cargar Equipo",
    
    // Export Modal
    exportTitle: "Exportar Equipo Pokémon Showdown",
    copyClipboard: "Copiar Portapapeles",
    copied: "¡Copiado!",
    close: "Cerrar",
    
    // Team imported
    teamImported: "Equipo Importado de Showdown",
    teamImportedStrategy: "Equipo cargado directamente vía Showdown. Puedes editarlo, simular daño de combate o consultar al Coach IA.",
  },
  en: {
    // Header
    title: "HEXACORE",
    subtitle: "BUILD CHAMPIONSHIP-LEVEL TEAMS WITH AI-POWERED STRATEGIC ANALYSIS. POWERED BY RAG & GEMINI.",
    
    // Search & Actions
    searchPlaceholder: "Describe your ideal competitive team (e.g.: Sun team with Venusaur and Torkoal)...",
    buildButton: "BUILD",
    buildingButton: "...",
    importShowdown: "Import Showdown",
    exportShowdown: "Export Showdown",
    
    // Advanced Filters
    hideFilters: "Hide Filters",
    advancedFilters: "Advanced Filters",
    formatLabel: "Regulation / Format",
    formatDefault: "Default",
    formatHelp: "Sets the legality framework and AI restrictions for team building.",
    archetypeLabel: "Archetype / Mechanic",
    archetypeDefault: "Any",
    archetypeHelp: "Forces specific synergies for weather, speed control, or Trick Room.",
    blacklistLabel: "Category Exclusions",
    clearFilters: "Clear Filters",
    
    // Formats
    formats: {
      "regulation-h": "VGC Regulation H (No Legendaries / No Paradox)",
      "regulation-g": "VGC Regulation G (1 Restricted Legendary)",
      "regulation-f": "VGC Regulation F (Paradox / Sub-Legendaries)",
      "regulation-e": "VGC Regulation E (Kitakami / Ogerpon)",
      "regulation-d": "VGC Regulation D (HOME Transfers)",
      "regulation-c": "VGC Regulation C (Treasures of Ruin)",
      "championship-series": "VGC Championship Series (Official Tournament Format)",
      "smogon-ou": "Smogon Singles OU (Gen 9)",
      "smogon-ubers": "Smogon Singles Ubers (Gen 9)",
      "smogon-uu": "Smogon Singles UU (Gen 9)",
      "smogon-ru": "Smogon Singles RU (Gen 9)",
      "smogon-nu": "Smogon Singles NU (Gen 9)",
      "smogon-pu": "Smogon Singles PU (Gen 9)",
      "smogon-lc": "Smogon Little Cup (Gen 9)",
      "smogon-doubles-ou": "Smogon Doubles OU (Gen 9)",
    },
    
    // Archetypes
    archetypes: {
      "rain": "Rain Weather (Rain Core)",
      "sun": "Sun Weather (Sun Core)",
      "sand": "Sandstorm Weather (Sand Core)",
      "snow": "Snow Weather (Snow Core)",
      "trick-room": "Trick Room (Setter/Sweeper)",
      "tailwind": "Speed Control (Tailwind Core)",
      "hyper-offense": "Hyper Offense",
      "stall": "Stall Core",
      "balance": "Balanced Core",
    },
    
    // Blacklist
    blacklist: {
      "legendary": "Restricted Legendaries (Calyrex/Miraidon)",
      "sub-legendary": "Sub-Legendaries (Urshifu/Ogerpon)",
      "paradox": "Paradox Pokémon (Flutter Mane/Iron Bundle)",
      "ultra-beast": "Ultra Beasts (Kartana/Nihilego)",
      "mythical": "Mythicals (Pecharunt/Mew)",
    },
    
    // Telemetry
    telemetryTitle: "AI BUILD TELEMETRY",
    liveStream: "LIVE STREAM",
    building: "BUILDING...",
    telemetryInit: "Initializing communication channel and resolving dependencies...",
    
    // Error
    errorTitle: "Generation Error",
    
    // Validation
    validationLegal: "FULLY LEGAL & COMPILED SYSTEM",
    validationLegalDesc: "Your team 100% complies with tournament regulations and analyzed competitive synergies.",
    validationErrors: "LEVEL 1: CRITICAL ILLEGALITIES DETECTED",
    validationWarnings: "LEVEL 2: MECHANICAL SYNERGY ANOMALIES (SABOTAGE)",
    validationSuggestions: "LEVEL 3: STRUCTURAL COHERENCE & AI COACHING",
    
    // Empty State
    emptyTitle: "Type a team idea above or press",
    emptyAction: "Import Showdown",
    emptyEnd: "to start.",
    
    // Import Modal
    importTitle: "Import Pokémon Showdown Team",
    importDesc: "Paste the Pokémon Showdown text export in the box below. Each Pokémon set should be separated by a blank line.",
    importCancel: "Cancel",
    importLoad: "Load Team",
    
    // Export Modal
    exportTitle: "Export Pokémon Showdown Team",
    copyClipboard: "Copy to Clipboard",
    copied: "Copied!",
    close: "Close",
    
    // Team imported
    teamImported: "Showdown Imported Team",
    teamImportedStrategy: "Team loaded directly via Showdown. You can edit it, simulate combat damage, or consult the AI Coach.",
  },
};

type Locale = "es" | "en";

export default function TeamBuilder() {
  // ============================================
  // STATE
  // ============================================
  const [locale, setLocale] = useState<Locale>("es");
  const t = translations[locale];
  
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

  // ============================================
  // HANDLERS
  // ============================================
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
        headers: { "Content-Type": "application/json" },
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
        throw new Error(locale === "es" 
          ? "No se pudo iniciar la generación de equipos. Revisa tu sesión."
          : "Could not start team generation. Check your session.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error(locale === "es"
          ? "No se pudo iniciar el canal de streaming de telemetría."
          : "Could not start the telemetry streaming channel.");
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
              console.error("Error parsing streaming line:", err);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || (locale === "es" 
        ? "Ocurrió un error inesperado al procesar la petición."
        : "An unexpected error occurred while processing the request."));
    } finally {
      setLoading(false);
    }
  }

  function handleUpdateMember(index: number, updatedMember: PokemonBuild) {
    if (!team) return;
    const updatedMembers = [...team.members];
    updatedMembers[index] = updatedMember;
    setTeam({ ...team, members: updatedMembers });
  }

  function handleImportShowdown() {
    if (!showdownInput.trim()) return;
    const importedMembers = importTeamFromShowdown(showdownInput);
    if (importedMembers.length === 0) {
      alert(locale === "es" 
        ? "No se pudo detectar un equipo Showdown válido. Revisa el formato."
        : "Could not detect a valid Showdown team. Check the format.");
      return;
    }

    setTeam({
      teamName: t.teamImported,
      strategy: t.teamImportedStrategy,
      format: "VGC Regulation H",
      members: importedMembers,
    });

    setShowdownInput("");
    setShowImportModal(false);
  }

  function openExportModal() {
    if (!team) return;
    const output = exportTeamToShowdown(team.members);
    setShowdownOutput(output);
    setShowExportModal(true);
  }

  function handleCopyToClipboard() {
    navigator.clipboard.writeText(showdownOutput);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  }

  function toggleLocale() {
    setLocale((prev) => (prev === "es" ? "en" : "es"));
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-[var(--background)] relative">
      {/* ============================================ */}
      {/* HEADER WITH LANGUAGE TOGGLE */}
      {/* ============================================ */}
      <header className="w-full border-b-4 border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://play.pokemonshowdown.com/sprites/dex/charizard.png"
                alt="Charizard" 
                className="w-10 h-10 opacity-60 hover:opacity-100 hover:scale-110 transition-all [image-rendering:pixelated]" 
              />
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                <span className="text-violet-500">{t.title}</span>
              </h1>
            </div>
          </div>

          {/* Neo-Brutalist Language Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-4 py-2 border-4 border-zinc-700 bg-zinc-900
                       font-black uppercase tracking-tighter text-sm
                       shadow-[4px_4px_0px_#000000]
                       hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#7c3aed]
                       hover:border-violet-500 hover:text-violet-400
                       active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                       transition-all cursor-pointer"
          >
            <Globe className="w-5 h-5" strokeWidth={3} />
            <span>{locale.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* MAIN CONTENT - TWO COLUMN LAYOUT */}
      {/* ============================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ============================================ */}
          {/* LEFT COLUMN - CONTROL PANEL & TELEMETRY */}
          {/* ============================================ */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* AI Query Input - Glassmorphic */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
              <div className="relative border-4 border-zinc-700 bg-zinc-900/80 backdrop-blur-md p-4
                              shadow-[4px_4px_0px_#000000]
                              hover:shadow-[6px_6px_0px_#7c3aed] hover:border-violet-500/50
                              transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-violet-400">
                    AI TEAM CONSTRUCTOR
                  </span>
                </div>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  disabled={loading}
                  rows={3}
                  className="w-full bg-transparent border-2 border-zinc-800 p-3
                             text-sm font-bold text-zinc-100 placeholder:text-zinc-600
                             focus:outline-none focus:border-violet-500/50
                             resize-none"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="w-full mt-3 px-6 py-3 bg-violet-600 text-white border-4 border-violet-500
                             font-black uppercase tracking-tighter text-sm
                             shadow-[4px_4px_0px_#000000]
                             hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                             hover:bg-emerald-500 hover:border-emerald-400
                             disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none
                             active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                             transition-all cursor-pointer"
                >
                  {loading ? t.buildingButton : t.buildButton}
                </button>
              </div>
            </form>

            {/* Advanced Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-center gap-2 px-4 py-2 border-4 border-zinc-800 bg-zinc-900
                         font-black uppercase tracking-widest text-[10px] text-zinc-400
                         shadow-[4px_4px_0px_#000000]
                         hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#ec4899]
                         hover:border-pink-500 hover:text-pink-400
                         active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                         transition-all cursor-pointer"
            >
              {showAdvanced ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
              {showAdvanced ? t.hideFilters : t.advancedFilters}
            </button>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="border-4 border-zinc-800 bg-zinc-900/90 p-5
                              shadow-[4px_4px_0px_#000000] animate-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-5">
                  
                  {/* Format Select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                      {t.formatLabel}
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="bg-zinc-950 border-2 border-zinc-700 text-xs font-bold p-3
                                 text-zinc-100 cursor-pointer focus:outline-none focus:border-violet-500"
                    >
                      <option value="">{t.formatDefault}</option>
                      {Object.entries(t.formats).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-zinc-600 font-bold">{t.formatHelp}</p>
                  </div>

                  {/* Archetype Select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      {t.archetypeLabel}
                    </label>
                    <select
                      value={archetype}
                      onChange={(e) => setArchetype(e.target.value)}
                      className="bg-zinc-950 border-2 border-zinc-700 text-xs font-bold p-3
                                 text-zinc-100 cursor-pointer focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">{t.archetypeDefault}</option>
                      {Object.entries(t.archetypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-zinc-600 font-bold">{t.archetypeHelp}</p>
                  </div>

                  {/* Blacklist Checkboxes */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                      {t.blacklistLabel}
                    </label>
                    <div className="flex flex-col gap-2">
                      {Object.entries(t.blacklist).map(([key, label]) => {
                        const checked = blacklistTypes.includes(key);
                        return (
                          <label key={key} className="flex items-center gap-3 text-xs font-bold cursor-pointer text-zinc-300 hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setBlacklistTypes(blacklistTypes.filter((t) => t !== key));
                                } else {
                                  setBlacklistTypes([...blacklistTypes, key]);
                                }
                              }}
                              className="w-4 h-4 border-2 border-zinc-700 bg-zinc-950 accent-pink-500 cursor-pointer"
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormat("");
                      setArchetype("");
                      setBlacklistTypes([]);
                    }}
                    className="px-4 py-2 border-2 border-zinc-700 text-[10px] font-black uppercase tracking-widest
                               text-zinc-500 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400
                               transition-all cursor-pointer"
                  >
                    {t.clearFilters}
                  </button>
                </div>
              </div>
            )}

            {/* Import/Export Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                           border-4 border-zinc-800 bg-zinc-900
                           font-black uppercase tracking-wider text-[10px] text-zinc-400
                           shadow-[4px_4px_0px_#000000]
                           hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                           hover:border-emerald-500 hover:text-emerald-400
                           active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                           transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" strokeWidth={2.5} />
                {t.importShowdown}
              </button>
              
              {team && (
                <button
                  onClick={openExportModal}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                             border-4 border-zinc-800 bg-zinc-900
                             font-black uppercase tracking-wider text-[10px] text-zinc-400
                             shadow-[4px_4px_0px_#000000]
                             hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#7c3aed]
                             hover:border-violet-500 hover:text-violet-400
                             active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                             transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                  {t.exportShowdown}
                </button>
              )}
            </div>

            {/* Live Telemetry Terminal */}
            {loading && (
              <div className="border-4 border-emerald-500/50 bg-zinc-950 p-4
                              shadow-[4px_4px_0px_#22c55e] relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      {t.telemetryTitle}
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase bg-emerald-500 text-black px-2 py-0.5 tracking-widest animate-pulse">
                    {t.liveStream}
                  </span>
                </div>

                {/* Terminal Window */}
                <div className="bg-black/80 border-2 border-zinc-800 p-3 font-mono text-[11px] min-h-[120px] max-h-[200px] overflow-y-auto">
                  {/* Terminal dots */}
                  <div className="flex items-center gap-1.5 mb-3 opacity-40">
                    <div className="w-2.5 h-2.5 bg-red-500" />
                    <div className="w-2.5 h-2.5 bg-yellow-500" />
                    <div className="w-2.5 h-2.5 bg-emerald-500" />
                  </div>

                  {streamLogs.map((log, index) => {
                    const isLast = index === streamLogs.length - 1;
                    return (
                      <div 
                        key={index} 
                        className={`flex items-start gap-2 mb-1 ${isLast ? "text-emerald-400 animate-pulse" : "text-zinc-500"}`}
                      >
                        <span className="text-emerald-500 shrink-0">&gt;&gt;</span>
                        <span className="leading-relaxed">{log}</span>
                      </div>
                    );
                  })}

                  {streamLogs.length === 0 && (
                    <div className="text-zinc-600 animate-pulse text-center py-4">
                      {t.telemetryInit}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="border-4 border-red-500 bg-red-500/10 p-4
                              shadow-[4px_4px_0px_#ef4444]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" strokeWidth={3} />
                  <div>
                    <p className="text-red-500 font-black uppercase tracking-tighter text-sm mb-1">
                      {t.errorTitle}
                    </p>
                    <p className="text-red-400 text-xs font-bold">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Dashboard */}
            {validation && !loading && (
              <div className="flex flex-col gap-3">
                
                {/* Legal Status */}
                {validation.valid && validation.warnings.length === 0 && (!validation.suggestions || validation.suggestions.length === 0) && (
                  <div className="border-4 border-emerald-500 bg-emerald-500/10 p-4
                                  shadow-[4px_4px_0px_#22c55e]
                                  hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                                  transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-emerald-500 bg-emerald-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" strokeWidth={3} />
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-black px-2 py-0.5">
                          INTEGRITY OK
                        </span>
                        <h4 className="text-emerald-400 text-xs font-black uppercase tracking-tight mt-1">
                          {t.validationLegal}
                        </h4>
                        <p className="text-zinc-500 text-[10px] font-bold mt-0.5">
                          {t.validationLegalDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {validation.errors.length > 0 && (
                  <div className="border-4 border-red-500 bg-red-500/5 p-4 shadow-[4px_4px_0px_#ef4444]">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-400">
                        {t.validationErrors}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5 border-t border-red-500/20 pt-3">
                      {validation.errors.map((err, ei) => (
                        <li key={ei} className="text-zinc-300 text-[11px] font-mono font-bold flex items-start gap-2">
                          <span className="text-red-500">»</span>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                  <div className="border-4 border-orange-500 bg-orange-500/5 p-4 shadow-[4px_4px_0px_#f97316]">
                    <div className="flex items-center gap-3 mb-3">
                      <SlidersHorizontal className="w-5 h-5 text-orange-500" strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">
                        {t.validationWarnings}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5 border-t border-orange-500/20 pt-3">
                      {validation.warnings.map((warn, wi) => (
                        <li key={wi} className="text-zinc-300 text-[11px] font-mono font-bold flex items-start gap-2">
                          <span className="text-orange-500">»</span>
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {validation.suggestions && validation.suggestions.length > 0 && (
                  <div className="border-4 border-yellow-500 bg-yellow-500/5 p-4 shadow-[4px_4px_0px_#eab308]">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">
                        {t.validationSuggestions}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5 border-t border-yellow-500/20 pt-3">
                      {validation.suggestions.map((sug, si) => (
                        <li key={si} className="text-zinc-300 text-[11px] font-mono font-bold flex items-start gap-2">
                          <span className="text-yellow-500">»</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* ============================================ */}
          {/* RIGHT COLUMN - POKEMON TEAM GRID */}
          {/* ============================================ */}
          <section className="lg:col-span-7">
            
            {/* Team Header (if team exists) */}
            {team && (
              <div className="mb-6 border-4 border-zinc-800 bg-zinc-900/80 p-5
                              shadow-[4px_4px_0px_#000000]">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-400 px-2.5 py-0.5 border border-violet-500/30">
                    {team.format}
                  </span>
                  {team.modelUsed && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 border border-emerald-500/30">
                      AI: {team.modelUsed}
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-2">
                  {team.teamName}
                </h2>
                <p className="text-zinc-500 text-xs font-bold leading-relaxed">
                  {team.strategy}
                </p>
              </div>
            )}

            {/* Pokemon Grid */}
            {team && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {team.members.map((member, i) => (
                  <TeamPokemonCard 
                    key={i} 
                    pokemon={member} 
                    index={i} 
                    onChange={(updated) => handleUpdateMember(i, updated)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!team && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] 
                              border-4 border-dashed border-zinc-800 bg-zinc-900/30">
                <div className="w-20 h-20 border-4 border-zinc-700 flex items-center justify-center mb-4
                                shadow-[4px_4px_0px_#000000]">
                  <Sparkles className="w-10 h-10 text-zinc-600" strokeWidth={2} />
                </div>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center max-w-xs">
                  {t.emptyTitle} <strong className="text-violet-500">{t.emptyAction}</strong> {t.emptyEnd}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />
          <div className="relative w-full max-w-2xl bg-zinc-950 border-4 border-violet-500 p-6
                          shadow-[8px_8px_0px_#000000] z-10">
            <div className="flex justify-between items-center mb-4 pb-3 border-b-4 border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                {t.importTitle}
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-zinc-500 text-xs font-bold uppercase mb-4 leading-relaxed">
              {t.importDesc}
            </p>

            <textarea
              value={showdownInput}
              onChange={(e) => setShowdownInput(e.target.value)}
              placeholder={`Gengar @ Choice Specs\nAbility: Cursed Body\nLevel: 50\nTera Type: Ghost\nEVs: 4 HP / 252 SpA / 252 Spe\nTimid Nature\n- Shadow Ball\n- Sludge Bomb\n- Dazzling Gleam\n- Trick`}
              className="w-full h-64 bg-black border-2 border-zinc-800 p-3 text-xs font-mono font-bold 
                         text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-violet-500"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border-2 border-zinc-700 text-xs font-black uppercase 
                           hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {t.importCancel}
              </button>
              <button
                onClick={handleImportShowdown}
                disabled={!showdownInput.trim()}
                className="px-5 py-2 bg-violet-600 text-white border-2 border-violet-500
                           text-xs font-black uppercase
                           shadow-[4px_4px_0px_#000000]
                           hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                           hover:bg-emerald-500 hover:border-emerald-400
                           disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none
                           transition-all cursor-pointer"
              >
                {t.importLoad}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="relative w-full max-w-2xl bg-zinc-950 border-4 border-emerald-500 p-6
                          shadow-[8px_8px_0px_#000000] z-10">
            <div className="flex justify-between items-center mb-4 pb-3 border-b-4 border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                {t.exportTitle}
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              value={showdownOutput}
              className="w-full h-64 bg-black border-2 border-zinc-800 p-3 text-xs font-mono font-bold 
                         text-zinc-100 focus:outline-none"
            />

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleCopyToClipboard}
                className="px-4 py-2 bg-emerald-600 text-white border-2 border-emerald-500
                           text-xs font-black uppercase flex items-center gap-2
                           shadow-[4px_4px_0px_#000000]
                           hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#7c3aed]
                           hover:bg-violet-500 hover:border-violet-400
                           transition-all cursor-pointer"
              >
                {showCopySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t.copyClipboard}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border-2 border-zinc-700 text-xs font-black uppercase 
                           hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {t.close}
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
