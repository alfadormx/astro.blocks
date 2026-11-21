// @ts-check
import { defineConfig } from 'astro/config';
import blocks from '@alfadormx/blocks/integration';

/**
 * Vercel Web Analytics on every docs page without a tag in the library Layout,
 * which other sites share and must not depend on @vercel/analytics.
 * @type {import('astro').AstroIntegration}
 */
const vercelAnalytics = {
  name: 'vercel-analytics',
  hooks: {
    'astro:config:setup': ({ command, injectScript }) => {
      if (command !== 'build') return;
      injectScript(
        'page',
        `import { inject } from '@vercel/analytics'; inject({ framework: 'astro' });`
      );
    },
  },
};

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/documentation/Composing': '/documentation/guides/Composing',
    '/documentation/Collections': '/documentation/guides/Collections',
  },
  integrations: [
    blocks({ config: './src/config.yaml', css: './src/styles/global.css' }),
    vercelAnalytics,
  ],
});
