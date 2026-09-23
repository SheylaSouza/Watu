import { expect } from '@playwright/test';

import { expectedBook } from '../../../data/api.data';
import { attachApiResponse, requireApiResponse } from '../../bdd/api-response';
import { Given, Then, When } from '../../bdd/fixtures';

Given('the ISBN belongs to a known book', async ({ apiState }) => {
  apiState.isbn = expectedBook.isbn;
});

When('the client requests {int} available books', async ({ apiState, request }, limit: number) => {
  apiState.operation = 'list-books';
  apiState.response = await request.get('/api/v1/books', {
    headers: apiState.clientHeaders,
    params: { limit, available: true },
  });
  apiState.body = await apiState.response.json();
});

When('the client requests the book details', async ({ apiState, request }) => {
  if (!apiState.isbn) {
    throw new Error('The known ISBN was not prepared by the scenario.');
  }

  apiState.operation = 'book-details';
  apiState.response = await request.get(`/api/v1/books/${apiState.isbn}`, {
    headers: apiState.clientHeaders,
  });
  apiState.body = await apiState.response.json();
});

When('the client requests an unknown ISBN', async ({ apiState, request }) => {
  apiState.operation = 'unknown-book';
  apiState.response = await request.get('/api/v1/books/0000000000000', {
    headers: apiState.clientHeaders,
  });
  apiState.body = await apiState.response.json();
});

When('the client requests the book catalogue', async ({ apiState, request }) => {
  apiState.operation = 'missing-client-id';
  apiState.response = await request.get('/api/v1/books', {
    headers: apiState.clientHeaders,
    params: { limit: 2, available: true },
  });
  apiState.body = await apiState.response.json();
});

Then('a not found response should be returned', async ({ $testInfo, apiState }) => {
  const response = requireApiResponse(apiState);
  await attachApiResponse(apiState, $testInfo);

  expect(response.status()).toBe(404);
  expect(apiState.body).toMatchObject({ code: 'resource_not_found' });
});

Then('a missing client ID response should be returned', async ({ $testInfo, apiState }) => {
  const response = requireApiResponse(apiState);
  await attachApiResponse(apiState, $testInfo);

  expect(response.status()).toBe(401);
  expect(apiState.body).toMatchObject({ code: 'missing_client_id' });
});
