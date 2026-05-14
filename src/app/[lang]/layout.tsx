import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/app/components/Shared/Navbar";
import { getDictionary } from "@/lib/dictionaries";

const inter = Inter({
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
  params: Promise<{ lang: "es" | "en" }>;
}>) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar lang={lang} dict={dict} />
        <main className="flex flex-col flex-1">{children}</main>
      </body>
    </html>
  );
}
