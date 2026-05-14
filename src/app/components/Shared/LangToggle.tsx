"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LangToggle({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const nextLang = currentLang === "es" ? "en" : "es";
    // Si la ruta no empieza con /es o /en, asumimos que está en la raíz
    let newPath = pathname;
    if (pathname.startsWith("/es/") || pathname === "/es") {
      newPath = pathname.replace(/^\/es/, `/${nextLang}`);
    } else if (pathname.startsWith("/en/") || pathname === "/en") {
      newPath = pathname.replace(/^\/en/, `/${nextLang}`);
    } else {
      newPath = `/${nextLang}${pathname}`;
    }
    
    // Set cookie para recordar la preferencia
    document.cookie = `NEXT_LOCALE=${nextLang}; path=/; max-age=31536000`;
    router.push(newPath);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 border-2 border-zinc-700 hover:border-[#DFE104] hover:bg-[#DFE104] hover:text-black text-zinc-400 uppercase font-black tracking-tighter transition-none active:scale-95"
      title="Toggle Language"
    >
      <Globe strokeWidth={3} className="w-5 h-5" />
      {currentLang}
    </button>
  );
}
