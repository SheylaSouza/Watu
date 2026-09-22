import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'https://demoqa.com';
const wireMockURL = process.env.WIREMOCK_URL ?? 'http://127.0.0.1:8080';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  outputDir: 'test-results',
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: process.env.PLAYWRIGHT_HTML_OUTPUT_DIR ?? 'reports/all',
        open: 'never',
      },
    ],
  ],
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
      name: 'desktop-chromium',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-firefox',
      testMatch: '**/ui/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-iphone',
      testMatch: '**/ui/**/*.spec.ts',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
      },
    },
    {
      name: 'db',
      testMatch: '**/db/**/*.spec.ts',
    },
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: wireMockURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
  ],
});
