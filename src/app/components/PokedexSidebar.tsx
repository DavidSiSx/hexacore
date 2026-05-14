"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PokedexSidebar({ lang, dict }: { lang: string; dict: any }) {
  const pathname = usePathname();

  const SIDEBAR_LINKS = [
    { href: `/${lang}/pokedex`,           label: dict.nav.overview },
    { href: `/${lang}/pokedex/pokemon`,   label: dict.nav.pokemon },
    { href: `/${lang}/pokedex/moves`,     label: dict.nav.moves },
    { href: `/${lang}/pokedex/abilities`, label: dict.nav.abilities },
    { href: `/${lang}/pokedex/items`,     label: dict.nav.items },
    { href: `/${lang}/pokedex/types`,     label: dict.nav.type_chart },
    { href: `/${lang}/pokedex/fakemons`,  label: dict.nav.fakemons },
    { href: `/${lang}/pokedex/calc`,      label: dict.nav.calculator },
  ];

  return (
    <>
      {/* Sidebar Desktop Brutalista */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r-4 border-zinc-700 bg-zinc-950 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="pt-8 pb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 px-6 mb-4">
            {dict.nav.encyclopedia}
          </h2>
          <nav className="flex flex-col">
            {SIDEBAR_LINKS.map((link) => {
              const isExact = pathname === link.href;
              const isActive = isExact || (link.href !== `/${lang}/pokedex` && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-6 py-4 text-xl font-black uppercase tracking-tighter border-b-2 border-zinc-800 transition-transform duration-0
                    ${isActive
                      ? "bg-[#DFE104] text-black border-zinc-900"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800 hover:translate-x-2"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile nav strip Brutalista */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t-4 border-zinc-700 flex overflow-x-auto">
        {SIDEBAR_LINKS.map((link) => {
          const isExact = pathname === link.href;
          const isActive = isExact || (link.href !== `/${lang}/pokedex` && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-none px-6 py-4 text-sm font-black uppercase tracking-tighter border-r-2 border-zinc-800 transition-none
                ${isActive
                  ? "bg-[#DFE104] text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
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
