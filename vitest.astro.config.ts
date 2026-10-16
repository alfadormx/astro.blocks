import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/astro/**/*.test.ts'],
    environment: 'node',
    testTimeout: 60000,
  },
} as never);
