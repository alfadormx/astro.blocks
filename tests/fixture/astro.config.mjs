import { defineConfig } from 'astro/config';
import blocks from '../../src/integration/index.ts';

export default defineConfig({ integrations: [blocks()] });
