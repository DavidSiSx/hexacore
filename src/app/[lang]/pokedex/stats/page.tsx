import { getMetagameStats } from "@/app/actions/metagame";
import { MetagameDashboard } from "@/app/components/Metagame/MetagameDashboard";

/**
 * Metagame Statistics Page
 * Entry point for analyzing real-time Smogon usage data.
 * Powered by Next.js Server Components.
 */
export default async function MetagamePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Pre-fetch inicial para Gen 9 OU (el metagame más popular)
  // Esto asegura que la página cargue con datos reales de forma instantánea.
  const initialData = await getMetagameStats("gen9ou");
  
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)]">
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <MetagameDashboard lang={lang} initialData={initialData} />
      </main>
    </div>
  );
}
