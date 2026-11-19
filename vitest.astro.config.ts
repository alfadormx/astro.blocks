import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';

export default getViteConfig(
  {
    resolve: {
      alias: {
        '~': resolve(import.meta.dirname, './src'),
      },
    },
    test: {
      dir: import.meta.dirname,
      include: ['tests/astro/**/*.test.ts'],
      environment: 'node',
      testTimeout: 60000,
    },
  } as never,
  { root: fileURLToPath(new URL('./tests/fixture/', import.meta.url)) }
);
