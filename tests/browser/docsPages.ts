import { documentationNavigation } from '../../src/pages/documentation/navigation';
import type { NavigationTreeItem } from '../../src/types/navigationtree.types';

const hrefs = (items: NavigationTreeItem[]): string[] =>
  items.flatMap((i) => [...(i.href ? [i.href] : []), ...hrefs(i.children ?? [])]);

export const docsPages = hrefs(documentationNavigation);
