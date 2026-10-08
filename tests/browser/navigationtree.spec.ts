import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/NavigationTree';

async function section(page: Page): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator('[data-doc-section="default-config"]');
}

const itemControls = (root: Locator): Locator =>
  root.locator('[data-nav-item] > div > div > :is(a, button)');

test('defaultItemConfig class reaches non-active items', async ({ page }) => {
  const root = await section(page);
  const inactive = itemControls(root).and(page.locator(`:not([href="${PAGE_URL}"])`));

  await expect(inactive.first()).toBeAttached();
  for (const control of await inactive.all()) {
    await expect(control).toHaveClass(/\btracking-wide\b/);
  }
});

test('defaultActiveItemConfig class reaches the active item', async ({ page }) => {
  const root = await section(page);

  await expect(root.locator(`a[href="${PAGE_URL}"]`)).toHaveClass(/\bunderline\b/);
});

test('defaultItemConfig icon renders on leaf items while parents keep the chevron', async ({
  page,
}) => {
  const root = await section(page);

  await expect(root.locator('a[href="/documentation/installation"] svg')).toHaveCount(1);
  await expect(
    root.locator('[data-has-children="true"] > div > div > button .nav-tree-icon').first()
  ).toBeAttached();
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
