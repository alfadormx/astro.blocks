import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/NavigationTree';

async function section(page: Page, name = 'default-config'): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator(`[data-doc-section="${name}"]`);
}

const itemControls = (root: Locator): Locator =>
  root.locator('[data-navigation-tree] :is(a, button, summary)');

const NOT_ROTATED = 'none';

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
  const parents = root.locator('[data-nav-toggle]');

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

test('clicking a parent collapses and expands its children and rotates its icon', async ({
  page,
}) => {
  const root = await section(page);
  const details = root.locator('[data-nav-details]').first();
  const parent = details.locator('> [data-nav-toggle]');
  const children = details.locator('> [data-nav-children]');
  const icon = parent.locator('svg');

  await expect(details).toHaveAttribute('open', '');
  await expect(children).toBeVisible();
  await expect(icon).not.toHaveCSS('transform', NOT_ROTATED);

  await parent.click();
  await expect(details).not.toHaveAttribute('open');
  await expect(children).toBeHidden();
  await expect(icon).toHaveCSS('transform', NOT_ROTATED);

  await parent.click();
  await expect(details).toHaveAttribute('open', '');
  await expect(children).toBeVisible();
});

test('a collapsed parent keeps its icon unrotated while its ancestor is open', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-doc-section="toggleable"]');
  const closedChild = root
    .locator('[data-nav-details][open] [data-nav-details]:not([open])')
    .first();

  await expect(closedChild).toBeAttached();
  await expect(closedChild.locator('> [data-nav-toggle] svg')).toHaveCSS('transform', NOT_ROTATED);
});

for (const key of ['Enter', 'Space'] as const) {
  test(`${key} toggles a focused parent`, async ({ page }) => {
    const root = await section(page);
    const details = root.locator('[data-nav-details]').first();

    await details.locator('> [data-nav-toggle]').focus();
    await page.keyboard.press(key);
    await expect(details).not.toHaveAttribute('open');
    await page.keyboard.press(key);
    await expect(details).toHaveAttribute('open', '');
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('clicking a parent toggles its children', async ({ page }) => {
    const root = await section(page);
    const details = root.locator('[data-nav-details]').first();

    await details.locator('> [data-nav-toggle]').click();
    await expect(details).not.toHaveAttribute('open');
    await expect(details.locator('> [data-nav-children]')).toBeHidden();
  });
});

test('icon toggle mode expands only from the chevron and navigates from the label', async ({
  page,
}) => {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-doc-section="icon-toggle"]');
  const parentItem = root.locator('[data-has-children="true"]').first();
  const control = parentItem.locator('> div > [data-nav-icon-toggle]');
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
  const icon = parentItem.locator('> div > [data-nav-icon-toggle] .nav-tree-icon');
  const wasExpanded = (await parentItem.getAttribute('data-expanded')) === 'true';
  const expandedClass = /\bnav-tree-icon-expanded\b/;

  await icon.click();
  if (wasExpanded) await expect(icon).not.toHaveClass(expandedClass);
  else await expect(icon).toHaveClass(expandedClass);

  await icon.click();
  if (wasExpanded) await expect(icon).toHaveClass(expandedClass);
  else await expect(icon).not.toHaveClass(expandedClass);
});

test('current path detection expands the parent of the page and labels the active link after it', async ({
  page,
}) => {
  const root = await section(page, 'current-path');
  const active = root.locator(`a[href="${PAGE_URL}"]`);

  await expect(active).toBeVisible();
  await expect(active).toHaveText('NavigationTree');
  await expect(root.locator('[data-nav-details]:has(a[href="' + PAGE_URL + '"])')).toHaveAttribute(
    'open',
    ''
  );
});
