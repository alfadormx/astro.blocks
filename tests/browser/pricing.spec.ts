import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Pricing';
const SECTIONS = [
  'single',
  'three-tiers',
  'four-tiers',
  'billing-toggle',
  'mixed-tiers',
  'localized',
  'no-toggle',
] as const;

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
}

async function ready(pricing: Locator): Promise<void> {
  await expect(pricing.locator('[data-pricing]')).toHaveAttribute('data-pricing-ready', '');
  await expect(pricing.locator('[data-toggle-group]')).toHaveAttribute(
    'data-toggle-group-ready',
    ''
  );
}

function option(pricing: Locator, label: string): Locator {
  return pricing.locator('[data-pricing-toggle] label', { hasText: label });
}

test.describe('rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('tier name renders as h3 under an h2 headline', async ({ page }) => {
    const pricing = section(page, 'single');
    await expect(pricing.locator('[data-headline] h2')).toHaveText('Plans for every team');
    await expect(pricing.locator('[data-pricing-tier] h3')).toHaveText('Starter');
  });

  test('numeric price renders as formatted currency with its period', async ({ page }) => {
    const price = section(page, 'single').locator('[data-pricing-price]');
    await expect(price).toContainText('$9');
    await expect(price).toContainText('/month');
  });

  test('included and excluded features carry their hook', async ({ page }) => {
    const tier = section(page, 'single').locator('[data-pricing-tier]');
    await expect(tier.locator('[data-feature-included="true"]')).toHaveCount(2);
    await expect(tier.locator('[data-feature-included="false"]')).toHaveCount(1);
  });

  test('an excluded feature reads "Not included" to assistive tech', async ({ page }) => {
    const excluded = section(page, 'single').locator('li[data-feature-included="false"]');
    await expect(excluded.locator('.sr-only')).toHaveText('Not included:');
  });

  test('feature icons are hidden from assistive tech', async ({ page }) => {
    const icons = section(page, 'single').locator('[data-pricing-tier] li svg');
    await expect(icons).toHaveCount(3);
    for (const icon of await icons.all()) await expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('the action renders as a full-width link', async ({ page }) => {
    const tier = section(page, 'single').locator('[data-pricing-tier]');
    const action = tier.getByRole('link', { name: 'Start free trial' });
    await expect(action).toBeVisible();
    expect((await box(action)).width).toBeGreaterThan((await box(tier)).width * 0.7);
  });

  test('the highlighted tier carries its hook, a solid action and the badge', async ({ page }) => {
    const pricing = section(page, 'three-tiers');
    await expect(pricing.locator('[data-highlighted]')).toHaveCount(1);
    const badge = pricing.locator('[data-highlighted] [data-pricing-badge]');
    await expect(badge).toHaveText('Most popular');
    await expect(badge).toBeVisible();
  });
});

test.describe('layout at desktop width', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('three tiers sit side by side in author order', async ({ page }) => {
    await page.goto(PAGE_URL);
    const tiers = section(page, 'three-tiers').locator('[data-pricing-tier]');
    const [starter, pro, enterprise] = await Promise.all([0, 1, 2].map((i) => box(tiers.nth(i))));
    expect(pro.y).toBeCloseTo(starter.y, 0);
    expect(enterprise.y).toBeCloseTo(starter.y, 0);
    expect(starter.x).toBeLessThan(pro.x);
    expect(pro.x).toBeLessThan(enterprise.x);
  });

  test('four tiers wrap into at least two columns', async ({ page }) => {
    await page.goto(PAGE_URL);
    const tiers = section(page, 'four-tiers').locator('[data-pricing-tier]');
    const [first, second] = await Promise.all([0, 1].map((i) => box(tiers.nth(i))));
    expect(second.y).toBeCloseTo(first.y, 0);
    expect(first.x).toBeLessThan(second.x);
  });
});

test.describe('layout at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function tiersByY(pricing: Locator) {
    const tiers = await pricing.locator('[data-pricing-tier]').all();
    const boxes = await Promise.all(
      tiers.map(async (tier) => ({
        box: await box(tier),
        highlighted: (await tier.getAttribute('data-highlighted')) !== null,
      }))
    );
    return boxes.sort((a, b) => a.box.y - b.box.y);
  }

  test('three tiers stack one per row', async ({ page }) => {
    await page.goto(PAGE_URL);
    const tiers = await tiersByY(section(page, 'three-tiers'));
    for (let i = 1; i < tiers.length; i++) {
      const previous = tiers[i - 1].box;
      expect(tiers[i].box.y).toBeGreaterThanOrEqual(previous.y + previous.height);
    }
  });

  test('the highlighted tier comes first', async ({ page }) => {
    await page.goto(PAGE_URL);
    const tiers = await tiersByY(section(page, 'three-tiers'));
    expect(tiers[0].highlighted).toBe(true);
  });
});

test.describe('billing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('monthly prices show on load and the announcer is empty', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await ready(pricing);
    for (const span of await pricing.locator('[data-billing="monthly"]').all()) {
      await expect(span).toBeVisible();
    }
    for (const span of await pricing.locator('[data-billing="yearly"]').all()) {
      await expect(span).toBeHidden();
    }
    await expect(pricing.locator('[data-pricing-announcer]')).toHaveText('');
  });

  test("choosing Yearly swaps every tier's price and period", async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await ready(pricing);
    await option(pricing, 'Yearly').click();
    const yearly = pricing.locator('[data-billing="yearly"]');
    await expect(yearly).toHaveCount(3);
    for (const span of await yearly.all()) await expect(span).toBeVisible();
    for (const span of await pricing.locator('[data-billing="monthly"]').all()) {
      await expect(span).toBeHidden();
    }
    await expect(yearly.nth(1)).toContainText('$290');
    await expect(yearly.nth(1)).toContainText('/year');
  });

  test('choosing Yearly announces once', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await ready(pricing);
    const announcer = pricing.locator('[data-pricing-announcer]');
    await option(pricing, 'Yearly').click();
    await expect(announcer).toHaveText('Showing yearly prices');
    await option(pricing, 'Monthly').click();
    await expect(announcer).toHaveText('Showing monthly prices');
  });

  test('a tier without a yearly price keeps its price in both states', async ({ page }) => {
    const pricing = section(page, 'mixed-tiers');
    await ready(pricing);
    const free = pricing.locator('[data-pricing-tier]', {
      has: page.getByRole('heading', { name: 'Free', exact: true }),
    });
    await expect(free.locator('[data-pricing-price]')).toContainText('$0');
    await option(pricing, 'Yearly').click();
    await expect(free.locator('[data-pricing-price]')).toContainText('$0');
    await expect(free.locator('[data-price-amount]')).toBeVisible();
  });

  test('toggleGroup false renders no toggle and shows monthly prices', async ({ page }) => {
    const pricing = section(page, 'no-toggle');
    await expect(pricing.locator('[data-pricing-toggle]')).toHaveCount(0);
    await expect(pricing.locator('[data-pricing-announcer]')).toHaveCount(0);
    await expect(pricing.locator('[data-billing="yearly"]')).toHaveCount(0);
    await expect(pricing.locator('[data-pricing-price]').nth(1)).toContainText('$29');
    await expect(pricing.locator('[data-pricing-price]').nth(1)).not.toContainText('$290');
  });

  test('a radio valued yearly inside a tier does not swap prices', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await ready(pricing);
    await pricing
      .locator('[data-pricing-tier]')
      .first()
      .evaluate((tier) => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.value = 'yearly';
        input.checked = true;
        tier.append(input);
      });
    await expect(pricing.locator('[data-billing="monthly"]').first()).toBeVisible();
  });

  test('localized labels render on the options', async ({ page }) => {
    const pricing = section(page, 'localized');
    await expect(option(pricing, 'Mensual')).toHaveCount(1);
    await expect(option(pricing, 'Anual')).toHaveCount(1);
    await expect(pricing.locator('[data-billing="monthly"]').first()).toContainText('/mes');
  });
});

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('ArrowRight from Monthly selects Yearly and swaps prices', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await ready(pricing);
    await pricing.locator('[data-pricing-toggle] input[value="monthly"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(pricing.locator('[data-pricing-toggle] input[value="yearly"]')).toBeChecked();
    await expect(pricing.locator('[data-billing="yearly"]').first()).toBeVisible();
    await expect(pricing.locator('[data-billing="monthly"]').first()).toBeHidden();
  });

  test('the toggle is a single tab stop', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await ready(pricing);
    await pricing.locator('[data-pricing-toggle] input[value="monthly"]').focus();
    await page.keyboard.press('Tab');
    await expect(pricing.locator('[data-pricing-tier]').first().getByRole('link')).toBeFocused();
  });
});

test.describe('without JS', () => {
  test.use({ javaScriptEnabled: false });

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('monthly prices show on load', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await expect(pricing.locator('[data-billing="monthly"]').first()).toBeVisible();
    await expect(pricing.locator('[data-billing="yearly"]').first()).toBeHidden();
  });

  test('choosing Yearly still swaps prices', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await option(pricing, 'Yearly').click();
    await expect(pricing.locator('[data-billing="yearly"]').first()).toBeVisible();
    await expect(pricing.locator('[data-billing="monthly"]').first()).toBeHidden();
  });

  test('the announcer stays empty', async ({ page }) => {
    const pricing = section(page, 'billing-toggle');
    await option(pricing, 'Yearly').click();
    await expect(pricing.locator('[data-pricing-announcer]')).toHaveText('');
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
      test(`${name} shows its first tier and action`, async ({ page }) => {
        const tier = section(page, name).locator('[data-pricing-tier]').first();
        await expect(tier).toBeVisible();
        await expect(tier.locator('a, button').last()).toBeVisible();
      });
    }
  });
}
