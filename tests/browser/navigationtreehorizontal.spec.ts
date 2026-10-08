import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/NavigationTreeHorizontal';

async function section(page: Page, name: string): Promise<Locator> {
  await page.goto(PAGE_URL);
  return page.locator(`[data-doc-section="${name}"]`);
}

test('defaultItemConfig iconPosition left renders the chevron before the label', async ({
  page,
}) => {
  const parent = (await section(page, 'icon-left')).locator('[data-nav-parent]').first();

  expect(await parent.evaluate((el) => el.firstElementChild?.tagName.toLowerCase())).toBe('svg');
});

test('default parents render the chevron after the label', async ({ page }) => {
  const parent = (await section(page, 'click')).locator('[data-nav-parent]').first();

  expect(await parent.evaluate((el) => el.lastElementChild?.tagName.toLowerCase())).toBe('svg');
});

test('click trigger opens and closes the dropdown', async ({ page }) => {
  const root = await section(page, 'click');
  const dropdown = root.locator('[data-nav-dropdown]').first();

  await expect(dropdown).toBeHidden();
  await root.locator('[data-nav-parent]').first().click();
  // Move away so the group-hover rule can't be what keeps the dropdown open.
  await page.mouse.move(0, 0);
  await expect(dropdown).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dropdown).toBeHidden();
});
