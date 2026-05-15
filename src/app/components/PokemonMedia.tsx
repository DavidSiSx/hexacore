"use client";

import { useState } from "react";
import SpriteImg from "@/app/components/Shared/SpriteImg";
import { Sparkles, Play, Pause, Box } from "lucide-react";
import { T } from "@/lib/lang";

import { useTheme } from "@/app/components/Shared/ThemeProvider";

interface PokemonMediaProps {
  species: string;
}

export default function PokemonMedia({ species }: PokemonMediaProps) {
  const [shiny, setShiny] = useState(false);
  const [animated, setAnimated] = useState(false); // DEFAULT TO STATIC SPRITE
  const { activeTheme } = useTheme();

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Canvas Principal */}
      <div className={`relative group p-10 bg-black/5 border-4 ${activeTheme.borderClass} w-full flex items-center justify-center min-h-[380px] overflow-hidden`}>
        <div className="absolute inset-0 bg-[var(--accent)] blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" />
        
        {/* Main Sprite/Model with proper sizing for 3D animated models */}
        {/* Main Sprite/Model with proper sizing for 3D animated models */}
        <div className={`relative z-10 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center ${animated ? 'w-[320px] h-[320px]' : 'w-[260px] h-[260px]'}`}>
          <SpriteImg 
            species={species} 
            width={animated ? 300 : 240} 
            height={animated ? 300 : 240} 
            shiny={shiny} 
            animated={animated}
            className="drop-shadow-2xl" 
          />
        </div>

        {/* Unified Media Switcher Matrix */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/80 p-1 border-2 border-[var(--border)] backdrop-blur-sm">
          <button 
            onClick={() => { setAnimated(false); setShiny(false); }}
            className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all border ${!animated && !shiny ? 'bg-[var(--accent)] text-[var(--background)] border-[var(--accent)]' : 'text-zinc-500 border-transparent hover:text-white'}`}
          >
            2D
          </button>
          <button 
            onClick={() => { setAnimated(false); setShiny(true); }}
            className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all border ${!animated && shiny ? 'bg-[var(--accent)] text-[var(--background)] border-[var(--accent)]' : 'text-zinc-500 border-transparent hover:text-white'}`}
          >
            2D SHINY
          </button>
          <button 
            onClick={() => { setAnimated(true); setShiny(false); }}
            className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all border ${animated && !shiny ? 'bg-[var(--accent)] text-[var(--background)] border-[var(--accent)]' : 'text-zinc-500 border-transparent hover:text-white'}`}
          >
            3D
          </button>
          <button 
            onClick={() => { setAnimated(true); setShiny(true); }}
            className={`px-3 py-1.5 text-[9px] font-black uppercase transition-all border ${animated && shiny ? 'bg-[var(--accent)] text-[var(--background)] border-[var(--accent)]' : 'text-zinc-500 border-transparent hover:text-white'}`}
          >
            3D SHINY
          </button>
        </div>

        {/* Status Indicators (Top) */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className={`px-2 py-1 border-2 border-[var(--border)] font-black text-[9px] uppercase ${shiny ? 'bg-[var(--accent)] text-[var(--background)]' : 'bg-black/50 text-white'}`}>
             {shiny ? "VARIANTE SHINY" : "ESTÁNDAR"}
          </div>
          <div className={`px-2 py-1 border-2 border-[var(--border)] font-black text-[9px] uppercase ${animated ? 'bg-[var(--accent)] text-[var(--background)]' : 'bg-black/50 text-white'}`}>
             {animated ? "MODELO 3D" : "SPRITE 2D"}
          </div>
        </div>
      </div>

      {/* Media Metadata Labels */}
      <div className="flex gap-4 w-full">
         <div className="flex-1 bg-black/5 border-2 border-[var(--border)] p-3 text-center">
            <p className="text-[10px] font-black uppercase opacity-40 mb-1 leading-none"><T es="MOTOR DE RENDER" en="RENDER ENGINE" /></p>
            <p className="text-[11px] font-black uppercase tracking-widest">{animated ? "SHOWDOWN 3D (ANI)" : "OFFICIAL DEX (STATIC)"}</p>
         </div>
         <div className="flex-1 bg-black/5 border-2 border-[var(--border)] p-3 text-center">
            <p className="text-[10px] font-black uppercase opacity-40 mb-1 leading-none"><T es="VISUALIZACIÓN" en="VISUALIZATION" /></p>
            <p className="text-[11px] font-black uppercase tracking-widest">{shiny ? <T es="VARIANTE VARIOCOLOR" en="SHINY VARIANT" /> : <T es="FORMA ESTÁNDAR" en="STANDARD FORM" />}</p>
         </div>
      </div>
    </div>
  );
}
