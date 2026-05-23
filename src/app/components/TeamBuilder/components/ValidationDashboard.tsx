import { 
  AlertTriangle, ShieldCheck, AlertCircle, Info,
  Gauge, Wind, Shield 
} from "lucide-react";
import { ValidationReport } from "@/lib/pokemon/validator";
import { TranslationType } from "../locales";

interface ValidationDashboardProps {
  t: TranslationType;
  validation: ValidationReport | null;
  loading: boolean;
}


export default function ValidationDashboard({ t, validation, loading }: ValidationDashboardProps) {
  if (!validation || loading) return null;

  return (
    <div className="flex flex-col gap-4 text-left">
      
      {/* Neo-Brutalist Technical Summary Card */}
      <div className={`border-4 ${validation.valid ? "border-emerald-500 shadow-[4px_4px_0px_#22c55e]" : "border-red-500 shadow-[4px_4px_0px_#ef4444]"} bg-zinc-950 p-5 relative overflow-hidden transition-all`}>
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 border ${validation.valid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
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
              <Gauge className={`w-3.5 h-3.5 ${validation.stats?.hasSpeedControl ? "text-emerald-400" : "text-zinc-600"}`} />
              <span className={`text-[10px] font-black uppercase ${validation.stats?.hasSpeedControl ? "text-emerald-400" : "text-zinc-600"}`}>
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
              <Wind className={`w-3.5 h-3.5 ${validation.stats?.hasHazardControl ? "text-emerald-400" : "text-zinc-600"}`} />
              <span className={`text-[10px] font-black uppercase ${validation.stats?.hasHazardControl ? "text-emerald-400" : "text-zinc-600"}`}>
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
          <div className="bg-zinc-900/40 border border-zinc-850 p-2 flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-zinc-500">Climas Activos</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
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
          <div className="bg-zinc-900/40 border border-zinc-850 p-2 flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-zinc-500">Terrenos Activos</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {validation.stats?.terrains && validation.stats.terrains.length > 0 ? (
                validation.stats.terrains.map((ter, idx) => (
                  <span key={idx} className="text-[9px] font-black uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--border)]/30 px-1.5 py-0.5">
                    {ter}
                  </span>
                ))
              ) : (
                <span className="text-[9px] font-black text-zinc-650">Ninguno</span>
              )}
            </div>
          </div>
        </div>

        {/* Immunities & Weaknesses */}
        <div className="flex flex-col gap-3 pt-3 border-t border-zinc-850">
          {/* Inmunidades */}
          {validation.stats?.immunities && validation.stats.immunities.length > 0 && (
            <div>
              <span className="text-[8px] font-black uppercase text-zinc-500 block mb-1">Inmunidades Activas</span>
              <div className="flex flex-wrap gap-1">
                {validation.stats.immunities.map((type) => (
                  <span key={type} className="text-[8px] font-bold uppercase bg-zinc-850 border border-zinc-800 px-1.5 py-0.5 text-zinc-300">
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

      {/* Audit Console Card */}
      <div className="border-4 border-zinc-800 bg-zinc-950 p-5 shadow-[4px_4px_0px_#000000] relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 tracking-wider">
              AUDIT
            </span>
            <h4 className="text-white text-xs font-black uppercase tracking-tight">
              {t.auditConsole}
            </h4>
          </div>
          {/* Status Badge */}
          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${validation.errors.length > 0 ? "bg-red-500/10 text-red-400 border-red-500/30" : validation.warnings.length > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}>
            {validation.errors.length > 0 ? "FALLA" : validation.warnings.length > 0 ? "ADVERTENCIA" : "COMPLETO"}
          </span>
        </div>

        {/* Errors List */}
        {validation.errors.length > 0 && (
          <div className="mb-4">
            <span className="text-[9px] font-black uppercase text-red-500 block mb-2 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t.validationErrors}
            </span>
            <div className="space-y-2">
              {validation.errors.map((err, idx) => (
                <div key={idx} className="bg-red-950/20 border-2 border-red-950/40 p-2.5 flex items-start gap-2.5 text-xs text-red-400 font-semibold leading-relaxed">
                  <span className="text-red-500 font-black shrink-0">[!]</span>
                  <p className="normal-case">{err}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings List */}
        {validation.warnings.length > 0 && (
          <div className="mb-4">
            <span className="text-[9px] font-black uppercase text-amber-500 block mb-2 tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {t.validationWarnings}
            </span>
            <div className="space-y-2">
              {validation.warnings.map((warn, idx) => (
                <div key={idx} className="bg-amber-955/25 border-2 border-amber-950/40 p-2.5 flex items-start gap-2.5 text-xs text-amber-455 font-semibold leading-relaxed">
                  <span className="text-amber-500 font-black shrink-0">[?]</span>
                  <p className="normal-case">{warn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions List */}
        {validation.suggestions.length > 0 && (
          <div className="mb-0">
            <span className="text-[9px] font-black uppercase text-sky-400 block mb-2 tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              {t.validationSuggestions}
            </span>
            <div className="space-y-2">
              {validation.suggestions.map((sug, idx) => (
                <div key={idx} className="bg-sky-950/20 border-2 border-sky-950/40 p-2.5 flex items-start gap-2.5 text-xs text-sky-400 font-semibold leading-relaxed">
                  <span className="text-sky-400 font-black shrink-0">[*]</span>
                  <p className="normal-case">{sug}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If absolutely no diagnostics (legal and optimal) */}
        {validation.errors.length === 0 && validation.warnings.length === 0 && validation.suggestions.length === 0 && (
          <div className="bg-emerald-955/15 border-2 border-emerald-950/30 p-4 text-center text-xs text-emerald-450 font-bold uppercase tracking-wide flex flex-col items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500 animate-pulse" />
            <p className="normal-case">{t.validationLegalDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
