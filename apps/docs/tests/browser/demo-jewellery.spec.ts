import { expect, test } from '@playwright/test';
import { contrastRatio } from './contrast';
import { localePaths } from './locales';

const prefixOf = (base: string) => (base === '/' ? '' : base);

const pagesFor = (base: string) => {
  const home = `${prefixOf(base)}/demos/jewellery`;
  return [home, `${home}/configurator`, `${home}/collections`, `${home}/about`, `${home}/contact`];
};

for (const base of localePaths) {
  for (const href of pagesFor(base)) {
    test(`${href} renders one h1 inside the jewellery theme`, async ({ page }) => {
      await page.goto(href);
      await expect(page.locator('html')).toHaveAttribute('data-demo', 'jewellery');
      await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
    });
  }

  test(`desktop nav on ${prefixOf(base)}/demos/jewellery reaches every page and marks it current`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const [home, ...targets] = pagesFor(base);
    await page.goto(home);
    for (const target of targets) {
      await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
      await page.locator(`[data-header] nav a[href="${target}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.locator('[data-header] nav [aria-current="page"]')).toHaveAttribute(
        'href',
        target
      );
    }
  });

  test(`mobile menu on ${prefixOf(base)}/demos/jewellery opens, navigates and is closed on the new page`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const [home, , collections] = pagesFor(base);
    await page.goto(home);
    await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
    await expect(page.locator('[data-header] nav').first()).toBeHidden();
    await page.locator('[data-modal-trigger="jewellery-menu"]').click();
    const menu = page.locator('#jewellery-menu');
    await expect(menu).toBeVisible();
    await menu.locator(`a[href="${collections}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${collections}$`));
    await expect(page.locator('#jewellery-menu')).toBeHidden();
  });
}

test('collections tabs switch panels and a ring card opens its design', async ({ page }) => {
  await page.goto('/demos/jewellery/collections');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  const panels = page.locator('[data-tab-panel]');
  await expect(panels.nth(1)).toBeHidden();
  await tabs.nth(1).click();
  await expect(panels.nth(1)).toBeVisible();
  await expect(panels.nth(0)).toBeHidden();

  await tabs.nth(0).click();
  await panels.nth(0).getByRole('link', { name: 'Design this ring' }).nth(1).click();
  await expect(page.locator('html')).toHaveAttribute('data-url-state-ready', '');
  await expect(page).toHaveURL(
    /\/demos\/jewellery\/configurator\?code=RING01-bold-large-rose-vvs1--$/
  );
  for (const [group, code] of [
    ['ring-model', 'bold'],
    ['ring-carat', 'large'],
    ['ring-color', 'rose'],
    ['ring-clarity', 'vvs1'],
  ]) {
    await expect(
      page.locator(`[data-selection-group="${group}"] [data-option-code="${code}"]`)
    ).toHaveAttribute('aria-checked', 'true');
  }
});

test('necklace and earring cards carry no design link', async ({ page }) => {
  await page.goto('/demos/jewellery/collections');
  const panels = page.locator('[data-tab-panel]');
  await expect(panels.nth(0).locator('a')).toHaveCount(3);
  await expect(panels.nth(1).locator('a')).toHaveCount(0);
  await expect(panels.nth(2).locator('a')).toHaveCount(0);
});

test('the contact form fields are labelled', async ({ page }) => {
  await page.goto('/demos/jewellery/contact');
  const form = page.locator('form[data-contact-form]');
  for (const name of ['Name', 'Email', 'What is it about?', 'Message']) {
    await expect(form.getByRole('textbox', { name, exact: false })).toBeVisible();
  }
});

test('the store map loads its tiles once scrolled into view', async ({ page }) => {
  await page.goto('/demos/jewellery/contact');
  const map = page.locator('[data-map-config]');
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute('data-map-ready', '');
});

for (const theme of ['light', 'dark'] as const) {
  test(`jewellery text keeps contrast in ${theme}`, async ({ page }) => {
    await page.goto('/demos/jewellery');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    for (const selector of [
      '[data-hero-copy] h1',
      '[data-headline] [data-subtitle]',
      '[data-testimonial] blockquote',
      '[data-header] nav a',
    ]) {
      const targets = page.locator(selector);
      await expect(targets.first()).toBeAttached();
      for (const target of await targets.all()) {
        expect(await contrastRatio(target), selector).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test(`jewellery configurator text keeps contrast in ${theme}`, async ({ page }) => {
    await page.goto('/demos/jewellery/configurator');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    for (const selector of ['[data-configurator-summary]', '[role="tab"]']) {
      const targets = page.locator(selector);
      await expect(targets.first()).toBeAttached();
      for (const target of await targets.all()) {
        expect(await contrastRatio(target), selector).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
