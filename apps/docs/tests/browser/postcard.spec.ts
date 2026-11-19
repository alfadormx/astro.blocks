import { expect, test } from '@playwright/test';

test.describe('PostCard docs', () => {
  test.beforeEach(async ({ page }) => page.goto('/documentation/composite/PostCard'));

  test('the card has one link, named by the title', async ({ page }) => {
    const section = page.locator('[data-doc-section="basic"]');
    await expect(section.getByRole('link')).toHaveCount(1);
    await expect(section.getByRole('link')).toHaveAccessibleName('Writing in two languages');
    await expect(section.getByRole('heading', { level: 3 })).toHaveText('Writing in two languages');
  });

  test('shows the Spanish date and read-more text for langCode es', async ({ page }) => {
    const section = page.locator('[data-doc-section="language"]');
    await expect(section.locator('[data-entry-card-eyebrow]')).toContainText(/oct/i);
    await expect(section).toContainText('Leer más');
  });

  test('hides the reading time when false', async ({ page }) => {
    await expect(
      page.locator('[data-doc-section="no-cover"] [data-entry-card-eyebrow]')
    ).not.toContainText('min');
  });
});
