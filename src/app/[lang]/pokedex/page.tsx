import { prisma } from "@/lib/db";
import { PokedexHubClient } from "@/app/components/PokedexHubClient";

async function getCounts() {
  const [pokemon, moves, abilities, items, fakemons] = await Promise.all([
    prisma.criatura.count({ where: { es_fakemon: false } }),
    prisma.movimiento.count(),
    prisma.habilidad.count(),
    prisma.objeto.count(),
    prisma.criatura.count({ where: { es_fakemon: true } }),
  ]);
  return { pokemon, moves, abilities, items, fakemons };
}

export default async function PokedexHub({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const counts = await getCounts();

  return <PokedexHubClient lang={lang || "es"} counts={counts} />;
}
