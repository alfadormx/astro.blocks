// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContactFormAction, ContactFormField } from '~/types/contactform.types';
import {
  buildMailtoUrl,
  contactFormId,
  defaultContactFields,
  isHoneypotFilled,
  mailtoEntries,
  submitToEndpoint,
  validateContactForm,
} from '~/utils/contactForm';

const endpoint: ContactFormAction = { type: 'endpoint', url: 'https://example.com/f' };

function validate(overrides: {
  action?: ContactFormAction;
  fields?: ContactFormField[];
  honeypot?: string | false;
}): () => void {
  return () =>
    validateContactForm({
      action: overrides.action ?? endpoint,
      fields: overrides.fields ?? defaultContactFields(),
      honeypot: overrides.honeypot ?? '_gotcha',
    });
}

function formWith(html: string): HTMLFormElement {
  const form = document.createElement('form');
  form.innerHTML = html;
  document.body.append(form);
  return form;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('validateContactForm', () => {
  it('accepts the defaults', () => {
    expect(validate({})).not.toThrow();
  });

  it('rejects an empty fields list', () => {
    expect(validate({ fields: [] })).toThrow(/^contactForm: fields is empty/);
  });

  it('rejects two fields sharing a name', () => {
    const fields: ContactFormField[] = [
      { control: 'input', name: 'email', label: 'Email' },
      { control: 'input', name: 'email', label: 'Email again' },
    ];
    expect(validate({ fields })).toThrow(/^contactForm: two fields share the name "email"/);
  });

  it('rejects a duplicate name across a Select and a CheckboxGroup', () => {
    const fields: ContactFormField[] = [
      { control: 'select', name: 'topic', label: 'Topic', options: [{ value: 'a', label: 'A' }] },
      {
        control: 'checkboxGroup',
        name: 'topic',
        label: 'Topics',
        options: [{ value: 'a', label: 'A' }],
      },
    ];
    expect(validate({ fields })).toThrow(/share the name "topic"/);
  });

  it.each(['', '  '])('rejects an endpoint url of %j', (url) => {
    expect(validate({ action: { type: 'endpoint', url } })).toThrow(/action.url is required/);
  });

  it.each(['', '  '])('rejects a mailto address of %j', (address) => {
    expect(validate({ action: { type: 'mailto', address } })).toThrow(/action.address is required/);
  });

  it('rejects a field named like the honeypot', () => {
    const fields: ContactFormField[] = [{ control: 'input', name: '_gotcha', label: 'Gotcha' }];
    expect(validate({ fields })).toThrow(/field "_gotcha" uses the honeypot name/);
  });

  it('accepts a field named _gotcha when the honeypot is off', () => {
    const fields: ContactFormField[] = [{ control: 'input', name: '_gotcha', label: 'Gotcha' }];
    expect(validate({ fields, honeypot: false })).not.toThrow();
  });
});

describe('defaultContactFields', () => {
  it('returns name, email, phone, subject and message in order', () => {
    expect(defaultContactFields().map((f) => f.name)).toEqual([
      'name',
      'email',
      'phone',
      'subject',
      'message',
    ]);
  });

  it('marks name, email and message required, phone and subject not', () => {
    const required = Object.fromEntries(
      defaultContactFields().map((f) => [f.name, 'required' in f && f.required === true])
    );
    expect(required).toEqual({
      name: true,
      email: true,
      phone: false,
      subject: false,
      message: true,
    });
  });

  it('returns a fresh list per call', () => {
    const first = defaultContactFields();
    first.pop();
    first[0].label = 'Changed';
    const second = defaultContactFields();
    expect(second).toHaveLength(5);
    expect(second[0].label).toBe('Name');
  });
});

describe('contactFormId', () => {
  it('returns distinct contact-form-N ids', () => {
    const a = contactFormId();
    const b = contactFormId();
    expect(a).toMatch(/^contact-form-\d+$/);
    expect(b).toMatch(/^contact-form-\d+$/);
    expect(a).not.toBe(b);
  });
});

describe('submitToEndpoint', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    [200, 'success'],
    [422, 'error'],
    [500, 'error'],
  ])('resolves a %i response to %s', async (status, expected) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    await expect(submitToEndpoint('https://example.com/f', new FormData())).resolves.toBe(expected);
  });

  it('resolves error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(submitToEndpoint('https://example.com/f', new FormData())).resolves.toBe('error');
  });

  it('posts the form data and asks for JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const data = new FormData();
    data.append('name', 'Ada');
    await submitToEndpoint('https://example.com/f', data);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/f', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
  });
});

describe('isHoneypotFilled', () => {
  it.each([
    ['an empty field', '<input name="_gotcha" value="">', '_gotcha'],
    ['a whitespace-only field', '<input name="_gotcha" value="   ">', '_gotcha'],
    ['a missing field', '<input name="other" value="x">', '_gotcha'],
    ['no honeypot name', '<input name="_gotcha" value="x">', undefined],
  ])('is false for %s', (_case, html, name) => {
    expect(isHoneypotFilled(formWith(html), name)).toBe(false);
  });

  it('is true for a filled field', () => {
    expect(isHoneypotFilled(formWith('<input name="_gotcha" value="x">'), '_gotcha')).toBe(true);
  });
});

describe('buildMailtoUrl', () => {
  it('encodes spaces as %20 and joins lines with %0D%0A', () => {
    const url = buildMailtoUrl('hi@example.com', {
      entries: [
        { label: 'Name', values: ['Ada Lovelace'] },
        { label: 'Message', values: ['Hello there'] },
      ],
    });
    expect(url).toBe(
      'mailto:hi@example.com?body=Name%3A%20Ada%20Lovelace%0D%0AMessage%3A%20Hello%20there'
    );
  });

  it('encodes &, ?, #, = and non-ASCII in values', () => {
    const url = buildMailtoUrl('hi@example.com', {
      entries: [{ label: 'Q', values: ['a&b?c#d=e é'] }],
    });
    expect(url).toBe('mailto:hi@example.com?body=Q%3A%20a%26b%3Fc%23d%3De%20%C3%A9');
  });

  it('skips entries whose values are all empty', () => {
    const url = buildMailtoUrl('hi@example.com', {
      entries: [
        { label: 'Phone', values: ['', '  '] },
        { label: 'Name', values: ['Ada'] },
      ],
    });
    expect(url).toBe('mailto:hi@example.com?body=Name%3A%20Ada');
  });

  it('joins multiple values with a comma', () => {
    const url = buildMailtoUrl('hi@example.com', {
      entries: [{ label: 'Interests', values: ['Events', 'Hiring'] }],
    });
    expect(decodeURIComponent(url)).toBe('mailto:hi@example.com?body=Interests: Events, Hiring');
  });

  it('puts a non-empty subject first', () => {
    const url = buildMailtoUrl('hi@example.com', {
      subject: ' Hello world ',
      entries: [{ label: 'Name', values: ['Ada'] }],
    });
    expect(url).toBe('mailto:hi@example.com?subject=Hello%20world&body=Name%3A%20Ada');
  });

  it.each([
    ['empty', ''],
    ['absent', undefined],
  ])('omits subject when it is %s', (_case, subject) => {
    const url = buildMailtoUrl('hi@example.com', {
      subject,
      entries: [{ label: 'Name', values: ['Ada'] }],
    });
    expect(url).not.toContain('subject=');
  });

  it('omits the query entirely when nothing is filled', () => {
    expect(
      buildMailtoUrl('hi@example.com', { subject: '', entries: [{ label: 'Name', values: [''] }] })
    ).toBe('mailto:hi@example.com');
  });
});

describe('mailtoEntries', () => {
  it('keeps label order and returns every value of a repeated name', () => {
    const form = formWith(`
      <input name="interests" type="checkbox" value="Events" checked>
      <input name="name" value="Ada">
      <input name="interests" type="checkbox" value="Hiring" checked>
      <input name="_gotcha" value="bot">
    `);
    expect(mailtoEntries(form, { name: 'Name', interests: 'Interests' })).toEqual([
      { label: 'Name', values: ['Ada'] },
      { label: 'Interests', values: ['Events', 'Hiring'] },
    ]);
  });
});
