// @ts-check
import { defineConfig } from 'astro/config';
import site_config from './vendor/integration';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';

import tailwindcss from '@tailwindcss/vite';
import { shikiConfig } from './src/utils/codeHighlight.ts';

const siteConfig = { config: './src/config.yaml' };

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/documentation/Composing': '/documentation/guides/Composing',
    '/documentation/Collections': '/documentation/guides/Collections',
  },
  integrations: [
    site_config(siteConfig),
    icon({
      include: {
        heroicons: ['*'],
        mdi: ['*'],
        lucide: ['*'],
        tabler: ['*'],
        'flat-color-icons': ['*'],
      },
    }),
    mdx(),
  ],

  markdown: { shikiConfig },

  vite: {
    plugins: [tailwindcss()],
    // Deps reached only via dynamic import are discovered late; Vite then reloads the page mid-test.
    optimizeDeps: {
      include: [
        'three',
        'three/addons/controls/OrbitControls.js',
        'three/addons/loaders/GLTFLoader.js',
        'three/addons/loaders/HDRLoader.js',
        'three/addons/environments/RoomEnvironment.js',
        'three/addons/postprocessing/EffectComposer.js',
        'three/addons/postprocessing/RenderPass.js',
        'three/addons/postprocessing/UnrealBloomPass.js',
        'three/addons/postprocessing/OutputPass.js',
        'three/addons/postprocessing/ShaderPass.js',
      ],
    },
  },
});
