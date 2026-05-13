import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Shared/Navbar";
import { LangProvider } from "@/lib/lang";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hexacore | AI Competitive Pokémon Team Builder",
  description:
    "Build championship-level Pokémon teams with AI-powered strategic analysis. Powered by RAG, pgvector, and Gemini 2.5 structured outputs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider>
          <Navbar />
          <main className="flex flex-col flex-1">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
