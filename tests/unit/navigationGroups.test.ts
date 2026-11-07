import { describe, expect, it } from 'vitest';
import type { NavigationTreeItem } from '~/types/navigationtree.types';
import { getGroupChildLabels } from '~/utils/navigationGroups';

const tree: NavigationTreeItem[] = [
  { label: 'Overview', href: '/documentation' },
  {
    label: 'Primitives',
    children: [
      { label: 'Button', href: '/documentation/primitives/Button' },
      { label: 'Image', href: '/documentation/primitives/Image' },
    ],
  },
  {
    label: 'Layout',
    children: [{ label: 'Container', href: '/documentation/layout/Container' }],
  },
  { label: 'Empty', children: [] },
];

describe('getGroupChildLabels', () => {
  it('returns the child labels of the named group in navigation order', () => {
    expect(getGroupChildLabels(tree, 'Primitives')).toEqual(['Button', 'Image']);
  });

  it('includes a child label as soon as it is added to the group', () => {
    const [overview, primitives, ...rest] = tree;
    const extended: NavigationTreeItem[] = [
      overview,
      {
        ...primitives,
        children: [
          ...primitives.children!,
          { label: 'Video', href: '/documentation/primitives/Video' },
        ],
      },
      ...rest,
    ];

    expect(getGroupChildLabels(extended, 'Primitives')).toContain('Video');
  });

  it('ignores top-level leaves and labels from other groups', () => {
    const labels = getGroupChildLabels(tree, 'Layout');

    expect(labels).toEqual(['Container']);
  });

  it('skips children without a label', () => {
    const withUnlabelled: NavigationTreeItem[] = [
      { label: 'Primitives', children: [{ href: '/x' }, { label: 'Button', href: '/b' }] },
    ];

    expect(getGroupChildLabels(withUnlabelled, 'Primitives')).toEqual(['Button']);
  });

  it('throws naming the group when it is missing', () => {
    expect(() => getGroupChildLabels(tree, 'Composite')).toThrow('"Composite"');
  });

  it('throws naming the group when it has no children', () => {
    expect(() => getGroupChildLabels(tree, 'Empty')).toThrow('"Empty"');
  });
});
