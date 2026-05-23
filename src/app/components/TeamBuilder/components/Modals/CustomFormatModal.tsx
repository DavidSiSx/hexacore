import { useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import { searchPokemonSpecies } from "@/app/actions/pokedex";
import { searchMoves, searchAbilities, searchItems } from "@/app/actions/encyclopedia";
import AutocompleteMultiSelect from "@/app/components/AutocompleteMultiSelect";
import { CustomFormat } from "../../hooks/useCustomFormats";
import { TranslationType } from "../../locales";

interface CustomFormatModalProps {
  locale: "es" | "en";
  t: TranslationType;
  showToast: (message: string, type: "success" | "error" | "info") => void;

  customFormats: CustomFormat[];
  showCustomManager: boolean;
  setShowCustomManager: (val: boolean) => void;
  showCustomModal: boolean;
  setShowCustomModal: (val: boolean) => void;
  customFormatId: string | null;
  customName: string;
  setCustomName: (val: string) => void;
  customDesc: string;
  setCustomDesc: (val: string) => void;
  speciesClause: boolean;
  setSpeciesClause: (val: boolean) => void;
  itemClause: boolean;
  setItemClause: (val: boolean) => void;
  allowMega: boolean;
  setAllowMega: (val: boolean) => void;
  allowZMove: boolean;
  setAllowZMove: (val: boolean) => void;
  allowTera: boolean;
  setAllowTera: (val: boolean) => void;
  minLevel: number;
  setMinLevel: (val: number) => void;
  maxLevel: number;
  setMaxLevel: (val: number) => void;
  banPokemon: string[];
  setBanPokemon: (val: string[]) => void;
  banItems: string[];
  setBanItems: (val: string[]) => void;
  banMoves: string[];
  setBanMoves: (val: string[]) => void;
  banAbilities: string[];
  setBanAbilities: (val: string[]) => void;
  resetCustomFormatForm: () => void;
  handleEditCustomFormat: (fmt: CustomFormat) => void;
  handleSaveCustomFormat: (e: React.FormEvent) => Promise<{ success: boolean; formatId?: string; error?: string }>;
  handleDeleteCustomFormat: (id: string) => Promise<{ success: boolean; error?: string }>;
  setFormat: (id: string) => void;
}

export default function CustomFormatModal({
  locale,
  t,
  showToast,
  customFormats,
  showCustomManager,
  setShowCustomManager,
  showCustomModal,
  setShowCustomModal,
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
  setFormat,
}: CustomFormatModalProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSaveCustomFormat(e);
    if (result.success && result.formatId) {
      setFormat(result.formatId);
      showToast(
        locale === "es" ? "Formato guardado con éxito." : "Format saved successfully.",
        "success"
      );
    } else if (result.error) {
      showToast(result.error, "error");
    }
  };

  const onDelete = async (id: string) => {
    const result = await handleDeleteCustomFormat(id);
    if (result.success) {
      showToast(
        locale === "es" ? "Formato eliminado con éxito." : "Format deleted successfully.",
        "success"
      );
    } else if (result.error) {
      showToast(result.error, "error");
    }
  };

  return (
    <>
      {/* Custom Formats Manager Modal */}
      {showCustomManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowCustomManager(false)} />
          <div className="relative w-full max-w-3xl bg-zinc-950 border-4 border-[var(--border)] p-6
                          shadow-[8px_8px_0px_#000000] z-10 flex flex-col max-h-[85vh] text-left">
            <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-zinc-900">
              <h3 className="text-base font-black uppercase tracking-tighter text-white">
                {t.customFormatsTitle}
              </h3>
              <button
                onClick={() => setShowCustomManager(false)}
                className="p-1 border-2 border-zinc-800 hover:bg-red-500 hover:border-red-500 hover:text-black transition-colors cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center mb-4 bg-black/40 border border-zinc-900 p-3">
              <span className="text-zinc-555 text-[9px] font-black uppercase tracking-wider">
                {t.customFormatsLimit} ({customFormats.length} / 6)
              </span>
              <button
                type="button"
                disabled={customFormats.length >= 6}
                onClick={() => {
                  resetCustomFormatForm();
                  setShowCustomModal(true);
                }}
                className="px-3.5 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--border)] text-xs font-black uppercase shadow-[2px_2px_0px_#000000] hover:bg-[var(--accent)]/90 disabled:opacity-20 cursor-pointer transition-all"
              >
                {t.createFormatBtn}
              </button>
            </div>

            {/* List of Custom Formats */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {customFormats.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-800 p-12 text-center text-zinc-500 font-bold text-xs uppercase tracking-wide">
                  {locale === "es" ? "No hay formatos personalizados creados." : "No custom formats created."}
                </div>
              ) : (
                customFormats.map((fmt) => {
                  const rules = fmt.reglas;
                  return (
                    <div 
                      key={fmt.id} 
                      className="border-2 border-zinc-905 bg-zinc-900/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-tight">{fmt.nombre}</h4>
                        {fmt.descripcion && (
                          <p className="text-zinc-400 text-[11px] mt-1 font-semibold normal-case leading-normal">{fmt.descripcion}</p>
                        )}
                        {/* Summary of Rules */}
                        <div className="flex flex-wrap gap-1.5 mt-3.5">
                          <span className="px-1.5 py-0.5 bg-zinc-850 border border-zinc-800 text-zinc-300 text-[8px] font-bold uppercase">
                            Lv. {rules.minLevel ?? 1}-{rules.maxLevel ?? 100}
                          </span>
                          {rules.speciesClause && (
                            <span className="px-1.5 py-0.5 bg-zinc-850 border border-zinc-800 text-zinc-300 text-[8px] font-bold uppercase">
                              Species Clause
                            </span>
                          )}
                          {rules.itemClause && (
                            <span className="px-1.5 py-0.5 bg-zinc-850 border border-zinc-800 text-zinc-300 text-[8px] font-bold uppercase">
                              Item Clause
                            </span>
                          )}
                          {rules.allowMega && (
                            <span className="px-1.5 py-0.5 bg-emerald-955/30 text-emerald-400 text-[8px] font-bold uppercase border border-emerald-900/40">
                              Megas
                            </span>
                          )}
                          {rules.allowZMove && (
                            <span className="px-1.5 py-0.5 bg-indigo-950/30 text-indigo-400 text-[8px] font-bold uppercase border border-indigo-900/40">
                              Z-Moves
                            </span>
                          )}
                          {rules.allowTera && (
                            <span className="px-1.5 py-0.5 bg-pink-955/30 text-pink-400 text-[8px] font-bold uppercase border border-pink-900/40">
                              Tera
                            </span>
                          )}
                          {((rules.bans?.pokemon?.length || 0) > 0 || (rules.bans?.items?.length || 0) > 0 || (rules.bans?.moves?.length || 0) > 0 || (rules.bans?.abilities?.length || 0) > 0) && (
                            <span className="px-1.5 py-0.5 bg-red-955/30 text-red-400 text-[8px] font-bold uppercase border border-red-900/40">
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
                          className="px-2.5 py-1.5 border border-zinc-850 bg-black hover:border-blue-500 hover:bg-blue-955/20 text-zinc-400 hover:text-blue-400 text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          {t.editFormatBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(fmt.id)}
                          className="px-2.5 py-1.5 border border-zinc-850 bg-black hover:border-red-500 hover:bg-red-955/20 text-zinc-400 hover:text-red-400 text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all"
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

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-zinc-900">
              <button
                onClick={() => setShowCustomManager(false)}
                className="px-4 py-2.5 border-2 border-zinc-800 text-xs font-black uppercase hover:bg-zinc-900 text-zinc-450 hover:text-white transition-colors cursor-pointer"
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
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowCustomModal(false)} />
          <form 
            onSubmit={onSave}
            className="relative w-full max-w-3xl bg-zinc-950 border-4 border-[var(--border)] p-6
                       shadow-[8px_8px_0px_#000000] z-10 flex flex-col max-h-[90vh] text-left"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-zinc-900">
              <h3 className="text-base font-black uppercase tracking-tighter text-white">
                {customFormatId ? (locale === "es" ? "Editar Formato" : "Edit Format") : (locale === "es" ? "Crear Formato" : "Create Format")}
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1 border-2 border-zinc-800 hover:bg-red-500 hover:border-red-500 hover:text-black transition-colors cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-left">
              {/* Name & Desc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {t.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={locale === "es" ? "Ej: Copa de la Liga" : "e.g. League Cup"}
                    className="bg-black border-2 border-zinc-850 p-2.5 text-xs font-bold text-zinc-150 placeholder:text-zinc-755 focus:outline-none focus:border-[var(--border)] normal-case"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {t.descLabel}
                  </label>
                  <input
                    type="text"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder={locale === "es" ? "Breve explicación del torneo..." : "Brief explanation of the tournament..."}
                    className="bg-black border-2 border-zinc-850 p-2.5 text-xs font-bold text-zinc-150 placeholder:text-zinc-755 focus:outline-none focus:border-[var(--border)] normal-case"
                  />
                </div>
              </div>

              {/* Toggles Group */}
              <div className="border-2 border-zinc-900 p-4 bg-black/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 text-xs font-bold text-zinc-350 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={speciesClause}
                    onChange={(e) => setSpeciesClause(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-800 bg-black accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="select-none normal-case">{t.speciesClauseLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-350 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={itemClause}
                    onChange={(e) => setItemClause(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-800 bg-black accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="select-none normal-case">{t.itemClauseLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-355 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={allowMega}
                    onChange={(e) => setAllowMega(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-800 bg-black accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="select-none normal-case">{t.allowMegaLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-355 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={allowZMove}
                    onChange={(e) => setAllowZMove(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-800 bg-black accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="select-none normal-case">{t.allowZMoveLabel}</span>
                </label>

                <label className="flex items-center gap-3 text-xs font-bold text-zinc-355 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={allowTera}
                    onChange={(e) => setAllowTera(e.target.checked)}
                    className="w-4 h-4 border-2 border-zinc-800 bg-black accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="select-none normal-case">{t.allowTeraLabel}</span>
                </label>
              </div>

              {/* Levels Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {t.minLevelLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={minLevel}
                    onChange={(e) => setMinLevel(Number(e.target.value))}
                    className="bg-black border-2 border-zinc-850 p-2.5 text-xs font-bold text-zinc-150 focus:outline-none focus:border-[var(--border)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    {t.maxLevelLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxLevel}
                    onChange={(e) => setMaxLevel(Number(e.target.value))}
                    className="bg-black border-2 border-zinc-850 p-2.5 text-xs font-bold text-zinc-150 focus:outline-none focus:border-[var(--border)]"
                  />
                </div>
              </div>

              {/* Ban lists */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] border-b border-zinc-900 pb-1.5">
                  {t.bansLabel}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AutocompleteMultiSelect
                    label={t.banPokemonLabel}
                    placeholder="e.g. Calyrex-Shadow, Zacian..."
                    selected={banPokemon}
                    onChange={setBanPokemon}
                    onSearch={searchPokemonSpecies}
                    themeColor="bg-amber-400"
                    t={{
                      noResults: locale === "es" ? "No se encontraron Pokémon" : "No Pokémon found",
                      loading: locale === "es" ? "Buscando Pokémon..." : "Searching Pokémon...",
                      add: locale === "es" ? "Agregar" : "Add",
                      alreadySelected: locale === "es" ? "Baneado" : "Banned"
                    }}
                  />

                  <AutocompleteMultiSelect
                    label={t.banItemsLabel}
                    placeholder="e.g. Gengarite, Light Clay..."
                    selected={banItems}
                    onChange={setBanItems}
                    onSearch={searchItems}
                    themeColor="bg-rose-400"
                    t={{
                      noResults: locale === "es" ? "No se encontraron objetos" : "No items found",
                      loading: locale === "es" ? "Buscando objetos..." : "Searching items...",
                      add: locale === "es" ? "Agregar" : "Add",
                      alreadySelected: locale === "es" ? "Baneado" : "Banned"
                    }}
                  />

                  <AutocompleteMultiSelect
                    label={t.banMovesLabel}
                    placeholder="e.g. Last Respects, Revival Blessing..."
                    selected={banMoves}
                    onChange={setBanMoves}
                    onSearch={searchMoves}
                    themeColor="bg-sky-400"
                    t={{
                      noResults: locale === "es" ? "No se encontraron movimientos" : "No moves found",
                      loading: locale === "es" ? "Buscando movimientos..." : "Searching moves...",
                      add: locale === "es" ? "Agregar" : "Add",
                      alreadySelected: locale === "es" ? "Baneado" : "Banned"
                    }}
                  />

                  <AutocompleteMultiSelect
                    label={t.banAbilitiesLabel}
                    placeholder="e.g. Moody, Arena Trap..."
                    selected={banAbilities}
                    onChange={setBanAbilities}
                    onSearch={searchAbilities}
                    themeColor="bg-purple-400"
                    t={{
                      noResults: locale === "es" ? "No se encontraron habilidades" : "No abilities found",
                      loading: locale === "es" ? "Buscando habilidades..." : "Searching abilities...",
                      add: locale === "es" ? "Agregar" : "Add",
                      alreadySelected: locale === "es" ? "Baneado" : "Banned"
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2.5 border-2 border-zinc-800 text-xs font-black uppercase hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-foreground)] border-2 border-[var(--border)]
                           text-xs font-black uppercase shadow-[3px_3px_0px_#000000]
                           hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#00FF66]
                           hover:bg-emerald-500 hover:border-emerald-400 hover:text-black transition-all cursor-pointer"
              >
                {t.saveFormatBtn}
              </button>
            </div>
          </form>
        </div>
      )}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-md bg-zinc-950 border-4 border-red-500 p-6 shadow-[6px_6px_0px_#ef4444] z-10 text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-2">
              {locale === "es" ? "Confirmar Eliminación" : "Confirm Deletion"}
            </h3>
            <p className="text-xs font-semibold text-zinc-300 normal-case leading-relaxed mb-6">
              {locale === "es" 
                ? "¿Seguro que deseas eliminar este formato personalizado? Esta acción no se puede deshacer."
                : "Are you sure you want to delete this custom format? This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border-2 border-zinc-800 text-xs font-black uppercase text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmId) {
                    onDelete(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 border-2 border-red-500 text-white text-xs font-black uppercase hover:bg-red-700 transition-colors cursor-pointer"
              >
                {t.deleteFormatBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
