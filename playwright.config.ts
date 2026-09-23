import 'dotenv/config';
import type { ReporterDescription } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const baseURL = process.env.BASE_URL ?? 'https://demoqa.com';
const wireMockURL = process.env.WIREMOCK_URL ?? 'http://127.0.0.1:8080';
const uiBddTestDir = defineBddConfig({
  features: 'tests/ui/features/**/*.feature',
  steps: ['tests/bdd/fixtures.ts', 'tests/ui/steps/**/*.ts'],
  outputDir: '.features-gen/ui',
});
const apiBddTestDir = defineBddConfig({
  features: 'tests/api/features/**/*.feature',
  steps: ['tests/bdd/fixtures.ts', 'tests/api/steps/**/*.ts'],
  outputDir: '.features-gen/api',
});

const reporters: ReporterDescription[] = [
  ['list'],
  [
    'html',
    {
      outputFolder: process.env.PLAYWRIGHT_HTML_OUTPUT_DIR ?? 'reports/manual',
      open: 'never',
    },
  ],
];

if (process.env.PLAYWRIGHT_BLOB_OUTPUT_FILE) {
  reporters.push(['blob']);
}

export default defineConfig({
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: process.env.PLAYWRIGHT_TEST_OUTPUT_DIR ?? 'test-results',
  reporter: reporters,
  use: {
    baseURL,
    geolocation: {
      latitude: -1.286389,
      longitude: 36.817223,
    },
    permissions: ['geolocation'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'UI - Desktop Chromium',
      testDir: uiBddTestDir,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'UI - Desktop Firefox',
      testDir: uiBddTestDir,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'UI - Mobile iPhone',
      testDir: uiBddTestDir,
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
      },
    },
    {
      name: 'DATABASE - MySQL and Prisma',
      testDir: './tests',
      testMatch: '**/db/**/*.spec.ts',
    },
    {
      name: 'API - WireMock',
      testDir: apiBddTestDir,
      use: {
        baseURL: wireMockURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
  ],
});
