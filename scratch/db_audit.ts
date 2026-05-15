import { prisma } from "../src/lib/db";

async function check() {
  console.log("--- POKEMON DATA ---");
  const venusaur = await prisma.criatura.findFirst({
    where: { nombre: "Venusaur-Gmax" }
  });
  console.log("Venusaur-Gmax:", JSON.stringify(venusaur, null, 2));

  const indeedee = await prisma.criatura.findFirst({
    where: { nombre: { contains: "Indeedee" } }
  });
  console.log("Indeedee:", JSON.stringify(indeedee, null, 2));

  const charizard = await prisma.criatura.findFirst({
    where: { nombre: "Charizard-Gmax" }
  });
  console.log("Charizard-Gmax:", JSON.stringify(charizard, null, 2));

  const morpeko = await prisma.criatura.findFirst({
    where: { nombre: { contains: "Morpeko" } }
  });
  console.log("Morpeko:", JSON.stringify(morpeko, null, 2));

  console.log("\n--- ITEM DATA ---");
  const babiri = await prisma.objeto.findFirst({
    where: { nombres: { path: ["es"], equals: "Baya Baribá" } }
  });
  console.log("Baya Baribá:", JSON.stringify(babiri, null, 2));

  const expShare = await prisma.objeto.findFirst({
    where: { nombre: "Exp. Share" }
  });
  console.log("Exp. Share:", JSON.stringify(expShare, null, 2));
}

check()
  .catch(console.error)
  .finally(() => process.exit(0));
