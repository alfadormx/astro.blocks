import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/ModelViewer';
const SCENE_REQUEST = /modelViewerScene|\.vite\/deps\/three/;
const ROOT_MARGIN_PX = 200;
// SwiftShader renders on the CPU; first load includes compiling three's shaders.
const READY_TIMEOUT = 20_000;

function viewer(page: Page, section: string): Locator {
  return page.locator(`[data-doc-section="${section}"] model-viewer-block`).first();
}

async function readyViewer(page: Page, section: string): Promise<Locator> {
  const root = viewer(page, section);
  await root.scrollIntoViewIfNeeded();
  // The state attribute is only ever advanced by the element's script.
  await expect(root).toHaveAttribute('data-model-viewer-state', 'ready', {
    timeout: READY_TIMEOUT,
  });
  return root;
}

async function failedViewer(page: Page, section: string, reason: string): Promise<Locator> {
  const root = viewer(page, section);
  await root.scrollIntoViewIfNeeded();
  await expect(root).toHaveAttribute('data-model-viewer-state', 'error', {
    timeout: READY_TIMEOUT,
  });
  await expect(root).toHaveAttribute('data-model-viewer-error', reason);
  return root;
}

async function expectStatus(root: Locator, text: string): Promise<void> {
  // The other messages stay in the region as hidden nodes, which textContent would include.
  await expect(root.getByRole('status')).toHaveText(text, { useInnerText: true });
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

// Share of pixels whose largest channel difference exceeds 16 of 255.
function diffRatio(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ([a, b]) => {
      const pixels = async (base64: string) => {
        const bitmap = await createImageBitmap(
          await (await fetch(`data:image/png;base64,${base64}`)).blob()
        );
        const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d')!;
        context.drawImage(bitmap, 0, 0);
        return context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      };
      const [x, y] = await Promise.all([pixels(a), pixels(b)]);
      let changed = 0;
      for (let i = 0; i < x.length; i += 4) {
        const delta = Math.max(
          Math.abs(x[i] - y[i]),
          Math.abs(x[i + 1] - y[i + 1]),
          Math.abs(x[i + 2] - y[i + 2])
        );
        if (delta > 16) changed++;
      }
      return changed / (x.length / 4);
    },
    [a.toString('base64'), b.toString('base64')]
  );
}

function collectWarnings(page: Page): string[] {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().startsWith('[ModelViewer]')) {
      warnings.push(message.text());
    }
  });
  return warnings;
}

function toggle(page: Page, group: string, code: string): Locator {
  return page.locator(
    `[data-toggle-group][data-selection-group="${group}"] [data-option-code="${code}"]`
  );
}

function reset(page: Page, group: string): Locator {
  return page.locator(`[data-selection-group="${group}"] [data-selection-clear]`);
}

test.describe('ModelViewer', () => {
  test('renders the model into a labelled canvas', async ({ page }) => {
    await page.goto(PAGE_URL);
    const root = await readyViewer(page, 'basic');
    await expect(root.getByRole('img', { name: 'An avocado cut in half' })).toBeVisible();
  });

  test('does not request three.js until a viewer nears the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    const requested: string[] = [];
    page.on('request', (request) => requested.push(request.url()));
    await page.goto(PAGE_URL);
    await page.waitForLoadState('load');

    const firstTop = await viewer(page, 'basic').evaluate((el) => el.getBoundingClientRect().top);
    expect(firstTop, 'fixture: first viewer must start below the lazy margin').toBeGreaterThan(
      300 + ROOT_MARGIN_PX
    );
    expect(requested.filter((url) => SCENE_REQUEST.test(url))).toEqual([]);
    await expect(viewer(page, 'basic')).toHaveAttribute('data-model-viewer-state', 'idle');

    await readyViewer(page, 'basic');
    expect(requested.some((url) => SCENE_REQUEST.test(url))).toBe(true);
  });
  test('resizes the canvas drawing buffer with its container', async ({ page }) => {
    await page.goto(PAGE_URL);
    const root = await readyViewer(page, 'basic');
    const ratio = await page.evaluate(() => Math.min(window.devicePixelRatio, 2));
    await root.evaluate((el) => {
      (el as HTMLElement).style.width = '320px';
      (el as HTMLElement).style.height = '240px';
    });
    const canvas = root.locator('canvas');
    await expect
      .poll(() => canvas.evaluate((c: HTMLCanvasElement) => [c.width, c.height]))
      .toEqual([320 * ratio, 240 * ratio]);
  });

  test('releases the WebGL context when the element is removed', async ({ page }) => {
    await page.goto(PAGE_URL);
    await readyViewer(page, 'basic');
    await page.evaluate(() => {
      const root = document.querySelector('[data-doc-section="basic"] model-viewer-block')!;
      const canvas = root.querySelector('canvas')!;
      // Asking for the context type the canvas already has returns that same context.
      (window as unknown as { __gl: WebGL2RenderingContext }).__gl = canvas.getContext('webgl2')!;
      root.remove();
    });
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as unknown as { __gl: WebGL2RenderingContext }).__gl.isContextLost()
        )
      )
      .toBe(true);
  });

  test('initialises new viewers after a view-transition style DOM swap', async ({ page }) => {
    await page.goto(PAGE_URL);
    await readyViewer(page, 'basic');
    await page.evaluate(async () => {
      const selector = '[data-doc-section="basic"]';
      const oldCanvas = document.querySelector<HTMLCanvasElement>(`${selector} canvas`)!;
      (window as unknown as { __gl: WebGL2RenderingContext }).__gl =
        oldCanvas.getContext('webgl2')!;
      const html = await (await fetch(location.href)).text();
      const next = new DOMParser().parseFromString(html, 'text/html').querySelector(selector)!;
      document.querySelector(selector)!.replaceWith(document.adoptNode(next));
      document.dispatchEvent(new Event('astro:after-swap'));
    });
    await readyViewer(page, 'basic');
    await expect(viewer(page, 'basic').locator('canvas')).toHaveCount(1);
    expect(
      await page.evaluate(() =>
        (window as unknown as { __gl: WebGL2RenderingContext }).__gl.isContextLost()
      )
    ).toBe(true);
  });

  test('shows the load message when the model request fails', async ({ page }) => {
    await page.route('**/models/avocado.glb', (route) => route.fulfill({ status: 404 }));
    await page.goto(PAGE_URL);
    const root = await failedViewer(page, 'basic', 'load');
    await expectStatus(root, 'The 3D model could not be loaded.');
    await expect(root).not.toHaveAttribute('aria-busy');
    await expect(root.locator('canvas')).toHaveCount(0);
  });

  test('shows the WebGL message when no context can be created', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ) {
        if (/webgl/.test(type)) return null;
        return original.call(this, type, ...(rest as [])) as never;
      } as typeof original;
    });
    await page.goto(PAGE_URL);
    const root = await failedViewer(page, 'basic', 'webgl');
    await expectStatus(root, 'This 3D view needs WebGL, which this browser does not provide.');
  });

  test('uses the author-supplied message and leaves neighbours working', async ({ page }) => {
    await page.goto(PAGE_URL);
    const failed = await failedViewer(page, 'error', 'load');
    await expectStatus(failed, 'This product preview is unavailable right now.');
    await readyViewer(page, 'basic');
  });

  test('loads a .gltf with an external .bin', async ({ page }) => {
    const binRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/models/water-bottle/WaterBottle.bin'))
        binRequests.push(request.url());
    });
    await page.goto(PAGE_URL);
    await readyViewer(page, 'gltf');
    expect(binRequests.length).toBeGreaterThan(0);
  });

  test('autorotate keeps changing the rendered frame', async ({ page }) => {
    await page.goto(PAGE_URL);
    const root = await readyViewer(page, 'autorotate');
    const first = await root.screenshot();
    await expect.poll(async () => (await root.screenshot()).equals(first)).toBe(false);
  });

  test('autorotate stays still under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGE_URL);
    const root = await readyViewer(page, 'autorotate');
    await page.waitForTimeout(300);
    const first = await root.screenshot();
    await page.waitForTimeout(600);
    expect((await root.screenshot()).equals(first)).toBe(true);
  });

  test.describe('selections', () => {
    const BAND = 'modelviewer-doc-band';
    const MODEL = 'modelviewer-doc-model';

    test('recolours the band when an option is picked and reverts on reset', async ({ page }) => {
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');
      const baseline = await settledShot(root);

      await toggle(page, BAND, 'white').click();
      const white = await changedShot(root, baseline);

      await reset(page, BAND).click();
      const reverted = await changedShot(root, white);
      expect(reverted.equals(baseline)).toBe(true);

      await toggle(page, BAND, 'rose').click();
      await changedShot(root, baseline);
    });

    test('applies a selection made before the model loaded', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 300 });
      await page.goto(PAGE_URL);
      const group = page.locator(`[data-toggle-group][data-selection-group="${BAND}"]`);
      await expect(group).toHaveAttribute('data-toggle-group-ready', '');
      await group.locator('input[value="white"]').evaluate((el: HTMLInputElement) => el.click());
      await expect(viewer(page, 'configurator')).toHaveAttribute('data-model-viewer-state', 'idle');
      // In a viewport shorter than the viewer, the fixed dev toolbar lands on it at scroll-dependent spots.
      await page.setViewportSize({ width: 1280, height: 900 });

      const root = await readyViewer(page, 'configurator');
      const picked = await settledShot(root);
      await reset(page, BAND).click();
      await changedShot(root, picked);

      await toggle(page, BAND, 'white').click();
      await expect.poll(async () => (await settledShot(root)).equals(picked)).toBe(true);
    });

    test('switches the visible stone per carat and restores it on reset', async ({ page }) => {
      const CARAT = 'modelviewer-doc-carat';
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');
      const medium = await settledShot(root);

      await toggle(page, CARAT, 'large').click();
      const large = await changedShot(root, medium);

      await toggle(page, CARAT, 'small').click();
      const small = await changedShot(root, large);
      expect(small.equals(medium)).toBe(false);

      await toggle(page, CARAT, 'medium').click();
      expect((await changedShot(root, small)).equals(medium)).toBe(true);

      await reset(page, CARAT).click();
      await changedShot(root, medium);
    });

    test('frames the band once when typing an engraving and does not snap back', async ({
      page,
    }) => {
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');
      const engraving = page.locator('[data-doc-section="configurator"] textarea');

      await engraving.pressSequentially('A');
      await expect(root).toHaveAttribute('data-model-viewer-camera', 'band');
      const framed = await settledShot(root);

      const box = (await root.locator('canvas').boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 });
      await page.mouse.up();
      const orbited = await changedShot(root, framed);

      await engraving.pressSequentially('B');
      await page.waitForTimeout(800);
      // OrbitControls keeps a sub-threshold damping residue that the next render consumes.
      expect(await diffRatio(page, await settledShot(root), orbited)).toBeLessThan(0.02);
    });

    test('jumps to the preset under reduced motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');

      await page.locator('[data-doc-section="configurator"] textarea').pressSequentially('A');
      await expect(root).toHaveAttribute('data-model-viewer-camera', 'band');
      await page.waitForTimeout(100);
      const early = await root.screenshot();
      await page.waitForTimeout(700);
      expect((await root.screenshot()).equals(early)).toBe(true);
    });

    test('swaps to the alternate ring and reflects the effective src', async ({ page }) => {
      await page.route('**/models/ring-alt.glb', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.continue();
      });
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring.glb');

      await toggle(page, MODEL, 'bold').click();
      await expect(root).toHaveAttribute('data-model-viewer-loading', '');
      await expect(root).toHaveAttribute('aria-busy', 'true');

      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring-alt.glb');
      await expect(root).not.toHaveAttribute('data-model-viewer-loading');
      await expect(root).not.toHaveAttribute('aria-busy');
      await expect(root).toHaveAttribute('data-model-viewer-state', 'ready');
    });

    test('keeps the current model when a swap fails', async ({ page }) => {
      await page.route('**/models/ring-alt.glb', (route) => route.fulfill({ status: 404 }));
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');

      const failed = page.waitForEvent('console', (message) =>
        message.text().includes('model "/models/ring-alt.glb" could not be loaded')
      );
      await toggle(page, MODEL, 'bold').click();
      await failed;

      await expect(root).not.toHaveAttribute('data-model-viewer-loading');
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring.glb');
      await expect(root).toHaveAttribute('data-model-viewer-state', 'ready');
      await expect(root.locator('canvas')).toHaveCount(1);
    });

    test('ends on the last choice after a rapid double swap', async ({ page }) => {
      await page.route('**/models/ring-alt.glb', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue().catch(() => {});
      });
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');

      await toggle(page, MODEL, 'bold').click();
      await expect(root).toHaveAttribute('data-model-viewer-loading', '');
      await toggle(page, MODEL, 'classic').click();

      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring.glb');
      await expect(root).not.toHaveAttribute('data-model-viewer-loading');
      await page.waitForTimeout(1500);
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring.glb');
    });

    test('keeps band and carat choices across a swap and back', async ({ page }) => {
      await page.goto(PAGE_URL);
      const root = await readyViewer(page, 'configurator');
      const initial = await settledShot(root);
      await toggle(page, BAND, 'white').click();
      await toggle(page, 'modelviewer-doc-carat', 'large').click();
      await changedShot(root, initial);
      const before = await settledShot(root);

      await toggle(page, MODEL, 'bold').click();
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring-alt.glb');
      const bold = await changedShot(root, before);

      await toggle(page, MODEL, 'classic').click();
      await expect(root).toHaveAttribute('data-model-viewer-src', '/models/ring.glb');
      expect((await changedShot(root, bold)).equals(before)).toBe(true);
    });

    test('warns once per problem in development and keeps rendering', async ({ page }) => {
      const warnings = collectWarnings(page);
      await page.goto(PAGE_URL);
      await readyViewer(page, 'configurator');
      const root = await readyViewer(page, 'warnings');
      const group = 'modelviewer-doc-warnings';

      await toggle(page, group, 'missing').click();
      await toggle(page, group, 'broken').click();
      await expect.poll(() => warnings.some((w) => w.includes('missing.glb'))).toBe(true);
      await toggle(page, group, 'missing').click();
      await expect(root).not.toHaveAttribute('data-model-viewer-loading');

      const count = (pattern: RegExp) => warnings.filter((w) => pattern.test(w)).length;
      expect(count(/group "modelviewer-doc-undeclared"/)).toBe(1);
      expect(count(/material "Platinum"/)).toBe(1);
      expect(count(/part "Stone_Huge"/)).toBe(1);
      expect(count(/model "\/models\/missing\.glb"/)).toBe(1);
      expect(warnings.filter((w) => w.includes('modelviewer-doc-band'))).toEqual([]);
      await expect(root).toHaveAttribute('data-model-viewer-state', 'ready');
    });
  });
});
