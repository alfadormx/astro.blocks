import { expect, test } from '@playwright/test';

const bar = (page: import('@playwright/test').Page) => page.locator('header').first();
const frame = (page: import('@playwright/test').Page) => page.locator('iframe[data-preview-frame]');

test('the preview frames the demo under a bar in the demo theme', async ({ page }) => {
  await page.goto('/demos/preview/portfolio');
  await expect(page.locator('html')).toHaveAttribute('data-demo', 'portfolio');
  await expect(frame(page)).toHaveAttribute('src', '/demos/portfolio');
  await expect(frame(page)).toHaveAttribute('title', 'Portfolio demo');
});

test('the size options narrow the frame to tablet and phone widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demos/preview/local');
  const sizes = page.getByRole('radiogroup', { name: 'Preview width' });
  await sizes.locator('[data-option-code="mobile"]').click();
  await expect(frame(page)).toHaveAttribute('data-preview-frame', 'mobile');
  await expect.poll(async () => (await frame(page).boundingBox())!.width).toBe(390);
  await sizes.locator('[data-option-code="tablet"]').click();
  await expect.poll(async () => (await frame(page).boundingBox())!.width).toBe(768);
  await sizes.locator('[data-option-code="desktop"]').click();
  await expect.poll(async () => (await frame(page).boundingBox())!.width).toBe(1440);
});

test('choosing another demo opens its preview', async ({ page }) => {
  await page.goto('/es/demos/preview/saas');
  await page
    .getByRole('combobox', { name: 'Elige una demo' })
    .selectOption('/es/demos/preview/local');
  await expect(page).toHaveURL(/\/es\/demos\/preview\/local$/);
  await expect(frame(page)).toHaveAttribute('src', '/es/demos/local');
});

test('Close follows the page reached inside the frame', async ({ page }) => {
  await page.goto('/demos/preview/portfolio');
  const close = bar(page).getByRole('link', { name: 'Close' });
  await expect(close).toHaveAttribute('href', '/demos/portfolio');
  await frame(page).contentFrame().locator('a[href="/demos/portfolio/about"]').first().click();
  await expect(close).toHaveAttribute('href', '/demos/portfolio/about');
  await close.click();
  await expect(page).toHaveURL(/\/demos\/portfolio\/about$/);
});
