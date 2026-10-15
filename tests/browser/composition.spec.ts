import { expect, test } from '@playwright/test';
import { docsPages } from './docsPages';

for (const href of ['/', '/demos/jewellery-configurator', ...docsPages]) {
  test(`${href} renders no children attribute`, async ({ request }) => {
    const response = await request.get(href);
    expect(await response.text()).not.toMatch(/\schildren="/);
  });
}
