import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Pager from '~/components/blocks/composite/Pager.astro';

async function render(props: Record<string, unknown>, slots?: Record<string, string>) {
  const container = await AstroContainer.create();
  return container.renderToString(Pager as never, {
    props,
    slots,
    request: new Request('http://localhost/'),
  });
}

// Quote-aware: the `[&>span]` class keeps its `>` unescaped.
const attrs = '(?:[^>"]|"[^"]*")*';
const linkTag = (html: string, which: 'prev' | 'next') =>
  html.match(new RegExp(`<a${attrs}data-pager-link="${which}"${attrs}>`))?.[0] ?? '';

const both = {
  prevButton: { href: '/a', subtitle: 'Alpha page' },
  nextButton: { href: '/b', subtitle: 'Beta page' },
};

describe('Pager', () => {
  it('renders nothing without links', async () => {
    const html = await render({}, { default: '<p>status</p>' });
    expect(html.trim()).toBe('');
  });

  it('renders a named nav with only the links that are set', async () => {
    const html = await render({ nextButton: { href: '/b' } });
    expect(html).toMatch(/<nav[^>]*aria-label="Pagination"[^>]*data-pager/);
    expect(html).toContain('Next');
    expect(html).not.toContain('data-pager-link="prev"');
  });

  it('localises the built-in strings and takes a custom ariaLabel', async () => {
    const es = await render({ langCode: 'es', nextButton: { href: '/b' } });
    expect(es).toContain('aria-label="Paginación"');
    expect(es).toContain('Siguiente');
    const custom = await render({ ariaLabel: 'Docs pages', nextButton: { href: '/b' } });
    expect(custom).toContain('aria-label="Docs pages"');
  });

  it('writes href, rel and subtitle on each link, prev first', async () => {
    const html = await render(both);
    const prev = linkTag(html, 'prev');
    const next = linkTag(html, 'next');
    expect(prev).toContain('href="/a"');
    expect(prev).toContain('rel="prev"');
    expect(next).toContain('href="/b"');
    expect(next).toContain('rel="next"');
    expect(html).toContain('Alpha page');
    expect(html).toContain('Beta page');
    expect(html.indexOf('data-pager-link="prev"')).toBeLessThan(
      html.indexOf('data-pager-link="next"')
    );
  });

  it('aligns next to the inline end, text column included', async () => {
    const next = linkTag(await render(both), 'next');
    expect(next).toContain('ms-auto');
    expect(next).toMatch(/\[&(amp;)?(>|&gt;)span\]:items-end/);
  });

  it('lets the instance override the defaults', async () => {
    const html = await render({ nextButton: { href: '/b', label: 'Onward', class: 'ms-0' } });
    expect(html).toContain('Onward');
    expect(html).not.toContain('>Next<');
    const next = linkTag(html, 'next');
    expect(next).toContain('ms-0');
    expect(next).not.toContain('ms-auto');
  });

  it('merges defaultButtonConfig under both links', async () => {
    const html = await render({ ...both, defaultButtonConfig: { variant: 'ghost' } });
    expect(linkTag(html, 'prev')).not.toContain('border-2');
    expect(linkTag(html, 'next')).not.toContain('border-2');
    const outline = await render(both);
    expect(linkTag(outline, 'prev')).toContain('border-2');
  });

  it('mutes the label only when a subtitle is set', async () => {
    expect(await render(both)).toMatch(/<span class="[^"]*text-muted[^"]*">Previous</);
    expect(await render({ prevButton: { href: '/a' } })).not.toContain('text-muted');
  });

  it('renders the slot between the links', async () => {
    const html = await render(both, { default: '<p data-slot-probe>mid</p>' });
    const probe = html.indexOf('data-slot-probe');
    expect(html.indexOf('data-pager-link="prev"')).toBeLessThan(probe);
    expect(probe).toBeLessThan(html.indexOf('data-pager-link="next"'));
  });
});
