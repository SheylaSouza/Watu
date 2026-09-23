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

const requiredRoleNames = ['Editor', 'ReadOnly', 'Superuser'] as const;

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('retrieves every generated user with roles through an explicit JOIN', async ({}, testInfo) => {
  const config = getUserGenerationConfig();
  const expectedIds = getExpectedUserIds(config);
  const expectedIdStrings = new Set(expectedIds.map((id: bigint) => id.toString()));

  const roleCatalog = await prisma.role.findMany({
    where: {
      name: {
        in: [...requiredRoleNames],
      },
    },
    select: {
      name: true,
    },
  });

  expect(roleCatalog.map((role: { name: string }) => role.name).sort()).toEqual(
    [...requiredRoleNames].sort(),
  );

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

  const generatedRows = rows.filter((row: UserRoleRow) => expectedIdStrings.has(row.id.toString()));
  const returnedIds = new Set(generatedRows.map((row: UserRoleRow) => row.id.toString()));
  for (const expectedId of expectedIds) {
    expect(returnedIds, `Expected user ${expectedId.toString()} in JOIN evidence`).toContain(
      expectedId.toString(),
    );
  }

  expect(generatedRows.length).toBeGreaterThanOrEqual(config.count);
  expect(generatedRows.every((row: UserRoleRow) => row.role.length > 0)).toBe(true);

  const rolesByUser = new Map<string, string[]>();
  for (const row of generatedRows) {
    const userId = row.id.toString();
    const assignedRoles = rolesByUser.get(userId) ?? [];
    assignedRoles.push(row.role);
    rolesByUser.set(userId, assignedRoles);
  }

  const roleCombinations = new Set(
    [...rolesByUser.values()].map((roles: string[]) => [...roles].sort().join('|')),
  );
  if (config.count > 1) {
    expect(
      roleCombinations.size,
      'Expected the generated users to have more than one role combination',
    ).toBeGreaterThan(1);
  }

  const evidence = JSON.stringify(
    {
      configuration: config,
      distinctUsers: returnedIds.size,
      requiredRoleCatalog: roleCatalog.map((role: { name: string }) => role.name).sort(),
      roleCombinations: [...roleCombinations].sort(),
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
