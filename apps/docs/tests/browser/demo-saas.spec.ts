import { expect, test, type Page } from '@playwright/test';
import { contrastRatio } from './contrast';
import { localePaths } from './locales';

const ANCHORS = ['features', 'pricing', 'testimonials', 'faq'];

const prefixOf = (base: string) => (base === '/' ? '' : base);
const landingPages = localePaths.map((base) => `${prefixOf(base)}/demos/saas`);
const saasPages = [
  ...landingPages,
  '/demos/saas/blog',
  '/es/demos/saas/blog',
  '/demos/saas/blog/hello-world',
  '/es/demos/saas/blog/hola-mundo',
];

async function expectBelowHeader(page: Page, id: string) {
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect
    .poll(async () => {
      const headerBottom = await page
        .locator('[data-header]')
        .first()
        .evaluate((h) => h.getBoundingClientRect().bottom);
      const anchorTop = await page
        .locator(`a#${id}`)
        .evaluate((a) => a.getBoundingClientRect().top);
      return anchorTop >= headerBottom - 1;
    })
    .toBe(true);
}

for (const href of saasPages) {
  test(`${href} renders one h1 inside the saas theme`, async ({ page }) => {
    await page.goto(href);
    await expect(page.locator('html')).toHaveAttribute('data-demo', 'saas');
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });
}

for (const href of landingPages) {
  test(`${href} has every section anchor`, async ({ page }) => {
    await page.goto(href);
    for (const id of ANCHORS) {
      await expect(page.locator(`[data-headline] a#${id}`)).toHaveCount(1);
    }
  });
}

test('the billing toggle switches to yearly prices', async ({ page }) => {
  await page.goto('/demos/saas');
  const pricing = page.locator('[data-pricing]');
  await expect(pricing).toHaveAttribute('data-pricing-ready', '');
  await expect(pricing.locator('[data-toggle-group]')).toHaveAttribute(
    'data-toggle-group-ready',
    ''
  );
  await expect(pricing.locator('[data-billing=monthly]').first()).toBeVisible();
  await pricing.locator('[data-pricing-toggle] label', { hasText: 'Yearly' }).click();
  await expect(pricing.locator('[data-billing=yearly]').first()).toBeVisible();
  await expect(pricing.locator('[data-billing=monthly]').first()).toBeHidden();
});

for (const theme of ['light', 'dark'] as const) {
  test(`themed sections keep text contrast in ${theme}`, async ({ page }) => {
    await page.goto('/demos/saas');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    for (const selector of [
      '[data-hero-copy] h1',
      '[data-headline] [data-subtitle]',
      '[data-pricing-tier] [data-price-amount]',
      '[data-testimonial] blockquote',
    ]) {
      const targets = page.locator(selector);
      await expect(targets.first()).toBeAttached();
      for (const target of await targets.all()) {
        expect(await contrastRatio(target), selector).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}

for (const base of localePaths) {
  test(`desktop nav on ${prefixOf(base)}/demos/saas lands each section below the header`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${prefixOf(base)}/demos/saas`);
    await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
    const nav = page.locator('[data-header] nav').first();
    for (const id of ANCHORS) {
      await nav.locator(`a[href$="#${id}"]`).click();
      await expectBelowHeader(page, id);
    }
  });

  test(`mobile menu on ${prefixOf(base)}/demos/saas closes and lands each section below the header`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${prefixOf(base)}/demos/saas`);
    await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
    await expect(page.locator('[data-header] nav').first()).toBeHidden();
    const menu = page.locator('#saas-menu');
    for (const id of ANCHORS) {
      await page.locator('[data-modal-trigger="saas-menu"]').click();
      await expect(menu).toBeVisible();
      await menu.locator(`a[href$="#${id}"]`).click();
      await expect(menu).toBeHidden();
      await expectBelowHeader(page, id);
    }
  });
}

test('the Blog nav link opens the blog list and its section links return to the landing page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/es/demos/saas');
  const nav = page.locator('[data-header] nav').first();
  await nav.getByRole('link', { name: 'Blog' }).click();
  await expect(page).toHaveURL(/\/es\/demos\/saas\/blog$/);
  await page.locator('[data-header] nav').first().locator('a[href$="#pricing"]').click();
  await expect(page).toHaveURL(/\/es\/demos\/saas#pricing$/);
});

const headerNav = (page: Page) => page.locator('[data-header] nav[data-nav-trigger]');

for (const base of localePaths) {
  const blog = `${prefixOf(base)}/demos/saas/blog`;

  test(`header nav marks Blog as the current page on ${blog}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(blog);
    const current = headerNav(page).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('href', blog);
    await expect(page.locator('#saas-menu [aria-current="page"]')).toHaveAttribute('href', blog);
  });

  test(`header nav marks no section anchor as current on ${prefixOf(base)}/demos/saas`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${prefixOf(base)}/demos/saas`);
    await expect(headerNav(page).locator('a').first()).toBeAttached();
    await expect(headerNav(page).locator('[aria-current]')).toHaveCount(0);
  });
}
