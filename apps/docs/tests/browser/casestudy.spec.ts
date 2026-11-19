import { expect, test } from '@playwright/test';

test('CaseStudyCard docs: the card has one link, named by the title', async ({ page }) => {
  await page.goto('/documentation/composite/CaseStudyCard');
  const section = page.locator('[data-doc-section="basic"]');
  await expect(section.getByRole('link')).toHaveAccessibleName('A ring configurator that sells');
  await expect(section.locator('[data-entry-card-eyebrow]')).toHaveText('Example Jewellers');
});

test.describe('CaseStudyLayout docs', () => {
  test.beforeEach(async ({ page }) => page.goto('/documentation/composite/CaseStudyLayout'));

  test('renders results and a map', async ({ page }) => {
    const section = page.locator('[data-doc-section="results-map"]');
    await expect(section.locator('[data-case-study-results] dt')).toHaveText([
      'Conversion',
      'Returns',
      'Time on page',
    ]);
    await expect(section.getByRole('application', { name: 'Amsterdam' })).toBeVisible();
  });

  test('map: false hides the map', async ({ page }) => {
    await expect(page.locator('[data-doc-section="no-map"] [data-entry-map]')).toHaveCount(0);
  });
});
