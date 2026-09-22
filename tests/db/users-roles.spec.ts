import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';

import { getExpectedUserIds, getUserGenerationConfig } from '../../data/user-generation.config';

interface UserRoleRow {
  id: bigint;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('retrieves every generated user with roles through an explicit JOIN', async ({}, testInfo) => {
  const config = getUserGenerationConfig();
  const expectedIds = getExpectedUserIds(config);

  const rows = await prisma.$queryRaw<UserRoleRow[]>`
    SELECT
      u.id,
      u.username,
      u.firstname,
      u.lastname,
      u.email,
      r.name AS role
    FROM \`AppUser\` AS u
    INNER JOIN \`AppUserRole\` AS ur ON ur.appuser_id = u.id
    INNER JOIN \`Role\` AS r ON r.id = ur.role_id
    WHERE u.is_deleted = FALSE
    ORDER BY u.id, r.id
  `;

  const returnedIds = new Set(rows.map((row: UserRoleRow) => row.id.toString()));
  for (const expectedId of expectedIds) {
    expect(returnedIds, `Expected user ${expectedId.toString()} in JOIN evidence`).toContain(
      expectedId.toString(),
    );
  }

  expect(rows.length).toBeGreaterThanOrEqual(config.count);
  expect(rows.every((row: UserRoleRow) => row.role.length > 0)).toBe(true);

  const evidence = JSON.stringify(
    {
      configuration: config,
      distinctUsers: returnedIds.size,
      rows,
    },
    (_, value: unknown) => (typeof value === 'bigint' ? value.toString() : value),
    2,
  );

  await testInfo.attach('users-with-roles.json', {
    body: Buffer.from(evidence),
    contentType: 'application/json',
  });
});
