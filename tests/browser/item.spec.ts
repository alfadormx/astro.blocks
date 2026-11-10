import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Item';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

test('connectorClass applies to horizontal connector lines', async ({ page }) => {
  await page.goto(PAGE_URL);
  const section = page.locator('[data-doc-section="connector-class"]');

  await expect(section.locator('.border-t.border-primary')).toHaveCount(4);
  await expect(section.locator('.border-t.border-transparent')).toHaveCount(2);
  await expect(section.locator('.border-transparent.border-primary')).toHaveCount(0);
});

test('connectorClass applies to the vertical connector line', async ({ page }) => {
  await page.goto(PAGE_URL);
  const section = page.locator('[data-doc-section="connector-class"]');

  await expect(section.locator('.border-l.border-primary')).toHaveCount(1);
});

test('spacing.margin reaches the item root', async ({ page }) => {
  await page.goto(PAGE_URL);
  const root = page.locator('[data-doc-section="spacing-margin"] > *').first();

  await expect(root).toHaveCSS('margin-top', '32px');
});

test('defaultActionConfig reaches every action', async ({ page }) => {
  await page.goto(PAGE_URL);
  const links = section(page, 'default-action-config').getByRole('link');

  await expect(links).toHaveCount(3);
  for (const link of await links.all()) await expect(link).toHaveCSS('border-top-width', '2px');
});

test('actionsClass reaches the actions wrapper', async ({ page }) => {
  await page.goto(PAGE_URL);
  const links = section(page, 'actions-class').getByRole('link');
  const [a, b] = [await links.nth(0).boundingBox(), await links.nth(1).boundingBox()];

  expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height);
});

for (const suffix of ['', '-horizontal']) {
  test(`an h3 title keeps the div title's box${suffix}`, async ({ page }) => {
    await page.goto(PAGE_URL);
    const div = section(page, `title-tag-div${suffix}`);
    const h3 = section(page, `title-tag-h3${suffix}`);

    await expect(div.getByRole('heading')).toHaveCount(0);
    await expect(h3.getByRole('heading', { level: 3, name: 'Our team' })).toBeVisible();

    const [outerA, outerB] = [await div.boundingBox(), await h3.boundingBox()];
    const [a, b] = [
      await div.getByText('Our team').boundingBox(),
      await h3.getByText('Our team').boundingBox(),
    ];
    for (const key of ['width', 'height'] as const) expect(b![key]).toBeCloseTo(a![key], 0);
    expect(b!.x - outerB!.x).toBeCloseTo(a!.x - outerA!.x, 0);
    expect(b!.y - outerB!.y).toBeCloseTo(a!.y - outerA!.y, 0);
  });
}

test('textTag renders the text as a paragraph', async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(section(page, 'text-tag').locator('p')).toHaveCount(1);
});
