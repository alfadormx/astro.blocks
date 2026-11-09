import { expect, test, type Locator, type Page } from '@playwright/test';
import { emphasisColour, expectFocusRing } from './focusRing';

const PAGE_URL = '/documentation/primitives/Accordion';
const SECTIONS = ['basic', 'single', 'default-open', 'slotted'] as const;

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

function items(page: Page, name: string): Locator {
  return section(page, name).locator('[data-accordion-item]');
}

test.describe('rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('basic renders every item closed with a title and an icon', async ({ page }) => {
    const all = items(page, 'basic');
    await expect(all).toHaveCount(3);
    for (const item of await all.all()) {
      await expect(item).not.toHaveAttribute('open');
      await expect(item.locator('[data-accordion-summary] svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    }
    await expect(all.first().locator('[data-accordion-summary]')).toContainText(
      'How long does shipping take?'
    );
  });

  test('an item id lands on its details element', async ({ page }) => {
    await expect(items(page, 'basic').first()).toHaveAttribute('id', 'shipping');
  });

  test('clicking a summary opens and closes its item and shows the content', async ({ page }) => {
    const item = items(page, 'basic').first();
    await item.locator('[data-accordion-summary]').click();
    await expect(item).toHaveAttribute('open', '');
    await expect(item.locator('[data-accordion-content]')).toBeVisible();
    await item.locator('[data-accordion-summary]').click();
    await expect(item).not.toHaveAttribute('open');
  });

  test('multiple items stay open together', async ({ page }) => {
    const [first, second] = [items(page, 'basic').nth(0), items(page, 'basic').nth(1)];
    await first.locator('[data-accordion-summary]').click();
    await second.locator('[data-accordion-summary]').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(second).toHaveAttribute('open', '');
  });

  test('multiple mode emits no name attribute', async ({ page }) => {
    for (const item of await items(page, 'basic').all()) {
      await expect(item).not.toHaveAttribute('name');
    }
  });

  test('defaultOpen items start open', async ({ page }) => {
    const all = items(page, 'default-open');
    await expect(all.nth(0)).toHaveAttribute('open', '');
    await expect(all.nth(1)).not.toHaveAttribute('open');
    await expect(all.nth(2)).toHaveAttribute('open', '');
  });

  test('a slotted answer replaces the item content', async ({ page }) => {
    const item = items(page, 'slotted').first();
    await item.locator('[data-accordion-summary]').click();
    await expect(item.locator('[data-accordion-content] li')).toHaveCount(2);
  });
});

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  for (const key of ['Enter', 'Space'] as const) {
    test(`${key} toggles a focused summary`, async ({ page }) => {
      const item = items(page, 'basic').first();
      await item.locator('[data-accordion-summary]').focus();
      await page.keyboard.press(key);
      await expect(item).toHaveAttribute('open', '');
      await page.keyboard.press(key);
      await expect(item).not.toHaveAttribute('open');
    });
  }

  test('Tab moves to the next summary with a neutral focus ring', async ({ page }) => {
    const summaries = section(page, 'basic').locator('[data-accordion-summary]');
    await summaries.first().focus();
    await page.keyboard.press('Tab');
    await expect(summaries.nth(1)).toBeFocused();
    await expectFocusRing(summaries.nth(1), await emphasisColour(page));
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('click toggles an item', async ({ page }) => {
    const item = items(page, 'basic').first();
    await item.locator('[data-accordion-summary]').click();
    await expect(item).toHaveAttribute('open', '');
  });

  for (const key of ['Enter', 'Space'] as const) {
    test(`${key} toggles a focused summary`, async ({ page }) => {
      const item = items(page, 'basic').nth(1);
      await item.locator('[data-accordion-summary]').focus();
      await page.keyboard.press(key);
      await expect(item).toHaveAttribute('open', '');
    });
  }
});

for (const javaScriptEnabled of [true, false]) {
  test.describe(`single mode with JavaScript ${javaScriptEnabled ? 'on' : 'off'}`, () => {
    test.use({ javaScriptEnabled });

    test('opening one item closes the open one', async ({ page }) => {
      await page.goto(PAGE_URL);
      const [first, second] = [items(page, 'single').nth(0), items(page, 'single').nth(1)];
      await first.locator('[data-accordion-summary]').click();
      await expect(first).toHaveAttribute('open', '');
      await second.locator('[data-accordion-summary]').click();
      await expect(second).toHaveAttribute('open', '');
      await expect(first).not.toHaveAttribute('open');
    });

    test('all single-mode items share one non-empty name', async ({ page }) => {
      await page.goto(PAGE_URL);
      const names = await items(page, 'single').evaluateAll((els) =>
        els.map((el) => el.getAttribute('name'))
      );
      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });
  });
}

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
      test(`${name} shows its titles and icons`, async ({ page }) => {
        const summary = section(page, name).locator('[data-accordion-summary]').first();
        await expect(summary).toBeVisible();
        await expect(summary.locator('svg')).toBeVisible();
      });
    }
  });
}
