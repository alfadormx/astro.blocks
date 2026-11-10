import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Button from '~/components/blocks/primitives/Button.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Button, { props: { as: 'summary', label: 'Parent', ...props } });
};

const openingTag = (html: string) => html.match(/^\s*<summary\b[^>]*>/)?.[0] ?? '';

describe('Button as summary', () => {
  it('renders the summary first, with no wrapper, so it can toggle its details', async () => {
    const html = await render({});

    expect(openingTag(html)).not.toBe('');
    expect(html).not.toMatch(/<(div|a|button)\b/);
  });

  it('ignores href and target', async () => {
    const tag = openingTag(await render({ href: '/p', target: '_blank' }));

    expect(tag).not.toMatch(/\shref=/);
    expect(tag).not.toMatch(/\starget=/);
  });

  it('a disabled summary is marked aria-disabled and leaves the tab order', async () => {
    const tag = openingTag(await render({ disabled: true }));

    expect(tag).toMatch(/\saria-disabled="true"/);
    expect(tag).toMatch(/\stabindex="-1"/);
  });

  it('an enabled summary stays in the tab order', async () => {
    const tag = openingTag(await render({}));

    expect(tag).not.toMatch(/\saria-disabled=/);
    expect(tag).not.toMatch(/\stabindex=/);
  });
});
