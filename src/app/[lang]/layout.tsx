import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import Navbar from "@/app/components/Shared/Navbar";
import { ThemeProvider } from "@/app/components/Shared/ThemeProvider";
import { getDictionary } from "@/lib/dictionaries";
import { PerformanceMonitor } from "@/app/components/Shared/PerformanceMonitor";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hexacore | AI Competitive Pokémon Team Builder",
  description:
    "Build championship-level Pokémon teams with AI-powered strategic analysis. Powered by RAG, pgvector, and Gemini 2.5 structured outputs.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang as "es" | "en");

  return (
    <html lang={lang} className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <PerformanceMonitor />
          <Navbar lang={lang} dict={dict} />
          <main className="flex flex-col flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}

