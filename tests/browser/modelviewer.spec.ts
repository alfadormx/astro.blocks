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
});
