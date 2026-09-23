import type { APIResponse, TestInfo } from '@playwright/test';

import type { ApiScenarioState } from './fixtures';

export function requireApiResponse(apiState: ApiScenarioState): APIResponse {
  if (!apiState.response) {
    throw new Error('The API response was not created by the scenario action.');
  }

  return apiState.response;
}

export async function attachApiResponse(
  apiState: ApiScenarioState,
  testInfo: TestInfo,
): Promise<void> {
  const evidence = JSON.stringify(
    {
      operation: apiState.operation,
      status: requireApiResponse(apiState).status(),
      body: apiState.body,
    },
    null,
    2,
  );

  await testInfo.attach(`API - ${apiState.operation ?? 'unknown'} response`, {
    body: Buffer.from(evidence),
    contentType: 'application/json',
  });
}
