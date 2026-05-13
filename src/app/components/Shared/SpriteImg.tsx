"use client";

import { useState } from "react";
import { getShowdownSpriteUrl } from "@/lib/pokemon";

interface SpriteImgProps {
  species: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function SpriteImg({ species, className = "", width = 96, height = 96 }: SpriteImgProps) {
  const [src, setSrc] = useState(getShowdownSpriteUrl(species));
  const [failed, setFailed] = useState(false);

  function handleError() {
    if (!failed) {
      // Try PokeAPI as fallback
      const cleaned = species.toLowerCase().replace(/[^a-z0-9]/g, "");
      setSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cleaned}.png`);
      setFailed(true);
    } else {
      // Both failed — show placeholder
      setSrc("");
    }
  }

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--surface-3)] rounded-xl text-[var(--text-muted)] ${className}`}
        style={{ width, height }}
      >
        <span className="text-2xl font-bold">?</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={species}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      loading="lazy"
      onError={handleError}
    />
  );
}
