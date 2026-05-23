export const translations = {
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
} as const;

export type Locale = "es" | "en";

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
type StringifyLeaf<T> = {
  [P in keyof T]: T[P] extends object ? StringifyLeaf<T[P]> : string;
};

export type TranslationType = StringifyLeaf<DeepWriteable<typeof translations.es>>;

