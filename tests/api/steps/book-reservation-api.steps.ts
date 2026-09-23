import { expect } from '@playwright/test';

import { expectedBook, validReservation } from '../../../data/api.data';
import { attachApiResponse, requireApiResponse } from '../../bdd/api-response';
import { Given, Then, When } from '../../bdd/fixtures';

Given('the reservation contains valid data', async ({ apiState }) => {
  apiState.reservationData = { ...validReservation };
});

Given('the reservation does not contain a user identifier', async ({ apiState }) => {
  apiState.reservationData = { bookId: expectedBook.isbn };
});

When('the client creates the reservation', async ({ apiState, request }) => {
  apiState.operation = 'create-reservation';
  apiState.response = await request.post('/api/v1/reservations', {
    headers: apiState.clientHeaders,
    data: apiState.reservationData,
  });
  apiState.body = await apiState.response.json();
});

When('the client attempts to create the reservation', async ({ apiState, request }) => {
  apiState.operation = 'invalid-reservation';
  apiState.response = await request.post('/api/v1/reservations', {
    headers: apiState.clientHeaders,
    data: apiState.reservationData,
  });
  apiState.body = await apiState.response.json();
});

Then('the reservation should be created successfully', async ({ $testInfo, apiState }) => {
  const response = requireApiResponse(apiState);
  await attachApiResponse(apiState, $testInfo);

  expect(response.status()).toBe(201);
  expect(response.headers()['location']).toBe('/api/v1/reservations/res-20260918-001');
  expect(apiState.body).toMatchObject({
    reservationId: 'res-20260918-001',
    status: 'CONFIRMED',
    ...validReservation,
  });
});

Then('a validation error response should be returned', async ({ $testInfo, apiState }) => {
  const response = requireApiResponse(apiState);
  await attachApiResponse(apiState, $testInfo);

  expect(response.status()).toBe(422);
  expect(apiState.body).toMatchObject({
    code: 'validation_error',
    errors: expect.arrayContaining([
      expect.objectContaining({ field: 'userId', message: expect.any(String) }),
    ]),
  });
});
