"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error crítico en consola
    console.error("Hexacore Global Crash:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-[#09090B] text-white min-h-screen flex flex-col items-center justify-center p-6 uppercase font-sans selection:bg-[#EF4444] selection:text-black">
        <div className="w-full max-w-xl border-8 border-[#EF4444] bg-[#09090B] text-white p-8 brutalist-shadow relative overflow-hidden">
          {/* Decorative Hazard Line */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-black flex overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-full skew-x-12 shrink-0 ${
                  i % 2 === 0 ? "bg-[#EF4444]" : "bg-black"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center mt-6">
            <AlertOctagon className="w-24 h-24 text-[#EF4444] mb-6 animate-pulse" strokeWidth={2.5} />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-[#EF4444] bg-black px-4 py-1 border-4 border-[#EF4444] inline-block">
              CRITICAL COLLAPSE
            </h1>
            <p className="text-xs sm:text-sm font-black tracking-widest text-zinc-400 max-w-md mb-6 text-center leading-relaxed">
              Un fallo fatal ha colapsado el núcleo de renderizado global de Hexacore.
            </p>

            <div className="w-full bg-black text-[#EF4444] font-mono p-4 text-[10px] sm:text-xs font-bold text-left overflow-x-auto border-4 border-[#EF4444] mb-6 max-h-40 scrollbar-thin">
              <span className="text-zinc-500 font-sans block mb-1">CRITICAL_FAIL:</span>
              {error.message || "Root-level engine failure."}
              {error.digest && (
                <span className="block text-zinc-500 mt-2 font-sans">
                  DIGEST: {error.digest}
                </span>
              )}
            </div>

            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 px-8 py-4 border-4 border-[#EF4444] bg-[#EF4444] text-black hover:bg-white hover:text-black hover:border-white font-black uppercase tracking-tight transition-none cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              RECONECTAR SISTEMA
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
