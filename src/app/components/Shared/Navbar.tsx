"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { LangToggle } from "@/app/components/Shared/LangToggle";
import type { User } from "@supabase/supabase-js";
import { Menu, X, LogOut, LogIn } from "lucide-react";

export default function Navbar({ lang, dict }: { lang: string; dict: any }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
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
    { href: `/${lang}`, label: dict.nav.overview },
    { href: `/${lang}/pokedex`, label: dict.nav.encyclopedia },
    { href: `/${lang}/builder`, label: dict.nav.builder, auth: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-zinc-700 bg-zinc-950">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo Brutalista */}
        <Link href={`/${lang}`} className="flex items-center group">
          <span className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-[#DFE104] transition-none">
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
                className={`px-4 py-2 text-sm font-black uppercase tracking-widest border-2 transition-none
                  ${isActive
                    ? "border-[#DFE104] bg-[#DFE104] text-black"
                    : "border-transparent text-zinc-400 hover:border-white hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Lang Toggle + Auth */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LangToggle currentLang={lang} />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500 hidden sm:block truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black px-4 py-2 border-2 border-zinc-700 hover:border-red-500 hover:bg-red-500 transition-none active:scale-95"
              >
                <LogOut className="w-4 h-4" strokeWidth={3} />
                SALIR
              </button>
            </div>
          ) : (
            <Link
              href={`/${lang}/auth/login`}
              className="flex items-center gap-2 bg-[#DFE104] hover:bg-white text-black text-xs font-black uppercase tracking-widest px-6 py-2 transition-none active:scale-95"
            >
              <LogIn className="w-4 h-4" strokeWidth={3} />
              ENTRAR
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-zinc-400 hover:text-white"
          >
            {menuOpen ? <X className="w-6 h-6" strokeWidth={3} /> : <Menu className="w-6 h-6" strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t-4 border-zinc-700 bg-zinc-900 flex flex-col">
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-zinc-400 hover:text-black py-4 px-6 border-b-2 border-zinc-800 hover:bg-[#DFE104] transition-none"
              >
                {link.label}
              </Link>
            );
          })}
          <div className="p-4 border-t-4 border-zinc-800">
            <LangToggle currentLang={lang} />
          </div>
        </div>
      )}
    </nav>
  );
}
