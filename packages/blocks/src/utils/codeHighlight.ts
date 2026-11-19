import type { ShikiConfig } from 'astro';

type Transformer = NonNullable<ShikiConfig['transformers']>[number];

/** Marks every highlighted `<pre>` so `blocks.css` can theme it by `[data-theme]`. */
export const codeTransformer: Transformer = {
  name: 'astro-blocks:data-code',
  pre(node) {
    node.properties['data-code'] = '';
  },
};

/** Shiki options shared by `markdown.shikiConfig` and CodeBlock's `<Code>`. */
export const shikiConfig = {
  themes: { light: 'github-light-default', dark: 'github-dark-default' },
  defaultColor: false,
  transformers: [codeTransformer],
} satisfies Partial<ShikiConfig>;
