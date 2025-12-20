// @ts-check
import { defineConfig } from 'astro/config';
import site_config from './vendor/integration';

const siteConfig = { config: './src/config.yaml' };

// https://astro.build/config
export default defineConfig({
  integrations: [site_config(siteConfig)],
});
