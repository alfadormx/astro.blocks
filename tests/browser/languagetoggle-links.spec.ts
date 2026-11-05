import { expect, test } from '@playwright/test';
import { locales, localePaths } from './locales';

const TOGGLE_DOC_PAGES = [
  '/documentation/composite/Footer',
  '/documentation/primitives/LanguageToggle',
];

for (const href of [...localePaths, ...TOGGLE_DOC_PAGES]) {
  test(`every language toggle link on ${href} resolves`, async ({ page, request }) => {
    await page.goto(href);
    const links = await page
      .locator('[data-language-toggle] a[href]')
      .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')!))]);

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect((await request.get(link)).status(), link).toBe(200);
    }
  });
}

for (const lang of locales) {
  test(`${lang.basePath} sets html lang and dir from the ${lang.code} config`, async ({ page }) => {
    await page.goto(lang.basePath);
    await expect(page.locator('html')).toHaveAttribute('lang', lang.code);
    await expect(page.locator('html')).toHaveAttribute('dir', lang.direction);
  });
}
