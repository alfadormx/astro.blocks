import { expect, test, type Page } from '@playwright/test';
import { contrastRatio } from './contrast';

const cardLinks = (page: Page) => page.locator('[data-collection-list] a[data-entry-card-link]');
const toggleLink = (page: Page, code: string) =>
  page.locator(`[data-language-toggle] a[lang="${code}"]`);

test.describe('blog demo', () => {
  test('lists posts in English and Spanish', async ({ page }) => {
    await page.goto('/demos/blog');
    await expect(cardLinks(page).first()).toBeVisible();
    await page.goto('/es/demos/blog');
    await expect(page.getByRole('link', { name: 'Hola, mundo', exact: true })).toBeVisible();
  });

  test('leaves an untranslated post out of the Spanish list', async ({ page, request }) => {
    await page.goto('/es/demos/blog');
    await expect(page.getByRole('link', { name: 'An English-only post' })).toHaveCount(0);
    expect((await request.get('/es/demos/blog/third-post')).status()).toBe(404);
  });

  test('makes each card one tab stop named by its title, and Enter follows it', async ({
    page,
  }) => {
    await page.goto('/es/demos/blog');
    const links = cardLinks(page);
    await expect(links).toHaveCount(2);
    const first = links.first();
    await first.focus();
    await expect(first).toHaveAccessibleName(
      (await first.locator('xpath=ancestor::h3').textContent())!.trim()
    );
    await page.keyboard.press('Tab');
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    const href = (await first.getAttribute('href'))!;
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test('switches language to the translated slug', async ({ page }) => {
    await page.goto('/demos/blog/hello-world');
    await expect(toggleLink(page, 'es')).toHaveAttribute('href', '/es/demos/blog/hola-mundo');
    await toggleLink(page, 'es').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Hola, mundo' })).toBeVisible();
  });

  test('sends a missing translation to the other language list', async ({ page }) => {
    await page.goto('/demos/blog/third-post');
    await expect(toggleLink(page, 'es')).toHaveAttribute('href', '/es/demos/blog');
  });

  test('switches a later list page to page 1 where the other language has fewer pages', async ({
    page,
  }) => {
    await page.goto('/demos/blog/page/2');
    await expect(toggleLink(page, 'es')).toHaveAttribute('href', '/es/demos/blog');
  });

  test('pages the list from /page/2 and never serves /page/1', async ({ page, request }) => {
    await page.goto('/demos/blog');
    const pager = page.locator('[data-collection-pager]');
    await expect(pager.getByRole('link')).toHaveText([/Next/]);
    await pager.getByRole('link', { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/demos\/blog\/page\/2$/);
    await expect(pager).toContainText('Page 2 of 2');
    await expect(pager.getByRole('link')).toHaveText([/Previous/]);
    expect((await request.get('/demos/blog/page/1')).status()).toBe(404);
  });
});

test.describe('case study demo', () => {
  test('lists case studies in both languages', async ({ page }) => {
    await page.goto('/demos/work');
    await expect(cardLinks(page)).toHaveCount(3);
    await page.goto('/es/demos/work');
    await expect(cardLinks(page)).toHaveCount(2);
  });

  test('shows a map only on the entry with coordinates', async ({ page }) => {
    await page.goto('/demos/work/ring-configurator');
    await expect(page.locator('[data-entry-map]')).toHaveCount(1);
    await expect(page.locator('[data-case-study-results] dd')).toHaveCount(3);
    await page.goto('/demos/work/docs-site');
    await expect(page.locator('[data-entry-map]')).toHaveCount(0);
  });
});

test.describe('event demo', () => {
  test('lists upcoming events first, then past ones with a badge', async ({ page }) => {
    await page.goto('/demos/events');
    await expect(cardLinks(page)).toHaveText([
      'Collections launch meetup',
      'Blocks workshop in New York',
      'Accessibility webinar',
      'Autumn documentation sprint',
    ]);
    const badges = page.locator('[data-entry-card]').locator('[data-entry-card-badge]');
    await expect(badges).toHaveText(['Past', 'Past']);
  });

  test('shows New York times in the event zone', async ({ page }) => {
    await page.goto('/demos/events');
    await expect(
      page
        .locator('[data-entry-card]', { hasText: 'New York' })
        .locator('[data-entry-card-eyebrow]')
    ).toContainText(/E[DS]T/);
  });

  test('links the Register button to the registration URL', async ({ page }) => {
    await page.goto('/demos/events/launch-meetup');
    await expect(page.locator('[data-entry-register] a')).toHaveAttribute(
      'href',
      'https://example.com/register/launch'
    );
    await expect(page.locator('[data-entry-register] a')).toHaveAccessibleName('Register');
  });

  test('localises the Register label', async ({ page }) => {
    await page.goto('/es/demos/events/encuentro-de-lanzamiento');
    await expect(page.locator('[data-entry-register] a')).toHaveAccessibleName('Inscribirse');
  });
});

const BODY_PARTS = {
  text: '[data-entry-body] > p',
  link: '[data-entry-body] a',
  blockquote: '[data-entry-body] blockquote p',
  code: '[data-entry-body] code',
  heading: '[data-entry-body] h2',
  meta: '[data-entry-layout] header time',
};

const EXTRA_PARTS: Record<string, [string, string]> = {
  'case study result label': ['/demos/work/ring-configurator', '[data-case-study-results] dt'],
  'event location': ['/demos/events/launch-meetup', '[data-entry-location]'],
  'pager status': ['/demos/blog', '[data-collection-pager-status]'],
  'past badge': ['/demos/events', '[data-entry-card-badge]'],
};

const CARD_PARTS = {
  excerpt: '[data-entry-card] p:not([data-entry-card-eyebrow])',
  eyebrow: '[data-entry-card-eyebrow]',
  tag: '[data-entry-card-tags] li',
  readMore: '[data-entry-card] span[aria-hidden]',
};

for (const theme of ['light', 'dark']) {
  test.describe(`contrast in the ${theme} theme`, () => {
    const setTheme = (page: Page) =>
      page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);

    for (const [part, selector] of Object.entries(BODY_PARTS)) {
      test(`post body ${part} reaches 4.5:1`, async ({ page }) => {
        await page.goto('/demos/blog/hello-world');
        await setTheme(page);
        expect(await contrastRatio(page.locator(selector).first())).toBeGreaterThanOrEqual(4.5);
      });
    }

    for (const [part, [href, selector]] of Object.entries(EXTRA_PARTS)) {
      test(`${part} reaches 4.5:1`, async ({ page }) => {
        await page.goto(href);
        await setTheme(page);
        expect(await contrastRatio(page.locator(selector).first())).toBeGreaterThanOrEqual(4.5);
      });
    }

    for (const [part, selector] of Object.entries(CARD_PARTS)) {
      test(`card ${part} reaches 4.5:1`, async ({ page }) => {
        await page.goto('/demos/blog');
        await setTheme(page);
        expect(await contrastRatio(page.locator(selector).first())).toBeGreaterThanOrEqual(4.5);
      });
    }
  });
}

test.describe('demo links', () => {
  for (const [home, prefix] of [
    ['/', ''],
    ['/es', '/es'],
  ]) {
    test(`the ${home} home page links every demo in its language`, async ({ page, request }) => {
      await page.goto(home);
      const hrefs = await page
        .locator('a[href*="/demos/"]')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      expect(hrefs).toEqual([
        `${prefix}/demos/blog`,
        `${prefix}/demos/work`,
        `${prefix}/demos/events`,
        `${prefix}/demos/jewellery-configurator`,
      ]);
      for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
    });
  }

  test('the demo header links between the demos in the page language', async ({ page }) => {
    await page.goto('/es/demos/work');
    const nav = page.locator('header nav').first();
    await expect(nav.getByRole('link')).toHaveText([
      'Inicio',
      'Blog',
      'Trabajos',
      'Eventos',
      'Configurador',
    ]);
    await expect(nav.getByRole('link', { name: 'Eventos' })).toHaveAttribute(
      'href',
      '/es/demos/events'
    );
    await expect(page.getByRole('heading', { level: 1, name: 'Trabajos' })).toBeVisible();
  });
});

test.describe('cover images', () => {
  for (const [href, selector] of [
    ['/demos/work', '[data-entry-card] img'],
    ['/demos/work/ring-configurator', '[data-entry-layout] img'],
  ]) {
    test(`crop to 16:9 on ${href}, whatever the source ratio`, async ({ page }) => {
      await page.goto(href);
      const box = (await page.locator(selector).first().boundingBox())!;
      expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    });
  }
});
