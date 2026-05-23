import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { TranslationType } from "../locales";

interface TelemetryTerminalProps {
  t: TranslationType;

  streamLogs: string[];
  loading: boolean;
}

export default function TelemetryTerminal({ t, streamLogs, loading }: TelemetryTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamLogs, loading]);

  if (!loading) return null;

  return (
    <div className="border-4 border-emerald-500 bg-zinc-950 p-6 shadow-[6px_6px_0px_#000000] relative overflow-hidden min-h-[480px] flex flex-col justify-between">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            {t.telemetryTitle}
          </span>
        </div>
        <span className="text-[9px] font-black uppercase bg-emerald-500 text-black px-2.5 py-0.5 tracking-widest animate-pulse">
          {t.liveStream}
        </span>
      </div>

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px]" />

      {/* Terminal Window */}
      <div className="flex-1 bg-black/90 border-2 border-zinc-800 p-4 font-mono text-[12px] overflow-y-auto max-h-[350px]">
        {/* Terminal dots */}
        <div className="flex items-center gap-1.5 mb-3 opacity-40">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>

        {streamLogs.map((log, index) => {
          const isLast = index === streamLogs.length - 1;
          return (
            <div 
              key={index} 
              className={`flex items-start gap-2.5 mb-2 leading-relaxed ${isLast ? "text-emerald-455 font-bold" : "text-zinc-500"}`}
            >
              <span className="text-emerald-500 shrink-0 select-none">&gt;&gt;</span>
              <p className="normal-case">{log}</p>
            </div>
          );
        })}

        {streamLogs.length === 0 && (
          <div className="text-zinc-700 animate-pulse text-center py-16 font-black uppercase tracking-widest text-xs">
            {t.telemetryInit}
          </div>
        )}
        
        {/* Scroll Anchor */}
        <div ref={terminalEndRef} />
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-bold">
        <span>HEXACORE AI CORE v2.5</span>
        <span className="animate-pulse text-emerald-500">PROCESS ACTIVE</span>
      </div>
    </div>
  );
}
