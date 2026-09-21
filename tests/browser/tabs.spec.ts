import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Tabs';
const TAB_COUNT = 3;

async function openTabs(page: Page): Promise<Locator> {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-tabs-root]').first();
  // role="tab" is applied by initTabs, never server-rendered: this is the post-init signal.
  await expect(root.locator('[role="tab"]').first()).toBeAttached();
  return root;
}

async function expectActiveIndex(root: Locator, activeIndex: number): Promise<void> {
  for (let i = 0; i < TAB_COUNT; i++) {
    const span = root.locator(`[data-tab-index="${i}"]`);
    const isActive = i === activeIndex;

    await expect(span.locator('[data-tab-button="active"]')).toBeVisible({ visible: isActive });
    await expect(span.locator('[data-tab-button="inactive"]')).toBeVisible({ visible: !isActive });

    const activeTrigger = span.locator('[data-tab-button="active"] [role="tab"]');
    await expect(activeTrigger).toHaveAttribute('aria-selected', isActive ? 'true' : 'false');
    await expect(activeTrigger).toHaveAttribute('tabindex', isActive ? '0' : '-1');

    const inactiveTrigger = span.locator('[data-tab-button="inactive"] [role="tab"]');
    await expect(inactiveTrigger).toHaveAttribute('aria-selected', 'false');
    await expect(inactiveTrigger).toHaveAttribute('tabindex', '-1');

    const panel = root.locator(`[data-tab-panel="${i}"]`);
    await expect(panel).toHaveAttribute('aria-hidden', isActive ? 'false' : 'true');
    await expect(panel).toBeVisible({ visible: isActive });
  }
}

test.describe('Tabs', () => {
  test('renders the correct initial state', async ({ page }) => {
    const root = await openTabs(page);
    await expectActiveIndex(root, 0);

    // Relationship-based id assertion: ids come from a counter that is never reset.
    const activeTrigger = root.locator(
      '[data-tab-index="0"] [data-tab-button="active"] [role="tab"]'
    );
    const panelId = await root.locator('[data-tab-panel="0"]').getAttribute('id');
    expect(panelId).toBeTruthy();
    await expect(activeTrigger).toHaveAttribute('aria-controls', panelId!);
    await expect(root.locator('[data-tab-panel="0"]')).toHaveAttribute('role', 'tabpanel');
  });

  test('switches state on click', async ({ page }) => {
    const root = await openTabs(page);
    await root.locator('[data-tab-index="1"]').click();
    await expectActiveIndex(root, 1);
  });

  test('survives an astro:after-swap dispatch', async ({ page }) => {
    const root = await openTabs(page);
    await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));

    // The WeakMap guard in initTabs must prevent a second click listener being bound.
    await root.locator('[data-tab-index="1"]').click();
    await expectActiveIndex(root, 1);

    await root.locator('[data-tab-index="2"]').click();
    await expectActiveIndex(root, 2);
  });
});
