import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/Video';

test('a consumer pipButton id keeps the floating player closable', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const root = page.locator('[data-doc-section="floating"]');
  const group = root.locator('[data-video-group]');
  const close = page.locator('#doc-video-pip');

  await root.scrollIntoViewIfNeeded();
  const sectionBottom = await root.evaluate((el) => el.getBoundingClientRect().bottom + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), sectionBottom + 800);

  await expect(group).toHaveClass(/floating-player/);
  await expect(close).toBeVisible();
  await close.click();
  await expect(group).not.toHaveClass(/floating-player/);
  await expect(close).toBeHidden();
});
