import { expect, test, type Locator, type Page, type Route } from '@playwright/test';
import { expectFocusRing, primaryColour, tokenColour } from './focusRing';

const PAGE_URL = '/documentation/composite/ContactForm';

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

async function openForm(page: Page, name = 'basic'): Promise<Locator> {
  await page.goto(PAGE_URL);
  const form = section(page, name).locator('form[data-contact-form]');
  await expect(form).toHaveAttribute('data-contact-form-ready', '');
  return form;
}

function fulfil(status: number) {
  return (route: Route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(status < 400 ? { ok: true } : { error: 'nope' }),
    });
}

async function countRequests(page: Page, pattern: string, status = 200): Promise<() => number> {
  let count = 0;
  await page.route(pattern, (route) => {
    count++;
    return fulfil(status)(route);
  });
  return () => count;
}

function textbox(form: Locator, name: string): Locator {
  return form.getByRole('textbox', { name, exact: true });
}

async function fillRequired(form: Locator): Promise<void> {
  await textbox(form, 'Name').fill('Ada');
  await textbox(form, 'Email').fill('ada@example.com');
  await textbox(form, 'Message').fill('Hello');
}

function status(form: Locator): Locator {
  return form.locator('[data-contact-form-status]');
}

function submit(form: Locator): Locator {
  return form.locator('[data-contact-form-submit]');
}

test.describe('ContactForm endpoint', () => {
  test('renders the five default fields, with the required marker on Name, Email and Message', async ({
    page,
  }) => {
    const form = await openForm(page);
    const required = { Name: true, Email: true, Phone: false, Subject: false, Message: true };
    for (const [name, isRequired] of Object.entries(required)) {
      await expect(textbox(form, name)).toBeVisible();
      await expect(
        form.locator('label', { hasText: name }).locator('[data-field-required]')
      ).toHaveCount(isRequired ? 1 : 0);
    }
  });

  test('posts natively to the endpoint without JavaScript', async ({ page }) => {
    const form = await openForm(page);
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toHaveAttribute('action', 'https://formspree.io/f/demo-basic');
  });

  test('a successful send shows and focuses the success message and hides the form', async ({
    page,
  }) => {
    await page.route('**/demo-basic', fulfil(200));
    const form = await openForm(page);
    await fillRequired(form);
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    await expect(status(form)).toHaveText('Thanks, your message has been sent.');
    await expect(status(form)).toBeFocused();
    await expect(form.locator('[data-contact-form-fields]')).toBeHidden();
    await expect(submit(form)).toBeHidden();
  });

  test('a failed send focuses the error message and keeps the values', async ({ page }) => {
    await page.route('**/demo-basic', fulfil(500));
    const form = await openForm(page);
    await fillRequired(form);
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'error');
    await expect(status(form)).toHaveText('Your message could not be sent. Please try again.');
    await expect(status(form)).toBeFocused();
    await expect(textbox(form, 'Name')).toHaveValue('Ada');
    await expect(textbox(form, 'Message')).toHaveValue('Hello');
    await expect(submit(form)).toBeEnabled();
  });

  test('a retry after an error can succeed', async ({ page }) => {
    let calls = 0;
    await page.route('**/demo-basic', (route) => fulfil(++calls === 1 ? 500 : 200)(route));
    const form = await openForm(page);
    await fillRequired(form);
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'error');
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    expect(calls).toBe(2);
  });

  test('an invalid form does not send', async ({ page }) => {
    const requests = await countRequests(page, '**/demo-basic');
    const form = await openForm(page);
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'idle');
    expect(requests()).toBe(0);
  });
});

test.describe('ContactForm custom fields', () => {
  test('renders a Select, a CheckboxGroup and a consent Checkbox', async ({ page }) => {
    const form = await openForm(page, 'custom-fields');
    await expect(form.getByRole('combobox', { name: 'Topic' })).toBeVisible();
    await expect(form.getByRole('group', { name: 'Interests' })).toBeVisible();
    await expect(form.getByRole('checkbox', { name: 'I agree to be contacted' })).toBeVisible();
  });

  test('posts every field, with repeated names for ticked interests', async ({ page }) => {
    let body = '';
    await page.route('**/demo-custom-fields', (route) => {
      body = route.request().postData() ?? '';
      return fulfil(200)(route);
    });
    const form = await openForm(page, 'custom-fields');
    await fillRequired(form);
    await form.getByRole('combobox', { name: 'Topic' }).selectOption('support');
    const interests = form.getByRole('group', { name: 'Interests' });
    await interests.getByRole('checkbox', { name: 'Events' }).check();
    await interests.getByRole('checkbox', { name: 'Hiring' }).check();
    await form.getByRole('checkbox', { name: 'I agree to be contacted' }).check();
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    expect(body).toContain('name="topic"');
    expect(body).toContain('name="consent"');
    expect(body.match(/name="interests"/g)).toHaveLength(2);
  });
});

test.describe('ContactForm honeypot', () => {
  test('a filled honeypot reports success without sending', async ({ page }) => {
    const requests = await countRequests(page, '**/demo-basic');
    const form = await openForm(page);
    await fillRequired(form);
    await form.locator('[name="_gotcha"]').fill('bot', { force: true });
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    await expect(status(form)).toBeFocused();
    expect(requests()).toBe(0);
  });

  test('the honeypot is not in the accessibility tree', async ({ page }) => {
    const form = await openForm(page);
    await expect(form.getByRole('textbox', { name: 'Leave this field empty' })).toHaveCount(0);
  });

  test('Tab from Message skips the honeypot and lands on Send', async ({ page }) => {
    const form = await openForm(page);
    await textbox(form, 'Message').focus();
    await page.keyboard.press('Tab');
    await expect(submit(form)).toBeFocused();
  });
});

test.describe('ContactForm mailto', () => {
  test('submitting shows and focuses the mailto notice without any http request', async ({
    page,
  }) => {
    const form = await openForm(page, 'mailto');
    const sent: string[] = [];
    page.on('request', (request) => {
      if (/^https?:/.test(request.url()) && request.method() === 'POST') sent.push(request.url());
    });
    await fillRequired(form);
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    await expect(status(form)).toHaveText(
      'Your mail app should open with the message ready to send.'
    );
    await expect(status(form)).toBeFocused();
    expect(sent).toEqual([]);
  });
});

test.describe('ContactForm aside', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(PAGE_URL);
  });

  test('the basic form renders no aside', async ({ page }) => {
    await expect(section(page, 'basic').locator('[data-contact-form-aside]')).toHaveCount(0);
  });

  test('the aside sits right of the form on wide screens', async ({ page }) => {
    const main = section(page, 'aside').locator('[data-contact-form-main]');
    const aside = section(page, 'aside').locator('[data-contact-form-aside]');
    await expect(main).toBeVisible();
    await expect(aside).toBeVisible();
    expect((await main.boundingBox())!.x).toBeLessThan((await aside.boundingBox())!.x);
  });

  test('asidePosition left puts the aside left of the form', async ({ page }) => {
    const main = section(page, 'aside-left').locator('[data-contact-form-main]');
    const aside = section(page, 'aside-left').locator('[data-contact-form-aside]');
    await expect(aside).toBeVisible();
    expect((await aside.boundingBox())!.x).toBeLessThan((await main.boundingBox())!.x);
  });

  for (const name of ['aside', 'aside-left']) {
    test(`a Map in the ${name} demo initialises`, async ({ page }) => {
      const map = section(page, name).locator('[data-map-config]');
      await expect(map).toBeVisible();
      await expect(map).toHaveClass(/leaflet-container/);
    });
  }
});

test.describe('ContactForm keyboard and re-init', () => {
  test('Tab walks the default fields in order, then Send', async ({ page }) => {
    const form = await openForm(page);
    await textbox(form, 'Name').focus();
    for (const name of ['Email', 'Phone', 'Subject', 'Message']) {
      await page.keyboard.press('Tab');
      await expect(textbox(form, name)).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(submit(form)).toBeFocused();
  });

  test('Enter in the Email field submits a valid form', async ({ page }) => {
    const requests = await countRequests(page, '**/demo-basic');
    const form = await openForm(page);
    await fillRequired(form);
    await textbox(form, 'Email').press('Enter');
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    expect(requests()).toBe(1);
  });

  test('a second init after a page swap does not double-bind', async ({ page }) => {
    const requests = await countRequests(page, '**/demo-basic');
    const form = await openForm(page);
    await page.evaluate(() => document.dispatchEvent(new Event('astro:after-swap')));
    await fillRequired(form);
    await submit(form).click();
    await expect(form).toHaveAttribute('data-contact-form-state', 'success');
    expect(requests()).toBe(1);
  });
});

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`ContactForm ${colorScheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme });
    });

    test('html carries the theme', async ({ page }) => {
      await openForm(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    });

    test('keyboard focus on a field shows the primary ring', async ({ page }) => {
      const form = await openForm(page);
      const name = textbox(form, 'Name');
      await name.focus();
      await expectFocusRing(name, await primaryColour(page));
    });

    test('the error message stands out from the page background', async ({ page }) => {
      await page.route('**/demo-basic', fulfil(500));
      const form = await openForm(page);
      await fillRequired(form);
      await submit(form).click();
      await expect(form).toHaveAttribute('data-contact-form-state', 'error');
      const colour = await status(form).evaluate((el) => getComputedStyle(el).color);
      expect(colour).not.toBe(await tokenColour(page, 'bg-background'));
    });
  });
}
