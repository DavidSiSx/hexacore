"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Lang = "es" | "en";

interface LangContextType {
  lang: Lang;
  toggle: () => void;
  t: (es: string, en: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "es",
  toggle: () => {},
  t: (es) => es,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");
  const toggle = useCallback(() => setLang(l => (l === "es" ? "en" : "es")), []);
  const t = useCallback((es: string, en: string) => (lang === "es" ? es : en), [lang]);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)]
                 hover:border-[var(--border-active)] text-xs text-[var(--text-muted)]
                 hover:text-white transition-all"
      title="Toggle language / Cambiar idioma"
    >
      {lang === "es" ? "🇲🇽" : "🇺🇸"}
      <span className="font-medium">{lang.toUpperCase()}</span>
    </button>
  );
}

export function T({ es, en }: { es: string; en: string }) {
  const { t } = useLang();
  return <>{t(es, en)}</>;
}

