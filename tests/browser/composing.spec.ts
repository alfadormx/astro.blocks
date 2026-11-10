import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/Composing';

const section = (page: Page, name: string) => page.locator(`[data-doc-section="${name}"]`);

async function tabsIn(page: Page, name: string): Promise<Locator> {
  await page.goto(PAGE_URL);
  const root = section(page, name).locator('[data-tabs-root]');
  await expect(root.locator('[role="tab"]').first()).toBeAttached();
  return root;
}

const trigger = (root: Locator, index: number, state: 'active' | 'inactive') =>
  root.locator(`[data-tab-index="${index}"] [data-tab-button="${state}"] [role="tab"]`);

test('an optional child renders only when its prop is set', async ({ page }) => {
  await page.goto(PAGE_URL);
  const presence = section(page, 'presence');
  await expect(
    presence.locator('[data-doc-example="no-actions"] a, [data-doc-example="no-actions"] button')
  ).toHaveCount(0);
  await expect(
    presence.locator('[data-doc-example="with-actions"]').getByText('Get started')
  ).toBeVisible();
});

test('false hides a child that renders by default', async ({ page }) => {
  await page.goto(PAGE_URL);
  const carousel = section(page, 'presence').locator('[data-doc-example="no-arrows"]');
  await expect(carousel.locator('[data-carousel]')).toBeAttached();
  await expect(carousel.locator('[data-carousel-prev], [data-carousel-next]')).toHaveCount(0);
});

test('the state layer styles only the active tab', async ({ page }) => {
  const root = await tabsIn(page, 'layers');
  await expect(trigger(root, 0, 'active')).toHaveClass(/\bbg-primary\b/);
  for (const i of [0, 1, 2])
    await expect(trigger(root, i, 'inactive')).not.toHaveClass(/\bbg-primary\b/);
});

test("an item's own class applies in every state", async ({ page }) => {
  const root = await tabsIn(page, 'order');
  await expect(trigger(root, 1, 'inactive')).toHaveClass(/\bunderline\b/);
  await expect(trigger(root, 1, 'active')).toHaveClass(/\bunderline\b/);
  await expect(trigger(root, 0, 'active')).not.toHaveClass(/\bunderline\b/);
});

test('a same-group class cancels the default', async ({ page }) => {
  await page.goto(PAGE_URL);
  const card = section(page, 'classes').locator('[class*="bg-elevated"]');
  await expect(card).toHaveClass(/\bshadow-none\b/);
  await expect(card).toHaveClass(/\brounded-none\b/);
  await expect(card).not.toHaveClass(/\bshadow-xl\b/);
  await expect(card).not.toHaveClass(/\brounded-md\b/);
});
