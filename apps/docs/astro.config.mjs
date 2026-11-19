// @ts-check
import { defineConfig } from 'astro/config';
import blocks from '@alfadormx/blocks/integration';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/documentation/Composing': '/documentation/guides/Composing',
    '/documentation/Collections': '/documentation/guides/Collections',
  },
  integrations: [blocks({ config: './src/config.yaml', css: './src/styles/global.css' })],
});
