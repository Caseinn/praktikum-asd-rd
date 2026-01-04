import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROSTER: Array<{ nim: string; fullName?: string }> = [
  { nim: "122140153", fullName: "Dito Rifki Irawan" },
];

async function main() {
  for (const s of ROSTER) {
    await prisma.studentRoster.upsert({
      where: { nim: s.nim },
      update: { fullName: s.fullName ?? undefined, isActive: true },
      create: { nim: s.nim, fullName: s.fullName },
    });
  }

  console.log("Seed roster done:", ROSTER.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
