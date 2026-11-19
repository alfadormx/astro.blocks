import { expect, test } from '@playwright/test';

test.describe('CollectionList docs', () => {
  test.beforeEach(async ({ page }) => page.goto('/documentation/composite/CollectionList'));

  test('renders one card link per entry', async ({ page }) => {
    await expect(page.locator('[data-doc-section="grid"] [data-entry-card-link]')).toHaveCount(3);
  });

  test('stacks the list orientation in one column', async ({ page }) => {
    const cards = page.locator('[data-doc-section="list"] [data-entry-card]');
    const [a, b] = await Promise.all([cards.nth(0).boundingBox(), cards.nth(1).boundingBox()]);
    expect(b!.y).toBeGreaterThan(a!.y + a!.height - 1);
  });

  test('applies the shared card config', async ({ page }) => {
    await expect(page.locator('[data-doc-section="shared-config"]')).toContainText(
      'Continue reading'
    );
  });

  test('labels the pager and orders previous before next', async ({ page }) => {
    const pager = page.getByRole('navigation', { name: 'Pagination' });
    await expect(pager.getByRole('link')).toHaveText([/Previous/, /Next/]);
    await expect(pager).toContainText('Page 2 of 3');
  });

  test('picks each card from its preset in a mixed list', async ({ page }) => {
    const eyebrows = page.locator('[data-doc-section="mixed"] [data-entry-card-eyebrow]');
    await expect(eyebrows.nth(1)).toHaveText('Example Jewellers');
    await expect(eyebrows.nth(2)).toContainText('2030');
  });
});
