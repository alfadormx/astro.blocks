import { expect, test } from '@playwright/test';
import { emphasisColour, expectFocusRing } from './focusRing';

const PAGE_URL = '/documentation/primitives/Button';

test('spread config children never reach the DOM', async ({ page }) => {
  await page.goto(PAGE_URL);
  const control = page.locator('[data-doc-section="children"] :is(a, button)');

  await expect(control).toHaveCount(1);
  await expect(control).not.toHaveAttribute('children');
});

test('a focused neutral nav item shows the emphasis ring', async ({ page }) => {
  await page.goto('/documentation/composite/NavigationTreeHorizontal');
  const item = page.locator('[data-doc-section="click"] [data-nav-parent]').first();

  await item.focus();
  await expectFocusRing(item, await emphasisColour(page));
});

test('a focused neutral tab trigger shows the emphasis ring', async ({ page }) => {
  await page.goto('/documentation/composite/Tabs');
  const tab = page
    .locator('[data-doc-section="horizontal"]')
    .getByRole('tab', { selected: false })
    .first();

  await tab.focus();
  await expectFocusRing(tab, await emphasisColour(page));
});
