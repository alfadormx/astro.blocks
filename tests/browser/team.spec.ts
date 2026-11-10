import { expect, test, type Locator, type Page } from '@playwright/test';
import { emphasisColour, expectFocusRing } from './focusRing';

const PAGE_URL = '/documentation/composite/Team';
const SECTIONS = [
  'basic',
  'square',
  'two-columns',
  'four-columns',
  'headline',
  'link-defaults',
] as const;

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function radiusAndWidth(img: Locator): Promise<{ radius: number; width: number }> {
  return img.evaluate((el) => ({
    radius: parseFloat(getComputedStyle(el).borderTopLeftRadius),
    width: el.getBoundingClientRect().width,
  }));
}

test.describe('rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('each member name is an h3', async ({ page }) => {
    const names = section(page, 'basic').getByRole('heading', { level: 3 });
    await expect(names).toHaveCount(3);
    await expect(names.first()).toHaveText('Ana Ruiz');
  });

  test('links are named after the person', async ({ page }) => {
    const root = section(page, 'basic');
    await expect(root.getByRole('link', { name: 'Ana on LinkedIn' })).toBeVisible();
    await expect(root.getByRole('link', { name: 'Ana on GitHub' })).toBeVisible();
  });

  test('photos are decorative', async ({ page }) => {
    const images = section(page, 'basic').locator('img');
    await expect(images).toHaveCount(3);
    for (const img of await images.all()) await expect(img).toHaveAttribute('alt', '');
  });

  test('circle photos are round', async ({ page }) => {
    const { radius, width } = await radiusAndWidth(section(page, 'basic').locator('img').first());
    expect(radius).toBeGreaterThanOrEqual(width / 2);
  });

  test('square photos keep corners', async ({ page }) => {
    const { radius, width } = await radiusAndWidth(section(page, 'square').locator('img').first());
    expect(radius).toBeGreaterThan(0);
    expect(radius).toBeLessThan(width / 2);
  });

  test('the headline is an h2', async ({ page }) => {
    await expect(
      section(page, 'headline').getByRole('heading', {
        level: 2,
        name: 'The people behind the product',
      })
    ).toBeVisible();
  });

  test('defaultActionConfig restyles every link', async ({ page }) => {
    const links = section(page, 'link-defaults').getByRole('link');
    await expect(links).toHaveCount(6);
    for (const link of await links.all()) await expect(link).toHaveCSS('border-top-width', '2px');
  });
});

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('Tab moves through the links in order', async ({ page }) => {
    const links = section(page, 'basic').getByRole('link');
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    for (let i = 1; i < 6; i++) {
      await page.keyboard.press('Tab');
      await expect(links.nth(i)).toBeFocused();
    }
  });

  test('a focused link shows the emphasis focus ring', async ({ page }) => {
    const link = section(page, 'basic').getByRole('link').first();
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expectFocusRing(link, await emphasisColour(page));
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
      test(`${name} shows its first member`, async ({ page }) => {
        await expect(section(page, name).getByRole('heading', { level: 3 }).first()).toBeVisible();
      });
    }
  });
}
