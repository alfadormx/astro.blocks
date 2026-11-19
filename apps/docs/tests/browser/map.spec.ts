import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/Map';
const ROOT_MARGIN_PX = 200;
const LEAFLET_REQUEST = /\.vite\/deps\/leaflet|leaflet\.js|tile\.openstreetmap|tile\.opentopomap/;

const section = (page: Page, name: string): Locator => page.locator(`[data-doc-section="${name}"]`);
const map = (page: Page, name: string) => section(page, name).locator('[data-map-config]');

async function readyMap(page: Page, name: string): Promise<Locator> {
  const el = map(page, name);
  await el.scrollIntoViewIfNeeded();
  await expect(el).toHaveAttribute('data-map-ready', '');
  return el;
}

test.describe('Map', () => {
  test('requests neither Leaflet nor tiles until a map nears the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto(PAGE_URL);
    await page.waitForLoadState('load');

    const top = await map(page, 'default').evaluate((el) => el.getBoundingClientRect().top);
    expect(top, 'fixture: first map must start below the lazy margin').toBeGreaterThan(
      300 + ROOT_MARGIN_PX
    );
    expect(requested.filter((u) => LEAFLET_REQUEST.test(u))).toEqual([]);
    await expect(map(page, 'default')).not.toHaveAttribute('data-map-ready');

    await readyMap(page, 'default');
    expect(requested.some((u) => LEAFLET_REQUEST.test(u))).toBe(true);
  });

  test('marks a map ready and renders Leaflet into it once scrolled into view', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    const el = await readyMap(page, 'popup');
    await expect(el).toHaveClass(/leaflet-container/);
    await expect(el.locator('.leaflet-popup-content')).toHaveText('Eiffel Tower');
  });

  test('initialises a map added before astro:after-swap, and no map twice', async ({ page }) => {
    await page.goto(PAGE_URL);
    await readyMap(page, 'default');
    await page.evaluate(() => {
      const el = document.createElement('div');
      el.dataset.mapConfig = JSON.stringify({
        lat: 40.42,
        lon: -3.7,
        zoom: 13,
        layer: 'mapnik',
        showMarker: true,
      });
      el.dataset.testAdded = '';
      el.style.height = '200px';
      document.querySelector('[data-doc-section="default"]')!.append(el);
      document.dispatchEvent(new Event('astro:after-swap'));
    });
    const added = page.locator('[data-test-added]');
    await added.scrollIntoViewIfNeeded();
    await expect(added).toHaveAttribute('data-map-ready', '');
    const original = section(page, 'default').locator('[data-map-config]:not([data-test-added])');
    await expect(original.locator('.leaflet-map-pane')).toHaveCount(1);
    await expect(added.locator('.leaflet-map-pane')).toHaveCount(1);
  });
});
