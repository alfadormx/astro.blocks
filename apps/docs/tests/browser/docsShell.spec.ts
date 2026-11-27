import { expect, test } from '@playwright/test';

const BUTTON = '/documentation/primitives/Button';

test('the sidebar holds every section and marks only the current page', async ({ page }) => {
  await page.goto(BUTTON);
  await expect(page.locator('[data-header] nav')).toHaveCount(0);

  const sidebar = page.locator('[data-docs-sidebar]');
  await expect(sidebar.locator('summary')).toHaveText([
    'Guides',
    'Demo sites',
    'Base',
    'Primitives',
    'Layout',
    'Composite',
    'Utilities',
  ]);
  await expect(sidebar.getByRole('link', { name: 'Button', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(sidebar.getByRole('link', { name: 'Container', exact: true })).toBeVisible();
});

test('Overview is current in the sidebar and has no pager', async ({ page }) => {
  await page.goto('/documentation');
  const sidebar = page.locator('[data-docs-sidebar]');
  await expect(sidebar.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(page.locator('#docs-pager')).toHaveCount(0);
});

test('the pager crosses a section boundary', async ({ page }) => {
  await page.goto('/documentation/layout/Container');
  const previous = page.locator('#docs-pager a[rel="prev"]');
  await expect(previous).toHaveAttribute('href', '/documentation/primitives/Video');
  await previous.click();
  await expect(page).toHaveURL(/\/documentation\/primitives\/Video$/);
});

test.describe('below md', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu opens and navigates', async ({ page }) => {
    await page.goto(BUTTON);
    // The Modal script sets this flag once its handlers are attached: the post-init signal.
    await page.waitForFunction(
      () => (window as { __modalInitialized?: boolean }).__modalInitialized === true
    );
    await page.locator('[data-modal-trigger="docs-menu"]').click();
    const menu = page.locator('#docs-menu [role="dialog"]');
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'Container', exact: true }).click();
    await expect(page).toHaveURL(/\/documentation\/layout\/Container$/);
  });
});
