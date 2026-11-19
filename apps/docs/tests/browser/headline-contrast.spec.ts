import { expect, test } from '@playwright/test';
import { contrastRatio } from './contrast';

const PAGE_URL = '/documentation/primitives/Headline';

test.describe('Headline subtitle contrast compliance', () => {
  const themes = [
    { mode: 'light', label: 'light theme' },
    { mode: 'dark', label: 'dark theme' },
  ];

  themes.forEach(({ mode, label }) => {
    test.describe(`${label}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ colorScheme: mode as 'light' | 'dark' });
        await page.goto(PAGE_URL);
        await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
      });

      test('default-styled Headline subtitles reach 4.5:1 contrast', async ({ page }) => {
        // Get all Headlines with subtitles (examples 1-5 have default styling)
        const headlines = await page.locator('[data-headline]').all();

        expect(headlines.length).toBeGreaterThanOrEqual(5);

        let checked = 0;

        // Test only the first 5 examples which use default styling
        for (let i = 0; i < 5; i++) {
          const headline = headlines[i];
          const subtitle = headline.locator('[data-subtitle]');
          const count = await subtitle.count();

          if (count > 0) {
            const text = await subtitle.first().textContent();
            if (text && text.trim()) {
              const ratio = await contrastRatio(subtitle.first());
              expect(ratio, `Example ${i + 1}: ${text}`).toBeGreaterThanOrEqual(4.5);
              checked++;
            }
          }
        }

        expect(checked).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
