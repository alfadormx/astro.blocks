import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectFocusRing, primaryColour } from './focusRing';

const PAGE_URL = '/documentation/primitives/Checkbox';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function box(page: Page, name: string): Promise<Locator> {
  const root = section(page, name).locator('[data-checkbox]').first();
  await expect(root).toBeAttached();
  return root.locator('input[type="checkbox"]');
}

test.describe('Checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the label names the checkbox', async ({ page }) => {
    await box(page, 'basic');
    await expect(
      section(page, 'basic').getByRole('checkbox', { name: 'Subscribe to the newsletter' })
    ).toBeVisible();
  });

  test('help text is the checkbox description', async ({ page }) => {
    await expect(
      section(page, 'help').getByRole('checkbox', { name: 'Gift wrap' })
    ).toHaveAccessibleDescription('Adds a card with your message.');
  });

  test('Space toggles the checkbox', async ({ page }) => {
    const input = await box(page, 'basic');
    await input.focus();
    await page.keyboard.press('Space');
    await expect(input).toBeChecked();
    await page.keyboard.press('Space');
    await expect(input).not.toBeChecked();
  });

  test('clicking the label toggles the checkbox', async ({ page }) => {
    const input = await box(page, 'basic');
    await section(page, 'basic').locator('label').click();
    await expect(input).toBeChecked();
  });

  test('the check mark shows only while checked', async ({ page }) => {
    const input = await box(page, 'basic');
    const mark = section(page, 'basic').locator('[data-checkbox-mark]');
    await expect(mark).not.toBeVisible();
    await input.check();
    await expect(mark).toBeVisible();
    await expect(section(page, 'checked').locator('[data-checkbox-mark]')).toBeVisible();
  });

  test('error text is announced and marks the checkbox invalid', async ({ page }) => {
    const input = await box(page, 'error');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Read them before ordering. Accept the terms to continue.'
    );
  });

  test('a required checkbox shows a hidden marker and is natively required', async ({ page }) => {
    const input = await box(page, 'required');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).toHaveAccessibleName('I accept the terms and conditions');
    await expect(section(page, 'required').locator('[data-field-required]')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  test('a disabled checkbox cannot be toggled', async ({ page }) => {
    const input = section(page, 'states').getByRole('checkbox', { name: 'Disabled', exact: true });
    await expect(input).toBeDisabled();
    await input.click({ force: true });
    await expect(input).not.toBeChecked();
  });
});

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE_URL);
    });

    test('html carries the theme', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    });

    test('keyboard focus shows the primary ring', async ({ page }) => {
      const control = await box(page, 'help');
      await (await box(page, 'basic')).focus();
      await page.keyboard.press('Tab');
      await expect(control).toBeFocused();
      await expectFocusRing(control, await primaryColour(page));
    });

    test('the check mark is visible on a checked box', async ({ page }) => {
      await expect(section(page, 'checked').locator('[data-checkbox-mark]')).toBeVisible();
    });
  });
}
