import { expect, test, type Locator, type Page } from '@playwright/test';
import { expectFocusRing, primaryColour, tokenColour } from './focusRing';

const PAGE_URL = '/documentation/primitives/CheckboxGroup';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function group(page: Page, name: string): Promise<Locator> {
  const root = section(page, name).locator('[data-checkbox-group]').first();
  await expect(root).toBeAttached();
  return root;
}

test.describe('CheckboxGroup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the legend names the group', async ({ page }) => {
    await group(page, 'basic');
    await expect(section(page, 'basic').getByRole('group', { name: 'Interests' })).toBeVisible();
  });

  test('help text is the group description', async ({ page }) => {
    await expect(
      section(page, 'help').getByRole('group', { name: 'Notifications' })
    ).toHaveAccessibleDescription('Pick every channel you want updates on.');
  });

  test('error text is part of the group description', async ({ page }) => {
    const root = await group(page, 'error');
    await expect(root).toHaveAccessibleDescription(
      'Pick at least one. Choose one or more interests.'
    );
    await expect(root).toHaveAttribute('aria-invalid', 'true');
  });

  test('Tab visits each option in order', async ({ page }) => {
    const boxes = (await group(page, 'basic')).getByRole('checkbox');
    await boxes.nth(0).focus();
    await page.keyboard.press('Tab');
    await expect(boxes.nth(1)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(boxes.nth(2)).toBeFocused();
  });

  test('every option shares the group name and derives its id from the group', async ({ page }) => {
    const root = await group(page, 'basic');
    const groupId = await root.getAttribute('id');
    const boxes = root.getByRole('checkbox');
    await expect(boxes).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(boxes.nth(i)).toHaveAttribute('name', 'interests');
      await expect(boxes.nth(i)).toHaveAttribute('id', `${groupId}-${i}`);
    }
  });

  test('the option layer applies its intent to every option', async ({ page }) => {
    const root = await group(page, 'custom');
    const success = await tokenColour(page, 'bg-success');
    const boxes = root.getByRole('checkbox');
    await boxes.nth(1).check();
    for (let i = 0; i < 2; i++) {
      await expect(boxes.nth(i)).toHaveCSS('background-color', success);
    }
  });

  test('a disabled group disables every option', async ({ page }) => {
    const boxes = (await group(page, 'disabled')).getByRole('checkbox');
    await expect(boxes).toHaveCount(3);
    for (let i = 0; i < 3; i++) await expect(boxes.nth(i)).toBeDisabled();
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
      const boxes = (await group(page, 'basic')).getByRole('checkbox');
      await boxes.nth(0).focus();
      await page.keyboard.press('Tab');
      await expect(boxes.nth(1)).toBeFocused();
      await expectFocusRing(boxes.nth(1), await primaryColour(page));
    });
  });
}
