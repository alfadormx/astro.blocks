import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Item from '~/components/blocks/composite/Item.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Item, { props });
};

const linkTags = (html: string) => html.match(/<a\b[^>]*>/g) ?? [];

const actions = [
  { label: 'One', href: '#one' },
  { label: 'Two', href: '#two' },
  { label: 'Three', href: '#three', intent: 'error' },
];

describe('Item actions', () => {
  it('keeps the default actions wrapper when actionsClass is unset', async () => {
    const html = await render({ title: 'Title', actions: [{ label: 'Go', href: '#' }] });

    expect(html).toContain('<div class="flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-3">');
  });

  it('merges actionsClass over the default actions wrapper', async () => {
    const html = await render({
      actions: [{ label: 'Go', href: '#' }],
      actionsClass: 'gap-1 md:gap-1',
    });

    expect(html).toContain('<div class="flex flex-wrap mt-2 md:mt-3 gap-1 md:gap-1">');
  });

  it('applies defaultActionConfig to every action', async () => {
    const tags = linkTags(await render({ actions, defaultActionConfig: { variant: 'outline' } }));

    expect(tags).toHaveLength(3);
    for (const tag of tags) expect(tag).toMatch(/border-2/);
  });

  it('lets an action override defaultActionConfig', async () => {
    const tags = linkTags(await render({ actions, defaultActionConfig: { variant: 'outline' } }));

    expect(tags[0]).toMatch(/border-primary/);
    expect(tags[1]).toMatch(/border-primary/);
    expect(tags[2]).toMatch(/border-error/);
  });
});

describe('Item tags', () => {
  it('renders a div title without Headline by default', async () => {
    const html = await render({ title: 'Title' });

    expect(html).toMatch(/<div class="font-bold text-lg[^"]*">Title<\/div>/);
    expect(html).not.toContain('data-headline');
  });

  it('renders a heading title through Headline', async () => {
    const html = await render({ title: 'Title', titleTag: 'h3' });

    expect(html).toContain('data-headline');
    expect(html).toMatch(/<h3 [^>]*>Title<\/h3>/);
  });

  it('renders Markdown emphasis inside a heading title', async () => {
    const html = await render({ title: 'Morning at **Palais Royal**', titleTag: 'h3' });

    expect(html).toMatch(/<h3 [^>]*>Morning at <strong>Palais Royal<\/strong><\/h3>/);
  });

  it('renders Markdown emphasis inside a div title', async () => {
    const html = await render({ title: 'Morning at **Palais Royal**' });

    expect(html).toMatch(
      /<div class="font-bold text-lg[^"]*">Morning at <strong>Palais Royal<\/strong><\/div>/
    );
  });

  it('keeps a multi-paragraph title inline inside the heading', async () => {
    const html = await render({ title: 'One\n\nTwo', titleTag: 'h3' });

    expect(html).not.toMatch(/<h3 [^>]*>\s*<p>/);
  });

  it('escapes HTML-significant characters in a plain title', async () => {
    const html = await render({ title: `Tom & Jerry's "best" day`, titleTag: 'h3' });

    expect(html).toMatch(/<h3 [^>]*>Tom &amp; Jerry&#39;s &quot;best&quot; day<\/h3>/);
  });

  it('renders the text element with textTag', async () => {
    const html = await render({ content: 'Text', textTag: 'p' });

    expect(html).toMatch(/<p class="mb-2 md:mb-3">Text<\/p>/);
  });
});

describe('Item mediaClass', () => {
  const image = {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    alt: 'Mountain',
    width: 800,
    height: 1000,
  };

  it('puts mediaClass on a non-shrinking box around an image', async () => {
    const html = await render({ image, mediaClass: 'w-56', orientation: 'horizontal' });

    expect(html).toMatch(/<div class="w-56 shrink-0"><div[^>]*><img [^>]*class="w-56"/);
  });

  it('merges image.class over mediaClass on the img only', async () => {
    const html = await render({ image: { ...image, class: 'rounded-full' }, mediaClass: 'w-56' });

    expect(html).toContain('<div class="w-56 shrink-0">');
    expect(html).toMatch(/<img [^>]*class="w-56 rounded-full"/);
  });

  it('keeps mediaClass on the icon svg', async () => {
    const html = await render({ icon: { name: 'mdi:star' }, mediaClass: 'size-6' });

    expect(html).toMatch(/<svg [^>]*class="size-6 shrink-0"/);
    expect(html).not.toContain('<div class="size-6 shrink-0">');
  });
});
