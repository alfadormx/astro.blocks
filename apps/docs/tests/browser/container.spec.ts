import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/layout/Container';
const MIN_HEIGHT_SECTIONS = ['min-height-top', 'min-height-center'] as const;
const MIN_H_96 = 384;

function container(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"] section`).first();
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
}

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL);
});

for (const name of MIN_HEIGHT_SECTIONS) {
  test(`${name} is exactly its min-height tall, padding included`, async ({ page }) => {
    expect((await box(container(page, name))).height).toBeCloseTo(MIN_H_96, 0);
  });
}

test('min-height-center centres its items vertically in the container', async ({ page }) => {
  const outer = await box(container(page, 'min-height-center'));
  const item = await box(container(page, 'min-height-center').getByText('Item 1'));
  expect(Math.abs(item.y + item.height / 2 - (outer.y + outer.height / 2))).toBeLessThan(4);
});

test('min-height-full-center centres its stack vertically in the container', async ({ page }) => {
  const outer = await box(container(page, 'min-height-full-center'));
  const middle = await box(container(page, 'min-height-full-center').getByText('Item 2'));
  expect(Math.abs(middle.y + middle.height / 2 - (outer.y + outer.height / 2))).toBeLessThan(4);
});

test('min-height-top keeps its items at the top of the content box', async ({ page }) => {
  const content = await box(container(page, 'min-height-top').locator(':scope > div').last());
  const item = await box(container(page, 'min-height-top').getByText('Item 1'));
  expect(item.y - content.y).toBeLessThan(40);
});
