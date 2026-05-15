const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.objeto.findMany({ take: 5 });
  console.log(JSON.stringify(items, null, 2));
  await prisma.$disconnect();
}

check();
