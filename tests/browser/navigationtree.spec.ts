import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/NavigationTree';

async function section(page: Page, name = 'default-config'): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator(`[data-doc-section="${name}"]`);
}

const itemControls = (root: Locator): Locator =>
  root.locator('[data-nav-item] > div > div > :is(a, button)');

test('defaultItemConfig class reaches every item', async ({ page }) => {
  const root = await section(page);
  const controls = itemControls(root);

  await expect(root.locator(`a[href="${PAGE_URL}"]`)).toHaveClass(/\btracking-wide\b/);
  for (const control of await controls.all()) {
    await expect(control).toHaveClass(/\btracking-wide\b/);
  }
});

test('activeItemConfig class reaches the active item', async ({ page }) => {
  const root = await section(page);

  await expect(root.locator(`a[href="${PAGE_URL}"]`)).toHaveClass(/\bunderline\b/);
});

test('defaultItemConfig icon renders on leaf items while parents keep the chevron', async ({
  page,
}) => {
  const root = await section(page);
  const parents = root.locator('[data-has-children="true"] > div > div > button');

  await expect(
    root.locator('a[href="/documentation/installation"] svg[data-icon="mdi:circle-small"]')
  ).toHaveCount(1);
  await expect(parents.first()).toBeAttached();
  for (const parent of await parents.all()) {
    await expect(parent.locator('svg[data-icon="mdi:chevron-right"]')).toHaveCount(1);
  }
});

test('activeItemConfig class overrides the active weight', async ({ page }) => {
  const overridden = (await section(page, 'active-weight')).locator(`a[href="${PAGE_URL}"]`);
  const fallback = page.locator(`[data-doc-section="default-config"] a[href="${PAGE_URL}"]`);

  await expect(overridden).toHaveCSS('font-weight', '400');
  await expect(fallback).toHaveCSS('font-weight', '600');
});

test('clicking a parent still toggles the expanded icon', async ({ page }) => {
  const root = await section(page);
  const parent = root.locator('[data-has-children="true"] > div > div > button').first();
  const icon = parent.locator('.nav-tree-icon');

  await expect(icon).toHaveClass(/\bnav-tree-icon-expanded\b/);
  await parent.click();
  await expect(icon).not.toHaveClass(/\bnav-tree-icon-expanded\b/);
  await parent.click();
  await expect(icon).toHaveClass(/\bnav-tree-icon-expanded\b/);
});

test('icon toggle mode expands only from the chevron and navigates from the label', async ({
  page,
}) => {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-doc-section="icon-toggle"]');
  const parentItem = root.locator('[data-has-children="true"]').first();
  const control = parentItem.locator('> div > div > a');
  const wasExpanded = await parentItem.getAttribute('data-expanded');

  await control.locator('svg').first().click();
  await expect(parentItem).not.toHaveAttribute('data-expanded', wasExpanded ?? '');
  await expect(page).toHaveURL(new RegExp(`${PAGE_URL}$`));

  await control.getByText('Documentation', { exact: true }).click();
  await expect(page).toHaveURL(/\/documentation\/?$/);
});

test('icon toggle mode rotates the chevron of the toggled parent', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-doc-section="icon-toggle"]');
  const parentItem = root.locator('[data-has-children="true"]').first();
  const icon = parentItem.locator('> div > div > a .nav-tree-icon');
  const wasExpanded = (await parentItem.getAttribute('data-expanded')) === 'true';
  const expandedClass = /\bnav-tree-icon-expanded\b/;

  await icon.click();
  if (wasExpanded) await expect(icon).not.toHaveClass(expandedClass);
  else await expect(icon).toHaveClass(expandedClass);

  await icon.click();
  if (wasExpanded) await expect(icon).toHaveClass(expandedClass);
  else await expect(icon).not.toHaveClass(expandedClass);
});
