import { useState, useEffect } from "react";
import { 
  getCustomFormatsAction, 
  saveCustomFormatAction, 
  deleteCustomFormatAction,
  CustomRulesPayload
} from "@/app/actions/format";

export interface CustomFormat {
  id: string;
  nombre: string;
  descripcion: string;
  reglas: CustomRulesPayload;
  usuarioId: string;
  created_at: Date;
}

export function useCustomFormats() {
  const [customFormats, setCustomFormats] = useState<CustomFormat[]>([]);
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
  const [banPokemon, setBanPokemon] = useState<string[]>([]);
  const [banItems, setBanItems] = useState<string[]>([]);
  const [banMoves, setBanMoves] = useState<string[]>([]);
  const [banAbilities, setBanAbilities] = useState<string[]>([]);

  // Load custom formats on init
  useEffect(() => {
    async function loadFormats() {
      try {
        const res = await getCustomFormatsAction();
        if (res.success && res.formats) {
          // Cast database rules safely to CustomRulesPayload
          const formatted = res.formats.map((fmt) => ({
            ...fmt,
            reglas: fmt.reglas as CustomRulesPayload,
          })) as CustomFormat[];
          setCustomFormats(formatted);
        }
      } catch (e) {
        console.error("Error cargando formatos personalizados:", e);
      }
    }
    loadFormats();
  }, []);

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
    setBanPokemon([]);
    setBanItems([]);
    setBanMoves([]);
    setBanAbilities([]);
  }

  function handleEditCustomFormat(fmt: CustomFormat) {
    setCustomFormatId(fmt.id);
    setCustomName(fmt.nombre);
    setCustomDesc(fmt.descripcion);
    
    const rules = fmt.reglas;
    setSpeciesClause(rules.speciesClause ?? true);
    setItemClause(rules.itemClause ?? false);
    setAllowMega(rules.allowMega ?? true);
    setAllowZMove(rules.allowZMove ?? true);
    setAllowTera(rules.allowTera ?? true);
    setMinLevel(rules.minLevel ?? 1);
    setMaxLevel(rules.maxLevel ?? 100);
    setBanPokemon(rules.bans?.pokemon ?? []);
    setBanItems(rules.bans?.items ?? []);
    setBanMoves(rules.bans?.moves ?? []);
    setBanAbilities(rules.bans?.abilities ?? []);
    
    setShowCustomModal(true);
  }

  async function handleSaveCustomFormat(e: React.FormEvent) {
    e.preventDefault();
    if (!customName.trim()) return { success: false, error: "Name is required" };

    try {
      const rules: CustomRulesPayload = {
        speciesClause,
        itemClause,
        allowMega,
        allowZMove,
        allowTera,
        minLevel,
        maxLevel,
        bans: {
          pokemon: banPokemon,
          items: banItems,
          moves: banMoves,
          abilities: banAbilities,
        }
      };

      const res = await saveCustomFormatAction(
        customName,
        customDesc,
        rules,
        customFormatId || undefined
      );

      if (res.success && res.format) {
        const typedFormat: CustomFormat = {
          ...res.format,
          reglas: res.format.reglas as CustomRulesPayload,
        };

        if (customFormatId) {
          setCustomFormats(prev => prev.map(f => f.id === customFormatId ? typedFormat : f));
        } else {
          setCustomFormats(prev => [typedFormat, ...prev]);
        }
        setShowCustomModal(false);
        resetCustomFormatForm();
        return { success: true, formatId: typedFormat.id };
      } else {
        return { success: false, error: res.error || "Error al guardar el formato." };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: msg };
    }
  }

  async function handleDeleteCustomFormat(id: string) {
    try {
      const res = await deleteCustomFormatAction(id);
      if (res.success) {
        setCustomFormats(prev => prev.filter(f => f.id !== id));
        return { success: true };
      } else {
        return { success: false, error: res.error || "Error al eliminar el formato." };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: msg };
    }
  }

  return {
    customFormats,
    showCustomModal,
    setShowCustomModal,
    showCustomManager,
    setShowCustomManager,
    customFormatId,
    customName,
    setCustomName,
    customDesc,
    setCustomDesc,
    speciesClause,
    setSpeciesClause,
    itemClause,
    setItemClause,
    allowMega,
    setAllowMega,
    allowZMove,
    setAllowZMove,
    allowTera,
    setAllowTera,
    minLevel,
    setMinLevel,
    maxLevel,
    setMaxLevel,
    banPokemon,
    setBanPokemon,
    banItems,
    setBanItems,
    banMoves,
    setBanMoves,
    banAbilities,
    setBanAbilities,
    resetCustomFormatForm,
    handleEditCustomFormat,
    handleSaveCustomFormat,
    handleDeleteCustomFormat,
  };
}
