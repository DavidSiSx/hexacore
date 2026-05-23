import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AITeam, PokemonBuild } from "@/lib/schemas/team";
import { validateTeam } from "@/lib/pokemon/validator";
import { exportTeamToShowdown, importTeamFromShowdown } from "@/lib/pokemon/showdown";
import { translations, Locale } from "../locales";
import { CustomFormat } from "./useCustomFormats";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export function useTeamBuilder(customFormats: CustomFormat[]) {
  const params = useParams();
  const locale = ((params?.lang as Locale) || "es") satisfies Locale;
  const t = translations[locale];

  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<AITeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showdownInput, setShowdownInput] = useState("");
  const [showdownOutput, setShowdownOutput] = useState("");

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Protect unsaved changes
  useEffect(() => {
    if (!team) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = locale === "es"
        ? "¿Seguro que deseas salir? Los cambios del equipo no exportados se perderán."
        : "Are you sure you want to leave? Unsaved team changes will be lost.";
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [team, locale]);


  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [format, setFormat] = useState("");
  const [archetype, setArchetype] = useState("");
  const [blacklistTypes, setBlacklistTypes] = useState<string[]>([]);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);

  // Refinement & Meta strictness
  const [metaMode, setMetaMode] = useState<"ai_chooses" | "meta" | "optimized" | "casual">("ai_chooses");
  const [lockedSlots, setLockedSlots] = useState<boolean[]>([false, false, false, false, false, false]);
  const [refinementInput, setRefinementInput] = useState("");

  // Reactive Validation Report calculated dynamically on render
  const activeFormatId = format || team?.format;
  const customRules = activeFormatId ? customFormats.find(f => f.id === activeFormatId) : undefined;
  const validation = team && team.members 
    ? validateTeam(team.members, activeFormatId || undefined, customRules) 
    : null;


  function handleToggleLock(index: number) {
    setLockedSlots((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
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
      showToast(
        locale === "es" 
          ? "No se pudo detectar un equipo Showdown válido. Revisa el formato."
          : "Could not detect a valid Showdown team. Check the format.",
        "error"
      );
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

  function handleCreateFromScratch() {
    setLockedSlots([false, false, false, false, false, false]);
    setTeam({
      teamName: locale === "es" ? "Mi Equipo Competitivo" : "My Competitive Team",
      strategy: locale === "es" 
        ? "Construido manualmente desde cero. Edita las ranuras para configurar tus Pokémon." 
        : "Manually built from scratch. Edit slots to configure your Pokémon.",
      format: format || "regulation-h",
      members: Array.from({ length: 6 }, () => ({
        species: "",
        item: "None",
        ability: "None",
        nature: "Serious",
        teraType: "Normal",
        evs: { HP: 0, Atk: 0, Def: 0, SpA: 0, SpD: 0, Spe: 0 },
        ivs: { HP: 31, Atk: 31, Def: 31, SpA: 31, SpD: 31, Spe: 31 },
        moves: ["", "", "", ""],
        role: "",
      })),
    });
    showToast(
      locale === "es"
        ? "Tablero de equipo inicializado con 6 ranuras vacías."
        : "Team board initialized with 6 empty slots.",
      "success"
    );
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

  async function handleGenerateStream(endpoint: string, requestBody: unknown) {
    setLoading(true);
    setError(null);
    setStreamLogs([]);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(locale === "es" 
          ? "No se pudo iniciar el proceso de generación de la IA. Revisa tu sesión."
          : "Could not start the AI generation process. Check your session.");
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLockedSlots([false, false, false, false, false, false]);
    setTeam(null);

    await handleGenerateStream("/api/team/generate", {
      query,
      options: {
        format: format || undefined,
        archetype: archetype || undefined,
        blacklistTypes: blacklistTypes.length > 0 ? blacklistTypes : undefined,
        metaMode: metaMode || undefined,
        lang: locale,
      },
    });
  }

  async function handleRefinementSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refinementInput.trim() || loading || !team) return;

    const reqBody = {
      query,
      options: {
        format: format || undefined,
        archetype: archetype || undefined,
        blacklistTypes: blacklistTypes.length > 0 ? blacklistTypes : undefined,
        metaMode: metaMode || undefined,
        currentTeam: team.members,
        lockedSlots: lockedSlots.map((lock, idx) => lock ? idx : -1).filter(idx => idx !== -1),
        refinementPrompt: refinementInput,
        lang: locale,
      },
    };

    await handleGenerateStream("/api/team/generate", {
      ...reqBody
    });
    setRefinementInput("");
  }

  return {
    locale,
    t,
    query,
    setQuery,
    team,
    setTeam,
    loading,
    error,
    setError,
    showImportModal,
    setShowImportModal,
    showExportModal,
    setShowExportModal,
    showCopySuccess,
    showdownInput,
    setShowdownInput,
    showdownOutput,
    validation,
    showAdvanced,
    setShowAdvanced,
    format,
    setFormat,
    archetype,
    setArchetype,
    blacklistTypes,
    setBlacklistTypes,
    streamLogs,
    metaMode,
    setMetaMode,
    lockedSlots,
    refinementInput,
    setRefinementInput,
    toasts,
    showToast,
    handleToggleLock,
    handleUpdateMember,
    handleImportShowdown,
    openExportModal,
    handleCopyToClipboard,
    handleSubmit,
    handleRefinementSubmit,
    handleCreateFromScratch,
  };
}
export type UseTeamBuilderReturn = ReturnType<typeof useTeamBuilder>;
