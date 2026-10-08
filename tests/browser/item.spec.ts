import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Item';

test('connectorClass applies to horizontal connector lines', async ({ page }) => {
  await page.goto(PAGE_URL);
  const section = page.locator('[data-doc-section="connector-class"]');

  await expect(section.locator('.border-t.border-primary')).toHaveCount(4);
  await expect(section.locator('.border-t.border-transparent')).toHaveCount(2);
  await expect(section.locator('.border-transparent.border-primary')).toHaveCount(0);
});

test('connectorClass applies to the vertical connector line', async ({ page }) => {
  await page.goto(PAGE_URL);
  const section = page.locator('[data-doc-section="connector-class"]');

  await expect(section.locator('.border-l.border-primary')).toHaveCount(1);
});
