import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/ItemsGrid';

type EventWindow = { __events: unknown[] };

async function openGrid(page: Page, group: string): Promise<Locator> {
  await page.goto(PAGE_URL);
  const root = page.locator(`[data-selection-group="${group}"][data-items-grid-selectable]`);
  // role is applied by the script, never server-rendered: this is the post-init signal.
  await expect(root.locator('[role="radio"], [role="checkbox"]').first()).toBeAttached();
  return root;
}

async function expectChecked(root: Locator, checked: string[]): Promise<void> {
  const options = root.locator('[data-option-code]');
  for (const code of await options.evaluateAll((els) =>
    els.map((el) => (el as HTMLElement).dataset.optionCode!)
  )) {
    const option = root.locator(`[data-option-code="${code}"]`);
    const isChecked = checked.includes(code);
    await expect(option).toHaveAttribute('aria-checked', String(isChecked));
    await expect(option.locator('[data-option-variant="selected"]')).toBeVisible({
      visible: isChecked,
    });
    await expect(option.locator('[data-option-variant="unselected"]')).toBeVisible({
      visible: !isChecked,
    });
  }
}

async function collectEvents(page: Page): Promise<() => Promise<unknown[]>> {
  await page.evaluate(() => {
    (window as unknown as EventWindow).__events = [];
    document.addEventListener('selection:change', (e) =>
      (window as unknown as EventWindow).__events.push((e as CustomEvent).detail)
    );
  });
  return () => page.evaluate(() => (window as unknown as EventWindow).__events);
}

function option(root: Locator, code: string): Locator {
  return root.locator(`[data-option-code="${code}"]`);
}

test.describe('ItemsGrid selection', () => {
  test('a grid without selection stays static', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForLoadState('load');
    // The script ran on this page: the selectable grid has its roles.
    await expect(page.locator('[role="radio"]').first()).toBeAttached();

    const basic = page.locator('[data-doc-section="basic"]');
    await expect(basic.locator('[role]')).toHaveCount(0);
    await expect(basic.locator('[tabindex]')).toHaveCount(0);
    await expect(basic.locator('[data-selection-group]')).toHaveCount(0);
  });

  test.describe('single', () => {
    const GROUP = 'itemsgrid-doc-single';

    test('renders the initial state', async ({ page }) => {
      const root = await openGrid(page, GROUP);
      await expect(root).toHaveAttribute('role', 'radiogroup');
      await expect(root).toHaveAttribute('aria-label', 'Size');
      await expectChecked(root, ['size-m']);
      await expect(option(root, 'size-s')).toHaveAttribute('tabindex', '-1');
      await expect(option(root, 'size-m')).toHaveAttribute('tabindex', '0');
      await expect(option(root, 'size-l')).toHaveAttribute('tabindex', '-1');
    });

    test('click switches the selection', async ({ page }) => {
      const root = await openGrid(page, GROUP);
      await option(root, 'size-l').click();
      await expectChecked(root, ['size-l']);
      await expect(option(root, 'size-l')).toHaveAttribute('tabindex', '0');
      await expect(option(root, 'size-m')).toHaveAttribute('tabindex', '-1');
    });

    test('arrow keys wrap and select', async ({ page }) => {
      const root = await openGrid(page, GROUP);
      await option(root, 'size-m').focus();

      await page.keyboard.press('ArrowRight');
      await expectChecked(root, ['size-l']);
      await expect(option(root, 'size-l')).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expectChecked(root, ['size-s']);
      await expect(option(root, 'size-s')).toBeFocused();

      await page.keyboard.press('ArrowUp');
      await expectChecked(root, ['size-l']);
      await expect(option(root, 'size-l')).toBeFocused();
    });

    test('Space selects the focused option', async ({ page }) => {
      const root = await openGrid(page, GROUP);
      await option(root, 'size-s').focus();
      await page.keyboard.press('Space');
      await expectChecked(root, ['size-s']);
    });

    test('publishes a selection:change payload', async ({ page }) => {
      const root = await openGrid(page, GROUP);
      const events = await collectEvents(page);
      await option(root, 'size-s').click();
      await expectChecked(root, ['size-s']);
      expect((await events()).at(-1)).toEqual({
        group: GROUP,
        mode: 'single',
        selection: [{ code: 'size-s' }],
      });
    });

    test('survives astro:after-swap', async ({ page }) => {
      const root = await openGrid(page, GROUP);
      await option(root, 'size-l').click();
      await expectChecked(root, ['size-l']);

      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      await expectChecked(root, ['size-l']);

      const events = await collectEvents(page);
      await option(root, 'size-s').click();
      await expectChecked(root, ['size-s']);
      await option(root, 'size-m').click();
      await expectChecked(root, ['size-m']);

      const groupEvents = (await events()).filter(
        (detail) => (detail as { group: string }).group === GROUP
      );
      expect(groupEvents).toEqual([
        { group: GROUP, mode: 'single', selection: [{ code: 'size-s' }] },
        { group: GROUP, mode: 'single', selection: [{ code: 'size-m' }] },
      ]);
    });
  });
});
