"use client";

import { useTheme } from "@/app/components/Shared/ThemeProvider";

interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  isLast?: boolean;
}

export function ModeButton({ active, onClick, label, isLast }: ModeButtonProps) {
  const { activeTheme } = useTheme();
  
  return (
    <button 
      onClick={onClick}
      className={`flex-1 py-2 text-xs font-black uppercase transition-none ${isLast ? `border-l-2 ${activeTheme.borderClass}` : ""} ${active ? `${activeTheme.badgeBgClass}` : `text-zinc-500 hover:${activeTheme.textMainClass} bg-transparent`}`}
    >
      {label}
    </button>
  );
}
