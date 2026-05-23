import { SlidersHorizontal, X } from "lucide-react";
import { CustomFormat } from "../hooks/useCustomFormats";
import { TranslationType } from "../locales";

interface FilterPanelProps {
  t: TranslationType;

  locale: "es" | "en";
  format: string;
  setFormat: (val: string) => void;
  archetype: string;
  setArchetype: (val: string) => void;
  blacklistTypes: string[];
  setBlacklistTypes: (val: string[]) => void;
  customFormats: CustomFormat[];
  setShowCustomManager: (val: boolean) => void;
  showAdvanced: boolean;
  setShowAdvanced: (val: boolean) => void;
  loading: boolean;
}

export default function FilterPanel({
  t,
  locale,
  format,
  setFormat,
  archetype,
  setArchetype,
  blacklistTypes,
  setBlacklistTypes,
  customFormats,
  setShowCustomManager,
  showAdvanced,
  setShowAdvanced,
  loading,
}: FilterPanelProps) {
  return (
    <>
      {/* Advanced Filters Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className={`flex items-center justify-center gap-2.5 px-4 py-3.5 border-4 font-black uppercase tracking-wider text-[10px] transition-all duration-200 cursor-pointer
          ${showAdvanced 
            ? "border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[4px_4px_0px_#000000] hover:bg-[var(--accent)]/95" 
            : "border-zinc-800 bg-zinc-955 text-zinc-450 shadow-[4px_4px_0px_#000000] hover:border-zinc-700 hover:text-white"
          }`}
      >
        {showAdvanced ? <X className="w-4 h-4" strokeWidth={3} /> : <SlidersHorizontal className="w-4 h-4" strokeWidth={3} />}
        {showAdvanced ? t.hideFilters : t.advancedFilters}
      </button>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-4 border-zinc-800 bg-zinc-950 p-5
                        shadow-[6px_6px_0px_#000000] animate-in slide-in-from-top-3 duration-250">
          <div className="flex flex-col gap-5">
            
            {/* Format Select */}
            <div className="flex flex-col gap-2 text-left">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
                  {t.formatLabel}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomManager(true);
                  }}
                  className="px-2 py-0.5 border border-zinc-800 bg-black hover:border-[var(--border)] hover:bg-zinc-900 text-[8px] font-black uppercase tracking-tighter text-zinc-400 hover:text-[var(--accent)] transition-all flex items-center gap-1 cursor-pointer"
                >
                  ⚙️ {t.manageFormatsBtn} ({customFormats.length}/6)
                </button>
              </div>
              
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-black border-2 border-zinc-800 text-xs font-bold p-3.5
                           text-zinc-100 cursor-pointer focus:outline-none focus:border-[var(--border)]"
              >
                <option value="">{t.formatDefault}</option>
                
                {/* Custom Formats Group */}
                {customFormats.length > 0 && (
                  <optgroup label={locale === "es" ? "FORMATOS PERSONALIZADOS" : "CUSTOM FORMATS"}>
                    {customFormats.map(fmt => (
                      <option key={fmt.id} value={fmt.id}>{fmt.nombre}</option>
                    ))}
                  </optgroup>
                )}

                <optgroup label={locale === "es" ? "FORMATOS OFICIALES VGC" : "OFFICIAL VGC FORMATS"}>
                  <option value="regulation-h">{t.formats["regulation-h"]}</option>
                  <option value="regulation-g">{t.formats["regulation-g"]}</option>
                  <option value="regulation-f">{t.formats["regulation-f"]}</option>
                  <option value="regulation-e">{t.formats["regulation-e"]}</option>
                  <option value="regulation-d">{t.formats["regulation-d"]}</option>
                  <option value="regulation-c">{t.formats["regulation-c"]}</option>
                  <option value="championship-series">{t.formats["championship-series"]}</option>
                </optgroup>

                <optgroup label={locale === "es" ? "FORMATOS SMOGON SINGLES" : "SMOGON SINGLES FORMATS"}>
                  <option value="smogon-ou">{t.formats["smogon-ou"]}</option>
                  <option value="smogon-ubers">{t.formats["smogon-ubers"]}</option>
                  <option value="smogon-uu">{t.formats["smogon-uu"]}</option>
                  <option value="smogon-ru">{t.formats["smogon-ru"]}</option>
                  <option value="smogon-nu">{t.formats["smogon-nu"]}</option>
                  <option value="smogon-pu">{t.formats["smogon-pu"]}</option>
                  <option value="smogon-lc">{t.formats["smogon-lc"]}</option>
                </optgroup>

                <optgroup label={locale === "es" ? "FORMATOS SMOGON DOUBLES" : "SMOGON DOUBLES FORMATS"}>
                  <option value="smogon-doubles-ou">{t.formats["smogon-doubles-ou"]}</option>
                </optgroup>

                <optgroup label={locale === "es" ? "FORMATOS NATIONAL DEX" : "NATIONAL DEX FORMATS"}>
                  <option value="gen9nationaldex">{t.formats["gen9nationaldex"]}</option>
                  <option value="gen9nationaldexubers">{t.formats["gen9nationaldexubers"]}</option>
                  <option value="gen9nationaldexuu">{t.formats["gen9nationaldexuu"]}</option>
                  <option value="gen9nationaldexru">{t.formats["gen9nationaldexru"]}</option>
                  <option value="gen9nationaldexmonotype">{t.formats["gen9nationaldexmonotype"]}</option>
                  <option value="gen9nationaldexdoubles">{t.formats["gen9nationaldexdoubles"]}</option>
                </optgroup>
              </select>
              
              <p className="text-[9px] text-zinc-500 font-bold leading-normal normal-case mt-1">{t.formatHelp}</p>
            </div>
            
            {/* Archetype Select */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
                {t.archetypeLabel}
              </label>
              <select
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
                className="bg-black border-2 border-zinc-800 text-xs font-bold p-3.5
                           text-zinc-100 cursor-pointer focus:outline-none focus:border-[var(--border)]"
              >
                <option value="">{t.archetypeDefault}</option>
                {Object.entries(t.archetypes).map(([key, label]) => (
                  <option key={key} value={key}>{String(label)}</option>
                ))}
              </select>
              <p className="text-[9px] text-zinc-500 font-bold leading-normal normal-case mt-1">{t.archetypeHelp}</p>
            </div>

            {/* Blacklist Checkboxes */}
            <div className="flex flex-col gap-2 text-left border-t border-zinc-900 pt-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">
                {t.blacklistLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {Object.entries(t.blacklist).map(([key, label]) => {
                  const checked = blacklistTypes.includes(key);
                  return (
                    <label key={key} className="flex items-center gap-3 text-xs font-bold cursor-pointer text-zinc-400 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={loading}
                        onChange={() => {
                          if (checked) {
                            setBlacklistTypes(blacklistTypes.filter((t) => t !== key));
                          } else {
                            setBlacklistTypes([...blacklistTypes, key]);
                          }
                        }}
                        className="w-4 h-4 border-2 border-zinc-800 bg-black accent-pink-500 cursor-pointer"
                      />
                      <span className="select-none normal-case">{String(label)}</span>
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
              className="px-4 py-3 border-2 border-zinc-800 text-[10px] font-black uppercase tracking-wider
                         text-zinc-400 bg-black hover:bg-red-500/10 hover:border-red-500 hover:text-red-400
                         transition-all duration-200 cursor-pointer"
            >
              {t.clearFilters}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
