import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Item';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

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

test('spacing.margin reaches the item root', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-doc-section="spacing-margin"] > *').first();

  await expect(root).toHaveCSS('margin-top', '32px');
});

test('defaultActionConfig reaches every action', async ({ page }) => {
  await page.goto(PAGE_URL);
  const links = section(page, 'default-action-config').getByRole('link');

  await expect(links).toHaveCount(3);
  for (const link of await links.all()) await expect(link).toHaveCSS('border-top-width', '2px');
});

test('actionsClass reaches the actions wrapper', async ({ page }) => {
  await page.goto(PAGE_URL);
  const links = section(page, 'actions-class').getByRole('link');
  const [a, b] = [await links.nth(0).boundingBox(), await links.nth(1).boundingBox()];

  expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height);
});
