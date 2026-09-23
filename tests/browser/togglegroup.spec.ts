import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/ToggleGroup';

type EventWindow = { __events: unknown[] };

async function groupRoot(page: Page, group: string, nth = 0): Promise<Locator> {
  const root = page.locator(`[data-selection-group="${group}"][data-toggle-group]`).nth(nth);
  // ARIA and checked state are server-rendered; this attribute is the script's post-init signal.
  await expect(root).toHaveAttribute('data-toggle-group-ready', '');
  return root;
}

async function openGroup(page: Page, group: string): Promise<Locator> {
  await page.goto(PAGE_URL);
  return groupRoot(page, group);
}

function option(root: Locator, code: string): Locator {
  return root.locator(`[data-option-code="${code}"]`);
}

function input(root: Locator, code: string): Locator {
  return option(root, code).locator('input[type="radio"]');
}

async function expectChecked(root: Locator, checked: string[]): Promise<void> {
  const codes = await root
    .locator('[data-option-code]')
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.optionCode!));
  for (const code of codes) {
    const isChecked = checked.includes(code);
    await expect(input(root, code)).toBeChecked({ checked: isChecked });
    await expect(option(root, code).locator('[data-option-variant="selected"]')).toBeVisible({
      visible: isChecked,
    });
    await expect(option(root, code).locator('[data-option-variant="unselected"]')).toBeVisible({
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

async function groupEvents(events: () => Promise<unknown[]>, group: string): Promise<unknown[]> {
  return (await events()).filter((detail) => (detail as { group: string }).group === group);
}

test.describe('ToggleGroup', () => {
  test.describe('radio', () => {
    const GROUP = 'togglegroup-doc-basic';

    test('renders a labelled radiogroup with the initial selection', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      await expect(root).toHaveAttribute('role', 'radiogroup');
      await expect(root).toHaveAttribute('aria-label', 'Delivery');
      await expect(root).toHaveAttribute('aria-orientation', 'horizontal');
      await expectChecked(root, ['standard']);
    });

    test('click switches the selection', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      await option(root, 'pickup').click();
      await expectChecked(root, ['pickup']);
    });

    test('arrow keys wrap and skip disabled options', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      await input(root, 'express').focus();

      await page.keyboard.press('ArrowRight');
      await expectChecked(root, ['pickup']);
      await expect(input(root, 'pickup')).toBeFocused();

      await page.keyboard.press('ArrowRight');
      await expectChecked(root, ['standard']);

      await page.keyboard.press('ArrowLeft');
      await expectChecked(root, ['pickup']);
    });

    test('the group is a single tab stop', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      await input(root, 'standard').focus();

      await page.keyboard.press('Tab');
      await expect(root.locator('input:focus')).toHaveCount(0);

      await page.keyboard.press('Shift+Tab');
      await expect(input(root, 'standard')).toBeFocused();
    });

    test('publishes a selection:change payload', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      const events = await collectEvents(page);
      await option(root, 'express').click();
      await expectChecked(root, ['express']);
      expect((await events()).at(-1)).toEqual({
        group: GROUP,
        mode: 'single',
        selection: [{ code: 'express' }],
      });
    });

    test('survives astro:after-swap', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      await option(root, 'pickup').click();
      await expectChecked(root, ['pickup']);

      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      await expectChecked(root, ['pickup']);

      const events = await collectEvents(page);
      await option(root, 'express').click();
      await expectChecked(root, ['express']);
      await option(root, 'standard').click();
      await expectChecked(root, ['standard']);

      expect(await groupEvents(events, GROUP)).toEqual([
        { group: GROUP, mode: 'single', selection: [{ code: 'express' }] },
        { group: GROUP, mode: 'single', selection: [{ code: 'standard' }] },
      ]);
    });
  });

  test.describe('shared group', () => {
    const GROUP = 'togglegroup-doc-events';

    async function openBoth(page: Page): Promise<[Locator, Locator]> {
      const a = await openGroup(page, GROUP);
      const b = await groupRoot(page, GROUP, 1);
      return [a, b];
    }

    test('an instance with nothing selected does not clear the group on connect', async ({
      page,
    }) => {
      const [a, b] = await openBoth(page);
      await expectChecked(a, ['gloss']);
      await expectChecked(b, ['gloss']);
    });

    test('selecting in one instance updates the other', async ({ page }) => {
      const [a, b] = await openBoth(page);
      await option(b, 'matte').click();
      await expectChecked(a, ['matte']);
      await expectChecked(b, ['matte']);
    });

    test('an external publish updates the group with exactly one event', async ({ page }) => {
      const [a, b] = await openBoth(page);
      const events = await collectEvents(page);
      await page.locator('[data-selection-external="satin"]').click();
      await expectChecked(a, ['satin']);
      await expectChecked(b, ['satin']);
      expect(await groupEvents(events, GROUP)).toHaveLength(1);
    });

    test('a foreign code unchecks every option', async ({ page }) => {
      const [a, b] = await openBoth(page);
      await page.locator('[data-selection-external="walnut"]').click();
      await expectChecked(a, []);
      await expectChecked(b, []);
    });

    test('the log shows the published payload', async ({ page }) => {
      const [a] = await openBoth(page);
      await page.locator('[data-selection-external="satin"]').click();
      await expectChecked(a, ['satin']);
      expect(JSON.parse((await page.locator('[data-selection-log]').textContent())!)).toEqual({
        group: GROUP,
        mode: 'single',
        selection: [{ code: 'satin' }],
      });
    });
  });

  test('arrow keys move the selection in the vertical layout', async ({ page }) => {
    const root = await openGroup(page, 'togglegroup-doc-vertical');
    await expect(root).toHaveAttribute('aria-orientation', 'vertical');
    await input(root, 'none').focus();

    await page.keyboard.press('ArrowDown');
    await expectChecked(root, ['1y']);

    await page.keyboard.press('ArrowUp');
    await expectChecked(root, ['none']);
  });

  test("a hidden label is still the input's accessible name", async ({ page }) => {
    const root = await openGroup(page, 'togglegroup-doc-font');
    await expect(input(root, 'serif')).toHaveAccessibleName('Serif');
    await expect(input(root, 'script')).toHaveAccessibleName('Script');
  });

  test('a cell selection publishes the same payload as a radio selection', async ({ page }) => {
    const group = 'togglegroup-doc-cell-solid';
    const root = await openGroup(page, group);
    const events = await collectEvents(page);
    await option(root, 'yes').click();
    await expectChecked(root, ['yes']);
    expect(await groupEvents(events, group)).toEqual([
      { group, mode: 'single', selection: [{ code: 'yes' }] },
    ]);
  });

  test.describe('state config', () => {
    const GROUP = 'togglegroup-doc-custom';

    test('custom selected classes apply to the selected variant only', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      const black = option(root, 'black');
      await expect(black.locator('[data-option-variant="selected"]')).toHaveClass(/bg-accent\/10/);
      await expect(black.locator('[data-option-variant="unselected"]')).not.toHaveClass(
        /bg-accent\/10/
      );
    });

    test('disabledOptionConfig applies to disabled options only', async ({ page }) => {
      const root = await openGroup(page, GROUP);
      for (const variant of ['selected', 'unselected']) {
        await expect(option(root, 'red').locator(`[data-option-variant="${variant}"]`)).toHaveClass(
          /line-through/
        );
        await expect(
          option(root, 'white').locator(`[data-option-variant="${variant}"]`)
        ).not.toHaveClass(/line-through/);
      }
    });
  });

  test('a disabled group has no tab stop and ignores clicks', async ({ page }) => {
    const group = 'togglegroup-doc-disabled';
    const root = await openGroup(page, group);
    for (const code of ['standard', 'express']) await expect(input(root, code)).toBeDisabled();

    const events = await collectEvents(page);
    await option(root, 'express').click({ force: true });
    await expectChecked(root, []);
    expect(await groupEvents(events, group)).toEqual([]);

    const custom = await groupRoot(page, 'togglegroup-doc-custom');
    await input(custom, 'black').focus();
    await page.keyboard.press('Tab');
    await expect(root.locator('input:focus')).toHaveCount(0);
  });

  test('labelledBy wins over label', async ({ page }) => {
    const root = await openGroup(page, 'togglegroup-doc-labelledby');
    await expect(root).toHaveAttribute('aria-labelledby', 'togglegroup-labelledby-heading');
    await expect(root).not.toHaveAttribute('aria-label');
    await expectChecked(root, ['serif']);
  });
});
