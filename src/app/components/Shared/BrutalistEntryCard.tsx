"use client";

import Link from "next/link";
import { useTheme } from "@/app/components/Shared/ThemeProvider";
import TypeBadge from "@/app/components/Shared/TypeBadge";
import { Briefcase } from "lucide-react";

interface BrutalistEntryCardProps {
  title: string;
  description: string;
  lang: string;
  type?: string;
  category?: string;
  power?: number;
  accuracy?: number;
  spriteUrl?: string | null;
  isItem?: boolean;
  isMove?: boolean;
  href: string;
}

const CATEGORY_LABELS: Record<string, { es: string; en: string }> = {
  Physical: { es: "FÍSICO", en: "PHYSICAL" },
  Special: { es: "ESPECIAL", en: "SPECIAL" },
  Status: { es: "ESTADO", en: "STATUS" },
};

export function BrutalistEntryCard({
  title,
  description,
  lang,
  type,
  category,
  power,
  accuracy,
  spriteUrl,
  isItem,
  isMove,
  href,
}: BrutalistEntryCardProps) {
  const { activeTheme } = useTheme();
  const isEs = lang === "es";

  // Resolución segura de etiquetas de categoría
  const catLabel = category 
    ? (CATEGORY_LABELS[category]?.[isEs ? "es" : "en"] || category.toUpperCase())
    : "";

  return (
    <Link
      href={href}
      className={`group relative flex flex-col justify-between p-4 border-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass} transition-all duration-150 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:translate-x-1 hover:-translate-y-1 block`}
    >
      <div className="flex items-start gap-4 w-full">
        {/* RENDERIZADO EXCLUSIVO DE OBJETOS CON SISTEMA DE RESPALDO VECTORIAL */}
        {isItem && (
          <div className={`relative w-14 h-14 shrink-0 flex items-center justify-center border-2 ${activeTheme.borderClass} group-hover:border-[var(--accent-foreground)] group-hover:scale-105 transition-transform overflow-hidden`}>
            {/* Ícono Vectorial de Respaldo Absoluto (Siempre visible si falla la imagen) */}
            <Briefcase className={`w-6 h-6 absolute ${activeTheme.textMutedClass} group-hover:text-[var(--accent-foreground)]`} strokeWidth={2.5} />
            
            {/* Imagen Principal superpuesta */}
            {spriteUrl && (
              <img
                src={spriteUrl}
                alt={title}
                width={32}
                height={32}
                className="object-contain rendering-pixelated relative z-10"
                onError={(e) => {
                  // Oculta exclusivamente el tag img roto revelando el ícono vectorial inferior al instante
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        )}

        {/* CONTENIDO TEXTUAL PRINCIPAL */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight ${activeTheme.textMainClass} truncate max-w-full group-hover:text-[var(--accent-foreground)] transition-all`}>
              {title}
            </h3>

            {/* RENDERIZADO EXCLUSIVO DE MOVIMIENTOS: BADGES DE TIPO Y CATEGORÍA */}
            {isMove && type && (
              <div className="flex items-center gap-1.5 shrink-0 self-start">
                <TypeBadge type={type} />
                {category && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 border ${activeTheme.borderClass} ${activeTheme.badgeBgClass} group-hover:bg-[var(--accent-foreground)] group-hover:text-[var(--accent)] transition-colors`}>
                    {catLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className={`text-xs font-bold tracking-wide mt-1.5 line-clamp-2 ${activeTheme.textMutedClass} group-hover:text-[var(--accent-foreground)] group-hover:opacity-100 transition-colors`}>
            {description}
          </p>
        </div>
      </div>

      {/* METADATOS INFERIORES DE MOVIMIENTOS (POTENCIA Y PRECISIÓN) */}
      {isMove && (
        <div className={`mt-4 pt-2 border-t-2 ${activeTheme.borderClass} flex items-center justify-end gap-4 text-[10px] font-mono font-bold ${activeTheme.textMainClass} group-hover:text-[var(--accent-foreground)] transition-colors`}>
          <div className="flex items-center gap-1">
            <span className={`uppercase font-sans ${activeTheme.textMutedClass} group-hover:text-[var(--accent-foreground)] group-hover:opacity-60 transition-colors`}>{isEs ? "POT:" : "POW:"}</span>
            <span>{power || "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`uppercase font-sans ${activeTheme.textMutedClass} group-hover:text-[var(--accent-foreground)] group-hover:opacity-60 transition-colors`}>{isEs ? "PREC:" : "ACC:"}</span>
            <span>{accuracy ? `${accuracy}%` : "—"}</span>
          </div>
        </div>
      )}

      {/* Acento Brutalista Esquinero */}
      <div className={`absolute bottom-0 right-0 w-2 h-2 ${activeTheme.borderClass} border-t border-l`} />
    </Link>
  );
}
