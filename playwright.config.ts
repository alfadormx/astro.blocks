import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:4321';

export default defineConfig({
  testDir: 'tests/browser',
  use: {
    baseURL,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    // `astro dev` daemonises itself when it detects an agent environment, which Playwright
    // reads as the web server exiting early. Setting this env var opts out of that detection
    // so the dev server stays in the foreground for the lifetime of the run.
    env: { ASTRO_DEV_BACKGROUND: '1' },
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
