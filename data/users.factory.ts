import { createHash } from 'node:crypto';

import { faker } from '@faker-js/faker';

export interface GeneratedUser {
  id: bigint;
  is_deleted: boolean;
  username: string;
  firstname: string;
  lastname: string;
  password: string;
  email: string;
  nonlocked: boolean;
  enabled: boolean;
  password_never_expires: boolean;
  cannot_change_password: boolean;
}

export function initializeUserFactory(seed = 20260918): void {
  faker.seed(seed);
}

export function buildUser(id: bigint): GeneratedUser {
  const idText = id.toString();
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const password = createHash('sha256').update(`qa-only-password-${idText}`).digest('hex');

  return {
    id,
    is_deleted: false,
    username: `qa_user_${idText}`,
    firstname,
    lastname,
    password,
    email: `qa_user_${idText}@example.test`,
    nonlocked: true,
    enabled: true,
    password_never_expires: false,
    cannot_change_password: false,
  };
}
