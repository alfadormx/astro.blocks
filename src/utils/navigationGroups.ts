import type { NavigationTreeItem } from '~/types/navigationtree.types';

export function getGroupChildLabels(tree: NavigationTreeItem[], groupLabel: string): string[] {
  const labels =
    tree
      .find((entry) => entry.label === groupLabel)
      ?.children?.flatMap((child) => (child.label ? [child.label] : [])) ?? [];

  if (labels.length === 0) {
    throw new Error(`Navigation group "${groupLabel}" not found or empty`);
  }

  return labels;
}
