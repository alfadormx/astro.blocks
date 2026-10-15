import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/ContentCarousel';

async function section(page: Page): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator('[data-doc-section="button-config"]');
}

test('indicator receives spread consumer attributes and shape', async ({ page }) => {
  const indicators = (await section(page)).locator('[data-carousel-indicator]');

  await expect(indicators).toHaveCount(3);
  for (const indicator of await indicators.all()) {
    await expect(indicator).toHaveAttribute('data-test', 'indicator');
    await expect(indicator).toHaveCSS('border-top-left-radius', '4px');
  }
});

test('indicators default to a pill shape', async ({ page }) => {
  await page.goto(PAGE_URL);
  const indicator = page
    .locator('[data-doc-section="container"] [data-carousel-indicator]')
    .first();
  const radius = await indicator.evaluate((el) =>
    parseFloat(getComputedStyle(el).borderTopLeftRadius)
  );

  expect(radius).toBeGreaterThan(4);
});

test('pause/play toggle switches hidden and keeps consumer labels', async ({ page }) => {
  const root = await section(page);
  const pause = root.locator('[data-carousel-pause]');
  const play = root.locator('[data-carousel-play]');

  await expect(pause).toBeVisible();
  await expect(pause).toHaveAttribute('aria-label', 'Stop slideshow');
  await expect(play).toBeHidden();

  await pause.click();
  await expect(pause).toBeHidden();
  await expect(play).toBeVisible();
  await expect(play).toHaveAttribute('aria-label', 'Start slideshow');

  await play.click();
  await expect(play).toBeHidden();
  await expect(pause).toBeVisible();
  await expect(pause).toHaveAttribute('aria-label', 'Stop slideshow');
});
