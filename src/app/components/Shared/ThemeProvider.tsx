"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeId = "neon" | "gba" | "crimson" | "quartz" | "cyberpunk";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardBgClass: string;
  borderClass: string;
  accentClass: string;
  textMainClass: string;
  textMutedClass: string;
  badgeBgClass: string;
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: "neon",
    name: "Brutalismo Neón",
    bgClass: "bg-zinc-950",
    cardBgClass: "bg-black",
    borderClass: "border-[#DFE104]",
    accentClass: "text-[#DFE104]",
    textMainClass: "text-white",
    textMutedClass: "text-zinc-500",
    badgeBgClass: "bg-[#DFE104]/10 text-[#DFE104]",
  },
  {
    id: "gba",
    name: "GBA Retro Esmeralda",
    bgClass: "bg-emerald-950",
    cardBgClass: "bg-emerald-900/40",
    borderClass: "border-[#00FF66]",
    accentClass: "text-[#00FF66]",
    textMainClass: "text-emerald-50",
    textMutedClass: "text-emerald-400",
    badgeBgClass: "bg-[#00FF66]/10 text-[#00FF66]",
  },
  {
    id: "crimson",
    name: "Ocaso Carmesí",
    bgClass: "bg-rose-950",
    cardBgClass: "bg-rose-900/30",
    borderClass: "border-[#FF3366]",
    accentClass: "text-[#FF3366]",
    textMainClass: "text-rose-50",
    textMutedClass: "text-rose-400",
    badgeBgClass: "bg-[#FF3366]/10 text-[#FF3366]",
  },
  {
    id: "quartz",
    name: "Minimalismo Cuarzo",
    bgClass: "bg-[#F4F4F5]",
    cardBgClass: "bg-white",
    borderClass: "border-black",
    accentClass: "text-black",
    textMainClass: "text-zinc-900",
    textMutedClass: "text-zinc-500",
    badgeBgClass: "bg-black text-white",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Índigo",
    bgClass: "bg-slate-950",
    cardBgClass: "bg-indigo-950/50",
    borderClass: "border-[#00FFFF]",
    accentClass: "text-[#00FFFF]",
    textMainClass: "text-cyan-50",
    textMutedClass: "text-indigo-300",
    badgeBgClass: "bg-[#00FFFF]/10 text-[#00FFFF]",
  },
];

interface ThemeContextType {
  currentTheme: ThemeId;
  activeTheme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>("neon");

  useEffect(() => {
    const saved = localStorage.getItem("hexacore_global_theme") as ThemeId;
    if (saved && saved !== "quartz" && THEMES_LIST.some(t => t.id === saved)) {
      setCurrentThemeState(saved);
    } else if (saved === "quartz") {
      setCurrentThemeState("neon");
      localStorage.setItem("hexacore_global_theme", "neon");
    }
  }, []);

  function setTheme(id: ThemeId) {
    setCurrentThemeState(id);
    localStorage.setItem("hexacore_global_theme", id);
  }

  const activeTheme = THEMES_LIST.find((t) => t.id === currentTheme) || THEMES_LIST[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, activeTheme, setTheme }}>
      <div className={`theme-${currentTheme} min-h-screen flex flex-col w-full ${activeTheme.bgClass} ${activeTheme.textMainClass} transition-colors duration-300`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Retornamos un fallback robusto si se intenta llamar fuera de contexto para máxima seguridad en RCC
    return {
      currentTheme: "neon" as ThemeId,
      activeTheme: THEMES_LIST[0],
      setTheme: () => {},
    };
  }
  return context;
}
