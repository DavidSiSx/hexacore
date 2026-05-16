"use client";

import { use } from "react";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import { Construction } from "lucide-react";

export default function BuilderPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const { activeTheme } = useTheme();
  const isEs = lang === "es";

  return (
    <div className="flex flex-col px-6 py-20 max-w-7xl mx-auto items-center justify-center text-center gap-6">
      <Construction className={`w-20 h-20 ${activeTheme.accentClass} animate-pulse`} />
      <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter">
        {isEs ? "CONSTRUCTOR" : "BUILDER"}
      </h1>
      <p className="text-xl font-bold uppercase tracking-widest opacity-50 max-w-2xl">
        {isEs 
          ? "ESTAMOS CONSTRUYENDO EL MOTOR DE SINERGIAS RAG MÁS AVANZADO. LA OBRA MAESTRA DE HEXACORE ESTÁ EN CAMINO." 
          : "WE ARE BUILDING THE MOST ADVANCED RAG SYNERGY ENGINE. HEXACORE'S MASTERPIECE IS ON THE WAY."}
      </p>
      
      <div className={`mt-10 p-8 border-4 ${activeTheme.borderClass} bg-black/40 relative overflow-hidden group w-full max-w-md`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 block mb-6">
          PHASE 4: CONTROLLED GENERATION
        </span>
        <div className="flex flex-col gap-3 items-start text-left font-mono text-sm">
          <div className="flex gap-3"><span className={activeTheme.accentClass}>[✔]</span> <span>LOADER INITIALIZED</span></div>
          <div className="flex gap-3"><span className={activeTheme.accentClass}>[✔]</span> <span>VECTOR CACHE READY</span></div>
          <div className="flex gap-3"><span className="text-zinc-700">[ ]</span> <span>GEMINI SYNERGY MAPPING</span></div>
          <div className="flex gap-3"><span className="text-zinc-700">[ ]</span> <span>LEGALITY ENGINE v1.0</span></div>
        </div>
      </div>
    </div>
  );
}
