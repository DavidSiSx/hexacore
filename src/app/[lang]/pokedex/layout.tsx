import { getDictionary } from "@/lib/dictionaries";
import { PokedexSidebar } from "@/app/components/PokedexSidebar";

type PokedexLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function PokedexLayout({
  children,
  params,
}: PokedexLayoutProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "en" | "es");

  return (
    <div className="flex flex-1 min-h-0">
      <PokedexSidebar lang={lang as "en" | "es"} dict={dict} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
