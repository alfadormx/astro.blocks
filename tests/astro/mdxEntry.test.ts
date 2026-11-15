import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { describe, expect, it } from 'vitest';
import BlockEntry from './fixtures/blockEntry.mdx';

const render = async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(BlockEntry);
};

describe('mdx entry', () => {
  it('renders a block imported into an mdx entry', async () => {
    expect(await render()).toMatch(/<a[^>]*href="\/mdx-proof"[^>]*>[\s\S]*Proof/);
  });

  it('renders the text of a file imported with ?raw', async () => {
    expect(await render()).toContain('mdx-raw-import-proof');
  });
});
