import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Footer';

test('languageToggleConfig.defaultButtonConfig reaches the toggle buttons', async ({ page }) => {
  await page.goto(PAGE_URL);
  const buttons = page.locator('[data-doc-section="language-toggle"] .language-toggle-container a');

  await expect(buttons.first()).toBeAttached();
  for (const button of await buttons.all()) {
    await expect(button).toHaveCSS('border-top-width', '2px');
    await expect(button).toHaveClass(/\bpx-3\b/);
  }
});
