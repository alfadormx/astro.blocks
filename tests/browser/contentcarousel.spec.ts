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
  // Widened so a fixed radius (rounded-md, 6px) can't pass as a pill on the 8px default dot.
  const { radius, height } = await indicator.evaluate((el) => {
    el.style.width = '32px';
    el.style.height = '32px';
    const style = getComputedStyle(el);
    return {
      radius: parseFloat(style.borderTopLeftRadius),
      height: el.getBoundingClientRect().height,
    };
  });

  expect(radius).toBeGreaterThanOrEqual(height / 2);
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

async function probeBackground(page: Page, className: string): Promise<string> {
  return page.evaluate((cls) => {
    const probe = document.createElement('div');
    probe.className = cls;
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, className);
}

function selectedIndicator(page: Page, name: string): Locator {
  return page.locator(
    `[data-doc-section="${name}"] [data-carousel-indicator][aria-selected="true"]`
  );
}

test('the selected indicator uses the primary colour', async ({ page }) => {
  await page.goto(PAGE_URL);
  const indicator = selectedIndicator(page, 'container');

  await expect(indicator).toHaveCSS('background-color', await probeBackground(page, 'bg-primary'));
});

test('defaultIndicatorButtonConfig can override the selected colour', async ({ page }) => {
  await page.goto(PAGE_URL);
  const indicator = selectedIndicator(page, 'indicator-class');

  await expect(indicator).toHaveCSS('background-color', await probeBackground(page, 'bg-accent'));
});

test('defaultImageConfig class reaches the slide image', async ({ page }) => {
  await page.goto(PAGE_URL);
  const image = page.locator('[data-doc-section="image-config"] [data-carousel-slide] img').first();

  await expect(image).toHaveCSS('border-top-left-radius', '12px');
});

test('slotted slides are announced as slides', async ({ page }) => {
  await page.goto(PAGE_URL);
  const slides = page.locator(
    '[data-doc-section="slotted"] .carousel-item:not([data-carousel-clone])'
  );
  const count = await slides.count();
  expect(count).toBeGreaterThan(1);
  for (let i = 0; i < count; i++) {
    await expect(slides.nth(i)).toHaveAttribute('role', 'group');
    await expect(slides.nth(i)).toHaveAttribute('aria-roledescription', 'slide');
    await expect(slides.nth(i)).toHaveAttribute('aria-label', `Slide ${i + 1} of ${count}`);
  }
});

test('loop clones are hidden and carry no slide label', async ({ page }) => {
  await page.goto(PAGE_URL);
  const clones = page.locator('[data-doc-section="loop"] [data-carousel-clone]');
  await expect(clones.first()).toBeAttached();
  for (const clone of await clones.all()) {
    await expect(clone).toHaveAttribute('aria-hidden', 'true');
    await expect(clone).not.toHaveAttribute('aria-label');
    await expect(clone).not.toHaveAttribute('role');
  }
});

test('loop clones leave each slide id in the DOM once', async ({ page }) => {
  await page.goto(PAGE_URL);
  const section = page.locator('[data-doc-section="loop"]');
  await expect(section.locator('[data-carousel-clone]').first()).toBeAttached();
  await expect(page.locator('#loop-mountain')).toHaveCount(1);
  await expect(
    section.locator('[data-carousel-clone] [id], [data-carousel-clone][id]')
  ).toHaveCount(0);
});
