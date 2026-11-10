import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectFocusRing, primaryColour } from './focusRing';

const PAGE_URL = '/documentation/primitives/Select';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function field(page: Page, name: string): Promise<Locator> {
  const root = section(page, name).locator('[data-select]').first();
  await expect(root).toBeAttached();
  return root.locator('select');
}

test.describe('Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the label names the select', async ({ page }) => {
    await field(page, 'basic');
    await expect(section(page, 'basic').getByRole('combobox', { name: 'Country' })).toBeVisible();
  });

  test('help text is the select description', async ({ page }) => {
    await expect(
      section(page, 'help').getByRole('combobox', { name: 'Delivery country' })
    ).toHaveAccessibleDescription('We ship to these countries only.');
  });

  test('Tab reaches the select and a choice changes its value', async ({ page }) => {
    const root = section(page, 'help');
    await root.getByRole('combobox', { name: 'Delivery country' }).focus();
    await page.keyboard.press('Tab');
    const select = root.getByRole('combobox', { name: 'Language' });
    await expect(select).toBeFocused();
    await select.selectOption('de');
    await expect(select).toHaveValue('de');
  });

  test('the placeholder is disabled and selected while no option is', async ({ page }) => {
    const select = await field(page, 'placeholder');
    const placeholder = select.locator('option[value=""]');
    await expect(placeholder).toHaveAttribute('disabled', '');
    await expect(select).toHaveValue('');
    await expect(placeholder).toHaveText('Choose a country');
  });

  test('a required select with a placeholder is invalid until a choice is made', async ({
    page,
  }) => {
    const select = await field(page, 'required');
    const valueMissing = () => select.evaluate((el: HTMLSelectElement) => el.validity.valueMissing);
    expect(await valueMissing()).toBe(true);
    await select.selectOption('nl');
    expect(await valueMissing()).toBe(false);
  });

  test('a disabled option cannot be selected', async ({ page }) => {
    const select = section(page, 'states').getByRole('combobox', {
      name: 'With a disabled option',
    });
    await expect(select.locator('option[value="express"]')).toBeDisabled();
    await expect(select.selectOption('express', { timeout: 1000 })).rejects.toThrow();
    await expect(select).toHaveValue('standard');
  });

  test('a disabled select is disabled', async ({ page }) => {
    await expect(
      section(page, 'states').getByRole('combobox', { name: 'Disabled', exact: true })
    ).toBeDisabled();
  });

  test('error text is announced and marks the select invalid', async ({ page }) => {
    const select = await field(page, 'error');
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription('Choose the country you live in.');
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
      const root = section(page, 'help');
      await root.getByRole('combobox', { name: 'Delivery country' }).focus();
      await page.keyboard.press('Tab');
      const control = root.getByRole('combobox', { name: 'Language' });
      await expect(control).toBeFocused();
      await expectFocusRing(control, await primaryColour(page));
    });

    test('the native dropdown follows the theme', async ({ page }) => {
      const control = await field(page, 'basic');
      await expect(control).toHaveCSS('color-scheme', colorScheme === 'dark' ? 'dark' : 'normal');
    });
  });
}
