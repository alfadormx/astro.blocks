import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

import { docsPages } from './docsPages';

// R-50: the suculentas demos get their h1 when they're committed.
const PENDING_DEMOS = new Set(['suculentas', 'suculentas-keyshot']);

const demoPages = readdirSync(new URL('../../src/pages/demos/', import.meta.url))
  .filter((file) => file.endsWith('.astro'))
  .map((file) => file.replace(/\.astro$/, ''))
  .filter((name) => !PENDING_DEMOS.has(name))
  .map((name) => `/demos/${name}`);

for (const href of ['/', ...demoPages, ...docsPages]) {
  test(`${href} renders exactly one h1`, async ({ page }) => {
    await page.goto(href);
    // Light DOM only: Playwright's CSS engine pierces the dev toolbar's shadow root and its h1s.
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });
}
