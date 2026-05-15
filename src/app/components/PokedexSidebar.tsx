"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/components/Shared/ThemeProvider";

export function PokedexSidebar({ lang, dict }: { lang: string; dict: any }) {
  const pathname = usePathname();
  const { activeTheme } = useTheme();

  const SIDEBAR_LINKS = [
    { href: `/${lang}/pokedex`,           label: dict.nav?.overview || "Overview" },
    { href: `/${lang}/pokedex/pokemon`,   label: dict.nav?.pokemon || "Pokémon" },
    { href: `/${lang}/pokedex/moves`,     label: dict.nav?.moves || "Moves" },
    { href: `/${lang}/pokedex/abilities`, label: dict.nav?.abilities || "Abilities" },
    { href: `/${lang}/pokedex/items`,     label: dict.nav?.items || "Items" },
    { href: `/${lang}/pokedex/types`,     label: dict.nav?.type_chart || "Type Chart" },
    { href: `/${lang}/pokedex/fakemons`,  label: dict.nav?.fakemons || "Fakemons" },
    { href: `/${lang}/pokedex/calc`,      label: dict.nav?.calculator || "Calculator" },
  ];

  return (
    <>
      {/* Sidebar Desktop Brutalista Tematizada */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 border-r-4 ${activeTheme.borderClass} ${activeTheme.bgClass} sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-colors`}>
        <div className="pt-8 pb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 px-6 mb-4">
            {dict.nav?.encyclopedia || "Encyclopedia"}
          </h2>
          <nav className="flex flex-col">
            {SIDEBAR_LINKS.map((link) => {
              const isExact = pathname === link.href;
              const isActive = isExact || (link.href !== `/${lang}/pokedex` && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-6 py-4 text-xl font-black uppercase tracking-tighter border-b-2 border-zinc-800 transition-all duration-150
                    ${isActive
                      ? `${activeTheme.badgeBgClass} border-l-8 ${activeTheme.borderClass} translate-x-1`
                      : "text-zinc-400 hover:text-white hover:bg-black hover:translate-x-2"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile nav strip Brutalista Tematizada */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${activeTheme.bgClass} border-t-4 ${activeTheme.borderClass} flex overflow-x-auto transition-colors`}>
        {SIDEBAR_LINKS.map((link) => {
          const isExact = pathname === link.href;
          const isActive = isExact || (link.href !== `/${lang}/pokedex` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-none px-6 py-4 text-sm font-black uppercase tracking-tighter border-r-2 border-zinc-800 transition-none
                ${isActive
                  ? `${activeTheme.badgeBgClass} border-b-4 ${activeTheme.borderClass}`
                  : "text-zinc-400 hover:text-white hover:bg-black"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
