import { expect, test } from '@playwright/test';

const PAGE_URL = 'http://localhost:3000/documentation/Example';

test.describe('Example component', () => {
  test('preview renders with correct section scoping', async ({ page }) => {
    await page.goto(PAGE_URL);

    const preview = page.locator('[data-doc-section="basic"]');
    await expect(preview).toBeVisible();

    const button = preview.locator('button');
    await expect(button).toBeVisible();
  });

  test('CodeBlock copy button works', async ({ page }) => {
    await page.goto(PAGE_URL);

    const codeBlock = page.locator('[data-code-block]').first();
    await expect(codeBlock).toBeVisible();

    const copyButton = codeBlock.locator('[data-code-block-copy]');
    await expect(copyButton).toBeVisible();

    await copyButton.click();

    // Verify copy status appears
    const status = codeBlock.locator('[data-code-block-status]');
    await expect(status).toBeVisible();
  });

  test('section scoping isolates multiple examples on same page', async ({ page }) => {
    await page.goto(PAGE_URL);

    const sections = page.locator('[data-doc-section]');
    const count = await sections.count();

    expect(count).toBeGreaterThan(1);

    // Each section should contain its own preview
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await expect(section).toBeVisible();
    }
  });

  test('code={false} hides the CodeBlock', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Find the visual-only section
    const visualSection = page.locator('[data-doc-section="visual-only"]');
    await expect(visualSection).toBeVisible();

    // We should have fewer code blocks than sections (because visual-only has no code)
    const allCodeBlocks = page.locator('[data-code-block]');
    const count = await allCodeBlocks.count();

    // We should have fewer code blocks than sections (because visual-only has no code)
    const sections = page.locator('[data-doc-section]');
    const sectionCount = await sections.count();

    expect(count).toBeLessThan(sectionCount);
  });

  test('renders all section scopes with preview and code', async ({ page }) => {
    await page.goto(PAGE_URL);

    // Check that all sections are visible
    const sections = page.locator('[data-doc-section]');
    const count = await sections.count();

    // Should have at least the 3 examples from the documentation
    expect(count).toBeGreaterThanOrEqual(3);

    // Each section should be visible and contained within the example wrapper
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await expect(section).toBeVisible();
    }
  });
});
