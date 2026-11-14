import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

import { docsPages } from './docsPages';
import { localePaths } from './locales';

// R-50: the suculentas demos get their h1 when they're committed.
const PENDING_DEMOS = new Set(['suculentas', 'suculentas-keyshot']);

const DEMOS_DIR = new URL('../../src/pages/[...lang]/demos/', import.meta.url);

// Static demo routes only: dynamic `[...]` pages are listed in `collectionPages`.
function staticDemoRoutes(dir: URL, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('_') || entry.name.startsWith('[')) return [];
    if (entry.isDirectory()) {
      return staticDemoRoutes(new URL(`${entry.name}/`, dir), `${prefix}/${entry.name}`);
    }
    if (!entry.name.endsWith('.astro')) return [];
    const name = entry.name.replace(/\.astro$/, '');
    return [name === 'index' ? prefix : `${prefix}/${name}`];
  });
}

const demoPages = staticDemoRoutes(DEMOS_DIR)
  .filter((route) => !PENDING_DEMOS.has(route.slice(1)))
  .flatMap((route) => localePaths.map((base) => `${base === '/' ? '' : base}/demos${route}`));

const collectionPages = [
  '/demos/saas/blog',
  '/demos/saas/blog/hello-world',
  '/es/demos/saas/blog',
  '/demos/portfolio/work',
  '/demos/portfolio/work/ring-configurator',
  '/es/demos/portfolio/work/renovacion-de-marca',
  '/demos/local/events',
  '/demos/local/events/launch-meetup',
  '/es/demos/local/events/encuentro-de-lanzamiento',
];

for (const href of [...localePaths, ...demoPages, ...collectionPages, ...docsPages]) {
  test(`${href} renders exactly one h1`, async ({ page }) => {
    await page.goto(href);
    // Light DOM only: Playwright's CSS engine pierces the dev toolbar's shadow root and its h1s.
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });
}
