import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectFocusRing } from './focusRing';

const PAGE_URL = '/documentation/composite/Hero';
const SECTIONS = ['centered', 'background-video', 'split-right', 'split-left'] as const;
const SPLIT_SECTIONS = ['split-right', 'split-left'] as const;

function section(page: Page, name: (typeof SECTIONS)[number]): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

function backgroundOf(page: Page, className: string): Promise<string> {
  return page.evaluate((cls) => {
    const probe = document.createElement('div');
    probe.className = cls;
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, className);
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
}

test.describe('rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  for (const name of SECTIONS) {
    test(`${name} shows its headline and both actions`, async ({ page }) => {
      const copy = section(page, name).locator('[data-hero-copy]');
      await expect(copy.locator('[data-headline] h2')).toBeVisible();
      await expect(copy.locator(':is(a, button)')).toHaveCount(2);
    });
  }

  test('centered renders no media', async ({ page }) => {
    await expect(section(page, 'centered').locator('[data-hero-media], video, img')).toHaveCount(0);
  });

  test('background-video renders the video behind an overlay', async ({ page }) => {
    const hero = section(page, 'background-video');
    await expect(hero.locator('video[aria-hidden="true"]')).toHaveCount(1);
    await expect(hero.locator('.bg-base\\/60')).toHaveCount(1);
  });

  test('split-right puts the media right of the copy', async ({ page }) => {
    const hero = section(page, 'split-right');
    const copy = await box(hero.locator('[data-hero-copy]'));
    const media = await box(hero.locator('[data-hero-media]'));
    expect(media.x).toBeGreaterThan(copy.x);
  });

  test('split-left puts the media left of the copy', async ({ page }) => {
    const hero = section(page, 'split-left');
    const copy = await box(hero.locator('[data-hero-copy]'));
    const media = await box(hero.locator('[data-hero-media]'));
    expect(media.x).toBeLessThan(copy.x);
  });
});

test.describe('at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const name of SPLIT_SECTIONS) {
    test(`${name} stacks the copy above the media`, async ({ page }) => {
      await page.goto(PAGE_URL);
      const hero = section(page, name);
      const copy = await box(hero.locator('[data-hero-copy]'));
      const media = await box(hero.locator('[data-hero-media]'));
      expect(copy.y + copy.height).toBeLessThanOrEqual(media.y + 1);
    });
  }
});

test.describe('keyboard', () => {
  test('Tab reaches each centered action in order with a focus ring', async ({ page }) => {
    await page.goto(PAGE_URL);
    const actions = section(page, 'centered').locator('[data-hero-copy] :is(a, button)');
    const secondaryRing = await backgroundOf(page, 'bg-secondary');

    await actions.first().focus();
    await expect(actions.first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(actions.nth(1)).toBeFocused();
    await expectFocusRing(actions.nth(1), secondaryRing);
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
      test(`${name} shows headline, actions and media`, async ({ page }) => {
        const hero = section(page, name);
        await expect(hero.locator('[data-hero-copy] [data-headline]')).toBeVisible();
        await expect(hero.locator('[data-hero-copy] :is(a, button)').first()).toBeVisible();
        if (name === 'background-video') await expect(hero.locator('.bg-base\\/60')).toBeVisible();
        if (name.startsWith('split')) await expect(hero.locator('[data-hero-media]')).toBeVisible();
      });
    }
  });
}
