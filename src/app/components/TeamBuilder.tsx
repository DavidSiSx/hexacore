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
  getCustomFormatsAction, 
  saveCustomFormatAction, 
  deleteCustomFormatAction 
} from "@/app/actions/format";
import { 
  Loader2, Sparkles, AlertTriangle, ShieldCheck, 
  Upload, Download, X, Copy, Check, SlidersHorizontal, Globe,
  Gauge, Wind, Shield, Settings, Trash2, Edit
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
      "gen9nationaldex": "Smogon National Dex OU",
      "gen9nationaldexubers": "Smogon National Dex Ubers",
      "gen9nationaldexuu": "Smogon National Dex UU",
      "gen9nationaldexru": "Smogon National Dex RU",
      "gen9nationaldexmonotype": "Smogon National Dex Monotype",
      "gen9nationaldexdoubles": "Smogon National Dex Doubles",
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

    // Meta Modes
    metaModeLabel: "SELECTOR DE COMPORTAMIENTO / RIGIDEZ DE META",
    metaModes: {
      ai_chooses: "IA Elige",
      meta: "Meta Estricto",
      optimized: "Óptimo",
      casual: "Diversión/Meme",
    },
    metaModeHelp: {
      ai_chooses: "La IA decide el balance de competitividad según tu solicitud.",
      meta: "Usa Pokémon de primer nivel en torneos mundiales y spreads de EV precisos.",
      optimized: "Estrategias de alto rendimiento balanceando cores creativos y meta.",
      casual: "Prioriza tu tema meme o idea inusual asegurando sets 100% legales.",
    },
    refinementTitle: "CONSOLA DE REFINAMIENTO DE IA",
    refinementHelp: "Puedes dar retroalimentación a la IA para corregir el equipo o hacer preguntas. Bloquea las ranuras de los Pokémon que te encanten usando el botón 'Bloquear' en su tarjeta antes de refinar.",
    refinementPlaceholder: "e.g. Haz a Rillaboom más defensivo con Assault Vest...",
    refinementButton: "Ajustar Equipo",
    auditConsole: "CONSOLA DE AUDITORÍA INTERNA DE IA",
    technicalSummaryTitle: "RESUMEN TÉCNICO Y COBERTURAS",
    customFormatsTitle: "Formatos Personalizados",
    customFormatsLimit: "Puedes crear hasta 6 formatos personalizados.",
    createFormatBtn: "Crear Formato",
    editFormatBtn: "Editar",
    deleteFormatBtn: "Eliminar",
    nameLabel: "Nombre del Formato",
    descLabel: "Descripción",
    speciesClauseLabel: "Species Clause (No Duplicados)",
    itemClauseLabel: "Item Clause (No Objetos Duplicados)",
    allowMegaLabel: "Permitir Megaevoluciones",
    allowZMoveLabel: "Permitir Movimientos Z",
    allowTeraLabel: "Permitir Teracristalización",
    minLevelLabel: "Nivel Mínimo",
    maxLevelLabel: "Nivel Máximo",
    bansLabel: "Baneos (Separados por comas)",
    banPokemonLabel: "Pokémon Baneados",
    banItemsLabel: "Objetos Baneados",
    banMovesLabel: "Movimientos Baneados",
    banAbilitiesLabel: "Habilidades Baneadas",
    saveFormatBtn: "Guardar Formato",
    cancelBtn: "Cancelar",
    manageFormatsBtn: "Gestionar Formatos",
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
      "gen9nationaldex": "Smogon National Dex OU",
      "gen9nationaldexubers": "Smogon National Dex Ubers",
      "gen9nationaldexuu": "Smogon National Dex UU",
      "gen9nationaldexru": "Smogon National Dex RU",
      "gen9nationaldexmonotype": "Smogon National Dex Monotype",
      "gen9nationaldexdoubles": "Smogon National Dex Doubles",
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

    // Meta Modes
    metaModeLabel: "BEHAVIOR SELECTOR / META STRICTNESS",
    metaModes: {
      ai_chooses: "AI Decides",
      meta: "Strict Meta",
      optimized: "Optimized",
      casual: "Casual/Meme",
    },
    metaModeHelp: {
      ai_chooses: "The AI decides the competitiveness balance based on your prompt.",
      meta: "Strictly uses top-tier world championship builds and precise EV spreads.",
      optimized: "Solid high-tier performance while enabling creative core dynamics.",
      casual: "Prioritizes your creative or meme theme while keeping sets 100% legal.",
    },
    refinementTitle: "AI REFINEMENT CONSOLE",
    refinementHelp: "You can provide feedback to the AI to correct the team or ask questions. Lock the slots of the Pokémon you love using the 'Lock' button on their card before refining.",
    refinementPlaceholder: "e.g. Make Rillaboom more defensive with an Assault Vest...",
    refinementButton: "Refine Team",
    auditConsole: "AI INTERNAL AUDIT CONSOLE",
    technicalSummaryTitle: "TECHNICAL SUMMARY & COVERAGES",
    customFormatsTitle: "Custom Formats",
    customFormatsLimit: "You can create up to 6 custom formats.",
    createFormatBtn: "Create Format",
    editFormatBtn: "Edit",
    deleteFormatBtn: "Delete",
    nameLabel: "Format Name",
    descLabel: "Description",
    speciesClauseLabel: "Species Clause (No Duplicates)",
    itemClauseLabel: "Item Clause (No Duplicate Items)",
    allowMegaLabel: "Allow Mega Evolutions",
    allowZMoveLabel: "Allow Z-Moves",
    allowTeraLabel: "Allow Terastallization",
    minLevelLabel: "Minimum Level",
    maxLevelLabel: "Maximum Level",
    bansLabel: "Bans (Comma separated)",
    banPokemonLabel: "Banned Pokémon",
    banItemsLabel: "Banned Items",
    banMovesLabel: "Banned Moves",
    banAbilitiesLabel: "Banned Abilities",
    saveFormatBtn: "Save Format",
    cancelBtn: "Cancel",
    manageFormatsBtn: "Manage Formats",
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

  // Nuevos Estados del Constructor Avanzado y Refinamiento
  const [metaMode, setMetaMode] = useState<"ai_chooses" | "meta" | "optimized" | "casual">("ai_chooses");
  const [lockedSlots, setLockedSlots] = useState<boolean[]>([false, false, false, false, false, false]);
  const [refinementInput, setRefinementInput] = useState("");
  const [showAuditConsole, setShowAuditConsole] = useState(false);

  // Formatos Personalizados
  const [customFormats, setCustomFormats] = useState<any[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showCustomManager, setShowCustomManager] = useState(false);
  const [customFormatId, setCustomFormatId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [speciesClause, setSpeciesClause] = useState(true);
  const [itemClause, setItemClause] = useState(false);
  const [allowMega, setAllowMega] = useState(true);
  const [allowZMove, setAllowZMove] = useState(true);
  const [allowTera, setAllowTera] = useState(true);
  const [minLevel, setMinLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(100);
  const [banPokemon, setBanPokemon] = useState("");
  const [banItems, setBanItems] = useState("");
  const [banMoves, setBanMoves] = useState("");
  const [banAbilities, setBanAbilities] = useState("");

  // Cada vez que cambia el equipo o el formato seleccionado, recalculamos la validación
  useEffect(() => {
    if (team && team.members) {
      const report = validateTeam(team.members, format || team.format || undefined);
      setValidation(report);
    } else {
      setValidation(null);
    }
  }, [team, format]);

  // Cargar formatos personalizados al iniciar
  useEffect(() => {
    async function loadFormats() {
      try {
        const res = await getCustomFormatsAction();
        if (res.success && res.formats) {
          setCustomFormats(res.formats);
        }
      } catch (e) {
        console.error("Error cargando formatos personalizados:", e);
      }
    }
    loadFormats();
  }, []);

  async function handleSaveCustomFormat(e: React.FormEvent) {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      const rules = {
        speciesClause,
        itemClause,
        allowMega,
        allowZMove,
        allowTera,
        minLevel,
        maxLevel,
        bans: {
          pokemon: banPokemon.split(",").map(x => x.trim()).filter(Boolean),
          items: banItems.split(",").map(x => x.trim()).filter(Boolean),
          moves: banMoves.split(",").map(x => x.trim()).filter(Boolean),
          abilities: banAbilities.split(",").map(x => x.trim()).filter(Boolean),
        }
      };

      const res = await saveCustomFormatAction(
        customName,
        customDesc,
        rules,
        customFormatId || undefined
      );

      if (res.success && res.format) {
        if (customFormatId) {
          setCustomFormats(prev => prev.map(f => f.id === customFormatId ? res.format : f));
        } else {
          setCustomFormats(prev => [res.format, ...prev]);
        }
        setShowCustomModal(false);
        resetCustomFormatForm();
      } else {
        alert(res.error || "Error al guardar el formato.");
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    }
  }

  async function handleDeleteCustomFormat(id: string) {
    if (!confirm(locale === "es" ? "¿Seguro que deseas eliminar este formato?" : "Are you sure you want to delete this format?")) return;
    try {
      const res = await deleteCustomFormatAction(id);
      if (res.success) {
        setCustomFormats(prev => prev.filter(f => f.id !== id));
        if (format === id) {
          setFormat("");
        }
      } else {
        alert(res.error || "Error al eliminar el formato.");
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    }
  }

  function handleEditCustomFormat(fmt: any) {
    setCustomFormatId(fmt.id);
    setCustomName(fmt.nombre);
    setCustomDesc(fmt.descripcion);
    
    const rules = fmt.reglas as any;
    setSpeciesClause(rules.speciesClause ?? true);
    setItemClause(rules.itemClause ?? false);
    setAllowMega(rules.allowMega ?? true);
    setAllowZMove(rules.allowZMove ?? true);
    setAllowTera(rules.allowTera ?? true);
    setMinLevel(rules.minLevel ?? 1);
    setMaxLevel(rules.maxLevel ?? 100);
    setBanPokemon(rules.bans?.pokemon?.join(", ") ?? "");
    setBanItems(rules.bans?.items?.join(", ") ?? "");
    setBanMoves(rules.bans?.moves?.join(", ") ?? "");
    setBanAbilities(rules.bans?.abilities?.join(", ") ?? "");
    
    setShowCustomModal(true);
  }

  function resetCustomFormatForm() {
    setCustomFormatId(null);
    setCustomName("");
    setCustomDesc("");
    setSpeciesClause(true);
    setItemClause(false);
    setAllowMega(true);
    setAllowZMove(true);
    setAllowTera(true);
    setMinLevel(1);
    setMaxLevel(100);
    setBanPokemon("");
    setBanItems("");
    setBanMoves("");
    setBanAbilities("");
  }

  // ============================================
  // HANDLERS
  // ============================================
  function handleToggleLock(index: number) {
    setLockedSlots((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setTeam(null);
    setStreamLogs([]);
    // Resetear bloqueos en una generación limpia y fresca
    setLockedSlots([false, false, false, false, false, false]);

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
            metaMode: metaMode || undefined,
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

  async function handleRefinementSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refinementInput.trim() || loading || !team) return;

    setLoading(true);
    setError(null);
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
            metaMode: metaMode || undefined,
            currentTeam: team.members,
            lockedSlots: lockedSlots.map((lock, idx) => lock ? idx : -1).filter(idx => idx !== -1),
            refinementPrompt: refinementInput,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(locale === "es" 
          ? "No se pudo iniciar la refinación del equipo. Revisa tu sesión."
          : "Could not start team refinement. Check your session.");
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
      setRefinementInput("");
    } catch (err: any) {
      setError(err.message || (locale === "es" 
        ? "Ocurrió un error al procesar el refinamiento."
        : "An error occurred while processing refinement."));
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
                <span className="text-[var(--accent)]">{t.title}</span>
              </h1>
            </div>
          </div>

          {/* Neo-Brutalist Language Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-4 py-2 border-4 border-zinc-700 bg-zinc-900
                       font-black uppercase tracking-tighter text-sm
                       shadow-[4px_4px_0px_#000000]
                       hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--border)]
                       hover:border-[var(--border)] hover:text-[var(--accent)]
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
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-emerald-500/10 pointer-events-none" />
              <div className="relative border-4 border-zinc-700 bg-zinc-900/80 backdrop-blur-md p-4
                              shadow-[4px_4px_0px_#000000]
                              hover:shadow-[6px_6px_0px_var(--border)] hover:border-[var(--border)]/50
                              transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-[var(--accent)] animate-pulse" strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
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
                             focus:outline-none focus:border-[var(--border)]/50
                             resize-none"
                />

                {/* Selector de Modo / Rigidez de Meta */}
                <div className="mt-4 flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {t.metaModeLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ai_chooses", "meta", "optimized", "casual"] as const).map((mode) => {
                      const isActive = metaMode === mode;
                      let activeStyle = "";
                      if (mode === "ai_chooses") activeStyle = "bg-[var(--accent)] border-[var(--border)] text-[var(--accent-foreground)] shadow-[2px_2px_0px_var(--border)]";
                      else if (mode === "meta") activeStyle = "bg-red-600 border-red-500 text-white shadow-[2px_2px_0px_#7f1d1d]";
                      else if (mode === "optimized") activeStyle = "bg-emerald-600 border-emerald-500 text-white shadow-[2px_2px_0px_#064e3b]";
                      else activeStyle = "bg-pink-600 border-pink-500 text-white shadow-[2px_2px_0px_#831843]";

                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setMetaMode(mode)}
                          disabled={loading}
                          className={`px-3 py-2 border-2 text-[10px] font-black uppercase tracking-tighter transition-all cursor-pointer flex flex-col items-center justify-center text-center leading-none ${
                            isActive 
                              ? activeStyle 
                              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                        >
                          <span className="mb-0.5 block">{t.metaModes[mode]}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Info helper box */}
                  <p className="text-[9px] text-zinc-500 font-bold leading-tight mt-1 min-h-[24px]">
                    💡 {t.metaModeHelp[metaMode]}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="w-full mt-3 px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--border)]
                             font-black uppercase tracking-tighter text-sm
                             shadow-[4px_4px_0px_#000000]
                             hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                             hover:bg-emerald-500 hover:border-emerald-400 hover:text-black
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
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                        {t.formatLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomManager(true);
                          resetCustomFormatForm();
                        }}
                        className="px-2 py-0.5 border border-zinc-700 hover:border-[var(--border)] hover:bg-zinc-800 text-[8px] font-black uppercase tracking-tighter text-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        ⚙️ {t.manageFormatsBtn} ({customFormats.length}/6)
                      </button>
                    </div>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="bg-zinc-950 border-2 border-zinc-700 text-xs font-bold p-3
                                 text-zinc-100 cursor-pointer focus:outline-none focus:border-[var(--border)]"
                    >
                      <option value="">{t.formatDefault}</option>
                      {Object.entries(t.formats).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                      {customFormats.length > 0 && (
                        <optgroup label={t.customFormatsTitle}>
                          {customFormats.map((f) => (
                            <option key={f.id} value={f.id}>
                              ⭐ {f.nombre}
                            </option>
                          ))}
                        </optgroup>
                      )}
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
                             hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--border)]
                             hover:border-[var(--border)] hover:text-[var(--accent)]
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
              <div className="flex flex-col gap-4">
                
                {/* Neo-Brutalist Technical Summary Card */}
                <div className={`border-4 ${validation.valid ? "border-emerald-500 shadow-[4px_4px_0px_#22c55e]" : "border-red-500 shadow-[4px_4px_0px_#ef4444]"} bg-zinc-950 p-5 relative overflow-hidden transition-all`}>
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 border ${validation.valid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                        {validation.valid ? "COMPILADO" : "CONTRATIEMPO"}
                      </span>
                      <h4 className="text-white text-xs font-black uppercase tracking-tight">
                        {t.technicalSummaryTitle}
                      </h4>
                    </div>
                  </div>

                  {/* Indicators Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Speed Control */}
                    <div className="bg-zinc-900/60 border-2 border-zinc-800 p-2.5 text-center flex flex-col items-center justify-between gap-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 block">
                        Control Velocidad
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <Gauge className={`w-3.5 h-3.5 ${validation.stats?.hasSpeedControl ? "text-emerald-400" : "text-zinc-650"}`} />
                        <span className={`text-[10px] font-black uppercase ${validation.stats?.hasSpeedControl ? "text-emerald-400" : "text-zinc-650"}`}>
                          {validation.stats?.hasSpeedControl ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </div>
                    </div>

                    {/* Hazard Control */}
                    <div className="bg-zinc-900/60 border-2 border-zinc-800 p-2.5 text-center flex flex-col items-center justify-between gap-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 block">
                        Remoción Trampas
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <Wind className={`w-3.5 h-3.5 ${validation.stats?.hasHazardControl ? "text-emerald-400" : "text-zinc-650"}`} />
                        <span className={`text-[10px] font-black uppercase ${validation.stats?.hasHazardControl ? "text-emerald-400" : "text-zinc-650"}`}>
                          {validation.stats?.hasHazardControl ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </div>
                    </div>

                    {/* Protect count */}
                    <div className="bg-zinc-900/60 border-2 border-zinc-800 p-2.5 text-center flex flex-col items-center justify-between gap-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500 block">
                        Protecciones
                      </span>
                      <div className="flex items-center gap-1 mt-1 text-[var(--accent)]">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black">
                          {validation.stats?.protectCount || 0} slots
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Fields & Climate */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Climas */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 p-2 flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500">Climas Activos</span>
                      <div className="flex flex-wrap gap-1">
                        {validation.stats?.weathers && validation.stats.weathers.length > 0 ? (
                          validation.stats.weathers.map((w, idx) => (
                            <span key={idx} className="text-[9px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30 px-1.5 py-0.5">
                              {w}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-black text-zinc-650">Ninguno</span>
                        )}
                      </div>
                    </div>

                    {/* Terrenos */}
                    <div className="bg-zinc-900/40 border border-zinc-800/80 p-2 flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-zinc-500">Terrenos Activos</span>
                      <div className="flex flex-wrap gap-1">
                        {validation.stats?.terrains && validation.stats.terrains.length > 0 ? (
                          validation.stats.terrains.map((t, idx) => (
                            <span key={idx} className="text-[9px] font-black uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--border)]/30 px-1.5 py-0.5">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-black text-zinc-650">Ninguno</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Immunities & Weaknesses */}
                  <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/60">
                    {/* Inmunidades */}
                    {validation.stats?.immunities && validation.stats.immunities.length > 0 && (
                      <div>
                        <span className="text-[8px] font-black uppercase text-zinc-500 block mb-1">Inmunidades Activas</span>
                        <div className="flex flex-wrap gap-1">
                          {validation.stats.immunities.map((type) => (
                            <span key={type} className="text-[8px] font-bold uppercase bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-zinc-300">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cobertura de Debilidades */}
                    {validation.stats?.weaknesses && validation.stats.weaknesses.length > 0 && (
                      <div>
                        <span className="text-[8px] font-black uppercase text-zinc-400 block mb-1">Debilidades Acumuladas</span>
                        <div className="flex flex-wrap gap-1">
                          {validation.stats.weaknesses.map((type) => (
                            <span key={type} className="text-[8px] font-bold uppercase bg-red-950/30 border border-red-900/40 px-1.5 py-0.5 text-red-400">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[var(--accent)]/20 text-[var(--accent)] px-2.5 py-0.5 border border-[var(--border)]/30">
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
                    isLocked={lockedSlots[i]}
                    onToggleLock={() => handleToggleLock(i)}
                    onChange={(updated) => handleUpdateMember(i, updated)}
                  />
                ))}
              </div>
            )}

            {/* Refinement Panel */}
            {team && (
              <div className="mt-8 border-4 border-[var(--border)] bg-zinc-950 p-5
                              shadow-[6px_6px_0px_#000000] relative overflow-hidden transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-[var(--accent)] animate-bounce" strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                    {t.refinementTitle}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-bold uppercase mb-3 leading-relaxed">
                  {t.refinementHelp}
                </p>
                <form onSubmit={handleRefinementSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      placeholder={t.refinementPlaceholder}
                      disabled={loading}
                      className="flex-1 bg-black border-2 border-zinc-800 p-3 text-xs font-bold text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-[var(--border)]"
                    />
                    <button
                      type="submit"
                      disabled={loading || !refinementInput.trim()}
                      className="px-6 py-3 bg-[var(--accent)] border-2 border-[var(--border)] text-[var(--accent-foreground)] font-black uppercase tracking-tighter text-xs shadow-[2px_2px_0px_#000000] hover:bg-[var(--accent)]/80 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {t.refinementButton}
                    </button>
                  </div>
                </form>
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
                  {t.emptyTitle} <strong className="text-[var(--accent)]">{t.emptyAction}</strong> {t.emptyEnd}
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
          <div className="relative w-full max-w-2xl bg-zinc-950 border-4 border-[var(--border)] p-6
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
                         text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-[var(--border)]"
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
                className="px-5 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--border)]
                           text-xs font-black uppercase
                           shadow-[4px_4px_0px_#000000]
                           hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                           hover:bg-emerald-500 hover:border-emerald-400 hover:text-black
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
                           hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--border)]
                           hover:bg-[var(--accent)]/80 hover:border-[var(--border)] hover:text-[var(--accent-foreground)]
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

      {/* Custom Formats Manager Modal */}
      {showCustomManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowCustomManager(false)} />
          <div className="relative w-full max-w-3xl bg-zinc-950 border-4 border-[var(--border)] p-6
                          shadow-[8px_8px_0px_#000000] z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b-4 border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                  {t.customFormatsTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowCustomManager(false)}
                className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-500 text-[10px] font-black uppercase">
                {t.customFormatsLimit} ({customFormats.length} / 6)
              </span>
              <button
                type="button"
                disabled={customFormats.length >= 6}
                onClick={() => {
                  resetCustomFormatForm();
                  setShowCustomModal(true);
                }}
                className="px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--border)] text-xs font-black uppercase shadow-[2px_2px_0px_#000000] hover:bg-[var(--accent)]/80 disabled:opacity-40 cursor-pointer transition-all"
              >
                {t.createFormatBtn}
              </button>
            </div>

            {/* List of Custom Formats */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {customFormats.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-800 p-8 text-center text-zinc-500 font-bold text-xs uppercase">
                  {locale === "es" ? "No hay formatos personalizados creados." : "No custom formats created."}
                </div>
              ) : (
                customFormats.map((fmt) => {
                  const rules = fmt.reglas as any;
                  return (
                    <div 
                      key={fmt.id} 
                      className="border-2 border-zinc-800 bg-zinc-900/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-white uppercase tracking-tight">{fmt.nombre}</h4>
                        {fmt.descripcion && (
                          <p className="text-zinc-400 text-xs mt-1 font-semibold">{fmt.descripcion}</p>
                        )}
                        {/* Summary of Rules */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-300 text-[9px] font-bold rounded uppercase">
                            Lv. {rules.minLevel ?? 1}-{rules.maxLevel ?? 100}
                          </span>
                          {rules.speciesClause && (
                            <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-300 text-[9px] font-bold rounded uppercase">
                              Species Clause
                            </span>
                          )}
                          {rules.itemClause && (
                            <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-300 text-[9px] font-bold rounded uppercase">
                              Item Clause
                            </span>
                          )}
                          {rules.allowMega && (
                            <span className="px-1.5 py-0.5 bg-emerald-950/40 text-emerald-400 text-[9px] font-bold rounded uppercase border border-emerald-900/50">
                              Megas
                            </span>
                          )}
                          {rules.allowZMove && (
                            <span className="px-1.5 py-0.5 bg-indigo-950/40 text-indigo-400 text-[9px] font-bold rounded uppercase border border-indigo-900/50">
                              Z-Moves
                            </span>
                          )}
                          {rules.allowTera && (
                            <span className="px-1.5 py-0.5 bg-pink-950/40 text-pink-400 text-[9px] font-bold rounded uppercase border border-pink-900/50">
                              Tera
                            </span>
                          )}
                          {((rules.bans?.pokemon?.length || 0) > 0 || (rules.bans?.items?.length || 0) > 0 || (rules.bans?.moves?.length || 0) > 0 || (rules.bans?.abilities?.length || 0) > 0) && (
                            <span className="px-1.5 py-0.5 bg-red-950/40 text-red-400 text-[9px] font-bold rounded uppercase border border-red-900/50">
                              Bans: {
                                [
                                  rules.bans?.pokemon?.length ? `${rules.bans.pokemon.length} Poke` : null,
                                  rules.bans?.items?.length ? `${rules.bans.items.length} Obj` : null,
                                  rules.bans?.moves?.length ? `${rules.bans.moves.length} Mov` : null,
                                  rules.bans?.abilities?.length ? `${rules.bans.abilities.length} Hab` : null,
                                ].filter(Boolean).join(", ")
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditCustomFormat(fmt)}
                          className="px-2.5 py-1.5 border border-zinc-700 hover:border-blue-500 hover:bg-blue-950/20 text-zinc-300 hover:text-blue-400 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          {t.editFormatBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomFormat(fmt.id)}
                          className="px-2.5 py-1.5 border border-zinc-700 hover:border-red-500 hover:bg-red-950/20 text-zinc-300 hover:text-red-400 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.deleteFormatBtn}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t-4 border-zinc-800">
              <button
                onClick={() => setShowCustomManager(false)}
                className="px-4 py-2 border-2 border-zinc-700 text-xs font-black uppercase hover:bg-zinc-800 transition-colors text-white cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Format Editor/Creator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowCustomModal(false)} />
          <form 
            onSubmit={handleSaveCustomFormat}
            className="relative w-full max-w-3xl bg-zinc-950 border-4 border-[var(--border)] p-6
                            shadow-[8px_8px_0px_#000000] z-10 flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b-4 border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                {customFormatId ? (locale === "es" ? "Editar Formato" : "Edit Format") : (locale === "es" ? "Crear Formato" : "Create Format")}
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 border-2 border-zinc-700 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-left">
              {/* Name & Desc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={locale === "es" ? "Ej: Copa de la Liga" : "e.g. League Cup"}
                    className="bg-black border-2 border-zinc-800 p-2.5 text-xs font-bold text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-[var(--border)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t.descLabel}
                  </label>
                  <input
                    type="text"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder={locale === "es" ? "Breve explicación del torneo..." : "Brief explanation of the tournament..."}
                    className="bg-black border-2 border-zinc-800 p-2.5 text-xs font-bold text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-[var(--border)]"
                  />
                </div>
              </div>

              {/* Toggles Group */}
              <div className="border-2 border-zinc-800 p-4 bg-zinc-900/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 text-xs font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={speciesClause}
                    onChange={(e) => setSpeciesClause(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-700 bg-zinc-950 accent-[var(--accent)] cursor-pointer"
                  />
                  <span>{t.speciesClauseLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={itemClause}
                    onChange={(e) => setItemClause(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-700 bg-zinc-950 accent-[var(--accent)] cursor-pointer"
                  />
                  <span>{t.itemClauseLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={allowMega}
                    onChange={(e) => setAllowMega(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-700 bg-zinc-950 accent-[var(--accent)] cursor-pointer"
                  />
                  <span>{t.allowMegaLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={allowZMove}
                    onChange={(e) => setAllowZMove(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-700 bg-zinc-950 accent-[var(--accent)] cursor-pointer"
                  />
                  <span>{t.allowZMoveLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={allowTera}
                    onChange={(e) => setAllowTera(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-700 bg-zinc-950 accent-[var(--accent)] cursor-pointer"
                  />
                  <span>{t.allowTeraLabel}</span>
                </label>
              </div>

              {/* Levels Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t.minLevelLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={minLevel}
                    onChange={(e) => setMinLevel(Number(e.target.value))}
                    className="bg-black border-2 border-zinc-800 p-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-[var(--border)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {t.maxLevelLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxLevel}
                    onChange={(e) => setMaxLevel(Number(e.target.value))}
                    className="bg-black border-2 border-zinc-800 p-2.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-[var(--border)]"
                  />
                </div>
              </div>

              {/* Ban lists */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] border-b border-zinc-800 pb-1">
                  {t.bansLabel}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      {t.banPokemonLabel}
                    </label>
                    <textarea
                      value={banPokemon}
                      onChange={(e) => setBanPokemon(e.target.value)}
                      placeholder="Calyrex-Shadow, Zacian-Crowned..."
                      rows={2}
                      className="bg-black border-2 border-zinc-800 p-2 text-xs font-semibold text-zinc-100 placeholder:text-zinc-850 focus:outline-none focus:border-[var(--border)] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      {t.banItemsLabel}
                    </label>
                    <textarea
                      value={banItems}
                      onChange={(e) => setBanItems(e.target.value)}
                      placeholder="Gengarite, King's Rock..."
                      rows={2}
                      className="bg-black border-2 border-zinc-800 p-2 text-xs font-semibold text-zinc-100 placeholder:text-zinc-850 focus:outline-none focus:border-[var(--border)] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      {t.banMovesLabel}
                    </label>
                    <textarea
                      value={banMoves}
                      onChange={(e) => setBanMoves(e.target.value)}
                      placeholder="Double Iron Bash, Last Respects..."
                      rows={2}
                      className="bg-black border-2 border-zinc-800 p-2 text-xs font-semibold text-zinc-100 placeholder:text-zinc-850 focus:outline-none focus:border-[var(--border)] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      {t.banAbilitiesLabel}
                    </label>
                    <textarea
                      value={banAbilities}
                      onChange={(e) => setBanAbilities(e.target.value)}
                      placeholder="Moody, Arena Trap..."
                      rows={2}
                      className="bg-black border-2 border-zinc-800 p-2 text-xs font-semibold text-zinc-100 placeholder:text-zinc-850 focus:outline-none focus:border-[var(--border)] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t-4 border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 border-2 border-zinc-700 text-xs font-black uppercase hover:bg-zinc-800 transition-colors text-white cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--border)]
                           text-xs font-black uppercase shadow-[4px_4px_0px_#000000]
                           hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#22c55e]
                           hover:bg-emerald-500 hover:border-emerald-400 hover:text-black transition-all cursor-pointer"
              >
                {t.saveFormatBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Strategic Coach Assistant */}
      <ChatAssistantDrawer currentTeam={team ? team.members : null} activeTheme={activeTheme} />
    </div>
  );
}
