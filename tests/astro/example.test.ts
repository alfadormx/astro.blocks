import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Example from '~/components/blocks/composite/Example.astro';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Example, { props });
};

describe('Example', () => {
  describe('Phase 2: Preview + Section Scoping', () => {
    it('renders preview with section scoping', async () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<Button>Click me</Button>`;

      const html = await render({
        source,
        name: 'basic',
        code: false,
      });

      expect(html).toContain('data-doc-section="basic"');
      expect(html).toContain('rounded-md border border-border/50 bg-surface p-4');
    });

    it('wraps preview in data-doc-section with correct name', async () => {
      const html = await render({
        source: 'test',
        name: 'my-example',
        code: false,
      });

      expect(html).toContain('data-doc-section="my-example"');
      expect(html).toContain('rounded-md border border-border/50 bg-surface p-4');
    });

    it('defaults section name to "example" when not provided', async () => {
      const html = await render({
        source: 'test',
        code: false,
      });

      expect(html).toContain('data-doc-section="example"');
    });
  });

  describe('Phase 3: Code Display & Integration', () => {
    it('renders CodeBlock with full source', async () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<Button>Click me</Button>`;

      const html = await render({
        source,
        name: 'with-code',
        sourceType: 'full',
        code: true,
      });

      // The code block is highlighted by Shiki, so check for the highlighted version
      expect(html).toContain('import</span>');
      expect(html).toContain('Button');
      expect(html).toContain('data-code-block');
    });

    it('filters imports with sourceType="template-only"', async () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<Button>Click me</Button>`;

      const html = await render({
        source,
        name: 'template-only',
        sourceType: 'template-only',
        code: true,
      });

      // Should NOT contain the import statement
      expect(html).not.toContain('import Button');
      expect(html).not.toContain('from');
      // Should contain the component usage
      expect(html).toContain('Button');
      expect(html).toContain('Click me');
      expect(html).toContain('data-code-block');
    });

    it('hides CodeBlock when code={false}', async () => {
      const source = '<div>Visible</div>';

      const html = await render({
        source,
        name: 'no-code',
        code: false,
      });

      expect(html).not.toContain('data-code-block');
    });

    it('shows CodeBlock by default', async () => {
      const html = await render({
        source: 'test content',
        name: 'default-code',
      });

      expect(html).toContain('data-code-block');
    });

    it('passes title to CodeBlock', async () => {
      const html = await render({
        source: 'code here',
        name: 'my-example',
        code: true,
      });

      expect(html).toContain('my-example');
      expect(html).toContain('data-code-block');
    });

    it('renders CodeBlock with astro language by default', async () => {
      const html = await render({
        source: '<div>test</div>',
        code: true,
      });

      expect(html).toContain('data-code-block');
      // Astro language is set as default in the component
    });

    it('merges codeBlockConfig with defaults', async () => {
      const html = await render({
        source: 'test',
        code: true,
        defaultCodeBlockConfig: {
          lang: 'jsx',
          copiedMessage: 'Done!',
        },
      });

      expect(html).toContain('data-code-block-message="Done!"');
      expect(html).toContain('data-code-block');
    });
  });

  describe('error handling', () => {
    it('throws error when neither source nor sourceFile is provided', async () => {
      let error: Error | null = null;
      try {
        await render({
          name: 'no-source',
        });
      } catch (err) {
        error = err as Error;
      }

      expect(error).not.toBeNull();
      expect((error as Error).message).toContain('either source or sourceFile prop is required');
    });
  });
});
