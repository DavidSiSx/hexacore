import { Upload, Download, Sparkles, X, AlertCircle } from "lucide-react";
import TeamPokemonCard from "@/app/components/TeamPokemonCard";
import ChatAssistantDrawer from "@/app/components/ChatAssistantDrawer";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

import { useCustomFormats } from "./hooks/useCustomFormats";
import { useTeamBuilder } from "./hooks/useTeamBuilder";
import FilterPanel from "./components/FilterPanel";
import TelemetryTerminal from "./components/TelemetryTerminal";
import ValidationDashboard from "./components/ValidationDashboard";

import ImportModal from "./components/Modals/ImportModal";
import ExportModal from "./components/Modals/ExportModal";
import CustomFormatModal from "./components/Modals/CustomFormatModal";

export default function TeamBuilder() {
  const { activeTheme } = useTheme();
  
  // Custom formats manager hook
  const formatsState = useCustomFormats();
  
  // Main Team builder state hook
  const builderState = useTeamBuilder(formatsState.customFormats);
  
  const { t, locale } = builderState;

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-[var(--background)] relative">

      {/* ============================================ */}
      {/* MAIN CONTENT - TWO COLUMN LAYOUT */}
      {/* ============================================ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ============================================ */}
          {/* LEFT COLUMN - CONTROL PANEL & TELEMETRY */}
          {/* ============================================ */}
          <aside className="lg:col-span-5 flex flex-col gap-6">
            
            {/* AI Query Input - Glassmorphic */}
            <form onSubmit={builderState.handleSubmit} className="relative group">
              {/* Background gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/5 via-transparent to-purple-500/10 opacity-80 pointer-events-none blur-sm group-hover:opacity-100 transition-opacity" />
              
              <div className="relative border-4 border-zinc-800 bg-zinc-950 p-5
                              shadow-[6px_6px_0px_#000000]
                              hover:shadow-[8px_8px_0px_var(--border)] hover:border-[var(--border)]
                              transition-all duration-300">
                
                {/* Tech header line */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent)] animate-pulse" strokeWidth={2.5} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
                      PROMPT ESTRATÉGICO DE IA
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-650">INPUT_STAGE_01</span>
                </div>

                <div className="relative">
                  <textarea
                    value={builderState.query}
                    onChange={(e) => builderState.setQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    disabled={builderState.loading}
                    rows={3}
                    className="w-full bg-black/60 border-2 border-zinc-800 p-4
                               text-xs sm:text-sm font-bold text-zinc-100 placeholder:text-zinc-700
                               focus:outline-none focus:border-[var(--border)] focus:ring-1 focus:ring-[var(--accent)]/30
                               resize-none transition-all duration-300 normal-case"
                  />
                  {builderState.query.trim() && !builderState.loading && (
                    <button
                      type="button"
                      onClick={() => builderState.setQuery("")}
                      className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selector de Modo / Rigidez de Meta */}
                <div className="mt-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {t.metaModeLabel}
                    </label>
                    <span className="text-[8px] font-mono text-zinc-600">META_WEIGHT</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["ai_chooses", "meta", "optimized", "casual"] as const).map((mode) => {
                      const isActive = builderState.metaMode === mode;
                      let activeStyle = "";
                      let borderStyle = "";
                      
                      if (mode === "ai_chooses") {
                        activeStyle = "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--border)] shadow-[3px_3px_0px_var(--border)]";
                        borderStyle = "border-zinc-850 hover:border-[var(--border)] hover:text-[var(--accent)]";
                      } else if (mode === "meta") {
                        activeStyle = "bg-red-500/10 text-red-400 border-red-500 shadow-[3px_3px_0px_#ef4444]";
                        borderStyle = "border-zinc-850 hover:border-red-500 hover:text-red-400";
                      } else if (mode === "optimized") {
                        activeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-[3px_3px_0px_#10b981]";
                        borderStyle = "border-zinc-850 hover:border-emerald-500 hover:text-emerald-400";
                      } else {
                        activeStyle = "bg-pink-500/10 text-pink-400 border-pink-500 shadow-[3px_3px_0px_#ec4899]";
                        borderStyle = "border-zinc-850 hover:border-pink-500 hover:text-pink-400";
                      }

                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => builderState.setMetaMode(mode)}
                          disabled={builderState.loading}
                          className={`px-3 py-3 border-2 text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer flex flex-col items-center justify-center text-center leading-none ${
                            isActive 
                              ? activeStyle 
                              : `bg-black text-zinc-500 ${borderStyle}`
                          }`}
                        >
                          {isActive && <span className="w-1.5 h-1.5 bg-current rounded-full mb-1 animate-pulse" />}
                          <span className="block">{t.metaModes[mode]}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Info helper box */}
                  <div className="bg-black/50 border border-zinc-900 p-3 mt-1.5 min-h-[44px] flex items-center gap-2">
                    <span className="text-zinc-650 text-xs shrink-0">💡</span>
                    <p className="text-[10px] text-zinc-455 font-bold leading-normal normal-case">
                      {t.metaModeHelp[builderState.metaMode]}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={builderState.loading || !builderState.query.trim()}
                  className="w-full mt-5 px-6 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] border-4 border-[var(--border)]
                             font-black uppercase tracking-wider text-xs sm:text-sm
                             shadow-[4px_4px_0px_#000000]
                             hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000]
                             active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                             disabled:opacity-20 disabled:pointer-events-none disabled:shadow-none
                             transition-all duration-200 cursor-pointer"
                >
                  {builderState.loading ? t.buildingButton : t.buildButton}
                </button>
              </div>
            </form>

            {/* Advanced Filters Dashboard */}
            <FilterPanel
              t={t}
              locale={locale}
              format={builderState.format}
              setFormat={builderState.setFormat}
              archetype={builderState.archetype}
              setArchetype={builderState.setArchetype}
              blacklistTypes={builderState.blacklistTypes}
              setBlacklistTypes={builderState.setBlacklistTypes}
              customFormats={formatsState.customFormats}
              setShowCustomManager={formatsState.setShowCustomManager}
              showAdvanced={builderState.showAdvanced}
              setShowAdvanced={builderState.setShowAdvanced}
              loading={builderState.loading}
            />

            {/* Import/Export Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => builderState.setShowImportModal(true)}
                className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 
                           border-4 border-zinc-800 bg-zinc-950
                           font-black uppercase tracking-wider text-[10px] text-zinc-400
                           shadow-[4px_4px_0px_#000000]
                           hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#00FF66]
                           hover:border-[#00FF66] hover:text-[#00FF66]
                           active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                           transition-all duration-200 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-current" strokeWidth={3} />
                {t.importShowdown}
              </button>
              
              {builderState.team && (
                <button
                  onClick={builderState.openExportModal}
                  className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3.5 
                             border-4 border-zinc-800 bg-zinc-950
                             font-black uppercase tracking-wider text-[10px] text-zinc-400
                             shadow-[4px_4px_0px_#000000]
                             hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--border)]
                             hover:border-[var(--border)] hover:text-[var(--accent)]
                             active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000000]
                             transition-all duration-200 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-current" strokeWidth={3} />
                  {t.exportShowdown}
                </button>
              )}
            </div>

            {/* Error State */}
            {builderState.error && (
              <div className="border-4 border-red-500 bg-red-500/10 p-4
                              shadow-[4px_4px_0px_#ef4444] text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" strokeWidth={3} />
                  <div>
                    <p className="text-red-500 font-black uppercase tracking-tighter text-sm mb-1">
                      {t.errorTitle}
                    </p>
                    <p className="text-red-400 text-xs font-bold normal-case">{builderState.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Dashboard */}
            <ValidationDashboard 
              t={t}
              validation={builderState.validation}
              loading={builderState.loading}
            />
          </aside>

          {/* ============================================ */}
          {/* RIGHT COLUMN - POKEMON TEAM GRID */}
          {/* ============================================ */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Live Telemetry Terminal */}
            <TelemetryTerminal
              t={t}
              streamLogs={builderState.streamLogs}
              loading={builderState.loading}
            />

            {/* Team Header (if team exists) */}
            {!builderState.loading && builderState.team && (
              <div className="border-4 border-zinc-800 bg-zinc-950 p-5 shadow-[4px_4px_0px_#000000] text-left relative overflow-hidden transition-colors duration-300">
                {/* Decorative border bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[8px] font-black uppercase tracking-widest bg-[var(--accent)]/15 text-[var(--accent)] px-2.5 py-0.5 border border-[var(--border)]/30">
                    {builderState.team.format}
                  </span>
                  {builderState.team.modelUsed && (
                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 border border-emerald-500/20">
                      AI: {builderState.team.modelUsed}
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
                  {builderState.team.teamName}
                </h2>
                <p className="text-zinc-455 text-xs font-semibold leading-relaxed normal-case">
                  {builderState.team.strategy}
                </p>
              </div>
            )}

            {/* Pokemon Grid */}
            {!builderState.loading && builderState.team && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {builderState.team.members.map((member, i) => (
                  <TeamPokemonCard 
                    key={i} 
                    pokemon={member} 
                    index={i} 
                    isLocked={builderState.lockedSlots[i]}
                    onToggleLock={() => builderState.handleToggleLock(i)}
                    onChange={(updated) => builderState.handleUpdateMember(i, updated)}
                  />
                ))}
              </div>
            )}

            {/* Refinement Panel */}
            {!builderState.loading && builderState.team && (
              <div className="border-4 border-[var(--border)] bg-zinc-950 p-5
                              shadow-[6px_6px_0px_#000000] relative overflow-hidden transition-all text-left">
                {/* Tech corner accent */}
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--border)]/20 pointer-events-none" />

                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-4 h-4 text-[var(--accent)] animate-bounce" strokeWidth={2.5} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
                    {t.refinementTitle}
                  </span>
                </div>
                <p className="text-zinc-500 text-[10px] font-black uppercase mb-4 leading-normal">
                  {t.refinementHelp}
                </p>
                <form onSubmit={builderState.handleRefinementSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={builderState.refinementInput}
                      onChange={(e) => builderState.setRefinementInput(e.target.value)}
                      placeholder={t.refinementPlaceholder}
                      disabled={builderState.loading}
                      className="flex-1 bg-black border-2 border-zinc-850 p-3.5 text-xs sm:text-sm font-bold text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-[var(--border)] normal-case transition-all"
                    />
                    <button
                      type="submit"
                      disabled={builderState.loading || !builderState.refinementInput.trim()}
                      className="px-6 py-3.5 bg-[var(--accent)] border-2 border-[var(--border)] text-[var(--accent-foreground)] font-black uppercase tracking-wider text-xs shadow-[2px_2px_0px_#000000] hover:bg-[var(--accent)]/90 transition-all disabled:opacity-20 cursor-pointer"
                    >
                      {t.refinementButton}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Empty State */}
            {!builderState.loading && !builderState.team && !builderState.error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[420px] 
                              border-4 border-dashed border-zinc-800 bg-zinc-950/30 p-8">
                <div className="w-16 h-16 border-4 border-zinc-800 flex items-center justify-center mb-6
                                shadow-[4px_4px_0px_#000000]">
                  <Sparkles className="w-8 h-8 text-zinc-550" strokeWidth={2} />
                </div>
                
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider text-center max-w-sm leading-relaxed mb-6">
                  {t.emptyTitle} <strong className="text-[var(--accent)] underline cursor-pointer" onClick={() => builderState.setShowImportModal(true)}>{t.emptyAction}</strong> {t.emptyOr} <strong className="text-purple-450 underline cursor-pointer" onClick={builderState.handleCreateFromScratch}>{t.createFromScratch}</strong> {t.emptyEnd}
                </p>

                {/* Direct Action Buttons for Better UX */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => builderState.setShowImportModal(true)}
                    className="flex-1 px-4 py-3 border-4 border-zinc-800 bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-zinc-400 shadow-[3px_3px_0px_black] hover:border-[#00FF66] hover:text-[#00FF66] hover:shadow-[3px_3px_0px_#00FF66] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {t.importShowdown}
                  </button>
                  <button
                    onClick={builderState.handleCreateFromScratch}
                    className="flex-1 px-4 py-3 border-4 border-zinc-800 bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-zinc-400 shadow-[3px_3px_0px_black] hover:border-purple-500 hover:text-purple-450 hover:shadow-[3px_3px_0px_#a855f7] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {t.createFromScratch}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}
      
      {/* Import Modal */}
      <ImportModal
        isOpen={builderState.showImportModal}
        onClose={() => builderState.setShowImportModal(false)}
        t={t}
        showdownInput={builderState.showdownInput}
        setShowdownInput={builderState.setShowdownInput}
        onImport={builderState.handleImportShowdown}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={builderState.showExportModal}
        onClose={() => builderState.setShowExportModal(false)}
        t={t}
        showdownOutput={builderState.showdownOutput}
        showCopySuccess={builderState.showCopySuccess}
        onCopy={builderState.handleCopyToClipboard}
      />

      {/* Custom Formats Manager and Creator Modals */}
      <CustomFormatModal
        locale={locale}
        t={t}
        showToast={builderState.showToast}
        customFormats={formatsState.customFormats}
        showCustomManager={formatsState.showCustomManager}
        setShowCustomManager={formatsState.setShowCustomManager}
        showCustomModal={formatsState.showCustomModal}
        setShowCustomModal={formatsState.setShowCustomModal}
        customFormatId={formatsState.customFormatId}
        customName={formatsState.customName}
        setCustomName={formatsState.setCustomName}
        customDesc={formatsState.customDesc}
        setCustomDesc={formatsState.setCustomDesc}
        speciesClause={formatsState.speciesClause}
        setSpeciesClause={formatsState.setSpeciesClause}
        itemClause={formatsState.itemClause}
        setItemClause={formatsState.setItemClause}
        allowMega={formatsState.allowMega}
        setAllowMega={formatsState.setAllowMega}
        allowZMove={formatsState.allowZMove}
        setAllowZMove={formatsState.setAllowZMove}
        allowTera={formatsState.allowTera}
        setAllowTera={formatsState.setAllowTera}
        minLevel={formatsState.minLevel}
        setMinLevel={formatsState.setMinLevel}
        maxLevel={formatsState.maxLevel}
        setMaxLevel={formatsState.setMaxLevel}
        banPokemon={formatsState.banPokemon}
        setBanPokemon={formatsState.setBanPokemon}
        banItems={formatsState.banItems}
        setBanItems={formatsState.setBanItems}
        banMoves={formatsState.banMoves}
        setBanMoves={formatsState.setBanMoves}
        banAbilities={formatsState.banAbilities}
        setBanAbilities={formatsState.setBanAbilities}
        resetCustomFormatForm={formatsState.resetCustomFormatForm}
        handleEditCustomFormat={formatsState.handleEditCustomFormat}
        handleSaveCustomFormat={formatsState.handleSaveCustomFormat}
        handleDeleteCustomFormat={formatsState.handleDeleteCustomFormat}
        setFormat={builderState.setFormat}
      />

      {/* Floating Strategic Coach Assistant */}
      <ChatAssistantDrawer currentTeam={builderState.team ? builderState.team.members : null} activeTheme={activeTheme} />

      {/* Toast notifications container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {builderState.toasts.map((toast) => {
          let accentBorder = "border-zinc-850";
          let accentGlow = "shadow-[4px_4px_0px_#000000]";
          let textTheme = "text-zinc-100";
          let icon = "💡";

          if (toast.type === "success") {
            accentBorder = "border-[#00FF66]";
            accentGlow = "shadow-[4px_4px_0px_#000000]";
            textTheme = "text-zinc-100";
            icon = "✓";
          } else if (toast.type === "error") {
            accentBorder = "border-red-500";
            accentGlow = "shadow-[4px_4px_0px_#000000]";
            textTheme = "text-red-400";
            icon = "✗";
          } else {
            accentBorder = "border-[var(--border)]";
            accentGlow = "shadow-[4px_4px_0px_#000000]";
            textTheme = "text-zinc-150";
            icon = "ℹ";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-4 ${accentBorder} bg-zinc-950 p-4 ${accentGlow}
                          flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}
            >
              <div className={`w-5 h-5 flex items-center justify-center shrink-0 border-2 ${accentBorder} text-[10px] font-black uppercase`}>
                {icon}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${textTheme} normal-case leading-normal`}>
                  {toast.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
