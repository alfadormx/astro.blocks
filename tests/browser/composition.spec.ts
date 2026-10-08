import { expect, test } from '@playwright/test';
import { documentationNavigation } from '../../src/pages/documentation/navigation';
import type { NavigationTreeItem } from '../../src/types/navigationtree.types';

const hrefs = (items: NavigationTreeItem[]): string[] =>
  items.flatMap((i) => [...(i.href ? [i.href] : []), ...hrefs(i.children ?? [])]);

for (const href of ['/', '/demos/jewellery-configurator', ...hrefs(documentationNavigation)]) {
  test(`${href} renders no children attribute`, async ({ request }) => {
    const response = await request.get(href);
    expect(await response.text()).not.toMatch(/\schildren="/);
  });
}
