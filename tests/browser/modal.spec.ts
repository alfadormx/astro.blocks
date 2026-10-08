import { expect, test } from '@playwright/test';

const PAGE_URL = '/documentation/layout/Modal';

test('closeButtonConfig aria-label reaches the close button', async ({ page }) => {
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
