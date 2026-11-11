import { expect, test } from '@playwright/test';

test.describe('EventCard docs', () => {
  test.beforeEach(async ({ page }) => page.goto('/documentation/composite/EventCard'));

  test('shows the badge only on the past event', async ({ page }) => {
    await expect(page.locator('[data-doc-section="upcoming"] [data-entry-card-badge]')).toHaveCount(
      0
    );
    await expect(page.locator('[data-doc-section="past"] [data-entry-card-badge]')).toHaveText(
      'Past'
    );
  });

  test('shows the time in the event zone', async ({ page }) => {
    await expect(
      page.locator('[data-doc-section="upcoming"] [data-entry-card-eyebrow]')
    ).toContainText('EDT');
  });
});

test.describe('EventLayout docs', () => {
  test.beforeEach(async ({ page }) => page.goto('/documentation/composite/EventLayout'));

  test('renders the Register button and the map', async ({ page }) => {
    const section = page.locator('[data-doc-section="register"]');
    await expect(section.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      'https://example.com/register/launch'
    );
    await expect(section.locator('[data-entry-map]')).toHaveCount(1);
  });

  test('registerButton: false hides the button', async ({ page }) => {
    await expect(
      page.locator('[data-doc-section="no-register"] [data-entry-register]')
    ).toHaveCount(0);
  });
});
