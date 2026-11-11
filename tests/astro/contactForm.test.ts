import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ContactForm from '~/components/blocks/composite/ContactForm.astro';

async function render(
  props: Record<string, unknown>,
  slots?: Record<string, string>
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ContactForm as never, {
    props,
    slots,
    request: new Request('http://localhost/'),
  });
}

const endpoint = { type: 'endpoint', url: 'https://formspree.io/f/demo' };
const mailto = { type: 'mailto', address: 'hello@example.com' };

function formTag(html: string): string {
  return html.match(/<form[^>]*>/)?.[0] ?? '';
}

function tagsOf(html: string, tag: string): string[] {
  return html.match(new RegExp(`<${tag}\\b[^>]*>`, 'g')) ?? [];
}

describe('ContactForm endpoint mode', () => {
  it('posts natively to the endpoint without an enctype', async () => {
    const form = formTag(await render({ action: endpoint }));
    expect(form).toContain('action="https://formspree.io/f/demo"');
    expect(form).toContain('method="post"');
    expect(form).not.toContain('enctype');
  });

  it('renders the five default fields with ids derived from the form id', async () => {
    const html = await render({ action: endpoint });
    for (const name of ['name', 'email', 'phone', 'subject', 'message']) {
      expect(html).toMatch(new RegExp(`id="contact-form-\\d+-${name}"`));
    }
    const email = tagsOf(html, 'input').find((t) => t.includes('name="email"'));
    expect(email).toContain('autocomplete="email"');
  });

  it('renders the submit button as type submit', async () => {
    const button = tagsOf(await render({ action: endpoint }), 'button').find((t) =>
      t.includes('data-contact-form-submit')
    );
    expect(button).toContain('type="submit"');
    expect(button).not.toContain('type="button"');
  });

  it('renders the status hidden and programmatically focusable', async () => {
    const status = tagsOf(await render({ action: endpoint }), 'p').find((t) =>
      t.includes('data-contact-form-status')
    );
    expect(status).toContain('hidden');
    expect(status).toContain('tabindex="-1"');
  });

  it('renders no headline when headline is absent and an h2 when set', async () => {
    expect(await render({ action: endpoint })).not.toMatch(/<h[1-6]/);
    expect(await render({ action: endpoint, headline: { title: 'Contact' } })).toMatch(/<h2/);
  });
});

describe('ContactForm fields', () => {
  it('replaces the defaults with a provided list', async () => {
    const html = await render({
      action: endpoint,
      fields: [
        {
          control: 'select',
          name: 'topic',
          label: 'Topic',
          options: [{ value: 'a', label: 'A' }],
        },
      ],
    });
    expect(tagsOf(html, 'select')).toHaveLength(1);
    expect(tagsOf(html, 'textarea')).toHaveLength(0);
    expect(tagsOf(html, 'input').filter((t) => !t.includes('_gotcha'))).toHaveLength(0);
  });

  it('applies defaultFieldConfig to every control, under the instance', async () => {
    const html = await render({
      action: endpoint,
      defaultFieldConfig: { size: 'lg' },
      fields: [
        { control: 'input', name: 'a', label: 'A' },
        { control: 'input', name: 'b', label: 'B', size: 'sm' },
        { control: 'textarea', name: 'c', label: 'C' },
      ],
    });
    const controls = [
      ...tagsOf(html, 'input').filter((t) => !t.includes('_gotcha')),
      ...tagsOf(html, 'textarea'),
    ];
    const byName = (n: string) => controls.find((t) => t.includes(`name="${n}"`))!;
    expect(byName('a')).toContain('text-lg');
    expect(byName('b')).toContain('text-sm');
    expect(byName('b')).not.toContain('text-lg');
    expect(byName('c')).toContain('text-lg');
  });
});

describe('ContactForm honeypot', () => {
  it('renders the default _gotcha trap hidden from assistive tech and the tab order', async () => {
    const html = await render({ action: endpoint });
    const trap = html.match(/<div[^>]*data-contact-form-honeypot[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
    expect(trap).toContain('aria-hidden="true"');
    const input = tagsOf(trap, 'input')[0];
    expect(input).toContain('name="_gotcha"');
    expect(input).toContain('tabindex="-1"');
    expect(input).toContain('autocomplete="off"');
    expect(formTag(html)).toContain('data-contact-form-honeypot-name="_gotcha"');
  });

  it('renders no trap when honeypot is false', async () => {
    const html = await render({ action: endpoint, honeypot: false });
    expect(html).not.toContain('data-contact-form-honeypot');
  });
});

describe('ContactForm mailto mode', () => {
  it('hands off natively to the mail client as text/plain', async () => {
    const form = formTag(await render({ action: mailto }));
    expect(form).toContain('action="mailto:hello@example.com"');
    expect(form).toContain('method="post"');
    expect(form).toContain('enctype="text/plain"');
  });

  it('carries a field label map without the honeypot', async () => {
    const form = formTag(await render({ action: mailto }));
    const raw = form.match(/data-contact-form-labels="([^"]*)"/)?.[1] ?? '';
    const labels = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&#34;/g, '"'));
    expect(labels).toEqual({
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Message',
    });
  });
});

describe('ContactForm aside', () => {
  it('renders a single column without the aside slot', async () => {
    const html = await render({ action: endpoint });
    expect(html).not.toContain('data-contact-form-aside');
    expect(html).not.toContain('data-contact-form-main');
  });

  it('renders the form and the aside side by side with the aside slot', async () => {
    const html = await render({ action: endpoint }, { aside: '<p>Office</p>' });
    expect(html).toContain('data-contact-form-main');
    expect(html).toContain('data-contact-form-aside');
    expect(html).toContain('<p>Office</p>');
    expect(html.indexOf('data-contact-form-main')).toBeLessThan(
      html.indexOf('data-contact-form-aside')
    );
  });

  it('puts the aside first with asidePosition left', async () => {
    const html = await render(
      { action: endpoint, asidePosition: 'left' },
      { aside: '<p>Office</p>' }
    );
    expect(html.indexOf('data-contact-form-aside')).toBeLessThan(
      html.indexOf('data-contact-form-main')
    );
  });
});
