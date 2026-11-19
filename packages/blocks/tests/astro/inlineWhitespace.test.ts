import { getContainerRenderer } from '@astrojs/mdx/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { describe, expect, it } from 'vitest';
import InlineWhitespace from './fixtures/inlineWhitespace.mdx';

const render = async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  return container.renderToString(InlineWhitespace);
};

describe('mdx inline whitespace', () => {
  it.each([
    ['bold', /before\s+<strong>bold<\/strong>/],
    ['code', /before\s+<code>code<\/code>/],
    ['a link', /before\s+<a href="\/x">link<\/a>/],
    ['a raw inline tag', /<code>tag<\/code>\s+continues/],
    ['code at the start of a line', /<code>code first<\/code>\s+continues/],
  ])('keeps the space across a line break next to %s', async (_, pattern) => {
    expect(await render()).toMatch(pattern);
  });
});
