import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import CodeBlock from '~/components/blocks/primitives/CodeBlock.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(CodeBlock, { props: { code: 'a < b\n', ...props } });
};

describe('CodeBlock', () => {
  it('renders a literal < as text', async () => {
    const html = await render({});
    const code = html.slice(html.indexOf('<code>') + '<code>'.length, html.indexOf('</code>'));
    expect(code).toContain('&#x3C;');
    expect(code).not.toMatch(/<(?!\/?span)/);
  });

  it('renders the copy button by default', async () => {
    const html = await render({});
    expect(html).toContain('data-code-block-copy');
    expect(html).toContain('aria-label="Copy code"');
  });

  it('renders no copy button when copyButton is false', async () => {
    expect(await render({ copyButton: false })).not.toContain('data-code-block-copy');
  });

  it('puts the title and copy button in a figcaption', async () => {
    expect(await render({ title: 'src/x.ts' })).toMatch(
      /<figcaption[^>]*>[\s\S]*src\/x\.ts[\s\S]*data-code-block-copy[\s\S]*<\/figcaption>/
    );
  });

  it('marks the pre with data-code', async () => {
    expect(await render({})).toMatch(/<pre[^>]*data-code/);
  });

  it('is not ready on the server', async () => {
    expect(await render({})).not.toContain('data-code-block-ready');
  });
});
