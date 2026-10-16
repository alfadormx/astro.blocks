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

type Box = { x: number; y: number; width: number; height: number };
type Layout = Awaited<ReturnType<typeof zoneLayout>>;

async function zoneLayout(page: Page) {
  return page
    .locator('[data-header-row]')
    .first()
    .evaluate((row) => {
      const box = (el: Element): Box => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const lines = (el: Element) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let max = 0;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          max = Math.max(max, range.getClientRects().length);
        }
        return max;
      };
      const [left, logoSlot, right] = Array.from(row.children);
      const logo = logoSlot.querySelector('a, button') ?? logoSlot;
      const items = [left, right].flatMap((zone) =>
        Array.from(zone.querySelectorAll('a, button'))
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => {
            const b = box(el);
            const cx = b.x + b.width / 2;
            const cy = b.y + b.height / 2;
            const inViewport = cx >= 0 && cx < innerWidth && cy >= 0 && cy < innerHeight;
            const hit = inViewport ? document.elementFromPoint(cx, cy) : null;
            return {
              label: el.textContent?.trim() || el.getAttribute('aria-label') || el.tagName,
              box: b,
              hitsItself: !!hit && (hit === el || el.contains(hit)),
              lines: lines(el),
            };
          })
      );
      return {
        left: box(left),
        logo: box(logo),
        right: box(right),
        items,
        innerWidth,
        rowScrollWidth: row.scrollWidth,
        rowClientWidth: row.clientWidth,
      };
    });
}

function overlaps(a: Box, b: Box) {
  return (
    a.x + a.width > b.x + 0.5 &&
    b.x + b.width > a.x + 0.5 &&
    a.y + a.height > b.y + 0.5 &&
    b.y + b.height > a.y + 0.5
  );
}

function expectZonesClearOfLogo(layout: Layout) {
  expect(overlaps(layout.left, layout.logo)).toBe(false);
  expect(overlaps(layout.right, layout.logo)).toBe(false);
  for (const item of layout.items) expect(item.hitsItself, item.label).toBe(true);
}

function expectReachable(layout: Layout) {
  expect(Math.max(...layout.items.map(({ box }) => box.x + box.width))).toBeLessThanOrEqual(
    layout.innerWidth
  );
  for (const { label, box, hitsItself, lines } of layout.items) {
    expect(box.x, label).toBeGreaterThanOrEqual(0);
    expect(hitsItself, label).toBe(true);
    expect(lines, label).toBeLessThanOrEqual(1);
  }
  expect(layout.rowScrollWidth).toBeLessThanOrEqual(layout.rowClientWidth);
}

const centreY = (b: Box) => b.y + b.height / 2;

test.describe('zones at 390px', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('the home header keeps its zones clear of the logo', async ({ page }) => {
    await page.goto('/');
    const layout = await zoneLayout(page);

    expectZonesClearOfLogo(layout);
    expect(Math.abs(centreY(layout.left) - centreY(layout.logo))).toBeLessThan(1);
    expect(Math.abs(centreY(layout.right) - centreY(layout.logo))).toBeLessThan(1);
    for (const { label, box } of layout.items) {
      expect(Math.abs(centreY(box) - centreY(layout.logo)), label).toBeLessThan(1);
    }
    expect(layout.left.x + layout.left.width).toBeLessThanOrEqual(layout.logo.x + 0.5);
    expect(layout.right.x).toBeGreaterThanOrEqual(layout.logo.x + layout.logo.width - 0.5);
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

  for (const { name, floating } of [
    { name: 'static', floating: false },
    { name: 'floating', floating: true },
  ]) {
    test(`${name} header keeps every control reachable with wide zones`, async ({ page }) => {
      await page.goto('/');
      await page
        .locator('[data-header]')
        .first()
        .evaluate((header, floating) => {
          // The isFloating classes from Header.astro's topClasses.
          if (floating) header.classList.add('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
          const row = header.querySelector('[data-header-row]')!;
          const [left, , right] = Array.from(row.children) as HTMLElement[];
          const template = Array.from(row.querySelectorAll('a')).find(
            (a) => a.textContent?.trim() === 'Documentation'
          )!;
          const probe = (label: string) => {
            const b = document.createElement('button');
            b.className = template.className;
            b.textContent = label;
            return b;
          };
          left.append(
            probe('Browse all product categories'),
            probe('Customer service and returns')
          );
          right.prepend(probe('Track your order status'), probe('Sign in to your account'));
        }, floating);
      const layout = await zoneLayout(page);

      expectReachable(layout);
      expectZonesClearOfLogo(layout);
      expect((await page.locator('[data-theme-toggle]').first().boundingBox())?.width).toBe(40);
    });
  }
});
