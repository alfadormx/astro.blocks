import { expect, test } from '@playwright/test';

test.describe('PostLayout docs', () => {
  test.beforeEach(async ({ page }) => page.goto('/documentation/composite/PostLayout'));

  test('renders the meta line and the Markdown body', async ({ page }) => {
    const section = page.locator('[data-doc-section="basic"]');
    await expect(section.locator('time').first()).toHaveAttribute('datetime', /2026-10-01/);
    await expect(section.locator('[data-entry-body] li')).toHaveCount(2);
    await expect(section.getByRole('list', { name: 'Tags' })).toBeVisible();
  });

  test('bodyClass cancels the reading width', async ({ page }) => {
    const width = (name: string) =>
      page
        .locator(`[data-doc-section="${name}"] [data-entry-body]`)
        .evaluate((el) => getComputedStyle(el).maxWidth);
    expect(await width('body-class')).toBe('none');
    expect(await width('basic')).not.toBe('none');
  });
});
