import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Pager';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
];

async function openPager(page: Page, section: string): Promise<Locator> {
  await page.goto(PAGE_URL);
  const nav = page.locator(`[data-doc-section="${section}"]`).getByRole('navigation');
  // SSR-only block: visibility is the ready signal.
  await expect(nav).toBeVisible();
  return nav;
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('element has no bounding box');
  return b;
}

test('the landmark is named and holds both links', async ({ page }) => {
  await openPager(page, 'both');
  const nav = page
    .locator('[data-doc-section="both"]')
    .getByRole('navigation', { name: 'Pagination' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link')).toHaveText([/Previous/, /Next/]);

  const custom = page
    .locator('[data-doc-section="custom-labels"]')
    .getByRole('navigation', { name: 'Documentation pages' });
  await expect(custom).toBeVisible();
});

for (const viewport of VIEWPORTS) {
  test(`a lone next sits at the inline end at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const nav = await openPager(page, 'lone-next');
    const navBox = await box(nav);
    const linkBox = await box(nav.locator('[data-pager-link="next"]'));
    expect(Math.abs(navBox.x + navBox.width - (linkBox.x + linkBox.width))).toBeLessThanOrEqual(1);
  });

  test(`long titles do not overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const nav = await openPager(page, 'long-titles');
    // The docs layout's content column doesn't shrink to the viewport, so cap the section at a
    // phone-width column to make the narrow case real.
    await page
      .locator('[data-doc-section="long-titles"]')
      .evaluate((el, width) => (el.style.maxWidth = `${width - 32}px`), viewport.width);
    expect(await nav.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    const navBox = await box(nav);
    expect(navBox.width).toBeLessThanOrEqual(viewport.width - 32);
    for (const which of ['prev', 'next']) {
      const linkBox = await box(nav.locator(`[data-pager-link="${which}"]`));
      expect(linkBox.x).toBeGreaterThanOrEqual(navBox.x - 1);
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(navBox.x + navBox.width + 1);
    }
  });
}

test('a lone previous sits at the inline start', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const nav = await openPager(page, 'lone-prev');
  const navBox = await box(nav);
  const linkBox = await box(nav.locator('[data-pager-link="prev"]'));
  expect(Math.abs(linkBox.x - navBox.x)).toBeLessThanOrEqual(1);
});

test('right-to-left puts next at the inline start and flips its arrow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const nav = await openPager(page, 'lone-next');
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  const link = nav.locator('[data-pager-link="next"]');
  const navBox = await box(nav);
  const linkBox = await box(link);
  expect(Math.abs(linkBox.x - navBox.x)).toBeLessThanOrEqual(1);
  // Tailwind v4's scale utilities set the `scale` property, not `transform`.
  const scale = await link.locator('svg').evaluate((el) => getComputedStyle(el).scale);
  expect(scale).toBe('-1 1');
});
