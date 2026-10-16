import { expect, test, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Header';

test('root carries the consumer id and aria-label', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('#doc-header');

  await expect(root).toHaveAttribute('data-header', '');
  await expect(root).toHaveAttribute('aria-label', 'Site header');
});

test('logo id renders once', async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(page.locator('#doc-header-logo')).toHaveCount(1);
});

test('header renders each id and name once', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('#doc-header');
  const ids = await root.locator('[id]').evaluateAll((els) => els.map((el) => el.id));
  const names = await root
    .locator('[name]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('name')));

  expect(ids).toContain('doc-header-logo-image');
  expect(names).toContain('doc-header-logo');
  expect(ids.length).toBe(new Set(ids).size);
  expect(names.length).toBe(new Set(names).size);
});

test('header renders one logo', async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(page.locator('#doc-header a[href="/"]')).toHaveCount(1);
});

test('the logo stays centred on the header row', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGE_URL);
  const logo = await page.locator('#doc-header-logo').boundingBox();
  const row = await page.locator('#doc-header [data-header-row]').boundingBox();

  expect(logo).not.toBeNull();
  expect(row).not.toBeNull();
  expect(Math.abs(logo!.x + logo!.width / 2 - (row!.x + row!.width / 2))).toBeLessThan(1);
});

type Box = { x: number; width: number };

async function zoneLayout(page: Page) {
  return page
    .locator('[data-header-row]')
    .first()
    .evaluate((row) => {
      const box = (el: Element): Box => {
        const r = el.getBoundingClientRect();
        return { x: r.x, width: r.width };
      };
      const [left, logoSlot, right] = Array.from(row.children);
      const logo = logoSlot.querySelector('a, button') ?? logoSlot;
      const items = [left, right].flatMap((zone) =>
        Array.from(zone.querySelectorAll('a, button')).map((el) => {
          const r = el.getBoundingClientRect();
          const cx = r.x + r.width / 2;
          const cy = r.y + r.height / 2;
          const inView = cx >= 0 && cx < window.innerWidth;
          const hit = inView ? document.elementFromPoint(cx, cy) : null;
          return { inView, hitsItself: !!hit && (hit === el || el.contains(hit)) };
        })
      );
      return { left: box(left), logo: box(logo), right: box(right), items };
    });
}

function expectZonesClearOfLogo(layout: Awaited<ReturnType<typeof zoneLayout>>) {
  expect(layout.left.x + layout.left.width).toBeLessThanOrEqual(layout.logo.x + 0.5);
  expect(layout.right.x).toBeGreaterThanOrEqual(layout.logo.x + layout.logo.width - 0.5);
  for (const item of layout.items.filter((i) => i.inView)) expect(item.hitsItself).toBe(true);
}

test.describe('zones at 390px', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('the home header keeps its zones clear of the logo', async ({ page }) => {
    await page.goto('/');
    expectZonesClearOfLogo(await zoneLayout(page));
  });

  test('zones wider than half the row push the logo instead of running under it', async ({
    page,
  }) => {
    await page.goto('/documentation');
    await page
      .locator('[data-header-row]')
      .first()
      .evaluate((row) => {
        const [left, , right] = Array.from(row.children) as HTMLElement[];
        const probe = () => {
          const b = document.createElement('button');
          b.setAttribute('data-probe', '');
          b.style.cssText = `flex:none;height:32px;width:${row.clientWidth / 2 + 40}px`;
          return b;
        };
        left.append(probe());
        right.prepend(probe());
      });
    expectZonesClearOfLogo(await zoneLayout(page));
  });
});
