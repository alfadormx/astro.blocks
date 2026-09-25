import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/demos/jewellery-configurator';
// SwiftShader renders on the CPU; first load includes compiling three's shaders.
const READY_TIMEOUT = 20_000;
const STYLE = 'ring-style';
const METAL = 'ring-metal';
const STONE = 'ring-stone';
const EXTRAS = 'ring-extras';
const ENGRAVING = 'ring-engraving';
const DEFAULT_SUMMARY = 'Classic · Yellow gold · 0.5 ct';

async function open(page: Page, query = ''): Promise<void> {
  await page.goto(`${PAGE_URL}${query}`);
  await expect(page.locator('html')).toHaveAttribute('data-url-state-ready', '');
  await expect(page.locator('[data-configurator]')).toHaveAttribute('data-configurator-ready', '');
}

async function readyViewer(page: Page): Promise<Locator> {
  const root = page.locator('[data-configurator] model-viewer-block');
  await root.scrollIntoViewIfNeeded();
  // The state attribute is only ever advanced by the element's script.
  await expect(root).toHaveAttribute('data-model-viewer-state', 'ready', {
    timeout: READY_TIMEOUT,
  });
  return root;
}

async function settledShot(root: Locator): Promise<Buffer> {
  let previous = await root.screenshot();
  await expect
    .poll(async () => {
      const next = await root.screenshot();
      const same = next.equals(previous);
      previous = next;
      return same;
    })
    .toBe(true);
  return previous;
}

async function changedShot(root: Locator, from: Buffer): Promise<Buffer> {
  await expect.poll(async () => (await root.screenshot()).equals(from)).toBe(false);
  return settledShot(root);
}

function option(page: Page, group: string, code: string): Locator {
  return page.locator(`[data-selection-group="${group}"] [data-option-code="${code}"]`);
}

function engraving(page: Page): Locator {
  return page.locator(`[data-selection-group="${ENGRAVING}"] textarea`);
}

function summary(page: Page): Locator {
  return page.locator('[data-configurator-summary]');
}

// Role queries skip the hidden copy of each trigger, so this clicks the visible one.
function openTab(page: Page, label: string): Promise<void> {
  return page.getByRole('tab', { name: label }).click();
}

function codeParam(page: Page): string | null {
  return /[?&]code=([^&#]*)/.exec(page.url())?.[1] ?? null;
}

async function expectCode(page: Page, code: string | null): Promise<void> {
  await expect.poll(() => codeParam(page)).toBe(code);
}

async function expectChecked(page: Page, group: string, code: string): Promise<void> {
  await expect(
    page.locator(`[data-selection-group="${group}"] input[type="radio"]:checked`)
  ).toHaveValue(code);
}

async function expectGridChecked(page: Page, group: string, codes: string[]): Promise<void> {
  await expect
    .poll(() =>
      page
        .locator(`[data-selection-group="${group}"] [data-option-code][aria-checked="true"]`)
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.optionCode))
    )
    .toEqual(codes);
}

test.describe('Configurator', () => {
  test.describe('toggle panel', () => {
    test('checks the clicked metal and repaints the viewer', async ({ page }) => {
      await open(page);
      const root = await readyViewer(page);
      const before = await settledShot(root);
      await openTab(page, 'Metal');
      await option(page, METAL, 'rose').click();
      await expectChecked(page, METAL, 'rose');
      await changedShot(root, before);
    });

    test('names the metal group by its panel heading', async ({ page }) => {
      await open(page);
      await openTab(page, 'Metal');
      await expect(page.getByRole('radiogroup', { name: 'Choose your metal' })).toBeVisible();
    });
  });

  test.describe('grid panel', () => {
    test('checks only the clicked stone in a single grid', async ({ page }) => {
      await open(page);
      await openTab(page, 'Stone');
      await option(page, STONE, 'large').click();
      await expectGridChecked(page, STONE, ['large']);
      await expect(option(page, STONE, 'medium')).toHaveAttribute('aria-checked', 'false');
    });

    test('disables the remaining extras once max is reached', async ({ page }) => {
      await open(page);
      await openTab(page, 'Extras');
      await option(page, EXTRAS, 'giftbox').click();
      await option(page, EXTRAS, 'certificate').click();
      await expectGridChecked(page, EXTRAS, ['giftbox', 'certificate']);
      await expect(option(page, EXTRAS, 'polish')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  test.describe('text panel', () => {
    test('moves the camera to the band preset while typing an engraving', async ({ page }) => {
      await open(page);
      const root = await readyViewer(page);
      await openTab(page, 'Engraving');
      await engraving(page).pressSequentially('Mia');
      await expect(root).toHaveAttribute('data-model-viewer-camera', 'band');
    });

    test('names the engraving field by its panel heading', async ({ page }) => {
      await open(page);
      await openTab(page, 'Engraving');
      await expect(page.getByRole('textbox', { name: 'Add an engraving' })).toBeVisible();
    });
  });

  test.describe('hidden panels', () => {
    test('swaps the model from the style panel', async ({ page }) => {
      await open(page);
      const root = await readyViewer(page);
      await openTab(page, 'Style');
      await option(page, STYLE, 'bold').click();
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring-alt.glb');
    });

    test('keeps the default stone selected while its panel is hidden', async ({ page }) => {
      await open(page);
      await expect(option(page, STONE, 'medium')).toBeHidden();
      await expect(option(page, STONE, 'medium')).toHaveAttribute('aria-checked', 'true');
    });
  });

  test.describe('defaults layering', () => {
    test('renders metal cells at the size from defaultToggleConfig', async ({ page }) => {
      await open(page);
      await expect(
        option(page, METAL, 'yellow').locator('[data-option-variant="unselected"]')
      ).toHaveClass(/(^|\s)px-3(\s|$)/);
    });
  });

  test.describe('summary', () => {
    test('server-renders the default summary and keeps it after the scripts run', async ({
      page,
    }) => {
      const html = await (await page.request.get(PAGE_URL)).text();
      expect(html).toContain(`data-configurator-summary`);
      expect(html).toMatch(new RegExp(`>\\s*${DEFAULT_SUMMARY}\\s*</p>`));
      await open(page);
      await readyViewer(page);
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);
    });

    test('follows a toggle change', async ({ page }) => {
      await open(page);
      await openTab(page, 'Metal');
      await option(page, METAL, 'rose').click();
      await expect(summary(page)).toHaveText('Classic · Rose gold · 0.5 ct');
    });

    test('lists extras in option order, not click order', async ({ page }) => {
      await open(page);
      await openTab(page, 'Extras');
      await option(page, EXTRAS, 'certificate').click();
      await option(page, EXTRAS, 'giftbox').click();
      await expect(summary(page)).toHaveText(`${DEFAULT_SUMMARY} · Gift box · Certificate`);
    });

    test('quotes the engraving', async ({ page }) => {
      await open(page);
      await openTab(page, 'Engraving');
      await engraving(page).pressSequentially('Mia');
      await expect(summary(page)).toHaveText(`${DEFAULT_SUMMARY} · "Mia"`);
    });

    test('drops a category once it is emptied', async ({ page }) => {
      await open(page);
      await openTab(page, 'Extras');
      await option(page, EXTRAS, 'giftbox').click();
      await option(page, EXTRAS, 'giftbox').click();
      await openTab(page, 'Engraving');
      await engraving(page).pressSequentially('Mia');
      await engraving(page).fill('');
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);
    });

    test('keeps updating after a page swap', async ({ page }) => {
      await open(page);
      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      await openTab(page, 'Metal');
      await option(page, METAL, 'white').click();
      await expect(summary(page)).toHaveText('Classic · White gold · 0.5 ct');
    });
  });

  test.describe('load', () => {
    test('leaves the URL alone on a fresh load', async ({ page }) => {
      await open(page);
      await expectCode(page, null);
    });

    test('restores every panel from a code', async ({ page }) => {
      await open(page, '?code=RING01-bold-rose-large-giftbox-Mia');
      await expectChecked(page, STYLE, 'bold');
      await expectChecked(page, METAL, 'rose');
      await expectGridChecked(page, STONE, ['large']);
      await expectGridChecked(page, EXTRAS, ['giftbox']);
      await expect(engraving(page)).toHaveValue('Mia');
      await expect(summary(page)).toHaveText('Bold · Rose gold · 1 ct · Gift box · "Mia"');
      await expect(await readyViewer(page)).toHaveAttribute(
        'data-model-viewer-src',
        '/models/ring-alt.glb'
      );
    });

    test('keeps the default for a stale option code', async ({ page }) => {
      await open(page, '?code=RING01-classic-gold-medium--');
      await expectChecked(page, METAL, 'yellow');
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);
    });
  });

  test.describe('write-back', () => {
    test('writes a change into the code', async ({ page }) => {
      await open(page);
      await openTab(page, 'Metal');
      await option(page, METAL, 'white').click();
      await expectCode(page, 'RING01-classic-white-medium--');
    });
  });

  test.describe('history', () => {
    test('steps back and forward through changes', async ({ page }) => {
      await open(page);
      await openTab(page, 'Metal');
      await option(page, METAL, 'white').click();
      await openTab(page, 'Stone');
      await option(page, STONE, 'large').click();
      await expect(summary(page)).toHaveText('Classic · White gold · 1 ct');

      await page.goBack();
      await expectGridChecked(page, STONE, ['medium']);
      await expect(summary(page)).toHaveText('Classic · White gold · 0.5 ct');

      await page.goForward();
      await expectGridChecked(page, STONE, ['large']);
      await expect(summary(page)).toHaveText('Classic · White gold · 1 ct');
    });
  });

  test.describe('full flow', () => {
    test('configures a ring, shares the URL and restores it', async ({ page, browser }) => {
      await open(page);
      const root = await readyViewer(page);
      await expectCode(page, null);
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);

      await openTab(page, 'Style');
      await option(page, STYLE, 'bold').click();
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring-alt.glb');
      await openTab(page, 'Metal');
      await option(page, METAL, 'rose').click();
      await openTab(page, 'Stone');
      await option(page, STONE, 'large').click();
      await openTab(page, 'Extras');
      await option(page, EXTRAS, 'certificate').click();
      await option(page, EXTRAS, 'giftbox').click();
      await openTab(page, 'Engraving');
      await engraving(page).pressSequentially('Mia');
      await expect(root).toHaveAttribute('data-model-viewer-camera', 'band');

      const code = 'RING01-bold-rose-large-giftbox.certificate-Mia';
      const full = 'Bold · Rose gold · 1 ct · Gift box · Certificate · "Mia"';
      await expectCode(page, code);
      await expect(summary(page)).toHaveText(full);

      const shared = await browser.newPage();
      await open(shared, `?code=${code}`);
      await expect(summary(shared)).toHaveText(full);
      await expect(await readyViewer(shared)).toHaveAttribute(
        'data-model-viewer-src',
        '/models/ring-alt.glb'
      );
      await expectChecked(shared, STYLE, 'bold');
      await expectChecked(shared, METAL, 'rose');
      await expectGridChecked(shared, STONE, ['large']);
      await expectGridChecked(shared, EXTRAS, ['giftbox', 'certificate']);
      await expect(engraving(shared)).toHaveValue('Mia');
      await shared.close();

      // One typing burst is one history entry, so back lands before the engraving.
      await page.goBack();
      await expect(summary(page)).toHaveText('Bold · Rose gold · 1 ct · Gift box · Certificate');
      await page.goForward();
      await expect(summary(page)).toHaveText(full);
    });
  });
});
