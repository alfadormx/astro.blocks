import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/NavigationTreeHorizontal';

async function section(page: Page, name: string): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator(`[data-doc-section="${name}"]`);
}

test('defaultItemConfig iconPosition left renders the chevron before the label', async ({
  page,
}) => {
  const parent = (await section(page, 'icon-left')).locator('[data-nav-parent]').first();

  expect(await parent.evaluate((el) => el.firstElementChild?.tagName.toLowerCase())).toBe('svg');
});

test('default parents render the chevron after the label', async ({ page }) => {
  const parent = (await section(page, 'click')).locator('[data-nav-parent]').first();

  expect(await parent.evaluate((el) => el.lastElementChild?.tagName.toLowerCase())).toBe('svg');
});

test('click trigger opens and closes the dropdown', async ({ page }) => {
  const root = await section(page, 'click');
  const dropdown = root.locator('[data-nav-dropdown]').first();

  await expect(dropdown).toBeHidden();
  await root.locator('[data-nav-parent]').first().click();
  // Move away so the hover rule can't be what keeps the dropdown open.
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dropdown).toBeHidden();
});

test('hover trigger ignores clicks so the dropdown closes when the pointer leaves', async ({
  page,
}) => {
  const root = await section(page, 'icon-left');
  const dropdown = root.locator('[data-nav-dropdown]').first();

  await root.locator('[data-nav-parent]').first().click();
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeHidden();
});

test('a display utility in dropdownClass does not open the dropdown', async ({ page }) => {
  const root = await section(page, 'dropdown-class');
  const dropdown = root.locator('[data-nav-dropdown]').first();

  await expect(dropdown).toBeHidden();
  await root.locator('[data-nav-parent]').first().click();
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dropdown).toBeHidden();
});

test('parents keep the chevron over defaultItemConfig.icon', async ({ page }) => {
  const root = await section(page, 'default-icon');
  const parents = root.locator('[data-nav-parent]');

  await expect(parents).toHaveCount(2);
  for (const parent of await parents.all()) {
    await expect(parent.locator('svg[data-icon="heroicons:chevron-down"]')).toHaveCount(1);
  }
  const leaf = root.locator('[data-nav-item]').first().locator('a, button').first();
  await expect(leaf.locator('svg[data-icon="mdi:circle-small"]')).toHaveCount(1);
});

test('iconName swaps the parent chevron', async ({ page }) => {
  const parent = (await section(page, 'icon-name')).locator('[data-nav-parent]').first();

  await expect(parent.locator('svg[data-icon="heroicons:chevron-double-down"]')).toHaveCount(1);
});

test('hover trigger opens the dropdown on keyboard focus and Tab reaches its children', async ({
  page,
}) => {
  const root = await section(page, 'icon-left');
  const parent = root.getByRole('button', { name: 'Products' });
  const dropdown = root.locator('[data-nav-dropdown]').first();

  await parent.focus();
  await expect(dropdown).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(root.getByRole('link', { name: 'Product 1' })).toBeFocused();
});

test('click trigger keeps a closed dropdown closed under hover', async ({ page }) => {
  const root = await section(page, 'click');
  const parentItem = root.locator('[data-nav-item]:has([data-nav-parent])').first();
  const dropdown = parentItem.locator('[data-nav-dropdown]');

  await parentItem.locator('[data-nav-parent]').click();
  await expect(dropdown).toBeVisible();
  await page.keyboard.press('Escape');
  await parentItem.hover();
  await expect(dropdown).toBeHidden();
});

test('click trigger closes the dropdown on an outside click', async ({ page }) => {
  const root = await section(page, 'click');
  const dropdown = root.locator('[data-nav-dropdown]').first();

  await root.locator('[data-nav-parent]').first().click();
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeVisible();
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await expect(dropdown).toBeHidden();
});

test('a hover-mode parent click closes an open click-mode dropdown', async ({ page }) => {
  const click = await section(page, 'click');
  const dropdown = click.locator('[data-nav-dropdown]').first();

  await click.locator('[data-nav-parent]').first().click();
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeVisible();
  await page.locator('[data-doc-section="icon-left"] [data-nav-parent]').first().click();
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeHidden();
});
