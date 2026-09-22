import 'dotenv/config';

import { PrismaClient } from '@prisma/client';

import { getExpectedUserIds, getUserGenerationConfig } from '../data/user-generation.config';
import { buildUser, initializeUserFactory } from '../data/users.factory';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const config = getUserGenerationConfig();
  initializeUserFactory();

  const users = getExpectedUserIds(config).map(buildUser);

  for (const user of users) {
    await prisma.appUser.upsert({
      where: { id: user.id },
      create: user,
      update: user,
    });
  }

  const firstId = users.at(0)?.id.toString();
  const lastId = users.at(-1)?.id.toString();
  console.log(
    `Prepared ${users.length} users (IDs ${firstId}-${lastId}; configured maximum ${config.maxCount}).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
