import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/ContentCarousel';

async function section(page: Page): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator('[data-doc-section="button-config"]');
}

test('indicator receives spread consumer attributes', async ({ page }) => {
  const indicators = (await section(page)).locator('[data-carousel-indicator]');

  await expect(indicators).toHaveCount(3);
  for (const indicator of await indicators.all()) {
    await expect(indicator).toHaveAttribute('data-test', 'indicator');
    await expect(indicator).toHaveAttribute('aria-label', /^Go to slide \d+$/);
  }
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
