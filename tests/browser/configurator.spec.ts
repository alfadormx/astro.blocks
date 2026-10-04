import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/demos/jewellery-configurator';
// SwiftShader renders on the CPU; first load includes compiling three's shaders.
const READY_TIMEOUT = 20_000;
const MODEL = 'ring-model';
const CARAT = 'ring-carat';
const COLOR = 'ring-color';
const CLARITY = 'ring-clarity';
const EXTRAS = 'ring-extras';
const ENGRAVING = 'ring-engraving';
const DEFAULT_SUMMARY = 'Yellow gold 0.5 ct IF';

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
  test.describe('model panel', () => {
    test('swaps to the bold model and repaints the viewer', async ({ page }) => {
      await open(page);
      const root = await readyViewer(page);
      const before = await settledShot(root);
      await option(page, MODEL, 'bold').click();
      await expectGridChecked(page, MODEL, ['bold']);
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring-alt.glb');
      await changedShot(root, before);
    });

    test('names the model group by its panel heading', async ({ page }) => {
      await open(page);
      await expect(page.getByRole('radiogroup', { name: 'Select your model' })).toBeVisible();
    });
  });

  test.describe('grid panel', () => {
    test('checks only the clicked carat in a single grid', async ({ page }) => {
      await open(page);
      await openTab(page, 'Carat');
      await option(page, CARAT, 'large').click();
      await expectGridChecked(page, CARAT, ['large']);
      await expect(option(page, CARAT, 'medium')).toHaveAttribute('aria-checked', 'false');
    });

    test('recolours the band when a metal colour is picked', async ({ page }) => {
      await open(page);
      const root = await readyViewer(page);
      const before = await settledShot(root);
      await openTab(page, 'Color');
      await option(page, COLOR, 'rose').click();
      await expectGridChecked(page, COLOR, ['rose']);
      await changedShot(root, before);
    });

    test('clouds the stone when a lower clarity is picked', async ({ page }) => {
      await open(page);
      const root = await readyViewer(page);
      const before = await settledShot(root);
      await openTab(page, 'Clarity');
      await option(page, CLARITY, 'vs1').click();
      await expectGridChecked(page, CLARITY, ['vs1']);
      await changedShot(root, before);
    });

    test('grows the carat icon with the weight', async ({ page }) => {
      await open(page);
      await openTab(page, 'Carat');
      const iconWidth = async (code: string): Promise<number> =>
        (await option(page, CARAT, code)
          .locator('[data-option-variant]:not([hidden]) svg')
          .boundingBox())!.width;
      const small = await iconWidth('small');
      const medium = await iconWidth('medium');
      const large = await iconWidth('large');
      expect(small).toBeLessThan(medium);
      expect(medium).toBeLessThan(large);
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

    test('names the engraving field by its visible label', async ({ page }) => {
      await open(page);
      await openTab(page, 'Engraving');
      await expect(page.getByRole('textbox', { name: 'Engraving' })).toBeVisible();
    });
  });

  test.describe('hidden panels', () => {
    test('keeps the default carat selected while its panel is hidden', async ({ page }) => {
      await open(page);
      await expect(option(page, CARAT, 'medium')).toBeHidden();
      await expect(option(page, CARAT, 'medium')).toHaveAttribute('aria-checked', 'true');
    });
  });

  test.describe('defaults layering', () => {
    test('renders grid tiles with the padding from defaultGridConfig', async ({ page }) => {
      await open(page);
      await expect(
        option(page, CARAT, 'small').locator('[data-option-variant="unselected"] > div')
      ).toHaveClass(/(^|\s)p-4(\s|$)/);
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

    test('follows a grid change', async ({ page }) => {
      await open(page);
      await openTab(page, 'Carat');
      await option(page, CARAT, 'large').click();
      await expect(summary(page)).toHaveText('Yellow gold 1 ct IF');
    });

    test('leaves out categories the summary does not list', async ({ page }) => {
      await open(page);
      await option(page, MODEL, 'bold').click();
      await openTab(page, 'Extras');
      await option(page, EXTRAS, 'giftbox').click();
      await openTab(page, 'Engraving');
      await engraving(page).pressSequentially('Mia');
      await expectCode(page, 'RING01-bold-medium-yellow-if-giftbox-Mia');
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);
    });

    test('keeps updating after a page swap', async ({ page }) => {
      await open(page);
      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      await openTab(page, 'Color');
      await option(page, COLOR, 'rose').click();
      await expect(summary(page)).toHaveText('Rose gold 0.5 ct IF');
    });

    test('shows the title and call to action under the viewer', async ({ page }) => {
      await open(page);
      await expect(page.getByRole('heading', { name: 'Solitaire' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save my design' })).toBeVisible();
    });
  });

  test.describe('responsive layout', () => {
    const STACKED = { width: 375, height: 667 };

    test('shows the first tab on the first screen when stacked', async ({ page }) => {
      await page.setViewportSize(STACKED);
      await open(page);
      const tab = page.locator('[data-configurator] [role="tablist"]').getByRole('tab').first();
      const box = (await tab.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(STACKED.height);
    });

    test('renders a short 16:9 viewer when stacked', async ({ page }) => {
      await page.setViewportSize(STACKED);
      await open(page);
      const box = (await page.locator('[data-configurator] model-viewer-block').boundingBox())!;
      expect(box.height).toBeLessThan(260);
      expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    });

    test('keeps the canvas drawing buffer in step with the stacked viewer', async ({ page }) => {
      await page.setViewportSize(STACKED);
      await open(page);
      const root = await readyViewer(page);
      const expected = await root.evaluate((el) => {
        const ratio = Math.min(window.devicePixelRatio, 2);
        const { width, height } = el.getBoundingClientRect();
        return [Math.floor(width * ratio), Math.floor(height * ratio)];
      });
      await expect
        .poll(() => root.locator('canvas').evaluate((c: HTMLCanvasElement) => [c.width, c.height]))
        .toEqual(expected);
    });

    test('orbits the model on drag when stacked', async ({ page }) => {
      await page.setViewportSize(STACKED);
      await open(page);
      const root = await readyViewer(page);
      const before = await settledShot(root);
      const box = (await root.locator('canvas').boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();
      await changedShot(root, before);
    });

    test('keeps the 600px viewer beside the tabs on wide screens', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page);
      const viewerBox = (await page
        .locator('[data-configurator] model-viewer-block')
        .boundingBox())!;
      const tabsBox = (await page.locator('[data-configurator] [role="tablist"]').boundingBox())!;
      expect(viewerBox.height).toBe(600);
      expect(tabsBox.x).toBeGreaterThanOrEqual(viewerBox.x + viewerBox.width);
    });
  });

  test.describe('load', () => {
    test('leaves the URL alone on a fresh load', async ({ page }) => {
      await open(page);
      await expectCode(page, null);
    });

    test('restores every panel from a code', async ({ page }) => {
      await open(page, '?code=RING01-bold-large-rose-vvs1-giftbox-Mia');
      await expectGridChecked(page, MODEL, ['bold']);
      await expectGridChecked(page, CARAT, ['large']);
      await expectGridChecked(page, COLOR, ['rose']);
      await expectGridChecked(page, CLARITY, ['vvs1']);
      await expectGridChecked(page, EXTRAS, ['giftbox']);
      await expect(engraving(page)).toHaveValue('Mia');
      await expect(summary(page)).toHaveText('Rose gold 1 ct VVS1');
      await expect(await readyViewer(page)).toHaveAttribute(
        'data-model-viewer-src',
        '/models/ring-alt.glb'
      );
    });

    test('keeps the default for a stale option code', async ({ page }) => {
      await open(page, '?code=RING01-slim-medium-yellow-if--');
      await expectGridChecked(page, MODEL, ['classic']);
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);
    });
  });

  test.describe('write-back', () => {
    test('writes a change into the code', async ({ page }) => {
      await open(page);
      await option(page, MODEL, 'bold').click();
      await expectCode(page, 'RING01-bold-medium-yellow-if--');
    });
  });

  test.describe('history', () => {
    test('steps back and forward through changes', async ({ page }) => {
      await open(page);
      await option(page, MODEL, 'bold').click();
      await openTab(page, 'Carat');
      await option(page, CARAT, 'large').click();
      await expect(summary(page)).toHaveText('Yellow gold 1 ct IF');

      await page.goBack();
      await expectGridChecked(page, CARAT, ['medium']);
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);

      await page.goForward();
      await expectGridChecked(page, CARAT, ['large']);
      await expect(summary(page)).toHaveText('Yellow gold 1 ct IF');
    });
  });

  test.describe('full flow', () => {
    test('configures a ring, shares the URL and restores it', async ({ page, browser }) => {
      await open(page);
      const root = await readyViewer(page);
      await expectCode(page, null);
      await expect(summary(page)).toHaveText(DEFAULT_SUMMARY);

      await option(page, MODEL, 'bold').click();
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring-alt.glb');
      await openTab(page, 'Carat');
      await option(page, CARAT, 'large').click();
      await openTab(page, 'Color');
      await option(page, COLOR, 'white').click();
      await openTab(page, 'Clarity');
      await option(page, CLARITY, 'vs1').click();
      await openTab(page, 'Extras');
      await option(page, EXTRAS, 'certificate').click();
      await option(page, EXTRAS, 'giftbox').click();
      await openTab(page, 'Engraving');
      await engraving(page).pressSequentially('Mia');
      await expect(root).toHaveAttribute('data-model-viewer-camera', 'band');

      const code = 'RING01-bold-large-white-vs1-giftbox.certificate-Mia';
      const full = 'White gold 1 ct VS1';
      await expectCode(page, code);
      await expect(summary(page)).toHaveText(full);

      const shared = await browser.newPage();
      await open(shared, `?code=${code}`);
      await expect(summary(shared)).toHaveText(full);
      await expect(await readyViewer(shared)).toHaveAttribute(
        'data-model-viewer-src',
        '/models/ring-alt.glb'
      );
      await expectGridChecked(shared, MODEL, ['bold']);
      await expectGridChecked(shared, CARAT, ['large']);
      await expectGridChecked(shared, COLOR, ['white']);
      await expectGridChecked(shared, CLARITY, ['vs1']);
      await expectGridChecked(shared, EXTRAS, ['giftbox', 'certificate']);
      await expect(engraving(shared)).toHaveValue('Mia');
      await shared.close();

      // One typing burst is one history entry, so back lands before the engraving.
      await page.goBack();
      await expect(engraving(page)).toHaveValue('');
      await page.goForward();
      await expect(engraving(page)).toHaveValue('Mia');
    });
  });
});
