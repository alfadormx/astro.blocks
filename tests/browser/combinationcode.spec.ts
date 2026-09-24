import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/utilities/CombinationCode';
const FINISH = 'combinationcode-doc-finish';
const EXTRAS = 'combinationcode-doc-extras';
const ENGRAVING = 'combinationcode-doc-engraving';

async function open(page: Page, query = ''): Promise<void> {
  await page.goto(`${PAGE_URL}${query}`);
  await expect(page.locator('html')).toHaveAttribute('data-url-state-ready', '');
}

function codeParam(page: Page): string | null {
  return /[?&]code=([^&#]*)/.exec(page.url())?.[1] ?? null;
}

function historyLength(page: Page): Promise<number> {
  return page.evaluate(() => history.length);
}

async function expectFinish(page: Page, code: string): Promise<void> {
  await expect(
    page.locator(`[data-selection-group="${FINISH}"] input[type="radio"]:checked`)
  ).toHaveValue(code);
}

async function expectExtras(page: Page, codes: string[]): Promise<void> {
  await expect
    .poll(() =>
      page
        .locator(`[data-selection-group="${EXTRAS}"] [data-option-code][aria-checked="true"]`)
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.optionCode))
    )
    .toEqual(codes);
}

async function expectCode(page: Page, code: string | null): Promise<void> {
  await expect.poll(() => codeParam(page)).toBe(code);
}

function clickFinish(page: Page, code: string): Promise<void> {
  return page.locator(`[data-selection-group="${FINISH}"] [data-option-code="${code}"]`).click();
}

function clickExtra(page: Page, code: string): Promise<void> {
  return page.locator(`[data-selection-group="${EXTRAS}"] [data-option-code="${code}"]`).click();
}

function engraving(page: Page): Locator {
  return page.locator(`[data-selection-group="${ENGRAVING}"] textarea`);
}

function collectWarnings(page: Page): string[] {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  return warnings;
}

async function plainLoadHistoryLength(browser: Browser): Promise<number> {
  const page = await browser.newPage();
  await open(page);
  const length = await historyLength(page);
  await page.close();
  return length;
}

test.describe('CombinationCode URL state', () => {
  test.describe('load', () => {
    test('seeds every group from the code, overriding block defaults', async ({ page }) => {
      await open(page, '?code=RING01-GD-IN.EX-');
      await expectFinish(page, 'GD');
      await expectExtras(page, ['IN', 'EX']);
    });

    test('keeps block defaults and a clean URL when no code is present', async ({ page }) => {
      await open(page);
      await expectFinish(page, 'SV');
      await expectExtras(page, ['GW']);
      expect(codeParam(page)).toBeNull();
    });
  });

  test.describe('write-back', () => {
    test('writes the full code when a selection changes', async ({ page }) => {
      await open(page);
      await clickFinish(page, 'GD');
      await expectCode(page, 'RING01-GD-GW-');
    });

    test('adds one history entry per discrete change', async ({ page }) => {
      await open(page);
      const before = await historyLength(page);
      await clickFinish(page, 'GD');
      await expectCode(page, 'RING01-GD-GW-');
      await clickExtra(page, 'IN');
      await expectCode(page, 'RING01-GD-GW.IN-');
      expect(await historyLength(page)).toBe(before + 2);
    });

    test('preserves other query params and the hash', async ({ page }) => {
      await open(page, '?foo=1#x');
      await clickFinish(page, 'GD');
      await expect.poll(() => page.url()).toMatch(/\?foo=1&code=RING01-GD-GW-#x$/);
    });

    test('still writes a code after returning to the defaults', async ({ page }) => {
      await open(page);
      await clickFinish(page, 'GD');
      await expectCode(page, 'RING01-GD-GW-');
      await clickFinish(page, 'SV');
      await expectCode(page, 'RING01-SV-GW-');
    });

    test('writes nothing on a seeded load', async ({ page }) => {
      await open(page, '?code=RING01-GD-EX.IN-');
      await expectExtras(page, ['IN', 'EX']);
      expect(codeParam(page)).toBe('RING01-GD-EX.IN-');
    });
  });

  test.describe('history', () => {
    async function walk(page: Page): Promise<void> {
      await open(page);
      await clickFinish(page, 'GD');
      await expectCode(page, 'RING01-GD-GW-');
      await clickExtra(page, 'IN');
      await expectCode(page, 'RING01-GD-GW.IN-');
    }

    test('back restores the previous configuration', async ({ page }) => {
      await walk(page);
      await page.goBack();
      await expectFinish(page, 'GD');
      await expectExtras(page, ['GW']);
      expect(codeParam(page)).toBe('RING01-GD-GW-');
    });

    test('back to the clean entry restores page-load defaults', async ({ page }) => {
      await walk(page);
      await page.goBack();
      await page.goBack();
      await expectFinish(page, 'SV');
      await expectExtras(page, ['GW']);
      expect(codeParam(page)).toBeNull();
    });

    test('forward restores the later configuration', async ({ page }) => {
      await walk(page);
      await page.goBack();
      await page.goBack();
      await expectFinish(page, 'SV');
      await page.goForward();
      await expectFinish(page, 'GD');
    });

    test('restoring does not write a new history entry', async ({ page }) => {
      await walk(page);
      const length = await historyLength(page);
      await page.goBack();
      await expectExtras(page, ['GW']);
      await page.goForward();
      await expectExtras(page, ['GW', 'IN']);
      expect(await historyLength(page)).toBe(length);
      expect(codeParam(page)).toBe('RING01-GD-GW.IN-');
    });

    test('re-seeds from the URL after astro:after-swap', async ({ page }) => {
      await open(page, '?code=RING01-GD-IN-');
      await expectFinish(page, 'GD');
      await page.evaluate(() => {
        history.replaceState(null, '', '?code=RING01-RG-CD-');
        document.dispatchEvent(new Event('astro:after-swap'));
      });
      await expectFinish(page, 'RG');
      await expectExtras(page, ['CD']);
      await clickFinish(page, 'SV');
      await expectCode(page, 'RING01-SV-CD-');
    });
  });

  test.describe('text', () => {
    test('seeds the engraving text from the code', async ({ page }) => {
      await open(page, '?code=RING01-SV-GW-Hello%20you');
      await expect(engraving(page)).toHaveValue('Hello you');
    });

    test('adds one history entry for a typing burst', async ({ page }) => {
      await open(page);
      const before = await historyLength(page);
      await engraving(page).pressSequentially('Hi there');
      await expectCode(page, 'RING01-SV-GW-Hi%20there');
      expect(await historyLength(page)).toBe(before + 1);
    });

    test('adds a new entry for a click after typing', async ({ page }) => {
      await open(page);
      const before = await historyLength(page);
      await engraving(page).pressSequentially('Hi there');
      await expectCode(page, 'RING01-SV-GW-Hi%20there');
      await clickFinish(page, 'GD');
      await expectCode(page, 'RING01-GD-GW-Hi%20there');
      expect(await historyLength(page)).toBe(before + 2);
    });

    test('escapes delimiters so the text reloads unchanged', async ({ page }) => {
      await open(page);
      await engraving(page).pressSequentially('Mia-Rose v2.');
      await expectCode(page, 'RING01-SV-GW-Mia%2DRose%20v2%2E');
      await page.reload();
      await expect(engraving(page)).toHaveValue('Mia-Rose v2.');
    });

    test('rewrites the URL in place with truncated seeded text', async ({ page, browser }) => {
      const plainLength = await plainLoadHistoryLength(browser);
      await open(page, `?code=RING01-SV-GW-${'A'.repeat(30)}`);
      await expect(engraving(page)).toHaveValue('A'.repeat(20));
      await expectCode(page, `RING01-SV-GW-${'A'.repeat(20)}`);
      expect(await historyLength(page)).toBe(plainLength);
    });
  });

  test.describe('stale codes', () => {
    test('applies valid groups, keeps the default for a stale one and warns', async ({ page }) => {
      const warnings = collectWarnings(page);
      await open(page, '?code=RING01-XX-IN-');
      await expectFinish(page, 'SV');
      await expectExtras(page, ['IN']);
      expect(warnings.some((text) => text.includes('no option "XX"'))).toBe(true);
    });

    test('keeps every default for a code from another product and warns', async ({ page }) => {
      const warnings = collectWarnings(page);
      await open(page, '?code=OTHER1-GD-IN-');
      await expectFinish(page, 'SV');
      await expectExtras(page, ['GW']);
      expect(warnings.some((text) => text.includes('does not match'))).toBe(true);
    });
  });
});
