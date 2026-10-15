import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/Button';

test('spread config children never reach the DOM', async ({ page }) => {
  await page.goto(PAGE_URL);
  const control = page.locator('[data-doc-section="children"] :is(a, button)');

  await expect(control).toHaveCount(1);
  await expect(control).not.toHaveAttribute('children');
});
