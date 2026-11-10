import { expect, test, type Locator, type Page } from '@playwright/test';
import { emphasisColour, expectFocusRing } from './focusRing';

const PAGE_URL = '/documentation/composite/LogoCloud';
const SECTIONS = [
  'basic',
  'links',
  'vector',
  'grayscale',
  'gap',
  'marquee',
  'marquee-grayscale',
  'marquee-links',
] as const;
const MARQUEE_NAMES = [
  'Acme',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Vandelay',
  'Stark',
  'Wayne',
];

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

// Clones are created by initCarousel, never server-rendered: this is the post-init signal.
async function marqueeReady(page: Page, name: string): Promise<Locator> {
  const root = section(page, name);
  await expect(root.locator('[data-carousel-clone]').first()).toBeAttached();
  return root;
}

function realLogos(root: Locator): Locator {
  return root.locator('[data-logo-cloud-logo]:not([data-carousel-clone] *)');
}

function trackOffset(root: Locator): Promise<number> {
  return root
    .locator('[data-carousel-track]')
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
}

function filterOf(locator: Locator): Promise<string> {
  return locator.evaluate((el) => {
    el.getAnimations().forEach((animation) => animation.finish());
    return getComputedStyle(el).filter;
  });
}

test.describe('static', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the static strip renders every logo', async ({ page }) => {
    const root = section(page, 'basic');
    await expect(root.locator('[data-logo-cloud-logo]')).toHaveCount(6);
    const logos = root.locator('[data-logo-cloud-logos]');
    await expect(logos).toHaveCSS('flex-wrap', 'wrap');
    await expect(logos).toHaveCSS('justify-content', 'center');
  });

  test('a logo without href is not a link', async ({ page }) => {
    await expect(section(page, 'basic').getByRole('link')).toHaveCount(0);
  });

  test('a linked logo is a same-tab link named after the logo', async ({ page }) => {
    const link = section(page, 'links').getByRole('link', { name: 'Acme' });
    await expect(link).toHaveAttribute('href', 'https://example.com/acme');
    await expect(link).not.toHaveAttribute('target');
  });

  test('an image logo takes its name as alt', async ({ page }) => {
    await expect(section(page, 'vector').locator('img').first()).toHaveAttribute(
      'alt',
      'Northwind'
    );
  });

  test('the headline renders as h2', async ({ page }) => {
    await expect(
      section(page, 'basic').getByRole('heading', { level: 2, name: 'Trusted by teams everywhere' })
    ).toBeVisible();
  });
});

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('Tab moves through every linked logo in order', async ({ page }) => {
    const links = section(page, 'links').getByRole('link');
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    for (let i = 1; i < 4; i++) {
      await page.keyboard.press('Tab');
      await expect(links.nth(i)).toBeFocused();
    }
  });

  test('a focused logo link shows the emphasis focus ring', async ({ page }) => {
    const link = section(page, 'links').getByRole('link').first();
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expectFocusRing(link, await emphasisColour(page));
  });
});

test.describe('marquee', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('each marquee logo is announced once', async ({ page }) => {
    const root = await marqueeReady(page, 'marquee-links');
    for (const name of MARQUEE_NAMES) {
      await expect(root.getByRole('link', { name })).toHaveCount(1);
    }
  });

  test('clones are aria-hidden and inert', async ({ page }) => {
    const root = await marqueeReady(page, 'marquee-links');
    const clones = root.locator('[data-carousel-clone]');
    await expect(clones).toHaveCount(16);
    for (const clone of await clones.all()) {
      await expect(clone).toHaveAttribute('aria-hidden', 'true');
      expect(await clone.evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    }
  });

  test('Tab never lands inside a clone', async ({ page }) => {
    const root = await marqueeReady(page, 'marquee-links');
    await root.getByRole('link', { name: 'Acme' }).focus();
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      const inClone = await page.evaluate(
        () => document.activeElement?.closest('[data-carousel-clone]') !== null
      );
      expect(inClone).toBe(false);
    }
  });

  test('a focused marquee logo stays inside the viewport', async ({ page }) => {
    const root = await marqueeReady(page, 'marquee-links');
    await root.getByRole('link', { name: 'Acme' }).focus();
    for (let i = 0; i < 7; i++) await page.keyboard.press('Tab');
    const last = root.getByRole('link', { name: 'Wayne' });
    await expect(last).toBeFocused();
    const viewport = root.locator('[data-carousel-viewport]');
    await expect
      .poll(async () => {
        const [link, view] = await Promise.all([last.boundingBox(), viewport.boundingBox()]);
        if (!link || !view) return false;
        return link.x >= view.x - 1 && link.x + link.width <= view.x + view.width + 1;
      })
      .toBe(true);
    expect(await viewport.evaluate((el) => el.scrollLeft)).toBe(0);
  });
});

test.describe('marquee motion', () => {
  test('the marquee pauses on hover and focus', async ({ page }) => {
    await page.clock.install();
    await page.goto(PAGE_URL);
    const root = await marqueeReady(page, 'marquee');

    const start = await trackOffset(root);
    await page.clock.runFor(1000);
    const drifted = await trackOffset(root);
    expect(drifted).toBeLessThan(start);

    await root.locator('[data-carousel-viewport]').hover();
    await page.clock.runFor(1000);
    const hovered = await trackOffset(root);
    await page.clock.runFor(1000);
    expect(await trackOffset(root)).toBe(hovered);

    await page.mouse.move(0, 0);
    await root.locator('[data-carousel-pause]').focus();
    const focused = await trackOffset(root);
    await page.clock.runFor(1000);
    expect(await trackOffset(root)).toBe(focused);
  });
});

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('the marquee does not move with reduced motion', async ({ page }) => {
    await page.clock.install();
    await page.goto(PAGE_URL);
    const root = await marqueeReady(page, 'marquee');
    const before = await trackOffset(root);
    await page.clock.runFor(2000);
    expect(await trackOffset(root)).toBe(before);
  });

  test('arrows still move the marquee with reduced motion', async ({ page }) => {
    await page.goto(PAGE_URL);
    const root = await marqueeReady(page, 'marquee');
    const before = await trackOffset(root);
    await root.locator('[data-carousel-next]').click();
    await expect.poll(() => trackOffset(root)).not.toBe(before);
  });
});

test.describe('grayscale', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('grayscale logos start desaturated', async ({ page }) => {
    const first = section(page, 'grayscale').locator('[data-logo-cloud-logo]').first();
    expect(await filterOf(first)).toBe('grayscale(1)');
  });

  test('hovering one logo restores its colour only', async ({ page }) => {
    const logos = section(page, 'grayscale').locator('[data-logo-cloud-logo]');
    await logos.first().hover();
    expect(await filterOf(logos.first())).not.toContain('grayscale(1)');
    expect(await filterOf(logos.nth(1))).toBe('grayscale(1)');
  });

  test('focusing a linked logo restores its colour', async ({ page }) => {
    const link = section(page, 'grayscale').getByRole('link').first();
    await link.focus();
    expect(await filterOf(link)).not.toContain('grayscale(1)');
  });
});

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE_URL);
    });

    test('html carries the theme', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    });

    for (const name of SECTIONS) {
      test(`${name} shows its first logo`, async ({ page }) => {
        await expect(realLogos(section(page, name)).first()).toBeVisible();
      });
    }

    test('vector logos differ in colour from the page background', async ({ page }) => {
      const logo = section(page, 'basic').locator('svg').first();
      const colour = await logo.evaluate((el) => getComputedStyle(el).color);
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(colour).not.toBe(background);
    });
  });
}
