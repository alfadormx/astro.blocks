import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import NavigationTree from '~/components/blocks/composite/NavigationTree.astro';

const items = [
  { label: 'Docs', href: '/docs', children: [{ label: 'Intro', href: '/docs/intro' }] },
  { label: 'About', href: '/about' },
];

const render = async (path: string, props: Record<string, unknown> = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(NavigationTree, {
    props: { items, ...props },
    request: new Request(`http://localhost${path}`),
  });
};

const current = (html: string) => html.match(/<[a-z]+\b[^>]*aria-current="page"[^>]*>/g) ?? [];

describe('NavigationTree current page', () => {
  it('marks only the matching link', async () => {
    const tags = current(await render('/docs/intro'));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatch(/^<a\b[^>]*href="\/docs\/intro"/);
  });

  it('does not mark a disclosure parent rendered as summary', async () => {
    expect(current(await render('/docs'))).toHaveLength(0);
  });

  it('marks an icon-mode parent, which renders as a link', async () => {
    const tags = current(await render('/docs', { toggleMode: 'icon' }));
    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatch(/href="\/docs"/);
  });
});

describe('NavigationTree childrenClass', () => {
  it('merges onto every children wrapper over the default indent', async () => {
    const nested = [
      { label: 'A', children: [{ label: 'B', children: [{ label: 'C', href: '/c' }] }] },
    ];
    const html = await render('/', {
      items: nested,
      childrenClass: 'pl-2 border-l',
      expansionStrategy: 'always',
    });
    const wrappers = html.match(/<div class="[^"]*"[^>]*data-nav-children/g) ?? [];
    expect(wrappers).toHaveLength(2);
    for (const w of wrappers) expect(w).toMatch(/class="pl-2 border-l"/);
  });
});
