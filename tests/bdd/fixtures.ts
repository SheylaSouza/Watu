import type { APIResponse } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';

import { BookDetailsPage } from '../../pages/book-details.page';
import { BooksPage } from '../../pages/books.page';

export type ApiOperation =
  | 'book-details'
  | 'create-reservation'
  | 'health'
  | 'invalid-reservation'
  | 'list-books'
  | 'missing-client-id'
  | 'unknown-book';

export interface ApiScenarioState {
  body?: unknown;
  clientHeaders: Record<string, string>;
  isbn?: string;
  operation?: ApiOperation;
  reservationData?: Record<string, number | string>;
  response?: APIResponse;
}

interface WatuFixtures {
  apiState: ApiScenarioState;
  bookDetailsPage: BookDetailsPage;
  booksPage: BooksPage;
}

export const test = base.extend<WatuFixtures>({
  apiState: async ({}, use) => {
    await use({ clientHeaders: {} });
  },
  bookDetailsPage: async ({ page }, use) => {
    await use(new BookDetailsPage(page));
  },
  booksPage: async ({ page }, use) => {
    await use(new BooksPage(page));
  },
});

export const { Given, Then, When } = createBdd(test);
