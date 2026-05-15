import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function repair() {
  console.log("🛠️ Iniciando Reparación Nuclear de Datos...");

  // 0. LIMPIEZA DE POSIBLES DUPLICADOS O CRUCES
  console.log("🧹 Limpiando inconsistencias...");
  // Eliminar cualquier objeto que NO sea Babiri Berry pero tenga la descripción corrupta de Exp. Share
  await prisma.objeto.updateMany({
    where: { 
      descripciones: { path: ["es"], string_contains: "reparte puntos de experiencia" },
      NOT: { nombre: { contains: "Huevo", mode: "insensitive" } }
    },
    data: { descripciones: {} } // Resetear para que el poblador lo arregle
  });

  // 1. CORRECCIÓN DE BABIRI BERRY (Baya Baribá)
  console.log("📦 Corrigiendo Baya Baribá...");
  await prisma.objeto.updateMany({
    where: { nombre: { contains: "Baribá", mode: "insensitive" } },
    data: {
      nombre: "Baya Baribá",
      nombres: { es: "Baya Baribá", en: "Babiri Berry" },
      descripciones: { 
        es: "Si lo lleva un Pokémon, debilita un movimiento de tipo Acero supereficaz.",
        en: "If held by a Pokémon, this Berry will lessen the damage taken from one multi-hit or single-hit super-effective Steel-type attack."
      }
    }
  });

  // 2. CORRECCIÓN DE VENUSAUR-GMAX Y ELIMINACIÓN DE CRUCES
  console.log("🦖 Corrigiendo Venusaur-Gmax y eliminando cruces...");
  
  // Como nombre es @unique, solo puede haber uno. Lo actualizamos con los datos correctos.
  await prisma.criatura.update({
    where: { nombre: "Venusaur-Gmax" },
    data: {
      nombres: { es: "Venusaur Gigamax", en: "Venusaur-Gmax" },
      descripciones: {
        es: "Forma Gigamax de Venusaur. Sus pétalos han crecido tanto que cubren todo su cuerpo.",
        en: "Gigantamax form of Venusaur. Its petals have grown so large that they cover its entire body."
      },
      atributos_de_combate: {
        num: 3,
        tipos: ["Grass", "Poison"],
        tier: "Uber",
        tags: ["Gigantamax"]
      }
    }
  }).catch(e => console.log("⚠️ Venusaur-Gmax no encontrado o ya corregido."));

  // 3. ASEGURAR TRADUCCIONES DE HABILIDADES CRÍTICAS
  console.log("🧠 Corrigiendo Habilidades Críticas...");
  const abilities = [
    { en: "Adaptability", es: "Adaptable", desc: "Potencia los movimientos del mismo tipo que el poseedor." },
    { en: "Intimidate", es: "Intimidación", desc: "Baja el Ataque del oponente al entrar en combate." },
  ];

  for (const ab of abilities) {
    await prisma.habilidad.updateMany({
      where: { nombre: ab.en },
      data: {
        nombres: { en: ab.en, es: ab.es },
        descripciones: { en: "Boosts the power of moves of the same type.", es: ab.desc }
      }
    });
  }

  console.log("✨ Reparación completada.");
}

repair()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
