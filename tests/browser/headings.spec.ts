import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

import { docsPages } from './docsPages';
import { localePaths } from './locales';

// R-50: the suculentas demos get their h1 when they're committed.
const PENDING_DEMOS = new Set(['suculentas', 'suculentas-keyshot']);

const demoPages = readdirSync(new URL('../../src/pages/[...lang]/demos/', import.meta.url))
  .filter((file) => file.endsWith('.astro') && !file.startsWith('_'))
  .map((file) => file.replace(/\.astro$/, ''))
  .filter((name) => !PENDING_DEMOS.has(name))
  .flatMap((name) => localePaths.map((base) => `${base === '/' ? '' : base}/demos/${name}`));

const collectionPages = [
  '/demos/blog',
  '/demos/blog/hello-world',
  '/es/demos/blog',
  '/demos/work',
  '/demos/work/ring-configurator',
  '/demos/events',
  '/demos/events/launch-meetup',
];

for (const href of [...localePaths, ...demoPages, ...collectionPages, ...docsPages]) {
  test(`${href} renders exactly one h1`, async ({ page }) => {
    await page.goto(href);
    // Light DOM only: Playwright's CSS engine pierces the dev toolbar's shadow root and its h1s.
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });
}
