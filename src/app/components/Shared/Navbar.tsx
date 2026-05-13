"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/builder", label: "Builder", auth: true },
];

export default function Navbar() {
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
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
                          bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            ⬡ Hexacore
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth Button */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] hidden sm:block truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-[var(--text-muted)] hover:text-white px-3 py-1.5 rounded-lg
                           border border-[var(--border)] hover:border-[var(--border-active)] transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                         text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-[var(--text-muted)] hover:text-white"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[var(--border)] px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {NAV_LINKS.map((link) => {
            if (link.auth && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[var(--text-secondary)] hover:text-white py-2 px-3 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
