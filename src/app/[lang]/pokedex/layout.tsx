import { getDictionary } from "@/lib/dictionaries";
import { PokedexSidebar } from "@/app/components/PokedexSidebar";

type PokedexLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: "en" | "es" }>;
};

export default async function PokedexLayout({
  children,
  params,
}: PokedexLayoutProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 min-h-0 bg-zinc-950">
      <PokedexSidebar lang={lang} dict={dict} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
