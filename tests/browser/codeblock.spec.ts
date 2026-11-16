import { expect, test, type Locator, type Page } from '@playwright/test';
import { contrastRatio } from './contrast';

const PAGE_URL = '/documentation/primitives/CodeBlock';

// Must match `basicSample` in src/pages/documentation/primitives/CodeBlock.astro.
const BASIC = 'export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

test('long lines scroll inside the block, not the page', async ({ page }) => {
  await page.goto(PAGE_URL);
  const pre = section(page, 'long-lines').locator('pre[data-code]');
  await expect(pre).toHaveAttribute('tabindex', '0');
  expect(await pre.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE_URL);
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    });

    test('every token meets 4.5:1', async ({ page }) => {
      const spans = await section(page, 'tokens').locator('pre[data-code] span[style]').all();
      let checked = 0;
      for (const span of spans) {
        const text = (await span.textContent()) ?? '';
        if (!text.trim()) continue;
        expect(await contrastRatio(span), text).toBeGreaterThanOrEqual(4.5);
        checked++;
      }
      expect(checked).toBeGreaterThan(10);
    });

    test('the caption text meets 4.5:1', async ({ page }) => {
      const caption = section(page, 'title').locator('figcaption span').first();
      expect(await contrastRatio(caption)).toBeGreaterThanOrEqual(4.5);
    });

    test('the pre background follows the theme', async ({ page }) => {
      const pre = section(page, 'basic').locator('pre[data-code]');
      await expect(pre).toHaveCSS(
        'background-color',
        colorScheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(13, 17, 23)'
      );
    });
  });
}

test.describe('copy', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(section(page, 'basic').locator('[data-code-block]')).toHaveAttribute(
      'data-code-block-ready',
      ''
    );
  });

  test('copies the exact source', async ({ page }) => {
    await section(page, 'basic').getByRole('button', { name: 'Copy code' }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(BASIC);
  });

  test('adds no trailing newline the source does not have', async ({ page }) => {
    await section(page, 'escape').getByRole('button', { name: 'Copy code' }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe('<p>a < b</p>');
  });

  test('announces Copied and shows the check icon', async ({ page }) => {
    const root = section(page, 'basic').locator('[data-code-block]');
    const button = root.getByRole('button', { name: 'Copy code' });
    await button.click();
    await expect(root.locator('[data-code-block-status]')).toHaveText('Copied');
    await expect(root).toHaveAttribute('data-code-block-copied', '');
    await expect(button.locator('[data-code-block-check]')).toBeVisible();
    await expect(button.locator('svg:not([data-code-block-check])')).toBeHidden();
  });

  test('resets after about two seconds', async ({ page }) => {
    const root = section(page, 'basic').locator('[data-code-block]');
    const button = root.getByRole('button', { name: 'Copy code' });
    await button.click();
    await expect(root.locator('[data-code-block-status]')).toHaveText('Copied');
    await expect(root.locator('[data-code-block-status]')).toHaveText('', { timeout: 4000 });
    await expect(root).not.toHaveAttribute('data-code-block-copied');
    await expect(button.locator('[data-code-block-check]')).toBeHidden();
    await expect(button.locator('svg:not([data-code-block-check])')).toBeVisible();
  });

  test('a repeat copy announces again', async ({ page }) => {
    const root = section(page, 'basic').locator('[data-code-block]');
    const status = root.locator('[data-code-block-status]');
    const button = root.getByRole('button', { name: 'Copy code' });
    await button.click();
    await expect(status).toHaveText('Copied');
    await expect(status).toHaveText('', { timeout: 4000 });
    await button.click();
    await expect(status).toHaveText('Copied');
  });

  test('after-swap does not bind twice', async ({ page }) => {
    await page.evaluate(() => {
      const w = window as unknown as { __writes: number };
      w.__writes = 0;
      const original = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = (text: string) => {
        w.__writes++;
        return original(text);
      };
      document.dispatchEvent(new Event('astro:after-swap'));
    });
    const root = section(page, 'basic').locator('[data-code-block]');
    await root.getByRole('button', { name: 'Copy code' }).click();
    await expect(root.locator('[data-code-block-status]')).toHaveText('Copied');
    expect(await page.evaluate(() => (window as unknown as { __writes: number }).__writes)).toBe(1);
  });

  test('the title variant copies too', async ({ page }) => {
    const root = section(page, 'title').locator('[data-code-block]');
    await root.getByRole('button', { name: 'Copy code' }).click();
    await expect(root.locator('[data-code-block-status]')).toHaveText('Copied');
  });
});
