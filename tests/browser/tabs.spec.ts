import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Tabs';

async function openTabs(page: Page, section = 'horizontal'): Promise<Locator> {
  await page.goto(PAGE_URL);
  const root = page.locator(`[data-doc-section="${section}"] [data-tabs-root]`);
  // role="tab" is applied by initTabs, never server-rendered: this is the post-init signal.
  await expect(root.locator('[role="tab"]').first()).toBeAttached();
  return root;
}

function activeTrigger(root: Locator, index: number): Locator {
  return root.locator(`[data-tab-index="${index}"] [data-tab-button="active"] [role="tab"]`);
}

async function expectActiveIndex(root: Locator, activeIndex: number, count = 3): Promise<void> {
  for (let i = 0; i < count; i++) {
    const span = root.locator(`[data-tab-index="${i}"]`);
    const isActive = i === activeIndex;

    await expect(span.locator('[data-tab-button="active"]')).toBeVisible({ visible: isActive });
    await expect(span.locator('[data-tab-button="inactive"]')).toBeVisible({ visible: !isActive });

    await expect(activeTrigger(root, i)).toHaveAttribute(
      'aria-selected',
      isActive ? 'true' : 'false'
    );
    await expect(activeTrigger(root, i)).toHaveAttribute('tabindex', isActive ? '0' : '-1');

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
    const panelId = await root.locator('[data-tab-panel="0"]').getAttribute('id');
    expect(panelId).toBeTruthy();
    await expect(activeTrigger(root, 0)).toHaveAttribute('aria-controls', panelId!);
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

  test('labels every panel by a rendered trigger', async ({ page }) => {
    const root = await openTabs(page);
    const labels = ['Overview', 'API', 'Examples'];

    for (let active = 0; active < labels.length; active++) {
      await root.locator(`[data-tab-index="${active}"]`).click();
      await expectActiveIndex(root, active);

      for (let i = 0; i < labels.length; i++) {
        const labelledBy = await root
          .locator(`[data-tab-panel="${i}"]`)
          .getAttribute('aria-labelledby');
        expect(labelledBy).toBeTruthy();
        await expect(page.locator(`#${labelledBy}`)).toBeVisible();
      }
      await expect(root.getByRole('tabpanel')).toHaveAccessibleName(labels[active]);
    }
  });

  test('keeps the active tab across an astro:after-swap dispatch', async ({ page }) => {
    const root = await openTabs(page);
    await root.locator('[data-tab-index="2"]').click();
    await expectActiveIndex(root, 2);

    await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
    await expectActiveIndex(root, 2);
  });

  test('moves focus to the active trigger after a click', async ({ page }) => {
    const root = await openTabs(page);
    await root.locator('[data-tab-index="1"]').click();
    await expect(activeTrigger(root, 1)).toBeFocused();
  });

  test('renders a horizontal aria-orientation for row and grid tablists', async ({ page }) => {
    for (const section of ['horizontal', 'layout-grid', 'many']) {
      const root = await openTabs(page, section);
      await expect(root.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    }
  });

  test('wraps Left/Right through all twelve tabs', async ({ page }) => {
    const root = await openTabs(page, 'many');
    await activeTrigger(root, 0).focus();

    await page.keyboard.press('ArrowLeft');
    await expect(activeTrigger(root, 11)).toBeFocused();
    await expectActiveIndex(root, 11, 12);

    await page.keyboard.press('ArrowRight');
    await expect(activeTrigger(root, 0)).toBeFocused();
    await expectActiveIndex(root, 0, 12);

    for (let i = 1; i <= 12; i++) {
      await page.keyboard.press('ArrowRight');
      await expect(activeTrigger(root, i % 12)).toBeFocused();
    }
    await expectActiveIndex(root, 0, 12);
  });

  test('jumps to the first and last tab with Home and End', async ({ page }) => {
    const root = await openTabs(page, 'many');
    await activeTrigger(root, 0).focus();

    await page.keyboard.press('End');
    await expect(activeTrigger(root, 11)).toBeFocused();
    await expectActiveIndex(root, 11, 12);

    await page.keyboard.press('Home');
    await expect(activeTrigger(root, 0)).toBeFocused();
    await expectActiveIndex(root, 0, 12);
  });

  test('ignores cross-axis arrows on a horizontal tablist', async ({ page }) => {
    const root = await openTabs(page, 'many');
    await activeTrigger(root, 0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(activeTrigger(root, 0)).toBeFocused();
    await expectActiveIndex(root, 0, 12);
  });

  test('swaps Left and Right in RTL', async ({ page }) => {
    const root = await openTabs(page, 'many');
    await page.evaluate(() => (document.dir = 'rtl'));
    await activeTrigger(root, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(activeTrigger(root, 11)).toBeFocused();
  });

  test('skips disabled tabs', async ({ page }) => {
    const root = await openTabs(page, 'many');
    await activeTrigger(root, 1).evaluate((el) => el.setAttribute('disabled', ''));
    await activeTrigger(root, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(activeTrigger(root, 2)).toBeFocused();
    await expectActiveIndex(root, 2, 12);
  });

  test('moves with Up/Down on a vertical tablist', async ({ page }) => {
    const root = await openTabs(page, 'vertical');
    await expect(root.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await activeTrigger(root, 0).focus();

    await page.keyboard.press('ArrowUp');
    await expect(activeTrigger(root, 2)).toBeFocused();
    await expectActiveIndex(root, 2);

    await page.keyboard.press('ArrowDown');
    await expect(activeTrigger(root, 0)).toBeFocused();
    await expectActiveIndex(root, 0);

    await page.keyboard.press('ArrowRight');
    await expect(activeTrigger(root, 0)).toBeFocused();
    await expectActiveIndex(root, 0);
  });

  test('follows the row layout of a vertical Tabs', async ({ page }) => {
    const root = await openTabs(page, 'layout-row');
    await expect(root.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');
    await activeTrigger(root, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(activeTrigger(root, 1)).toBeFocused();
    await expectActiveIndex(root, 1);
  });

  test('follows the column layout of a horizontal Tabs', async ({ page }) => {
    const root = await openTabs(page, 'layout-column');
    await expect(root.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await activeTrigger(root, 0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(activeTrigger(root, 1)).toBeFocused();
    await expectActiveIndex(root, 1);
  });
});
