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

test('aria-hidden logo copy holds nothing focusable', async ({ page }) => {
  await page.goto(PAGE_URL);
  const hidden = page.locator('#doc-header [aria-hidden="true"]');

  await expect(hidden).toHaveCount(1);
  const focused = await hidden.locator('*').evaluateAll((els) =>
    els
      .filter((el) => {
        (el as HTMLElement).focus();
        return document.activeElement === el;
      })
      .map((el) => el.outerHTML.slice(0, 80))
  );
  expect(focused).toEqual([]);
});
