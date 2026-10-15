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

test('header renders each id and name once', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('#doc-header');
  const ids = await root.locator('[id]').evaluateAll((els) => els.map((el) => el.id));
  const names = await root
    .locator('[name]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('name')));

  expect(ids).toContain('doc-header-logo-image');
  expect(names).toContain('doc-header-logo');
  expect(ids.length).toBe(new Set(ids).size);
  expect(names.length).toBe(new Set(names).size);
});

test('header renders one logo', async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(page.locator('#doc-header a[href="/"]')).toHaveCount(1);
});

test('the logo stays centred on the header row', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE_URL);
  const logo = await page.locator('#doc-header-logo').boundingBox();
  const row = await page.locator('#doc-header [data-header-row]').boundingBox();

  expect(logo).not.toBeNull();
  expect(row).not.toBeNull();
  expect(Math.abs(logo!.x + logo!.width / 2 - (row!.x + row!.width / 2))).toBeLessThan(1);
});
