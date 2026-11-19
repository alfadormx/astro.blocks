import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectFocusRing, primaryColour } from './focusRing';

const PAGE_URL = '/documentation/primitives/Input';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function field(page: Page, name: string): Promise<Locator> {
  const root = section(page, name).locator('[data-input]').first();
  await expect(root).toBeAttached();
  return root.locator('input');
}

test.describe('Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the label names the field', async ({ page }) => {
    await expect(await field(page, 'basic')).toHaveAccessibleName('Full name');
  });

  test('help text is the field description', async ({ page }) => {
    await expect(
      section(page, 'help').getByRole('textbox', { name: 'Email' })
    ).toHaveAccessibleDescription('We never share it.');
  });

  test('a hidden label still names the field', async ({ page }) => {
    const label = section(page, 'help').locator('label', { hasText: 'Search' });
    await expect(label).toHaveClass(/sr-only/);
    await expect(section(page, 'help').getByRole('textbox', { name: 'Search' })).toBeVisible();
  });

  test('a field without help has no description reference', async ({ page }) => {
    await expect(await field(page, 'basic')).not.toHaveAttribute('aria-describedby');
  });

  test('error text is announced and marks the field invalid', async ({ page }) => {
    const input = await field(page, 'error');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter a valid email address.');
  });

  test('a consumer aria-invalid is kept without error and overridden by error', async ({
    page,
  }) => {
    const root = section(page, 'consumer-aria');
    await expect(root.getByRole('textbox', { name: 'Valid' })).toHaveAttribute(
      'aria-invalid',
      'false'
    );
    await expect(root.getByRole('textbox', { name: 'With error' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  test('a consumer describedby id already generated appears once', async ({ page }) => {
    const input = section(page, 'consumer-aria').getByRole('textbox', {
      name: 'Duplicate reference',
    });
    await expect(input).toHaveAttribute(
      'aria-describedby',
      'doc-input-aria-dup-help doc-input-aria-note'
    );
  });

  test('disabled field rejects input', async ({ page }) => {
    const input = section(page, 'states').getByRole('textbox', { name: 'Disabled' });
    await expect(input).toBeDisabled();
    await input.click({ force: true });
    await page.keyboard.type('x');
    await expect(input).toHaveValue('Locked');
  });

  test('read-only field rejects input but stays focusable', async ({ page }) => {
    const input = section(page, 'states').getByRole('textbox', { name: 'Read-only' });
    await expect(input).toHaveAttribute('readonly', '');
    await input.focus();
    await expect(input).toBeFocused();
    await page.keyboard.type('x');
    await expect(input).toHaveValue('ORD-1234');
  });

  test('an email field reports a type mismatch for an incomplete address', async ({ page }) => {
    const input = await field(page, 'error');
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.typeMismatch)).toBe(true);
  });

  test('a pattern field reports mismatches and accepts a match', async ({ page }) => {
    const input = section(page, 'validation').getByRole('textbox', { name: 'Postcode' });
    await input.fill('12');
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
    await input.fill('1234AB');
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
  });

  test('a required field shows a hidden marker and keeps the label as its name', async ({
    page,
  }) => {
    const root = section(page, 'validation').locator('[data-input]').first();
    await expect(root.locator('[data-field-required]')).toHaveAttribute('aria-hidden', 'true');
    const input = root.locator('input');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).toHaveAccessibleName('Postcode');
  });

  test('Tab moves focus from one field to the next', async ({ page }) => {
    const root = section(page, 'types');
    await root.getByRole('textbox', { name: 'Text' }).focus();
    await page.keyboard.press('Tab');
    await expect(root.getByRole('textbox', { name: 'Email address' })).toBeFocused();
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
      const control = await field(page, 'basic');
      await control.focus();
      await expectFocusRing(control, await primaryColour(page));
    });
  });
}
