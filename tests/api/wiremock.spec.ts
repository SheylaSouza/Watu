import { expect, test } from '@playwright/test';

import { apiClientId, expectedBook, validReservation } from '../../data/api.data';

const authenticatedHeaders = {
  'X-Client-Id': apiClientId,
};

test.describe('WireMock book service contract', () => {
  test('reports service health', async ({ request }) => {
    const response = await request.get('/api/v1/health');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ status: 'UP', service: 'book-catalogue' });
  });

  test('lists books when header and query contract are valid', async ({ request }) => {
    const response = await request.get('/api/v1/books', {
      headers: authenticatedHeaders,
      params: { limit: 2, available: true },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['x-contract-version']).toBe('1.0');

    const body: unknown = await response.json();
    expect(body).toEqual({
      items: expect.arrayContaining([
        expect.objectContaining({
          isbn: expect.any(String),
          title: expect.any(String),
          author: expect.any(String),
          available: expect.any(Boolean),
        }),
      ]),
      page: { limit: 2, returned: 2 },
    });
  });

  test('returns book details for a known ISBN', async ({ request }) => {
    const response = await request.get(`/api/v1/books/${expectedBook.isbn}`, {
      headers: authenticatedHeaders,
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject(expectedBook);
  });

  test('creates a reservation for a valid request body', async ({ request }) => {
    const response = await request.post('/api/v1/reservations', {
      headers: authenticatedHeaders,
      data: validReservation,
    });

    expect(response.status()).toBe(201);
    expect(response.headers()['location']).toBe('/api/v1/reservations/res-20260918-001');
    await expect(response.json()).resolves.toMatchObject({
      reservationId: 'res-20260918-001',
      status: 'CONFIRMED',
      ...validReservation,
    });
  });

  test('rejects a reservation that violates the request contract', async ({ request }) => {
    const response = await request.post('/api/v1/reservations', {
      headers: authenticatedHeaders,
      data: { bookId: expectedBook.isbn },
    });

    expect(response.status()).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      code: 'validation_error',
      errors: expect.arrayContaining([
        expect.objectContaining({ field: 'userId', message: expect.any(String) }),
      ]),
    });
  });

  test('rejects protected endpoints without a client identifier', async ({ request }) => {
    const response = await request.get('/api/v1/books', { params: { limit: 2, available: true } });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ code: 'missing_client_id' });
  });

  test('returns a structured error for an unknown resource', async ({ request }) => {
    const response = await request.get('/api/v1/books/0000000000000', {
      headers: authenticatedHeaders,
    });

    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ code: 'resource_not_found' });
  });
});
