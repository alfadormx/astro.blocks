import { expect, test } from '@playwright/test';
import { docsPages } from './docsPages';
import { localePaths } from './locales';

const demoPages = [
  '/demos/jewellery-configurator',
  '/demos/saas',
  '/es/demos/saas',
  '/demos/saas/blog',
  '/demos/saas/blog/hello-world',
];

for (const href of [...localePaths, ...demoPages, ...docsPages]) {
  test(`${href} renders no children attribute`, async ({ request }) => {
    const response = await request.get(href);
    expect(await response.text()).not.toMatch(/\schildren="/);
  });
}
