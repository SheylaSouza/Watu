import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const seedPath = fileURLToPath(
  new URL('../database/seeds/seed_roles_and_assignments.sql', import.meta.url),
);

async function main(): Promise<void> {
  const seedSql = await readFile(seedPath, 'utf8');
  const statements = seedSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  console.log(`Applied ${statements.length} idempotent role seed statements.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
