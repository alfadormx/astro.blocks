import { expect, test } from '@playwright/test';

for (const href of [
  '/',
  '/documentation/composite/Content',
  '/documentation/composite/CallToAction',
  '/documentation/composite/ItemsContent',
]) {
  test(`${href} renders exactly one h1`, async ({ page }) => {
    await page.goto(href);
    // Light DOM only: Playwright's CSS engine pierces the dev toolbar's shadow root and its h1s.
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });
}
