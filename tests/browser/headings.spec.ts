import { expect, test } from '@playwright/test';

import { docsPages } from './docsPages';

// Suculentas demos are excluded until their own ticket fixes them.
for (const href of ['/', '/demos/jewellery-configurator', ...docsPages]) {
  test(`${href} renders exactly one h1`, async ({ page }) => {
    await page.goto(href);
    // Light DOM only: Playwright's CSS engine pierces the dev toolbar's shadow root and its h1s.
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });
}
