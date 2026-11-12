import { expect, test } from '@playwright/test';
import { contrastRatio } from './contrast';
import { localePaths } from './locales';

const prefixOf = (base: string) => (base === '/' ? '' : base);
const ENTRY: Record<string, string> = {
  '/': 'ring-configurator',
  '/es': 'configurador-de-anillos',
};

const pagesFor = (base: string) => {
  const home = `${prefixOf(base)}/demos/portfolio`;
  return [home, `${home}/about`, `${home}/contact`, `${home}/work`, `${home}/work/${ENTRY[base]}`];
};

for (const base of localePaths) {
  for (const href of pagesFor(base)) {
    test(`${href} renders one h1 inside the portfolio theme`, async ({ page }) => {
      await page.goto(href);
      await expect(page.locator('html')).toHaveAttribute('data-demo', 'portfolio');
      await expect.poll(() => page.evaluate(() => document.querySelectorAll('h1').length)).toBe(1);
    });
  }

  test(`desktop nav on ${prefixOf(base)}/demos/portfolio reaches every section and marks it current`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const [home, about, contact, work] = pagesFor(base);
    await page.goto(home);
    for (const target of [work, about, contact]) {
      await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
      await page.locator('[data-header] nav').first().locator(`a[href="${target}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(
        page.locator('[data-header] nav').first().locator('[aria-current="page"]')
      ).toHaveAttribute('href', target);
    }
  });

  test(`mobile menu on ${prefixOf(base)}/demos/portfolio opens, navigates and is closed on the new page`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const [home, about] = pagesFor(base);
    await page.goto(home);
    await expect(page.locator('[data-header]').first()).toHaveAttribute('data-header-ready', '');
    await expect(page.locator('[data-header] nav').first()).toBeHidden();
    await page.locator('[data-modal-trigger="portfolio-menu"]').click();
    const menu = page.locator('#portfolio-menu');
    await expect(menu).toBeVisible();
    await menu.locator(`a[href="${about}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${about}$`));
    await expect(page.locator('#portfolio-menu')).toBeHidden();
  });
}

test('an entry page marks Work as the current section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/demos/portfolio/work/ring-configurator');
  await expect(
    page.locator('[data-header] nav').first().locator('[aria-current="page"]')
  ).toHaveAttribute('href', '/demos/portfolio/work');
});

test('the home page features three case studies, each linking to its entry', async ({ page }) => {
  await page.goto('/demos/portfolio');
  const links = page.locator('a[href^="/demos/portfolio/work/"]');
  await expect(links).toHaveCount(3);
  for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) {
    expect((await page.request.get(href)).status(), href).toBe(200);
  }
});

test('the case gallery is operable from the keyboard', async ({ page }) => {
  await page.goto('/demos/portfolio/work/ring-configurator');
  const gallery = page.getByRole('region', { name: 'Project gallery' });
  const announcer = gallery.locator('[data-carousel-announcer]');
  await expect(announcer).toHaveText(/^Slide 1 of \d+$/);
  const total = Number((await announcer.textContent())!.match(/of (\d+)/)![1]);

  await gallery.locator('[data-carousel-next]').focus();
  await page.keyboard.press('Enter');
  await expect(announcer).toHaveText(`Slide 2 of ${total}`);
  await expect(gallery.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Shift+Tab');
  await expect(gallery.locator('[data-carousel-prev]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(announcer).toHaveText(`Slide 1 of ${total}`);

  await gallery.getByRole('tab').nth(2).focus();
  await page.keyboard.press('Space');
  await expect(announcer).toHaveText(`Slide 3 of ${total}`);
});

test('the contact form fields are labelled', async ({ page }) => {
  await page.goto('/demos/portfolio/contact');
  const form = page.locator('form[data-contact-form]');
  for (const name of ['Name', 'Email', 'Company']) {
    await expect(form.getByRole('textbox', { name, exact: false })).toBeVisible();
  }
  await expect(form.getByRole('textbox', { name: 'Tell us about the project' })).toBeVisible();
});

for (const theme of ['light', 'dark'] as const) {
  test(`portfolio text keeps contrast in ${theme}`, async ({ page }) => {
    await page.goto('/demos/portfolio');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    for (const selector of [
      '[data-hero-copy] h1',
      '[data-headline] [data-subtitle]',
      '[data-testimonial] blockquote',
      '[data-hero-copy] a[href$="/work"]',
    ]) {
      const targets = page.locator(selector);
      await expect(targets.first()).toBeAttached();
      for (const target of await targets.all()) {
        expect(await contrastRatio(target), selector).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
