import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/layout/Modal';

test('closeButton aria-label reaches the close button', async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.locator('[data-modal-trigger="labelled-modal"]').click();
  const close = page.locator('#labelled-modal [data-modal-close][aria-label]');

  await expect(close).toBeVisible();
  await expect(close).toHaveAttribute('aria-label', 'Dismiss dialog');
});

test('default close button keeps its built-in aria-label', async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.locator('[data-modal-trigger="modal-basic"]').click();
  const close = page.locator('#modal-basic [data-modal-close][aria-label]');

  await expect(close).toBeVisible();
  await expect(close).toHaveAttribute('aria-label', 'Close modal');
});

test('following a link inside an open modal closes it', async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.locator('[data-modal-trigger="modal-link"]').click();
  const modal = page.locator('#modal-link');
  await expect(modal).toBeVisible();
  await modal.getByRole('link', { name: 'Jump to the target' }).click();
  await expect(modal).toBeHidden();
  await expect(page).toHaveURL(/#link-closes-target$/);
});

test('a modifier-click on a link inside a modal leaves it open', async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.locator('[data-modal-trigger="modal-link"]').click();
  const modal = page.locator('#modal-link');
  await modal
    .getByRole('link', { name: 'Jump to the target' })
    .click({ modifiers: ['ControlOrMeta'] });
  await expect(modal).toBeVisible();
});

test('a new-tab link inside a modal leaves it open', async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.locator('[data-modal-trigger="modal-link"]').click();
  const modal = page.locator('#modal-link');
  const popup = page.waitForEvent('popup');
  await modal.getByRole('link', { name: 'Open the target in a new tab' }).click();
  await popup;
  await expect(modal).toBeVisible();
});
