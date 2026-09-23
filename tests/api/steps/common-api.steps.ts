import { expect } from '@playwright/test';

import { apiClientId, expectedBook } from '../../../data/api.data';
import { attachApiResponse, requireApiResponse } from '../../bdd/api-response';
import { Given, Then } from '../../bdd/fixtures';

interface BookListContract {
  items: unknown[];
  page: unknown;
}

Given('the client has a valid client identifier', async ({ apiState }) => {
  apiState.clientHeaders = { 'X-Client-Id': apiClientId };
});

Given('the client does not provide a client identifier', async ({ apiState }) => {
  apiState.clientHeaders = {};
});

Then('the response should be successful', async ({ $testInfo, apiState }) => {
  const response = requireApiResponse(apiState);
  await attachApiResponse(apiState, $testInfo);

  expect(response.status()).toBe(200);

  switch (apiState.operation) {
    case 'health':
      expect(response.headers()['content-type']).toContain('application/json');
      expect(apiState.body).toEqual({ status: 'UP', service: 'book-catalogue' });
      break;

    case 'list-books': {
      expect(response.headers()['x-contract-version']).toBe('1.0');

      const body = apiState.body as BookListContract;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.items.length).toBeGreaterThan(0);
      for (const item of body.items) {
        expect(item).toEqual(
          expect.objectContaining({
            isbn: expect.any(String),
            title: expect.any(String),
            author: expect.any(String),
            available: expect.any(Boolean),
          }),
        );
      }
      expect(body.page).toEqual({ limit: 2, returned: 2 });
      break;
    }

    case 'book-details':
      expect(apiState.body).toMatchObject(expectedBook);
      break;

    default:
      throw new Error(`No successful contract is defined for ${String(apiState.operation)}.`);
  }
});
