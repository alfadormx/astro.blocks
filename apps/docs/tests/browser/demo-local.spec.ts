import { expect, test } from '@playwright/test';
import { contrastRatio } from './contrast';
import { localePaths } from './locales';

const prefixOf = (base: string) => (base === '/' ? '' : base);
const homeOf = (base: string) => `${prefixOf(base)}/demos/local`;
const ADDRESS = 'Calle del Pez 12';
const EVENT: Record<string, string> = {
  '/': 'launch-meetup',
  '/es': 'encuentro-de-lanzamiento',
};

for (const base of localePaths) {
  const home = homeOf(base);

  test(`${home} renders one h1 inside the local theme`, async ({ page }) => {
    await page.goto(home);
    await expect(page.locator('html')).toHaveAttribute('data-demo', 'local');
    await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
  });

  for (const href of [`${home}/events`, `${home}/events/${EVENT[base]}`]) {
    test(`${href} renders one h1 inside the local theme`, async ({ page }) => {
      await page.goto(href);
      await expect(page.locator('html')).toHaveAttribute('data-demo', 'local');
      await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
    });
  }

  test(`an event entry under ${home} marks Events as current`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${home}/events/${EVENT[base]}`);
    await expect(
      page.locator('[data-header] nav').first().locator('[aria-current="page"]')
    ).toHaveAttribute('href', `${home}/events`);
  });

  test(`${home} serves the address and LocalBusiness JSON-LD without JS`, async ({ request }) => {
    const html = await (await request.get(home)).text();
    expect(html).toContain(ADDRESS);
    const ld = JSON.parse(
      html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)![1]
    );
    expect(ld['@type']).toBe('CafeOrCoffeeShop');
    expect(ld.address.streetAddress).toBe(ADDRESS);
  });

  test(`desktop nav on ${home} scrolls to each section`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(home);
    await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
    for (const id of ['services', 'about', 'reviews', 'visit']) {
      await page.locator('[data-header] nav').first().locator(`a[href="${home}#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${home}#${id}$`));
      await expect(page.locator(`[data-headline]:has([id="${id}"])`)).toBeInViewport();
    }
  });

  test(`mobile menu on ${home} opens and reaches Visit`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(home);
    await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
    await page.locator('[data-modal-trigger="local-menu"]').click();
    const menu = page.locator('#local-menu');
    await expect(menu).toBeVisible();
    await menu.locator(`a[href="${home}#visit"]`).click();
    await expect(page).toHaveURL(new RegExp(`${home}#visit$`));
    await expect(menu).toBeHidden();
  });
}

test('the Visit map loads no tiles until scrolled into view', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  await page.goto('/demos/local');
  await page.waitForLoadState('load');
  expect(requested.filter((u) => /tile\.openstreetmap/.test(u))).toEqual([]);
  const map = page.locator('[data-map-config]');
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute('data-map-ready', '');
  expect(requested.some((u) => /tile\.openstreetmap/.test(u))).toBe(true);
});

for (const theme of ['light', 'dark'] as const) {
  test(`local text keeps contrast in ${theme}`, async ({ page }) => {
    await page.goto('/demos/local');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    for (const selector of [
      '[data-hero-copy] h1',
      '[data-headline] [data-subtitle]',
      '[data-testimonial] blockquote',
      'footer a',
    ]) {
      const targets = page.locator(selector);
      await expect(targets.first()).toBeAttached();
      for (const target of await targets.all()) {
        expect(await contrastRatio(target), selector).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
