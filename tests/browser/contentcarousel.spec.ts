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

test.describe('focus pause', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
  });

  test('focus on a carousel control stops step autoplay', async ({ page }) => {
    const root = await section(page);
    const announcer = root.locator('[data-carousel-announcer]');
    await expect(announcer).toHaveText('Slide 1 of 3');
    await root.locator('[data-carousel-next]').focus();
    await page.clock.runFor(7000);
    await expect(announcer).toHaveText('Slide 1 of 3');
  });

  test('focus leaving the carousel resumes step autoplay', async ({ page }) => {
    const root = await section(page);
    const next = root.locator('[data-carousel-next]');
    await next.focus();
    await next.evaluate((el) => (el as HTMLElement).blur());
    await page.clock.runFor(3500);
    await expect(root.locator('[data-carousel-announcer]')).toHaveText('Slide 2 of 3');
  });

  test('focus leaving after the pause button keeps autoplay paused', async ({ page }) => {
    const root = await section(page);
    await root.locator('[data-carousel-pause]').focus();
    await page.keyboard.press('Enter');
    await root.locator('[data-carousel-play]').evaluate((el) => (el as HTMLElement).blur());
    await page.clock.runFor(7000);
    await expect(root.locator('[data-carousel-announcer]')).toHaveText('Slide 1 of 3');
  });

  test('pressing next after pause does not restart step autoplay', async ({ page }) => {
    const root = await section(page);
    await root.locator('[data-carousel-pause]').click();
    await root.locator('[data-carousel-next]').click();
    await root.locator('[data-carousel-next]').evaluate((el) => (el as HTMLElement).blur());
    await page.mouse.move(0, 0);
    await page.clock.runFor(7000);
    await expect(root.locator('[data-carousel-announcer]')).toHaveText('Slide 2 of 3');
  });
});

test.describe('continuous autoplay', () => {
  function continuous(page: Page): Locator {
    return page.locator('[data-doc-section="continuous"]');
  }

  async function offset(page: Page): Promise<number> {
    return continuous(page)
      .locator('[data-carousel-track]')
      .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  }

  async function open(page: Page): Promise<Locator> {
    await page.clock.install();
    await page.goto(PAGE_URL);
    const root = continuous(page);
    await expect(root.locator('[data-carousel-clone]').first()).toBeAttached();
    return root;
  }

  test('continuous autoplay moves the track at about speed pixels per second', async ({ page }) => {
    await open(page);
    const before = await offset(page);
    await page.clock.runFor(1000);
    const delta = (await offset(page)) - before;
    expect(delta).toBeGreaterThanOrEqual(-75);
    expect(delta).toBeLessThanOrEqual(-45);
  });

  test('hovering a continuous carousel freezes the track', async ({ page }) => {
    const root = await open(page);
    await root.locator('[data-carousel-viewport]').hover();
    const before = await offset(page);
    await page.clock.runFor(1000);
    expect(await offset(page)).toBe(before);
  });

  test('focus inside a continuous carousel freezes the track', async ({ page }) => {
    const root = await open(page);
    await root.locator('[data-carousel-next]').focus();
    const before = await offset(page);
    await page.clock.runFor(1000);
    expect(await offset(page)).toBe(before);
  });

  test('the pause button freezes a continuous carousel after focus leaves', async ({ page }) => {
    const root = await open(page);
    await root.locator('[data-carousel-pause]').focus();
    await page.keyboard.press('Enter');
    await root.locator('[data-carousel-play]').evaluate((el) => (el as HTMLElement).blur());
    const before = await offset(page);
    await page.clock.runFor(1000);
    expect(await offset(page)).toBe(before);
  });

  test('a continuous carousel does not move with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const before = await offset(page);
    await page.clock.runFor(2000);
    expect(await offset(page)).toBe(before);
  });

  test('next mid-drift lands on a real slide', async ({ page }) => {
    const root = await open(page);
    await page.clock.runFor(1500);
    await root.locator('[data-carousel-next]').click();
    const track = root.locator('[data-carousel-track]');
    const width = await track.evaluate(
      (el) => (el.firstElementChild as HTMLElement).getBoundingClientRect().width
    );
    let index = 0;
    await expect
      .poll(async () => {
        const slides = -(await offset(page)) / width;
        index = Math.round(slides);
        return Math.abs(slides - index);
      })
      .toBeLessThan(0.01);
    const isClone = await track.evaluate(
      (el, i) => el.children[i].hasAttribute('data-carousel-clone'),
      index
    );
    expect(isClone).toBe(false);
  });

  test('continuous autoplay drifts the other way in RTL', async ({ page }) => {
    await page.route('**/documentation/composite/ContentCarousel', async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/(<html[^>]*?)dir="ltr"/, '$1dir="rtl"');
      await route.fulfill({ response, body });
    });
    await open(page);
    expect(await page.locator('html').getAttribute('dir')).toBe('rtl');
    const before = await offset(page);
    await page.clock.runFor(1000);
    expect((await offset(page)) - before).toBeGreaterThan(0);
  });
});
