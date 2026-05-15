"use client";

import { useState, useEffect } from "react";
import { getShowdownSpriteUrl } from "@/lib/pokemon";

interface SpriteImgProps {
  species: string;
  className?: string;
  width?: number;
  height?: number;
  shiny?: boolean;
  animated?: boolean;
}

export default function SpriteImg({ 
  species, 
  className = "", 
  width = 96, 
  height = 96,
  shiny = false,
  animated = false // DEFAULT TO STATIC SPRITE
}: SpriteImgProps) {
  const [src, setSrc] = useState(getShowdownSpriteUrl(species, shiny, animated));
  const [errorStage, setErrorStage] = useState(0); // 0: initial, 1: fallback 1, 2: PokeAPI, 3: fail

  // Re-sync if props change
  useEffect(() => {
    setSrc(getShowdownSpriteUrl(species, shiny, animated));
    setErrorStage(0);
  }, [species, shiny, animated]);

  function handleError() {
    if (errorStage === 0) {
      // Intento 1: Alternar animado/estático (lo opuesto a lo inicial)
      setSrc(getShowdownSpriteUrl(species, shiny, !animated));
      setErrorStage(1);
    } else if (errorStage === 1) {
      // Intento 2: PokeAPI (Limpiando nombre)
      const cleaned = species.toLowerCase().replace(/[^a-z0-9]/g, "");
      setSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${cleaned}.png`);
      setErrorStage(2);
    } else {
      // Intento 3: Fail
      setSrc("");
      setErrorStage(3);
    }
  }

  if (!src || errorStage === 3) {
    return (
      <div
        className={`flex items-center justify-center bg-black/10 border-2 border-dashed border-zinc-800 text-zinc-600 ${className}`}
        style={{ width, height }}
      >
        <span className="text-xl font-bold uppercase tracking-tighter">?</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={species}
      width={width}
      height={height}
      className={`object-contain rendering-pixelated ${className}`}
      loading="lazy"
      onError={handleError}
    />
  );
}
