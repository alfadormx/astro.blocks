import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Header';

test('root carries the consumer id and aria-label', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('#doc-header');

  await expect(root).toHaveAttribute('data-header', '');
  await expect(root).toHaveAttribute('aria-label', 'Site header');
});

test('logo id renders once', async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(page.locator('#doc-header-logo')).toHaveCount(1);
});
