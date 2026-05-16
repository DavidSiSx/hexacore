"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { LangToggle } from "@/app/components/Shared/LangToggle";
import { useTheme, THEMES_LIST } from "@/app/components/Shared/ThemeProvider";
import type { User } from "@supabase/supabase-js";
import { Menu, X, LogOut, LogIn, Palette } from "lucide-react";

export default function Navbar({ lang, dict }: { lang: string; dict: any }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentTheme, activeTheme, setTheme } = useTheme();
  const isEs = lang === "es";

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = `/${lang}`;
  }

  const NAV_LINKS = [
    { href: `/${lang}`, label: dict.nav?.overview || "INICIO" },
    { href: `/${lang}/pokedex`, label: dict.nav?.encyclopedia || "ENCICLOPEDIA" },
    { href: `/${lang}/pokedex/stats`, label: dict.nav?.metagame || "METAGAME" },
    { href: `/${lang}/pokedex/calc`, label: dict.nav?.calculator || "CALCULADORA" },
    { href: `/${lang}/builder`, label: dict.nav?.builder || "CONSTRUCTOR", auth: true },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full border-b-4 ${activeTheme.borderClass} ${activeTheme.cardBgClass || "bg-zinc-950"} backdrop-blur-md transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo Brutalista */}
        <Link href={`/${lang}`} className="flex items-center group">
          <span className={`text-2xl font-black ${activeTheme.accentClass} uppercase tracking-tighter group-hover:opacity-80 transition-none`}>
            HEXACORE
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-4">
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            const isActive = pathname === link.href || (link.href !== `/${lang}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest border-2 transition-all
                  ${isActive
                    ? `${activeTheme.borderClass} bg-[var(--accent)] text-[var(--accent-foreground)]`
                    : "border-transparent text-zinc-400 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Global Theme Dropdown / Pills + Lang Toggle + Auth */}
        <div className="flex items-center gap-4">
          {/* Global Theme Selector Pills (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/60 px-3 py-1.5 border-2 border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Palette className={`w-4 h-4 ${activeTheme.accentClass} mr-1`} strokeWidth={3} />
            {THEMES_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.name}
                className={`w-4 h-4 border-2 transition-all hover:scale-110 active:scale-90 ${
                  currentTheme === t.id ? `${activeTheme.borderClass} scale-125 z-10` : "border-transparent opacity-30 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: t.id === "neon" ? "#DFE104" : t.id === "gba" ? "#00FF66" : t.id === "crimson" ? "#FF3366" : t.id === "quartz" ? "#FFFFFF" : "#00FFFF"
                }}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <LangToggle currentLang={lang} />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border-2 ${activeTheme.borderClass}`}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[120px]">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className={`group flex items-center justify-center w-9 h-9 border-2 ${activeTheme.borderClass} bg-black hover:bg-red-500 hover:border-red-500 hover:text-white transition-none active:scale-95`}
                title={isEs ? "SALIR" : "LOGOUT"}
              >
                <LogOut className="w-4 h-4 group-hover:scale-110" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <Link
              href={`/${lang}/auth/login`}
              className={`flex items-center gap-1.5 border-2 ${mounted ? activeTheme.borderClass : "border-zinc-800"} bg-black/60 hover:bg-[var(--accent)] hover:text-[var(--background)] ${mounted ? activeTheme.accentClass : "text-white"} text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-none active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
            >
              <LogIn className="w-3.5 h-3.5" strokeWidth={3} />
              {isEs ? "ENTRAR" : "LOGIN"}
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-zinc-400 hover:text-white"
          >
            {menuOpen ? <X className="w-5 h-5" strokeWidth={3} /> : <Menu className="w-5 h-5" strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t-4 border-zinc-700 bg-black flex flex-col p-4 gap-4">
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-black uppercase tracking-widest text-zinc-400 hover:${activeTheme.accentClass} py-2 border-b border-zinc-800 transition-none`}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Mobile Global Theme Selector */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <span className="text-[10px] font-black text-zinc-500 uppercase">TEMA GLOBAL:</span>
            <div className="flex gap-2">
              {THEMES_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setMenuOpen(false); }}
                  className={`px-2 py-1 text-[9px] font-black uppercase border ${currentTheme === t.id ? activeTheme.borderClass + " " + activeTheme.accentClass : "border-zinc-800 text-zinc-500"}`}
                >
                  {t.name.split(" ")[1] || t.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
            <LangToggle currentLang={lang} />
          </div>
        </div>
      )}
    </nav>
  );
}
