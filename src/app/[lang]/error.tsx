"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error en servicios de telemetría o consola
    console.error("Hexacore Captured Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center py-12">
      <div className="w-full max-w-xl border-8 border-black bg-[#EF4444] text-black p-8 brutalist-shadow mb-8 relative overflow-hidden">
        {/* Caution stripes decorativos brutalistas */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-black flex overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-full skew-x-12 shrink-0 ${
                i % 2 === 0 ? "bg-[#DFE104]" : "bg-black"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center mt-6">
          <AlertOctagon className="w-20 h-20 text-black mb-6 animate-pulse" strokeWidth={2.5} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black bg-white px-4 py-1 border-4 border-black inline-block">
            SYSTEM ANOMALY
          </h1>
          <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/80 max-w-md mb-6 leading-relaxed">
            Se ha producido un error inesperado al procesar los datos de combate o conexión de base de datos.
          </p>
          
          <div className="w-full bg-black text-[#EF4444] font-mono p-4 text-[10px] sm:text-xs font-bold text-left overflow-x-auto border-4 border-black mb-6 max-h-40 scrollbar-thin">
            <span className="text-zinc-500 font-sans block mb-1">ANOMALY_MESSAGE:</span>
            {error.message || "Execution anomaly detected."}
            {error.digest && (
              <span className="block text-zinc-500 mt-2 font-sans">
                DIGEST: {error.digest}
              </span>
            )}
          </div>
        </div>

        {/* Botones de Acción Brutalistas */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-black text-[#DFE104] hover:bg-[#DFE104] hover:text-black font-black uppercase tracking-tight transition-none cursor-pointer active:translate-x-1 active:translate-y-1"
          >
            <RefreshCw className="w-5 h-5" />
            REINTENTAR ACCIÓN
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-white text-black hover:bg-black hover:text-white font-black uppercase tracking-tight transition-none cursor-pointer active:translate-x-1 active:translate-y-1"
          >
            <Home className="w-5 h-5" />
            VOLVER AL INICIO
          </a>
        </div>
      </div>
    </div>
  );
}
