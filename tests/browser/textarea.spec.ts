import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/TextArea';

type EventWindow = { __events: unknown[] };

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function readyField(page: Page, sectionName: string): Promise<Locator> {
  const root = section(page, sectionName).locator('[data-textarea]').first();
  // Counter text is server-rendered; this attribute is the script's post-init signal.
  await expect(root).toHaveAttribute('data-textarea-ready', '');
  return root.locator('textarea');
}

async function collectEvents(page: Page): Promise<() => Promise<unknown[]>> {
  await page.evaluate(() => {
    (window as unknown as EventWindow).__events = [];
    document.addEventListener('selection:change', (e) =>
      (window as unknown as EventWindow).__events.push((e as CustomEvent).detail)
    );
  });
  return () => page.evaluate(() => (window as unknown as EventWindow).__events);
}

async function groupEvents(events: () => Promise<unknown[]>, group: string): Promise<unknown[]> {
  return (await events()).filter((detail) => (detail as { group: string }).group === group);
}

test.describe('TextArea', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the label names the field', async ({ page }) => {
    await expect(section(page, 'basic').locator('textarea')).toHaveAccessibleName('Message');
  });

  test('help text is the field description', async ({ page }) => {
    await expect(
      section(page, 'help').getByRole('textbox', { name: 'Delivery notes' })
    ).toHaveAccessibleDescription('Visible to the courier only.');
  });

  test('a hidden label still names the field', async ({ page }) => {
    const label = section(page, 'help').locator('label', { hasText: 'Comment' });
    await expect(label).toHaveClass(/sr-only/);
    await expect(section(page, 'help').getByRole('textbox', { name: 'Comment' })).toBeVisible();
  });

  test('a field without help has no description reference', async ({ page }) => {
    await expect(section(page, 'basic').locator('textarea')).not.toHaveAttribute(
      'aria-describedby'
    );
  });

  test.describe('character limit', () => {
    test('typing stops at maxLength', async ({ page }) => {
      const field = await readyField(page, 'limit');
      await field.pressSequentially('x'.repeat(45));
      await expect(field).toHaveValue('x'.repeat(40));
    });

    test('counter follows the value', async ({ page }) => {
      const field = await readyField(page, 'limit');
      const counter = section(page, 'limit').locator('[data-textarea-counter]');
      await expect(counter).toHaveText('0 / 40');
      await field.pressSequentially('Hello');
      await expect(counter).toHaveText('5 / 40');
      await field.fill('');
      await expect(counter).toHaveText('0 / 40');
    });

    test('counter is part of the description', async ({ page }) => {
      const field = await readyField(page, 'limit');
      await expect(field).toHaveAccessibleDescription(/illustrative purposes only.*0 \/ 40/);
    });
  });

  test.describe('states', () => {
    test('error text is announced and marks the field invalid', async ({ page }) => {
      const field = await readyField(page, 'error');
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(field).toHaveAccessibleDescription(
        `Letters, digits and basic punctuation. Emoji cannot be engraved. ${'Hello 👋'.length} / 40`
      );
    });

    test('a field without error is not marked invalid', async ({ page }) => {
      await expect(section(page, 'basic').locator('textarea')).not.toHaveAttribute('aria-invalid');
    });

    test('disabled field rejects input', async ({ page }) => {
      const field = section(page, 'states').getByRole('textbox', { name: 'Disabled' });
      await expect(field).toBeDisabled();
      await field.click({ force: true });
      await page.keyboard.type('x');
      await expect(field).toHaveValue('Locked text');
    });

    test('read-only field rejects input but stays focusable', async ({ page }) => {
      const field = section(page, 'states').getByRole('textbox', { name: 'Read-only' });
      await expect(field).toHaveAttribute('readonly', '');
      await field.focus();
      await expect(field).toBeFocused();
      await page.keyboard.type('x');
      await expect(field).toHaveValue('Fixed engraving');
    });
  });

  test.describe('selection group', () => {
    const GROUP = 'textarea-doc-events';

    function counter(page: Page): Locator {
      return section(page, 'events').locator('[data-textarea-counter]');
    }

    test('typing publishes the raw text', async ({ page }) => {
      const field = await readyField(page, 'events');
      const events = await collectEvents(page);
      await field.fill('For Sam ');
      expect((await groupEvents(events, GROUP)).at(-1)).toEqual({
        group: GROUP,
        mode: 'text',
        selection: [{ code: 'For Sam ' }],
      });
    });

    test('clearing publishes an empty selection', async ({ page }) => {
      const field = await readyField(page, 'events');
      const events = await collectEvents(page);
      await field.fill('x');
      await field.fill('');
      expect((await groupEvents(events, GROUP)).at(-1)).toEqual({
        group: GROUP,
        mode: 'text',
        selection: [],
      });
    });

    test('an external publish is reflected', async ({ page }) => {
      const field = await readyField(page, 'events');
      await page.getByRole('button', { name: 'Publish “For Sam”' }).click();
      await expect(field).toHaveValue('For Sam');
      await expect(counter(page)).toHaveText('7 / 20');
    });

    test('an over-long external publish is truncated and republished', async ({ page }) => {
      const field = await readyField(page, 'events');
      const events = await collectEvents(page);
      await page.getByRole('button', { name: 'Publish an over-long value' }).click();
      await expect(field).toHaveValue('Happy anniversary, w');
      await expect
        .poll(() => groupEvents(events, GROUP))
        .toEqual([
          { group: GROUP, mode: 'text', selection: [{ code: 'Happy anniversary, with love' }] },
          { group: GROUP, mode: 'text', selection: [{ code: 'Happy anniversary, w' }] },
        ]);
      const log = section(page, 'events').locator('[data-selection-log]');
      expect(JSON.parse((await log.textContent())!).selection).toEqual([
        { code: 'Happy anniversary, w' },
      ]);
    });

    test('clear button empties the field', async ({ page }) => {
      const field = await readyField(page, 'events');
      await field.fill('x');
      await page.getByRole('button', { name: 'Clear' }).click();
      await expect(field).toHaveValue('');
      await expect(counter(page)).toHaveText('0 / 20');
    });

    test('keeps counting and publishing after astro:after-swap', async ({ page }) => {
      const field = await readyField(page, 'events');
      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      const events = await collectEvents(page);
      await field.fill('abc');
      await expect(counter(page)).toHaveText('3 / 20');
      expect(await groupEvents(events, GROUP)).toEqual([
        { group: GROUP, mode: 'text', selection: [{ code: 'abc' }] },
      ]);
    });

    test('republishes a non-empty value on reconnect', async ({ page }) => {
      const field = await readyField(page, 'events');
      await field.fill('abc');
      const events = await collectEvents(page);
      await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
      expect(await groupEvents(events, GROUP)).toEqual([
        { group: GROUP, mode: 'text', selection: [{ code: 'abc' }] },
      ]);
    });

    test('a field without a group declares no selection group', async ({ page }) => {
      await expect(section(page, 'basic').locator('[data-textarea]')).not.toHaveAttribute(
        'data-selection-group'
      );
    });
  });
});
