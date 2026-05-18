"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { LangToggle } from "@/app/components/Shared/LangToggle";
import { useTheme, THEMES_LIST } from "@/app/components/Shared/ThemeProvider";
import type { User } from "@supabase/supabase-js";
import { Menu, X, LogOut, LogIn, Palette, Zap } from "lucide-react";

export default function Navbar({ lang, dict }: { lang: string; dict: Record<string, unknown> }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentTheme, activeTheme, setTheme } = useTheme();
  const isEs = lang === "es";

  useEffect(() => {
    setMounted(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = `/${lang}`;
  }

  const NAV_LINKS = [
    { href: `/${lang}`, label: (dict.nav as Record<string, string>)?.overview || "INICIO" },
    { href: `/${lang}/pokedex`, label: (dict.nav as Record<string, string>)?.encyclopedia || "ENCICLOPEDIA" },
    { href: `/${lang}/pokedex/stats`, label: (dict.nav as Record<string, string>)?.metagame || "METAGAME" },
    { href: `/${lang}/pokedex/calc`, label: (dict.nav as Record<string, string>)?.calculator || "CALCULADORA" },
    { href: `/${lang}/builder`, label: (dict.nav as Record<string, string>)?.builder || "CONSTRUCTOR", auth: true },
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full border-b-4 ${activeTheme.borderClass} bg-black/95 backdrop-blur-md transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16">
        {/* Logo Neo-Brutalist */}
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <div className={`p-1.5 border-2 ${activeTheme.borderClass} bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all`}>
            <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTheme.accentClass}`} strokeWidth={3} />
          </div>
          <span className={`text-lg sm:text-xl lg:text-2xl font-black ${activeTheme.accentClass} uppercase tracking-tighter`}>
            HEXACORE
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            const isActive = pathname === link.href || (link.href !== `/${lang}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 lg:px-3 py-1.5 text-[10px] lg:text-xs font-black uppercase tracking-wider border-2 transition-all
                  ${isActive
                    ? `${activeTheme.borderClass} bg-[var(--accent)] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                    : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Selector - Desktop */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-1.5 border-2 border-zinc-800 bg-zinc-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Palette className={`w-3.5 h-3.5 ${activeTheme.accentClass} mr-1`} strokeWidth={3} />
            {THEMES_LIST.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.name}
                className={`w-4 h-4 border-2 transition-all hover:scale-110 active:scale-90 ${
                  currentTheme === t.id ? `${activeTheme.borderClass} scale-110` : "border-zinc-700 opacity-50 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: t.id === "neon" ? "#DFE104" : t.id === "gba" ? "#00FF66" : t.id === "crimson" ? "#FF3366" : t.id === "quartz" ? "#FFFFFF" : "#00FFFF"
                }}
              />
            ))}
          </div>

          {/* Theme Selector - Tablet */}
          <div className="hidden sm:flex lg:hidden items-center">
            <button
              onClick={() => {
                const idx = THEMES_LIST.findIndex(t => t.id === currentTheme);
                const nextIdx = (idx + 1) % THEMES_LIST.length;
                setTheme(THEMES_LIST[nextIdx].id);
              }}
              className={`p-2 border-2 ${activeTheme.borderClass} bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all`}
              title="Cambiar tema"
            >
              <Palette className={`w-4 h-4 ${activeTheme.accentClass}`} strokeWidth={3} />
            </button>
          </div>

          {/* Language Toggle - Tablet/Desktop */}
          <div className="hidden sm:block">
            <LangToggle currentLang={lang} />
          </div>

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* User Badge - Desktop */}
              <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border-2 ${activeTheme.borderClass} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                <div className="w-2 h-2 bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[100px]">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border-2 ${activeTheme.borderClass} bg-black hover:bg-red-600 hover:border-red-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all`}
                title={isEs ? "SALIR" : "LOGOUT"}
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <Link
              href={`/${lang}/auth/login`}
              className={`hidden sm:flex items-center gap-1.5 border-2 ${mounted ? activeTheme.borderClass : "border-zinc-800"} bg-black hover:bg-[var(--accent)] hover:text-black ${mounted ? activeTheme.accentClass : "text-white"} text-[10px] font-black uppercase tracking-wider px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all`}
            >
              <LogIn className="w-3.5 h-3.5" strokeWidth={3} />
              {isEs ? "ENTRAR" : "LOGIN"}
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 border-2 ${menuOpen ? activeTheme.borderClass : "border-zinc-800"} bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all`}
          >
            {menuOpen ? (
              <X className={`w-4 h-4 ${activeTheme.accentClass}`} strokeWidth={3} />
            ) : (
              <Menu className="w-4 h-4 text-zinc-400" strokeWidth={3} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`md:hidden border-t-4 ${activeTheme.borderClass} bg-zinc-950 flex flex-col p-4 gap-3`}>
          {/* Mobile Nav Links */}
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            const isActive = pathname === link.href || (link.href !== `/${lang}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 text-sm font-black uppercase tracking-wider border-2 transition-all ${
                  isActive
                    ? `${activeTheme.borderClass} bg-[var(--accent)] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Mobile Login Button (if not logged in) */}
          {!user && (
            <Link
              href={`/${lang}/auth/login`}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-center gap-2 px-4 py-3 border-2 ${activeTheme.borderClass} bg-[var(--accent)] text-black text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
            >
              <LogIn className="w-4 h-4" strokeWidth={3} />
              {isEs ? "INICIAR SESION" : "LOGIN"}
            </Link>
          )}

          {/* Divider */}
          <div className="h-px bg-zinc-800 my-2" />

          {/* Mobile Theme Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
              {isEs ? "TEMA GLOBAL" : "GLOBAL THEME"}
            </span>
            <div className="grid grid-cols-5 gap-2">
              {THEMES_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); }}
                  className={`py-2 text-[9px] font-black uppercase border-2 transition-all ${
                    currentTheme === t.id 
                      ? `${activeTheme.borderClass} ${activeTheme.accentClass} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]` 
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                  }`}
                >
                  {t.id.slice(0, 4).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Language Toggle */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
              {isEs ? "IDIOMA" : "LANGUAGE"}
            </span>
            <LangToggle currentLang={lang} />
          </div>
        </div>
      )}
    </nav>
  );
}
